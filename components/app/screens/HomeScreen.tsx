'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Search, Globe, Wifi, MapPin, Star, Zap, Map, Bookmark,
  BookmarkCheck, Building2, ExternalLink, ChevronRight, ChevronLeft,
  TrendingUp, Briefcase, BarChart2, Send, Check, Loader2, MessageCircle, PlayCircle,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { COMPANIES, JOBS, SOURCE_CONFIG } from '@/lib/data'
import { DOCUMENTS } from '@/lib/data'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import type { Job, LiveJob } from '@/lib/types'
import { fetchLiveJobs, getWuzzufMockJobs, formatTimeAgo } from '@/lib/api'
import { getActivity, type ForageAttempt } from '@/lib/forage-tracking'

interface DbJob {
  id: string
  title: string
  company_name: string
  location: string | null
  type: string | null
  description: string | null
  created_at: string
}

// Tighter stagger for large lists — fewer delays = less perceived lag
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }
const up = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] } },
}

/** Generate 1–2 letter initials from a company name */
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(w => /^[A-Za-z؀-ۿ]/.test(w))
  if (words.length === 0) return name.slice(0, 2).toUpperCase()
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return words.slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

/** Time-aware greeting using the user's first name */
function getGreeting(name: string | undefined, ar: boolean): string {
  const first = (name ?? '').split(' ')[0]
  if (ar) return first ? `مرحباً، ${first}` : 'مرحباً'
  const h = new Date().getHours()
  const time = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  return first ? `${time}, ${first}` : time
}

const JOB_LOCATIONS = ['All', ...Array.from(new Set(JOBS.map(j => j.location)))]
const INDUSTRIES = ['All', ...Array.from(new Set(JOBS.map(j => j.industry)))]

type HomeTab = 'local' | 'linkedin' | 'wuzzuf'

function SourceBadge({ source }: { source: keyof typeof SOURCE_CONFIG }) {
  const cfg = SOURCE_CONFIG[source]
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-2xs font-bold tracking-wide"
      style={{ background: `${cfg.color}18`, color: cfg.color }}
    >
      {cfg.label}
    </span>
  )
}

