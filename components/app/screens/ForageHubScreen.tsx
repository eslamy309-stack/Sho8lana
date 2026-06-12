'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, ExternalLink, Zap, Star, Clock, BookOpen,
  TrendingUp, X, Search, Award, Flame, Globe,
  CheckCircle2, PlayCircle, RotateCcw, ShieldCheck, Loader2, Activity,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { cn } from '@/lib/utils'
import {
  FORAGE_PROGRAMS,
  FORAGE_CATEGORIES,
  type ForageProgram,
  type ForageCategory,
} from '@/lib/forage-programs'
import {
  launchForage, reportProgress, submitCertificate, getActivity,
  getActiveAttempt, clearActiveAttempt,
  type ForageAttempt, type ActiveAttempt,
} from '@/lib/forage-tracking'

// ─── Constants ───────────────────────────────────────────────────────────────

const LEVEL_COLORS: Record<string, { bg: string; text: string }> = {
  Beginner:     { bg: '#DCFCE7', text: '#166534' },
  Intermediate: { bg: '#FEF3C7', text: '#92400E' },
}

const STATUS_META: Record<ForageAttempt['status'], { label: string; bg: string; text: string }> = {
  launched:    { label: 'Launched',    bg: '#DBEAFE', text: '#1E40AF' },
  in_progress: { label: 'In progress', bg: '#FEF3C7', text: '#92400E' },
  completed:   { label: 'Completed',   bg: '#DCFCE7', text: '#166534' },
  abandoned:   { label: 'Stopped',     bg: '#F3F4F6', text: '#6B7280' },
}

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }
const up = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.26, ease: [0.16, 1, 0.3, 1] } },
}

function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.round(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.round(h / 24)}d ago`
}

function fmtDuration(sec: number): string {
  if (!sec) return '—'
  const h = Math.floor(sec / 3600)
  const m = Math.round((sec % 3600) / 60)
  return h ? `${h}h ${m}m` : `${m}m`
}

// ─── Status pill ──────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: ForageAttempt['status'] }) {
  const m = STATUS_META[status]
  return (
    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: m.bg, color: m.text }}>
      {m.label}
    </span>
  )
}

// ─── Program Card ─────────────────────────────────────────────────────────────

function ProgramCard({
  program, delay, attempt, loggedIn, launchingId, onLaunch,
}: {
  program: ForageProgram
  delay: number
  attempt?: ForageAttempt
  loggedIn: boolean
  launchingId: string | null
  onLaunch: (p: ForageProgram) => void
}) {
  const lvl = LEVEL_COLORS[program.level] ?? LEVEL_COLORS.Beginner
  const launching = launchingId === program.id
  const inProgress = attempt && (attempt.status === 'launched' || attempt.status === 'in_progress')
  const done = attempt?.status === 'completed'

  return (
    <motion.div
      variants={up}
      custom={delay}
      className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden"
    >
      {/* Top color strip */}
      <div
        className="h-1.5 w-full"
        style={{ background: `linear-gradient(90deg, ${program.color}, ${program.color}55)` }}
      />

      <div className="p-4">
        {/* Company + title */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-[10px] font-black text-white"
            style={{ background: program.color }}
          >
            {program.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <p className="text-[10px] font-semibold text-neutral-400 truncate">{program.company}</p>
              {program.hot && (
                <span className="flex items-center gap-0.5 text-[9px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full shrink-0">
                  <Flame className="w-2.5 h-2.5" /> Hot
                </span>
              )}
              {attempt && <StatusPill status={attempt.status} />}
            </div>
            <p className="text-sm font-bold text-neutral-900 leading-snug line-clamp-2">{program.title}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-neutral-500 leading-relaxed mb-3 line-clamp-2">{program.description}</p>

        {/* Progress (if there is an attempt) */}
        {attempt && attempt.status !== 'abandoned' && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-semibold text-neutral-400">
                {done ? 'Completed' : `${attempt.progress_pct}% complete`}
                {attempt.attempt_number > 1 && <span className="text-neutral-300"> · attempt {attempt.attempt_number}</span>}
              </span>
              {attempt.certificate_verified && (
                <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-600">
                  <ShieldCheck className="w-2.5 h-2.5" /> Verified
                </span>
              )}
            </div>
            <div className="h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${attempt.progress_pct}%`, background: done ? '#16A34A' : program.color }}
              />
            </div>
          </div>
        )}

        {/* Meta strip */}
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <span className="flex items-center gap-1 text-[10px] text-neutral-500">
            <Clock className="w-3 h-3" /> {program.duration}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-neutral-500">
            <BookOpen className="w-3 h-3" /> {program.tasks} tasks
          </span>
          <span className="flex items-center gap-1 text-[10px] text-neutral-500">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="font-semibold text-neutral-700">{program.rating}</span>
            <span className="text-neutral-400">· {program.enrolled}</span>
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span
            className="text-[9px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: `${program.color}18`, color: program.color }}
          >
            {program.category}
          </span>
          <span
            className="text-[9px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: lvl.bg, color: lvl.text }}
          >
            {program.level}
          </span>
          {program.skills.slice(0, 2).map(s => (
            <span key={s} className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
              {s}
            </span>
          ))}
          {program.skills.length > 2 && (
            <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-400">
              +{program.skills.length - 2}
            </span>
          )}
        </div>

        {/* CTA — tracked launch for logged-in users; plain link otherwise */}
        {loggedIn ? (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onLaunch(program)}
            disabled={launching}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white text-xs font-bold disabled:opacity-70"
            style={{ background: `linear-gradient(135deg, ${program.color}, ${program.color}CC)` }}
          >
            {launching
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Opening…</>
              : done
                ? <><RotateCcw className="w-3.5 h-3.5" /> Retake on Forage</>
                : inProgress
                  ? <><PlayCircle className="w-3.5 h-3.5" /> Resume on Forage</>
                  : <>Start on Forage <ExternalLink className="w-3.5 h-3.5" /></>}
          </motion.button>
        ) : (
          <motion.a
            whileTap={{ scale: 0.97 }}
            href={program.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white text-xs font-bold"
            style={{ background: `linear-gradient(135deg, ${program.color}, ${program.color}CC)` }}
          >
            Start on Forage
            <ExternalLink className="w-3.5 h-3.5" />
          </motion.a>
        )}
      </div>
    </motion.div>
  )
}

