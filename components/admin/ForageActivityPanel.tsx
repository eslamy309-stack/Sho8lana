'use client'

// Admin → Forage Activity. Real-time view of every user's Forage simulation
// activity. Reads via the service-role /api/forage/admin route (authorized by the
// logged-in super_admin's Supabase JWT) and live-refreshes via Supabase Realtime.

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import {
  RefreshCw, Search, ShieldCheck, CheckCircle2, Clock, Users, Activity,
  TrendingUp, X, Eye, Loader2,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { FORAGE_PROGRAMS } from '@/lib/forage-programs'

interface Attempt {
  attempt_token: string
  user_id: string
  program_id: string
  company: string
  title: string
  attempt_number: number
  status: 'launched' | 'in_progress' | 'completed' | 'abandoned'
  progress_pct: number
  score: number | null
  time_spent_seconds: number
  launched_at: string
  last_activity_at: string
  completed_at: string | null
  certificate_url: string | null
  certificate_verified: boolean
  certificate_issued_to: string | null
}

interface Analytics {
  active_now: number; in_progress: number; completed: number; abandoned: number
  distinct_users: number; verified_certs: number; avg_progress: number | null
  completion_rate: number | null; total_attempts: number
}

interface FEvent {
  id: string; event_type: string; created_at: string; progress_pct: number | null
  score: number | null; source: string; program_id: string
}

const STATUS_STYLE: Record<Attempt['status'], string> = {
  launched:    'bg-blue-500/15 text-blue-400',
  in_progress: 'bg-amber-500/15 text-amber-400',
  completed:   'bg-emerald-500/15 text-emerald-400',
  abandoned:   'bg-neutral-500/15 text-neutral-400',
}

function relTime(iso: string): string {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.round(h / 24)}d ago`
}
function fmtDur(s: number): string {
  if (!s) return '—'
  const h = Math.floor(s / 3600), m = Math.round((s % 3600) / 60)
  return h ? `${h}h ${m}m` : `${m}m`
}
async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  const t = data.session?.access_token
  return { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) }
}

function Kpi({ icon: Icon, label, value, accent }: { icon: React.ElementType; label: string; value: string | number; accent: string }) {
  return (
    <div className="bg-[#0D1526] border border-white/10 rounded-xl p-3.5">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon size={14} className={accent} />
        <span className="text-[11px] text-neutral-500 font-medium">{label}</span>
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  )
}

export default function ForageActivityPanel() {
  const [attempts, setAttempts]   = useState<Attempt[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading]     = useState(true)
  const [authBlocked, setAuthBlocked] = useState(false)

  // Filters
  const [text, setText]       = useState('')
  const [program, setProgram] = useState('all')
  const [status, setStatus]   = useState('all')
  const [from, setFrom]       = useState('')
  const [to, setTo]           = useState('')

  // Drill-down
  const [drill, setDrill]   = useState<string | null>(null)
  const [events, setEvents] = useState<FEvent[]>([])
  const [verifying, setVerifying] = useState<string | null>(null)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchData = useCallback(async () => {
    const params = new URLSearchParams()
    if (program !== 'all') params.set('program', program)
    if (status !== 'all')  params.set('status', status)
    if (from) params.set('from', new Date(from).toISOString())
    if (to)   params.set('to', new Date(to + 'T23:59:59').toISOString())
    try {
      const res = await fetch(`/api/forage/admin?${params.toString()}`, { headers: await authHeaders() })
      if (res.status === 401) { setAuthBlocked(true); setLoading(false); return }
      const j = await res.json()
      setAttempts(j.attempts ?? [])
      setAnalytics(j.analytics ?? null)
      setAuthBlocked(false)
    } catch { /* ignore */ } finally { setLoading(false) }
  }, [program, status, from, to])

  useEffect(() => { fetchData() }, [fetchData])

  // Realtime: nudge a debounced refetch on any attempt change
  useEffect(() => {
    let ch: ReturnType<typeof supabase.channel> | null = null
    try {
      ch = supabase.channel('admin-forage')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'forage_attempts' }, () => {
          if (debounceRef.current) clearTimeout(debounceRef.current)
          debounceRef.current = setTimeout(() => { fetchData() }, 600)
        })
        .subscribe()
    } catch { /* realtime unavailable */ }
    return () => { if (ch) supabase.removeChannel(ch) }
  }, [fetchData])

  const openDrill = useCallback(async (userId: string) => {
    setDrill(userId); setEvents([])
    try {
      const res = await fetch(`/api/forage/admin?eventsForUser=${userId}`, { headers: await authHeaders() })
      const j = await res.json()
      setEvents(j.events ?? [])
    } catch { /* ignore */ }
  }, [])

  const verify = useCallback(async (attemptToken: string) => {
    setVerifying(attemptToken)
    try {
      await fetch('/api/forage/admin', {
        method: 'POST', headers: await authHeaders(),
        body: JSON.stringify({ attemptToken, action: 'verify' }),
      })
      await fetchData()
    } catch { /* ignore */ } finally { setVerifying(null) }
  }, [fetchData])

  const filtered = useMemo(() => {
    const q = text.trim().toLowerCase()
    if (!q) return attempts
    return attempts.filter(a =>
      a.user_id.toLowerCase().includes(q) ||
      a.company.toLowerCase().includes(q) ||
      a.title.toLowerCase().includes(q) ||
      (a.certificate_issued_to ?? '').toLowerCase().includes(q)
    )
  }, [attempts, text])

  const drillAttempts = useMemo(() => attempts.filter(a => a.user_id === drill), [attempts, drill])

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity size={20} className="text-indigo-400" /> Forage Activity
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">Live tracking of Forage simulations across all users</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0D1526] border border-white/10 text-sm text-neutral-300 hover:text-white">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {authBlocked && (
        <div className="mb-5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          Sign in with a super_admin account to load Forage activity (the dashboard reads via your authenticated session).
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        <Kpi icon={Activity}    label="Active now"      value={analytics?.active_now ?? 0}    accent="text-blue-400" />
        <Kpi icon={Clock}       label="In progress"     value={analytics?.in_progress ?? 0}   accent="text-amber-400" />
        <Kpi icon={CheckCircle2} label="Completed"      value={analytics?.completed ?? 0}     accent="text-emerald-400" />
        <Kpi icon={ShieldCheck} label="Verified certs"  value={analytics?.verified_certs ?? 0} accent="text-emerald-400" />
        <Kpi icon={Users}       label="Users"           value={analytics?.distinct_users ?? 0} accent="text-indigo-400" />
        <Kpi icon={TrendingUp}  label="Completion rate" value={`${analytics?.completion_rate ?? 0}%`} accent="text-violet-400" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex items-center gap-2 bg-[#0D1526] border border-white/10 rounded-lg px-3 py-2 flex-1 min-w-[200px]">
          <Search size={14} className="text-neutral-500" />
          <input value={text} onChange={e => setText(e.target.value)} placeholder="Filter by user id, name, company…"
            className="bg-transparent text-sm text-white placeholder:text-neutral-600 outline-none w-full" />
        </div>
        <select value={program} onChange={e => setProgram(e.target.value)} className="bg-[#0D1526] border border-white/10 rounded-lg px-3 py-2 text-sm text-neutral-300">
          <option value="all">All programs</option>
          {FORAGE_PROGRAMS.map(p => <option key={p.id} value={p.id}>{p.company} · {p.title}</option>)}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)} className="bg-[#0D1526] border border-white/10 rounded-lg px-3 py-2 text-sm text-neutral-300">
          <option value="all">All statuses</option>
          <option value="launched">Launched</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
          <option value="abandoned">Abandoned</option>
        </select>
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="bg-[#0D1526] border border-white/10 rounded-lg px-3 py-2 text-sm text-neutral-400" />
        <input type="date" value={to} onChange={e => setTo(e.target.value)} className="bg-[#0D1526] border border-white/10 rounded-lg px-3 py-2 text-sm text-neutral-400" />
      </div>

      {/* Table */}
      <div className="bg-[#0A0F1E] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-500 text-[11px] uppercase tracking-wider border-b border-white/10">
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Program</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Progress</th>
              <th className="px-4 py-3 font-medium">Score</th>
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">Last activity</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-neutral-600">
                {loading ? 'Loading…' : 'No Forage activity yet'}
              </td></tr>
            ) : filtered.map(a => (
              <tr key={a.attempt_token} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                <td className="px-4 py-2.5">
                  <span className="text-neutral-300 font-mono text-xs" title={a.user_id}>{a.user_id.slice(0, 8)}…</span>
                  {a.attempt_number > 1 && <span className="ml-1.5 text-[10px] text-neutral-600">#{a.attempt_number}</span>}
                </td>
                <td className="px-4 py-2.5">
                  <p className="text-neutral-200 text-xs font-medium truncate max-w-[180px]">{a.title}</p>
                  <p className="text-neutral-600 text-[10px]">{a.company}</p>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[a.status]}`}>{a.status.replace('_', ' ')}</span>
                </td>
                <td className="px-4 py-2.5 w-32">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full bg-indigo-500" style={{ width: `${a.progress_pct}%` }} />
                    </div>
                    <span className="text-[10px] text-neutral-500">{a.progress_pct}%</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-neutral-300 text-xs">{a.score != null ? `${a.score}%` : '—'}</td>
                <td className="px-4 py-2.5 text-neutral-400 text-xs">{fmtDur(a.time_spent_seconds)}</td>
                <td className="px-4 py-2.5 text-neutral-500 text-xs">{relTime(a.last_activity_at)}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center justify-end gap-1.5">
                    {a.certificate_verified
                      ? <span className="flex items-center gap-1 text-[10px] text-emerald-400"><ShieldCheck size={12} /> verified</span>
                      : a.status === 'completed'
                        ? <button onClick={() => verify(a.attempt_token)} disabled={verifying === a.attempt_token}
                            className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md hover:bg-emerald-500/20 disabled:opacity-50">
                            {verifying === a.attempt_token ? <Loader2 size={11} className="animate-spin" /> : 'Verify'}
                          </button>
                        : null}
                    <button onClick={() => openDrill(a.user_id)} className="text-neutral-500 hover:text-white p-1" title="View user timeline">
                      <Eye size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Drill-down */}
      {drill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setDrill(null)}>
          <div className="bg-[#0A0F1E] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <p className="text-white font-bold text-sm">User timeline</p>
                <p className="text-neutral-500 text-xs font-mono mt-0.5">{drill}</p>
              </div>
              <button onClick={() => setDrill(null)}><X size={18} className="text-neutral-500 hover:text-white" /></button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4">
              {/* Attempts */}
              <div>
                <p className="text-[11px] uppercase tracking-wider text-neutral-500 mb-2">Attempts ({drillAttempts.length})</p>
                <div className="space-y-2">
                  {drillAttempts.map(a => (
                    <div key={a.attempt_token} className="bg-[#0D1526] border border-white/10 rounded-lg p-3 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-neutral-200 text-xs font-medium truncate">{a.title} <span className="text-neutral-600">#{a.attempt_number}</span></p>
                        <p className="text-neutral-600 text-[10px]">{a.company} · {fmtDur(a.time_spent_seconds)} · {relTime(a.last_activity_at)}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[a.status]}`}>{a.status.replace('_', ' ')}</span>
                      <span className="text-neutral-400 text-xs w-10 text-right">{a.progress_pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Events */}
              <div>
                <p className="text-[11px] uppercase tracking-wider text-neutral-500 mb-2">Recent events ({events.length})</p>
                <div className="space-y-1.5">
                  {events.map(ev => (
                    <div key={ev.id} className="flex items-center gap-3 text-xs">
                      <span className="text-neutral-600 w-16 shrink-0">{relTime(ev.created_at)}</span>
                      <span className="text-indigo-300 font-mono">{ev.event_type}</span>
                      {ev.progress_pct != null && <span className="text-neutral-500">{ev.progress_pct}%</span>}
                      <span className="text-neutral-700 ml-auto">{ev.source}</span>
                    </div>
                  ))}
                  {events.length === 0 && <p className="text-neutral-600 text-xs">No events.</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