function JobCard({ job, index }: { job: Job; index: number }) {
  const { state, dispatch } = useApp()
  const ar = state.lang === 'ar'
  const company = COMPANIES.find(c => c.id === job.companyId)!
  const applied = state.applications.some(a => a.jobId === job.id)
  const saved = state.savedJobs.includes(job.id)

  return (
    <motion.div
      variants={up}
      custom={index}
      className="bg-white rounded-xl border border-neutral-200 p-4 shadow-card hover:border-neutral-300 transition-colors duration-150"
    >
      <button
        className="w-full text-left"
        onClick={() => { dispatch({ type: 'SELECT_JOB', id: job.id }); dispatch({ type: 'GO', screen: 'detail' }) }}
      >
        <div className="flex gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-extrabold text-white"
               style={{ background: company.color }}>
            {getInitials(company.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-neutral-900">{ar ? job.titleAr : job.title}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{company.name}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {applied && (
                  <span className="text-2xs font-semibold text-success-600 bg-success-50 px-2 py-0.5 rounded-full">
                    {ar ? 'تقدّمت ✓' : 'Applied ✓'}
                  </span>
                )}
                <SourceBadge source={job.source} />
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="inline-flex items-center gap-1 text-2xs text-neutral-500 bg-neutral-50 px-2 py-1 rounded-lg">
                <MapPin className="w-2.5 h-2.5" /> {job.location}
              </span>
              <span className="text-2xs font-semibold text-warning-700 bg-warning-50 px-2 py-1 rounded-lg">
                {job.salary}
              </span>
              {job.type && (
                <span className={cn(
                  'text-2xs font-semibold px-2 py-1 rounded-lg',
                  job.type === 'internship' ? 'text-brand-600 bg-brand-50' : 'text-violet-600 bg-violet-50',
                )}>
                  {job.type === 'internship' ? (ar ? 'تدريب' : 'Internship') : (ar ? 'دوام كامل' : 'Full-time')}
                </span>
              )}
              {job.skills.slice(0, 2).map(s => (
                <span key={s} className="text-2xs text-brand-600 bg-brand-50 px-2 py-1 rounded-lg font-medium">{s}</span>
              ))}
              {job.skills.length > 2 && (
                <span className="text-2xs text-neutral-400">+{job.skills.length - 2}</span>
              )}
            </div>
          </div>
        </div>
      </button>
      {/* Save button — extended hit area via padding */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-50">
        <p className="text-2xs text-neutral-400">{job.applicants} {ar ? 'متقدم' : 'applicants'} · {job.postedAgo}</p>
        <button
          onClick={e => { e.stopPropagation(); dispatch({ type: 'TOGGLE_SAVE_JOB', id: job.id }) }}
          aria-label={saved ? (ar ? 'إلغاء الحفظ' : 'Unsave job') : (ar ? 'حفظ الوظيفة' : 'Save job')}
          aria-pressed={saved}
          className="-mr-1 p-2 rounded-lg text-neutral-400 hover:text-brand-600 hover:bg-brand-50 active:bg-brand-100 transition-colors"
        >
          {saved
            ? <BookmarkCheck className="w-4 h-4 text-brand-600" />
            : <Bookmark className="w-4 h-4" />}
        </button>
      </div>
    </motion.div>
  )
}

function FeaturedCard({ job }: { job: Job }) {
  const { state, dispatch } = useApp()
  const ar = state.lang === 'ar'
  const company = COMPANIES.find(c => c.id === job.companyId)!

  return (
    <motion.button
      variants={up}
      whileTap={{ scale: 0.97 }}
      onClick={() => { dispatch({ type: 'SELECT_JOB', id: job.id }); dispatch({ type: 'GO', screen: 'detail' }) }}
      className="flex-shrink-0 w-[72vw] max-w-[272px] rounded-xl border border-neutral-200 p-4 text-left shadow-card bg-white hover:-translate-y-0.5 hover:shadow-md transition-[transform,box-shadow] duration-150"
      style={{ background: `linear-gradient(145deg, ${company.color}09, white)` }}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-extrabold text-white flex-shrink-0"
             style={{ background: company.color }}>
          {getInitials(company.name)}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-neutral-500 truncate">{company.name}</p>
          <p className="text-sm font-bold text-neutral-900 leading-tight">{ar ? job.titleAr : job.title}</p>
        </div>
        <SourceBadge source={job.source} />
      </div>
      <div className="flex gap-1.5 flex-wrap">
        <span className="inline-flex items-center gap-1 text-2xs text-brand-600 bg-brand-50 px-2 py-1 rounded-lg">
          <MapPin className="w-2.5 h-2.5" />{job.location}
        </span>
        <span className="text-2xs font-semibold text-warning-700 bg-warning-50 px-2 py-1 rounded-lg">
          {job.salary}
        </span>
      </div>
      <p className="text-2xs text-neutral-400 mt-2">{job.applicants} {ar ? 'متقدم' : 'applicants'} · {job.postedAgo}</p>
    </motion.button>
  )
}

/** Surfaces the user's most recent in-progress Forage simulation so they can jump
 *  back in. Renders nothing if the user is logged out or has no open attempt. */
function ForageResumeCard() {
  const { state, dispatch } = useApp()
  const ar = state.lang === 'ar'
  const [attempt, setAttempt] = useState<ForageAttempt | null>(null)

  useEffect(() => {
    if (!state.user.supabaseId) { setAttempt(null); return }
    let cancelled = false
    getActivity()
      .then(({ attempts }) => {
        if (cancelled) return
        const open = attempts
          .filter(a => a.status === 'launched' || a.status === 'in_progress')
          .sort((a, b) => +new Date(b.last_activity_at) - +new Date(a.last_activity_at))[0]
        setAttempt(open ?? null)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [state.user.supabaseId])

  if (!attempt) return null

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => dispatch({ type: 'GO', screen: 'forageHub' })}
      className="w-full rounded-2xl p-4 text-left relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)' }}
    >
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-15"
           style={{ background: 'radial-gradient(circle,#60A5FA,transparent 70%)' }} />
      <div className="flex items-center gap-3 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
          <PlayCircle className="w-5 h-5 text-blue-300" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-blue-300/80 uppercase tracking-wider">
            {ar ? 'تابع محاكاة Forage' : 'Continue your Forage simulation'}
          </p>
          <p className="text-sm font-bold text-white truncate">{attempt.title}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="h-1.5 flex-1 rounded-full bg-white/15 overflow-hidden">
              <div className="h-full rounded-full bg-blue-400" style={{ width: `${attempt.progress_pct}%` }} />
            </div>
            <span className="text-[10px] text-white/60 tabular-nums">{attempt.progress_pct}%</span>
          </div>
        </div>
        {ar ? <ChevronLeft className="w-4 h-4 text-white/50 flex-shrink-0" />
            : <ChevronRight className="w-4 h-4 text-white/50 flex-shrink-0" />}
      </div>
    </motion.button>
  )
}

export function HomeScreen() {
  const { state, dispatch } = useApp()
  const { lang, searchQuery, locationFilter, jobTypeFilter, industryFilter } = state
  const ar = lang === 'ar'
  const [tab, setTab] = useState<HomeTab>(JOBS.length > 0 ? 'local' : 'linkedin')
  const [paidOnly, setPaidOnly] = useState(false)
  const [visibleCount, setVisibleCount] = useState(10)
  const greeting = getGreeting(state.user.name, ar)

  // ── Debounced search (200 ms) ─────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState(searchQuery)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const handleSearch = useCallback((value: string) => {
    setSearchInput(value)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => dispatch({ type: 'SET_SEARCH', query: value }), 200)
  }, [dispatch])

  // DB jobs posted by companies
  const [dbJobs, setDbJobs]           = useState<DbJob[]>([])
  const [dbJobsLoading, setDbJobsLoading] = useState(false)

  // Per-live-job applying state: jobId → 'idle' | 'loading' | 'done' | 'error'
  const [liveApplyState, setLiveApplyState] = useState<Record<string, 'idle' | 'loading' | 'done' | 'error'>>({})
  const [liveApplyError, setLiveApplyError] = useState<Record<string, string>>({})

  const isProfileDone =
    state.user.name && state.user.university && state.user.major &&
    DOCUMENTS.filter(d => d.required).every(d => state.user.documents[d.key])

  // Load live jobs eagerly on mount
  useEffect(() => {
    if ((tab === 'linkedin' || tab === 'wuzzuf' || JOBS.length === 0) && state.liveJobs.length === 0 && !state.liveJobsLoading) {
      dispatch({ type: 'SET_LIVE_JOBS_LOADING', loading: true })
      fetchLiveJobs('intern Egypt').then(jobs => {
        dispatch({ type: 'SET_LIVE_JOBS', jobs })
        dispatch({ type: 'SET_LIVE_JOBS_LOADING', loading: false })
      })
    }
  }, [tab]) // eslint-disable-line react-hooks/exhaustive-deps

  // Load company-posted DB jobs for Direct tab
  useEffect(() => {
    if (tab !== 'local') return
    setDbJobsLoading(true)
    supabase
      .from('jobs')
      .select('id, title, location, type, description, created_at, companies(name)')
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        const rows: DbJob[] = (data ?? []).map((r: Record<string, unknown>) => ({
          id: r.id as string,
          title: r.title as string,
          company_name: ((r.companies as { name?: string } | null)?.name ?? 'Company') as string,
          location: r.location as string | null,
          type: r.type as string | null,
          description: r.description as string | null,
          created_at: r.created_at as string,
        }))
        setDbJobs(rows)
        setDbJobsLoading(false)
      })
  }, [tab])

  // Apply to a live (LinkedIn/Wuzzuf) job internally
  const applyToLiveJob = useCallback(async (j: LiveJob) => {
    if (!state.user.supabaseId) return
    setLiveApplyState(s => ({ ...s, [j.id]: 'loading' }))
    setLiveApplyError(s => ({ ...s, [j.id]: '' }))
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId:        state.user.supabaseId,
          jobTitle:      j.title,
          company:       j.company,
          externalJobId: j.id,
          externalUrl:   j.url,
          source:        j.source,
        }),
      })
      const data = await res.json()
      if (res.status === 409 || res.ok) {
        setLiveApplyState(s => ({ ...s, [j.id]: 'done' }))
        dispatch({ type: 'ADD_APPLICATION', app: {
          id: Date.now(), jobId: j.id, title: j.title, company: j.company,
          status: 'applied', date: new Date().toLocaleDateString('en-GB'), logo: '🔗',
          externalUrl: j.url, source: j.source,
        }})
      } else {
        setLiveApplyState(s => ({ ...s, [j.id]: 'error' }))
        setLiveApplyError(s => ({ ...s, [j.id]: data.error ?? 'Failed' }))
      }
    } catch {
      setLiveApplyState(s => ({ ...s, [j.id]: 'error' }))
      setLiveApplyError(s => ({ ...s, [j.id]: 'Connection error' }))
    }
  }, [state.user.supabaseId, dispatch])

  // Apply to a company-posted DB job
  const applyToDbJob = useCallback(async (j: DbJob) => {
    if (!state.user.supabaseId) return
    setLiveApplyState(s => ({ ...s, [j.id]: 'loading' }))
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId:    state.user.supabaseId,
          jobId:     j.id,
          jobTitle:  j.title,
          company:   j.company_name,
          source:    'company',
        }),
      })
      const data = await res.json()
      if (res.status === 409 || res.ok) {
        setLiveApplyState(s => ({ ...s, [j.id]: 'done' }))
        dispatch({ type: 'ADD_APPLICATION', app: {
          id: data.application?.id ?? Date.now(),
          jobId: j.id, title: j.title, company: j.company_name,
          status: 'applied', date: new Date().toLocaleDateString('en-GB'), logo: '🏢',
        }})
      } else {
        setLiveApplyState(s => ({ ...s, [j.id]: 'error' }))
        setLiveApplyError(s => ({ ...s, [j.id]: data.error ?? 'Failed' }))
      }
    } catch {
      setLiveApplyState(s => ({ ...s, [j.id]: 'error' }))
    }
  }, [state.user.supabaseId, dispatch])

  // Check if already applied (by jobId or externalUrl)
  const isApplied = useCallback((key: string) => {
    const st = liveApplyState[key]
    if (st === 'done') return true
    return state.applications.some(a =>
      a.jobId === key || a.externalUrl === key
    )
  }, [liveApplyState, state.applications])

  const wuzzufJobs = getWuzzufMockJobs()

  const filtered = JOBS.filter(j => {
    const q = searchQuery.toLowerCase()
    const matchQ = !q || (ar ? j.titleAr : j.title).toLowerCase().includes(q) ||
      j.skills.some(s => s.toLowerCase().includes(q)) ||
      COMPANIES.find(c => c.id === j.companyId)?.name.toLowerCase().includes(q)
    const matchL = locationFilter === 'All' || j.location === locationFilter
    const matchT = jobTypeFilter === 'all' || j.type === jobTypeFilter
    const matchI = industryFilter === 'All' || j.industry === industryFilter
    const matchP = !paidOnly || (j.salary && !j.salary.toLowerCase().includes('unpaid') && !j.salary.toLowerCase().includes('0'))
    return matchQ && matchL && matchT && matchI && matchP
  })

  const activeFilterCount = [
    locationFilter !== 'All', jobTypeFilter !== 'all',
    industryFilter !== 'All', paidOnly,
  ].filter(Boolean).length

  // Reset visible count when filters change so the list doesn't stay truncated
  useEffect(() => { setVisibleCount(10) }, [searchQuery, locationFilter, jobTypeFilter, industryFilter, paidOnly])

  const featured = JOBS.filter(j => j.featured)

  return (
    <div className="min-h-dvh bg-neutral-50 pb-6">
      {/* Topbar — hidden on desktop (DesktopTopNav in Shell handles it) */}
      <div className="md:hidden sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-neutral-100 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center shadow-sm">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-serif text-lg text-neutral-900 tracking-tight">Sho8lana</span>
          {ar && <span className="text-sm text-neutral-400">شغلانة</span>}
        </div>
        {/* Icon buttons: 44×44 touch targets */}
        <div className="flex gap-1">
          <button
            onClick={() => dispatch({ type: 'GO', screen: 'map' })}
            aria-label={ar ? 'خريطة الفرص' : 'Opportunity Map'}
            className="w-11 h-11 rounded-xl border border-neutral-150 bg-white flex items-center justify-center text-brand-600 hover:bg-brand-50 active:bg-brand-100 transition-colors"
          >
            <Map className="w-4 h-4" />
          </button>
          <button
            onClick={() => dispatch({ type: 'GO', screen: 'companyPortal' })}
            aria-label={ar ? 'بوابة الشركات' : 'Employer Portal'}
            className="w-11 h-11 rounded-xl border border-neutral-150 bg-white flex items-center justify-center text-neutral-500 hover:bg-neutral-50 active:bg-neutral-100 transition-colors"
          >
            <Building2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => dispatch({ type: 'GO', screen: 'feeds' })}
            aria-label={ar ? 'المستجدات الحية' : 'Live Feeds'}
            className="w-11 h-11 rounded-xl border border-neutral-150 bg-white flex items-center justify-center text-success-500 hover:bg-neutral-50 active:bg-neutral-100 transition-colors"
          >
            <Wifi className="w-4 h-4" />
          </button>
          <button
            onClick={() => dispatch({ type: 'GO', screen: 'lang' })}
            aria-label={ar ? 'تغيير اللغة' : 'Change Language'}
            className="w-11 h-11 rounded-xl border border-neutral-150 bg-white flex items-center justify-center text-neutral-500 hover:bg-neutral-50 active:bg-neutral-100 transition-colors"
          >
            <Globe className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-3">

        {/* ── Personalized greeting ── */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-xl font-black text-neutral-900 leading-tight">
            {greeting} 👋
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            {ar
              ? `${JOBS.length} فرصة متاحة · ابحث واقدّم الآن`
              : `${JOBS.length} opportunities · find & apply today`}
          </p>
        </motion.div>

        {/* ── Stats strip ── */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: state.applications.length, label: ar ? 'طلباتي'  : 'Applied',  color: 'text-brand-600',  bg: 'bg-brand-50',  border: 'border-brand-100' },
            { value: state.savedJobs.length,    label: ar ? 'محفوظة'  : 'Saved',    color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
            { value: state.simXP,               label: ar ? 'نقاط XP' : 'XP',       color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-100' },
          ].map(s => (
            <div key={s.label} className={`rounded-xl px-3 py-2.5 border text-center ${s.bg} ${s.border}`}>
              <p className={`text-lg font-black tabular-nums ${s.color}`}>{s.value}</p>
              <p className="text-2xs text-neutral-500 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Continue your Forage simulation (only if an open attempt exists) */}
        <ForageResumeCard />

        {/* Source tabs */}
        <div className="flex gap-1 bg-neutral-100 rounded-xl p-1">
          {(['local', 'linkedin', 'wuzzuf'] as HomeTab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 py-2.5 rounded-lg text-xs font-semibold transition-colors min-h-[44px]',
                tab === t ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700',
              )}
            >
              {t === 'local'
                ? (ar ? 'مباشر' : 'Direct')
                : t === 'linkedin'
                ? 'LinkedIn'
                : 'Wuzzuf'}
            </button>
          ))}
        </div>

        {/* Search — debounced 200 ms */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          <input
            type="search"
            inputMode="search"
            autoComplete="off"
            aria-label={ar ? 'ابحث عن وظيفة' : 'Search jobs'}
            className="w-full h-11 pl-9 pr-4 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 transition-all"
            placeholder={ar ? 'ابحث بالعنوان أو المهارة...' : 'Search title, skill, company…'}
            value={searchInput}
            onChange={e => handleSearch(e.target.value)}
          />
        </div>

        {/* Location + Type filters (local tab only) */}
        {tab === 'local' && (
          <>
            <div className="flex gap-2 overflow-x-auto scroll-hide pb-1">
              {JOB_LOCATIONS.map(loc => (
                <motion.button
                  key={loc}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => dispatch({ type: 'SET_LOCATION_FILTER', location: loc })}
                  className={cn(
                    'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150',
                    locationFilter === loc
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300',
                  )}
                >
                  {loc === 'All' ? (ar ? 'الكل' : 'All') : loc}
                </motion.button>
              ))}
            </div>
            <div className="flex gap-2 overflow-x-auto scroll-hide pb-1">
              {(['all', 'internship', 'full-time'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => dispatch({ type: 'SET_JOB_TYPE_FILTER', filter: f })}
                  className={cn(
                    'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                    jobTypeFilter === f
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300',
                  )}
                >
                  {f === 'all' ? (ar ? 'الكل' : 'All')
                    : f === 'internship' ? (ar ? 'تدريب' : 'Internship')
                    : (ar ? 'دوام كامل' : 'Full-time')}
                </button>
              ))}
            </div>

            {/* Industry filter + Paid toggle */}
            <div className="flex gap-2 overflow-x-auto scroll-hide pb-1">
              {INDUSTRIES.map(ind => (
                <button
                  key={ind}
                  onClick={() => dispatch({ type: 'SET_INDUSTRY_FILTER', industry: ind })}
                  className={cn(
                    'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                    industryFilter === ind
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300',
                  )}
                >
                  {ind === 'All' ? (ar ? 'كل القطاعات' : 'All Industries') : ind}
                </button>
              ))}
              <button
                onClick={() => setPaidOnly(p => !p)}
                className={cn(
                  'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                  paidOnly
                    ? 'bg-success-600 text-white border-success-600'
                    : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300',
                )}
              >
                💰 {ar ? 'مدفوع فقط' : 'Paid only'}
              </button>
            </div>

            {/* Active filter summary + clear */}
            {activeFilterCount > 0 && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-500">
                  {filtered.length} {ar ? 'نتيجة' : 'results'} · {activeFilterCount} {ar ? 'فلتر مفعّل' : 'filter(s) active'}
                </p>
                <button
                  onClick={() => {
                    dispatch({ type: 'SET_LOCATION_FILTER', location: 'All' })
                    dispatch({ type: 'SET_JOB_TYPE_FILTER', filter: 'all' })
                    dispatch({ type: 'SET_INDUSTRY_FILTER', industry: 'All' })
                    setPaidOnly(false)
                  }}
                  className="text-xs text-brand-600 font-semibold hover:underline"
                >
                  {ar ? 'مسح الكل' : 'Clear all'}
                </button>
              </div>
            )}
          </>
        )}

        {/* Profile completion banner — with visual progress bar */}
        {!isProfileDone && tab === 'local' && (() => {
          const pct = Math.round((Object.keys(state.user.documents).length / DOCUMENTS.length) * 100)
          return (
            <motion.button
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => dispatch({ type: 'GO', screen: 'onboard' })}
              className="w-full rounded-2xl p-4 text-left"
              style={{ background: 'linear-gradient(135deg, #0F172A 0%, #0c3f3c 60%, #0F766E 100%)' }}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white leading-snug">
                    {ar ? 'أكمل ملفك للتقديم بنقرة واحدة' : 'Complete your profile to apply in 1 tap'}
                  </p>
                  <p className="text-xs text-white/55 mt-1">
                    {ar ? 'ارفع مستنداتك مرة واحدة، قدّم في كل مكان' : 'Upload once, apply everywhere'}
                  </p>
                </div>
                <span className="text-lg font-black text-white tabular-nums flex-shrink-0">{pct}%</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-white/15 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                  className="h-full bg-brand-400 rounded-full"
                />
              </div>
            </motion.button>
          )
        })()}

        {/* Quick access shortcuts */}
        {tab === 'local' && (
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: TrendingUp, label: ar ? 'ملفي'      : 'Profile',     screen: 'talentProfile',  color: 'bg-emerald-500' },
              { icon: Briefcase,  label: ar ? 'التدريب'   : 'Internships', screen: 'internshipHub',  color: 'bg-violet-500'  },
              { icon: BarChart2,  label: ar ? 'تحليلاتي'  : 'Analytics',   screen: 'careerAnalytics',color: 'bg-indigo-500'  },
              { icon: Globe,      label: ar ? 'Forage'    : 'Forage',      screen: 'forageHub',      color: 'bg-blue-600'    },
            ].map(({ icon: Icon, label, screen, color }) => (
              <button
                key={screen}
                onClick={() => dispatch({ type: 'GO', screen: screen as never })}
                className="flex flex-col items-center gap-1.5 p-2.5 bg-white rounded-xl border border-neutral-100 hover:border-neutral-200 hover:shadow-sm transition-all min-h-[72px] justify-center"
              >
                <div className={`w-8 h-8 rounded-xl ${color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-[10px] font-semibold text-neutral-700 leading-tight text-center">{label}</span>
              </button>
            ))}
          </div>
        )}

        {/* ── Local jobs (Direct + curated) ── */}
        {tab === 'local' && (
          <>
            {/* Featured carousel */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-neutral-900">{ar ? 'فرص مميزة' : 'Featured'}</h3>
                <Star className="w-4 h-4 text-warning-500" />
              </div>
              <motion.div variants={stagger} initial="hidden" animate="visible"
                className="flex gap-3 overflow-x-auto scroll-hide pb-1 -mx-4 px-4">
                {featured.map(j => <FeaturedCard key={j.id} job={j} />)}
              </motion.div>
            </div>

            {/* Map banner */}
            <button
              onClick={() => dispatch({ type: 'GO', screen: 'map' })}
              className="flex items-center gap-3 p-3 bg-gradient-to-r from-brand-50 to-teal-50 rounded-xl border border-brand-100 text-left hover:border-brand-200 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center flex-shrink-0">
                <Map className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-neutral-900">{ar ? 'الشركات القريبة منك' : 'Companies near you'}</p>
                <p className="text-xs text-neutral-500">{ar ? 'اكتشف الفرص حسب الموقع على الخريطة' : 'Explore opportunities by location on the map'}</p>
              </div>
              {ar ? <ChevronLeft className="w-4 h-4 text-neutral-400 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-neutral-400 flex-shrink-0" />}
            </button>

            {/* Curated jobs list (paginated) */}
            {filtered.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-neutral-900">
                    {ar ? 'فرص مختارة' : 'Curated Opportunities'}
                  </h3>
                  <span className="text-xs text-neutral-400">{filtered.length} {ar ? 'نتيجة' : 'results'}</span>
                </div>
                <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filtered.slice(0, visibleCount).map((j, i) => <JobCard key={j.id} job={j} index={i} />)}
                </motion.div>
                {visibleCount < filtered.length && (
                  <button
                    onClick={() => setVisibleCount(v => v + 10)}
                    className="mt-3 w-full py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50 transition-all"
                  >
                    {ar ? `عرض المزيد (${filtered.length - visibleCount} متبقية)` : `Load more (${filtered.length - visibleCount} remaining)`}
                  </button>
                )}
              </div>
            )}

            {/* Company-posted DB jobs */}
            <div>
              <h3 className="text-sm font-bold text-neutral-900 mb-2">
                {ar ? 'وظائف الشركات' : 'Company Postings'}
              </h3>
              {dbJobsLoading ? (
                <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-neutral-400" /></div>
              ) : dbJobs.length === 0 ? (
                <div className="text-center py-10 flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center">
                    <Briefcase className="w-7 h-7 text-neutral-400" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-700 font-semibold">
                      {ar ? 'لا توجد وظائف محلية حالياً' : 'No local listings right now'}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">
                      {ar ? 'تصفح LinkedIn أو Wuzzuf للعثور على الفرص المتاحة' : 'Browse LinkedIn or Wuzzuf for live opportunities'}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => setTab('linkedin')}
                      className="px-4 py-2.5 min-h-[44px] bg-[#0077B5] text-white text-xs font-semibold rounded-xl hover:opacity-90 active:opacity-80 transition-opacity"
                    >
                      LinkedIn
                    </button>
                    <button
                      onClick={() => setTab('wuzzuf')}
                      className="px-4 py-2.5 min-h-[44px] bg-[#E8464E] text-white text-xs font-semibold rounded-xl hover:opacity-90 active:opacity-80 transition-opacity"
                    >
                      Wuzzuf
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {dbJobs.map(j => {
                    const applied = isApplied(j.id)
                    const st = liveApplyState[j.id] ?? 'idle'
                    return (
                      <div key={j.id} className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-extrabold text-white flex-shrink-0 bg-brand-600">
                            {getInitials(j.company_name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-neutral-900 leading-snug">{j.title}</p>
                                <p className="text-xs text-neutral-500 mt-0.5 truncate">{j.company_name}</p>
                              </div>
                              <span className="text-2xs font-bold px-2 py-0.5 rounded flex-shrink-0 bg-brand-50 text-brand-600">Direct</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {j.location && <span className="inline-flex items-center gap-1 text-2xs text-neutral-500 bg-neutral-50 px-2 py-1 rounded-lg"><MapPin className="w-2.5 h-2.5" />{j.location}</span>}
                          {j.type && <span className={cn('text-2xs font-semibold px-2 py-1 rounded-lg', j.type === 'internship' ? 'text-brand-600 bg-brand-50' : 'text-violet-600 bg-violet-50')}>{j.type === 'internship' ? (ar ? 'تدريب' : 'Internship') : j.type}</span>}
                          <span className="text-2xs text-neutral-400">{formatTimeAgo(j.created_at)}</span>
                        </div>
                        {liveApplyError[j.id] && <p className="text-xs text-red-500 mt-2">{liveApplyError[j.id]}</p>}
                        <div className="mt-3 flex items-center gap-2">
                          {applied ? (
                            <>
                              <span className="flex items-center gap-1 text-xs font-semibold text-success-600">
                                <Check className="w-3.5 h-3.5" /> {ar ? 'تم التقديم ✓' : 'Applied ✓'}
                              </span>
                              <button
                                onClick={() => {
                                  sessionStorage.setItem('sho8_chat_conv', JSON.stringify({
                                    id: `new-${j.id}`, student_id: state.user.supabaseId,
                                    company_id: null, job_id: j.id,
                                    job_title: j.title, company_name: j.company_name,
                                    student_name: state.user.name,
                                    last_message: null, last_at: new Date().toISOString(),
                                    unread_student: 0, unread_company: 0, created_at: new Date().toISOString(),
                                  }))
                                  dispatch({ type: 'GO', screen: 'inbox' })
                                }}
                                className="flex items-center gap-1 text-xs text-brand-600 font-medium"
                              >
                                <MessageCircle className="w-3 h-3" />
                                {ar ? 'رسالة' : 'Message'}
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => applyToDbJob(j)}
                              disabled={st === 'loading' || !state.user.supabaseId}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 text-white text-xs font-semibold rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-60"
                            >
                              {st === 'loading' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                              {st === 'loading' ? (ar ? 'جارٍ...' : 'Applying...') : (ar ? 'قدّم الآن' : 'Apply Now')}
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── LinkedIn tab ── */}
        {tab === 'linkedin' && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded bg-[#0077B5] flex items-center justify-center">
                <span className="text-white text-xs font-bold">in</span>
              </div>
              <p className="text-sm font-bold text-neutral-900">
                {ar ? 'وظائف LinkedIn في مصر' : 'LinkedIn Jobs in Egypt'}
              </p>
              <span className="text-xs text-neutral-400 ml-auto">
                {ar ? 'بيانات حية' : 'Live feed'}
              </span>
            </div>

            {state.liveJobsLoading ? (
              <div className="flex flex-col gap-3" aria-label={ar ? 'جارٍ التحميل...' : 'Loading jobs…'} aria-busy="true">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-neutral-100 p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-2">
                        <div className="skeleton h-3.5 w-3/5 rounded-md" />
                        <div className="skeleton h-2.5 w-2/5 rounded-md" />
                      </div>
                      <div className="skeleton h-5 w-14 rounded-md" />
                    </div>
                    <div className="flex gap-2">
                      <div className="skeleton h-5 w-20 rounded-full" />
                      <div className="skeleton h-5 w-16 rounded-full" />
                      <div className="skeleton h-5 w-12 rounded-full" />
                    </div>
                    <div className="skeleton h-8 w-24 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {(state.liveJobs.length > 0 ? state.liveJobs : []).map(j => {
                  const applied = isApplied(j.id)
                  const st = liveApplyState[j.id] ?? 'idle'
                  return (
                    <div key={j.id} className="bg-white rounded-xl border border-neutral-100 p-4 shadow-sm">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-extrabold text-white flex-shrink-0"
                             style={{ background: '#0077B5' }}>
                          {getInitials(j.company)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-neutral-900 leading-snug">{j.title}</p>
                              <p className="text-xs text-neutral-500 mt-0.5 truncate">{j.company}</p>
                            </div>
                            <span className="text-2xs font-bold px-2 py-0.5 rounded flex-shrink-0" style={{ background: '#0077B515', color: '#0077B5' }}>LinkedIn</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="inline-flex items-center gap-1 text-2xs text-neutral-500 bg-neutral-50 px-2 py-1 rounded-lg"><MapPin className="w-2.5 h-2.5" />{j.location}</span>
                        {j.salary && <span className="text-2xs font-semibold text-warning-700 bg-warning-50 px-2 py-1 rounded-lg">{j.salary}</span>}
                        <span className="text-2xs text-neutral-400">{formatTimeAgo(j.postedAt)}</span>
                      </div>
                      {liveApplyError[j.id] && <p className="text-xs text-red-500 mt-2">{liveApplyError[j.id]}</p>}
                      <div className="flex items-center gap-3 mt-3">
                        {applied ? (
                          <span className="flex items-center gap-1 text-xs font-semibold text-success-600">
                            <Check className="w-3.5 h-3.5" /> {ar ? 'تم التقديم ✓' : 'Applied ✓'}
                          </span>
                        ) : (
                          <button
                            onClick={() => applyToLiveJob(j)}
                            disabled={st === 'loading' || !state.user.supabaseId}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 text-white text-xs font-semibold rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-60"
                          >
                            {st === 'loading' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                            {st === 'loading' ? (ar ? 'جارٍ...' : 'Applying...') : (ar ? 'قدّم الآن' : 'Apply Now')}
                          </button>
                        )}
                        <a href={j.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-neutral-500 hover:text-brand-600 transition-colors">
                          {ar ? 'الإعلان الأصلي' : 'Original Posting'} <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Wuzzuf tab ── */}
        {tab === 'wuzzuf' && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded bg-[#E8464E] flex items-center justify-center">
                <span className="text-white text-xs font-bold">W</span>
              </div>
              <p className="text-sm font-bold text-neutral-900">
                {ar ? 'وظائف Wuzzuf في مصر' : 'Wuzzuf Jobs in Egypt'}
              </p>
              <span className="text-xs text-neutral-400 ml-auto">{ar ? 'محدّث' : 'Updated'}</span>
            </div>
            <div className="flex flex-col gap-3">
              {wuzzufJobs.map(j => {
                const applied = isApplied(j.id)
                const st = liveApplyState[j.id] ?? 'idle'
                return (
                  <div key={j.id} className="bg-white rounded-xl border border-neutral-100 p-4 shadow-sm">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-extrabold text-white flex-shrink-0"
                           style={{ background: '#E8464E' }}>
                        {getInitials(j.company)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-neutral-900 leading-snug">{j.title}</p>
                            <p className="text-xs text-neutral-500 mt-0.5 truncate">{j.company}</p>
                          </div>
                          <span className="text-2xs font-bold px-2 py-0.5 rounded flex-shrink-0" style={{ background: '#E8464E15', color: '#E8464E' }}>Wuzzuf</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="inline-flex items-center gap-1 text-2xs text-neutral-500 bg-neutral-50 px-2 py-1 rounded-lg"><MapPin className="w-2.5 h-2.5" />{j.location}</span>
                      {j.salary && <span className="text-2xs font-semibold text-warning-700 bg-warning-50 px-2 py-1 rounded-lg">{j.salary}</span>}
                      <span className={cn('text-2xs font-semibold px-2 py-1 rounded-lg', j.type === 'INTERN' ? 'text-brand-600 bg-brand-50' : 'text-violet-600 bg-violet-50')}>
                        {j.type === 'INTERN' ? (ar ? 'تدريب' : 'Internship') : (ar ? 'دوام كامل' : 'Full-time')}
                      </span>
                      <span className="text-2xs text-neutral-400">{formatTimeAgo(j.postedAt)}</span>
                    </div>
                    {liveApplyError[j.id] && <p className="text-xs text-red-500 mt-2">{liveApplyError[j.id]}</p>}
                    <div className="flex items-center gap-3 mt-3">
                      {applied ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-success-600">
                          <Check className="w-3.5 h-3.5" /> {ar ? 'تم التقديم ✓' : 'Applied ✓'}
                        </span>
                      ) : (
                        <button
                          onClick={() => applyToLiveJob(j)}
                          disabled={st === 'loading' || !state.user.supabaseId}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E8464E] text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
                        >
                          {st === 'loading' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                          {st === 'loading' ? (ar ? 'جارٍ...' : 'Applying...') : (ar ? 'قدّم الآن' : 'Apply Now')}
                        </button>
                      )}
                      <a href={j.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-neutral-500 hover:text-[#E8464E] transition-colors">
                        {ar ? 'الإعلان الأصلي' : 'Original Posting'} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