// ─── Return / progress modal ──────────────────────────────────────────────────

function ReturnModal({
  attempt, busy, error, onProgress, onComplete, onAbandon, onCertificate, onClose,
}: {
  attempt: ActiveAttempt
  busy: boolean
  error: string | null
  onProgress: (pct: number) => void
  onComplete: () => void
  onAbandon: () => void
  onCertificate: (url: string) => void
  onClose: () => void
}) {
  const [showCert, setShowCert] = useState(false)
  const [certUrl, setCertUrl] = useState('')

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 pt-5 pb-4 border-b border-neutral-100 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-neutral-900">Welcome back!</p>
            <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1">How did <span className="font-semibold">{attempt.title}</span> go?</p>
          </div>
          <button onClick={onClose} aria-label="Close"><X className="w-4 h-4 text-neutral-400" /></button>
        </div>

        <div className="p-5 space-y-4">
          {!showCert ? (
            <>
              <div>
                <p className="text-[11px] font-semibold text-neutral-600 mb-2">Still working on it? Update your progress:</p>
                <div className="grid grid-cols-3 gap-2">
                  {[25, 50, 75].map(pct => (
                    <button
                      key={pct}
                      onClick={() => onProgress(pct)}
                      disabled={busy}
                      className="py-2 rounded-xl text-xs font-bold bg-neutral-100 text-neutral-700 hover:bg-neutral-200 disabled:opacity-50"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowCert(true)}
                disabled={busy}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" /> I finished it
              </button>

              <button
                onClick={onAbandon}
                disabled={busy}
                className="w-full py-2 rounded-xl text-xs font-semibold text-neutral-500 hover:bg-neutral-50 disabled:opacity-50"
              >
                I stopped — didn&apos;t finish
              </button>
            </>
          ) : (
            <>
              <div>
                <p className="text-[11px] font-semibold text-neutral-600 mb-1.5">
                  Paste your Forage certificate link to verify completion
                </p>
                <input
                  autoFocus
                  value={certUrl}
                  onChange={e => setCertUrl(e.target.value)}
                  placeholder="https://www.theforage.com/…"
                  className="w-full text-xs px-3 py-2.5 rounded-xl bg-neutral-100 outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <p className="text-[10px] text-neutral-400 mt-1.5">
                  Find it on your Forage dashboard → certificate → “Share”. We verify it server-side.
                </p>
              </div>
              <button
                onClick={() => onCertificate(certUrl.trim())}
                disabled={busy || !certUrl.trim()}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />} Verify & complete
              </button>
              <button
                onClick={onComplete}
                disabled={busy}
                className="w-full py-2 rounded-xl text-xs font-semibold text-neutral-500 hover:bg-neutral-50 disabled:opacity-50"
              >
                Mark complete without a certificate
              </button>
              <button
                onClick={() => setShowCert(false)}
                disabled={busy}
                className="w-full py-1.5 text-[11px] text-neutral-400"
              >
                ← Back
              </button>
            </>
          )}

          {error && <p className="text-[11px] text-red-500 text-center">{error}</p>}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── My Forage Activity section ───────────────────────────────────────────────

function ActivitySection({
  attempts, onUpdate,
}: {
  attempts: ForageAttempt[]
  onUpdate: (a: ForageAttempt) => void
}) {
  if (attempts.length === 0) return null

  return (
    <div className="px-4 pt-4 shrink-0">
      <div className="flex items-center gap-2 mb-2.5">
        <Activity className="w-4 h-4 text-blue-600" />
        <h2 className="text-sm font-bold text-neutral-900">My Forage Activity</h2>
        <span className="text-[10px] text-neutral-400">{attempts.length} tracked</span>
      </div>
      <div className="space-y-2">
        {attempts.map(a => {
          const done = a.status === 'completed'
          return (
            <div key={a.attempt_token} className="bg-white rounded-2xl border border-neutral-100 p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <p className="text-xs font-bold text-neutral-900 truncate">{a.title}</p>
                  <StatusPill status={a.status} />
                  {a.certificate_verified && <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />}
                </div>
                <div className="h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden mb-1">
                  <div className="h-full rounded-full" style={{ width: `${a.progress_pct}%`, background: done ? '#16A34A' : '#3B82F6' }} />
                </div>
                <div className="flex items-center gap-2.5 text-[9px] text-neutral-400">
                  <span>{a.company}</span>
                  <span>· {fmtDuration(a.time_spent_seconds)}</span>
                  {a.score != null && <span>· {a.score}%</span>}
                  <span>· {relTime(a.last_activity_at)}</span>
                </div>
              </div>
              {!done && (
                <button
                  onClick={() => onUpdate(a)}
                  className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg shrink-0"
                >
                  Update
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function ForageHubScreen() {
  const { state, dispatch } = useApp()
  const ar = state.lang === 'ar'
  const loggedIn = Boolean(state.user.supabaseId)

  const [activeCategory, setCategory] = useState<ForageCategory | 'All'>('All')
  const [query, setQuery]             = useState('')
  const [showSearch, setShowSearch]   = useState(false)

  // Tracking state
  const [attempts, setAttempts]   = useState<ForageAttempt[]>([])
  const [launchingId, setLaunchingId] = useState<string | null>(null)
  const [modal, setModal]         = useState<ActiveAttempt | null>(null)
  const [busy, setBusy]           = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const dismissedRef              = useRef<string | null>(null)

  // Latest attempt per program (highest attempt_number)
  const latestByProgram = useMemo(() => {
    const map: Record<string, ForageAttempt> = {}
    for (const a of attempts) {
      if (!map[a.program_id] || a.attempt_number > map[a.program_id].attempt_number) map[a.program_id] = a
    }
    return map
  }, [attempts])

  const refreshActivity = useCallback(async () => {
    if (!loggedIn) return
    try {
      const { attempts: rows } = await getActivity()
      setAttempts(rows)
    } catch { /* ignore — non-critical */ }
  }, [loggedIn])

  useEffect(() => { refreshActivity() }, [refreshActivity])

  // Return detection: when the user comes back to this tab with a launch open,
  // prompt them once per launch to record progress.
  useEffect(() => {
    function onVis() {
      if (document.visibilityState !== 'visible') return
      const active = getActiveAttempt()
      if (active && dismissedRef.current !== active.attemptToken) {
        setModal(active)
        refreshActivity()
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [refreshActivity])

  const handleLaunch = useCallback(async (program: ForageProgram) => {
    setError(null)
    setLaunchingId(program.id)
    dismissedRef.current = null   // allow the modal to show for this new launch
    try {
      await launchForage(program)
      await refreshActivity()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not launch')
    } finally {
      setLaunchingId(null)
    }
  }, [refreshActivity])

  // Award XP + a badge into the shared store (flows into Home stats + Leaderboard).
  // Idempotent per program via the store's forageDone guard.
  const awardXp = useCallback((programId: string, verified: boolean) => {
    const prog = FORAGE_PROGRAMS.find(p => p.id === programId)
    if (!prog) return
    const base = prog.level === 'Intermediate' ? 100 : 50
    dispatch({
      type: 'AWARD_FORAGE',
      programId,
      xp: base + (verified ? 50 : 0),
      badgeLabel: `${prog.company} — ${prog.title}`,
      trackId: prog.category,
    })
  }, [dispatch])

  // Modal actions
  const closeModal = useCallback(() => {
    if (modal) dismissedRef.current = modal.attemptToken
    setModal(null); setError(null)
  }, [modal])

  const doProgress = useCallback(async (pct: number) => {
    if (!modal) return
    setBusy(true); setError(null)
    try {
      await reportProgress({ attemptToken: modal.attemptToken, event: 'progress', progressPct: pct })
      await refreshActivity(); closeModal()
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed') } finally { setBusy(false) }
  }, [modal, refreshActivity, closeModal])

  const doComplete = useCallback(async () => {
    if (!modal) return
    setBusy(true); setError(null)
    try {
      await reportProgress({ attemptToken: modal.attemptToken, event: 'completed' })
      awardXp(modal.programId, false)
      clearActiveAttempt(); await refreshActivity(); closeModal()
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed') } finally { setBusy(false) }
  }, [modal, refreshActivity, closeModal, awardXp])

  const doAbandon = useCallback(async () => {
    if (!modal) return
    setBusy(true); setError(null)
    try {
      await reportProgress({ attemptToken: modal.attemptToken, event: 'abandoned' })
      clearActiveAttempt(); await refreshActivity(); closeModal()
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed') } finally { setBusy(false) }
  }, [modal, refreshActivity, closeModal])

  const doCertificate = useCallback(async (url: string) => {
    if (!modal) return
    setBusy(true); setError(null)
    try {
      const { verified } = await submitCertificate(modal.attemptToken, url)
      awardXp(modal.programId, verified)
      clearActiveAttempt(); await refreshActivity(); closeModal()
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not verify certificate') } finally { setBusy(false) }
  }, [modal, refreshActivity, closeModal, awardXp])

  const openUpdateFor = useCallback((a: ForageAttempt) => {
    dismissedRef.current = null
    setModal({ attemptToken: a.attempt_token, programId: a.program_id, company: a.company, title: a.title, launchedAt: a.last_activity_at })
  }, [])

  const filtered = useMemo(() => {
    let list = [...FORAGE_PROGRAMS]
    if (activeCategory !== 'All') list = list.filter(p => p.category === activeCategory)
    if (query) {
      const q = query.toLowerCase()
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.company.toLowerCase().includes(q) ||
        p.skills.some(s => s.toLowerCase().includes(q))
      )
    }
    return list
  }, [activeCategory, query])

  // Personalized recommendations: rank by skill overlap with the user's profile,
  // falling back to trending programs when we have no signal yet.
  const recommended = useMemo(() => {
    if (!loggedIn) return [] as ForageProgram[]
    const skills = (state.user.skills ?? []).map(s => s.toLowerCase())
    const major  = (state.user.major ?? '').toLowerCase()
    const completed = new Set(
      Object.values(latestByProgram).filter(a => a.status === 'completed').map(a => a.program_id),
    )
    const open = FORAGE_PROGRAMS.filter(p => !completed.has(p.id))
    const scored = open.map(p => {
      const overlap = p.skills.filter(s => skills.includes(s.toLowerCase())).length
      const majorHit = major && (p.category.toLowerCase().includes(major) || p.skills.some(s => major.includes(s.toLowerCase()))) ? 1 : 0
      return { p, score: overlap * 2 + majorHit }
    })
    const withSignal = scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score || b.p.rating - a.p.rating)
    const list = withSignal.length > 0 ? withSignal.map(s => s.p) : open.filter(p => p.hot)
    return list.slice(0, 4)
  }, [loggedIn, state.user.skills, state.user.major, latestByProgram])

  const hotCount = FORAGE_PROGRAMS.filter(p => p.hot).length
  const totalEnrolled = FORAGE_PROGRAMS.reduce((acc, p) => {
    const n = parseFloat(p.enrolled.replace(/[^0-9.]/g, '')) * (p.enrolled.includes('k') ? 1000 : 1)
    return acc + n
  }, 0)

  return (
    <div className="flex flex-col h-full bg-neutral-50">

      {/* ── Header ── */}
      <div className="bg-white border-b border-neutral-100 px-4 pt-10 md:pt-4 pb-3 shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => dispatch({ type: 'GO_BACK' })}
            className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center shrink-0"
            aria-label="Go back"
          >
            {ar ? <ChevronRight className="w-4 h-4 text-neutral-700" /> : <ChevronLeft className="w-4 h-4 text-neutral-700" />}
          </motion.button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              <h1 className="text-base font-bold text-neutral-900">Forage Programs</h1>
              <span className="text-[9px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                LIVE
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 mt-0.5">Real job simulations — now tracked to your sho8lana account</p>
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => { setShowSearch(s => !s); if (showSearch) setQuery('') }}
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center',
              showSearch ? 'bg-neutral-900' : 'bg-neutral-100'
            )}
            aria-label={showSearch ? 'Close search' : 'Search programs'}
          >
            {showSearch
              ? <X className="w-4 h-4 text-white" />
              : <Search className="w-4 h-4 text-neutral-700" />}
          </motion.button>
        </div>

        {/* Search bar */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mb-2"
            >
              <div className="flex items-center gap-2 bg-neutral-100 rounded-xl px-3 py-2.5">
                <Search className="w-4 h-4 text-neutral-400 shrink-0" />
                <input
                  autoFocus
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search company, skill, or title…"
                  className="flex-1 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 outline-none"
                />
                {query && (
                  <button onClick={() => setQuery('')} aria-label="Clear search">
                    <X className="w-3.5 h-3.5 text-neutral-400" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scroll-hide">
          {(['All', ...FORAGE_CATEGORIES] as const).map(cat => {
            const active = activeCategory === cat
            return (
              <motion.button
                key={cat}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCategory(cat as ForageCategory | 'All')}
                className={cn(
                  'shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-colors',
                  active
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white text-neutral-600 border-neutral-200'
                )}
              >
                {cat}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto">
        {/* Stats hero */}
        <div className="px-4 pt-3 pb-1">
          <div
            className="rounded-2xl p-4 text-white overflow-hidden relative"
            style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)' }}
          >
            <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full opacity-15"
                 style={{ background: 'radial-gradient(circle, #60A5FA, transparent 70%)' }} />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-[10px] font-semibold text-white/50 mb-0.5 uppercase tracking-wider">Job Simulations</p>
                <p className="text-2xl font-extrabold">{FORAGE_PROGRAMS.length} Programs</p>
                <p className="text-[10px] text-white/40 mt-0.5">
                  {Math.round(totalEnrolled / 1000).toLocaleString()}K+ global completions
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1.5 rounded-xl">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-bold">{hotCount} Trending</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1.5 rounded-xl">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-bold">100% Free</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/10 relative z-10">
              <TrendingUp className="w-3 h-3 text-white/30" />
              <p className="text-[9px] text-white/40">
                Sourced from{' '}
                <a
                  href="https://www.theforage.com/simulations?qfilter=recommended"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 underline underline-offset-2"
                >
                  theforage.com
                </a>
                {' '}· Launch, return, and we track your progress automatically
              </p>
            </div>
          </div>
        </div>

        {/* My Forage Activity */}
        {loggedIn && <ActivitySection attempts={attempts} onUpdate={openUpdateFor} />}

        {/* Recommended for you */}
        {loggedIn && recommended.length > 0 && activeCategory === 'All' && !query && (
          <div className="px-4 pt-4 shrink-0">
            <div className="flex items-center gap-2 mb-2.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-neutral-900">Recommended for you</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto scroll-hide pb-1 -mx-4 px-4">
              {recommended.map(p => {
                const launching = launchingId === p.id
                const reason = (state.user.skills ?? []).some(s => p.skills.map(x => x.toLowerCase()).includes(s.toLowerCase()))
                  ? 'Matches your skills' : 'Trending pick'
                return (
                  <motion.button
                    key={p.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleLaunch(p)}
                    disabled={launching}
                    className="flex-shrink-0 w-44 text-left bg-white rounded-2xl border border-neutral-100 shadow-sm p-3 disabled:opacity-70"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[9px] font-black text-white shrink-0"
                           style={{ background: p.color }}>
                        {p.initials}
                      </div>
                      <p className="text-[10px] font-semibold text-neutral-400 truncate">{p.company}</p>
                    </div>
                    <p className="text-xs font-bold text-neutral-900 leading-snug line-clamp-2 mb-2 min-h-[2rem]">{p.title}</p>
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: `${p.color}14`, color: p.color }}>
                      {launching ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Zap className="w-2.5 h-2.5" />}
                      {reason}
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </div>
        )}

        {/* Program list */}
        <div className="px-4 pt-4 pb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-neutral-600">
              {filtered.length} program{filtered.length !== 1 ? 's' : ''}
              {activeCategory !== 'All' && <span className="text-neutral-400"> in {activeCategory}</span>}
            </p>
            {(activeCategory !== 'All' || query) && (
              <button
                onClick={() => { setCategory('All'); setQuery('') }}
                className="text-[11px] text-brand-600 font-semibold"
              >
                Clear filters
              </button>
            )}
          </div>

          <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.length === 0 ? (
              <div className="col-span-full text-center py-16 flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mb-3">
                  <Search className="w-6 h-6 text-neutral-400" />
                </div>
                <p className="text-sm font-semibold text-neutral-700">No programs found</p>
                <p className="text-xs text-neutral-400 mt-1">Try a different category or search</p>
              </div>
            ) : (
              filtered.map((p, i) => (
                <ProgramCard
                  key={p.id}
                  program={p}
                  delay={i}
                  attempt={latestByProgram[p.id]}
                  loggedIn={loggedIn}
                  launchingId={launchingId}
                  onLaunch={handleLaunch}
                />
              ))
            )}
          </motion.div>

          {/* Browse all CTA */}
          <motion.a
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            href="https://www.theforage.com/simulations?qfilter=recommended"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-neutral-300 text-xs font-semibold text-neutral-500"
          >
            <ExternalLink className="w-4 h-4" />
            Browse 700+ programs on theforage.com
          </motion.a>
        </div>
      </div>

      {/* Return / progress modal */}
      <AnimatePresence>
        {modal && (
          <ReturnModal
            attempt={modal}
            busy={busy}
            error={error}
            onProgress={doProgress}
            onComplete={doComplete}
            onAbandon={doAbandon}
            onCertificate={doCertificate}
            onClose={closeModal}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
