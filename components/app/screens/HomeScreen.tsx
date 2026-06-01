'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Search, Globe, Wifi, MapPin, Star, Zap, Map, Bookmark,
  BookmarkCheck, Building2, ExternalLink, ChevronRight, ChevronLeft,
  TrendingUp, Briefcase, BarChart2,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { COMPANIES, JOBS, SOURCE_CONFIG } from '@/lib/data'
import { DOCUMENTS } from '@/lib/data'
import { cn } from '@/lib/utils'
import type { Job } from '@/lib/types'
import { fetchLiveJobs, getWuzzufMockJobs, formatTimeAgo } from '@/lib/api'

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }
const up = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
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
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
               style={{ background: `${company.color}12` }}>
            {company.logo}
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
      {/* Save button */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-50">
        <p className="text-2xs text-neutral-400">{job.applicants} {ar ? 'متقدم' : 'applicants'} · {job.postedAgo}</p>
        <button
          onClick={() => dispatch({ type: 'TOGGLE_SAVE_JOB', id: job.id })}
          className="text-neutral-400 hover:text-brand-600 transition-colors"
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
      whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.11)' }}
      whileTap={{ scale: 0.98 }}
      onClick={() => { dispatch({ type: 'SELECT_JOB', id: job.id }); dispatch({ type: 'GO', screen: 'detail' }) }}
      className="flex-shrink-0 w-[260px] rounded-xl border border-neutral-200 p-4 text-left shadow-card bg-white"
      style={{ background: `linear-gradient(145deg, ${company.color}09, white)` }}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
             style={{ background: `${company.color}15` }}>
          {company.logo}
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

export function HomeScreen() {
  const { state, dispatch } = useApp()
  const { lang, searchQuery, locationFilter, jobTypeFilter } = state
  const ar = lang === 'ar'
  const [tab, setTab] = useState<HomeTab>('local')

  const isProfileDone =
    state.user.name && state.user.university && state.user.major &&
    DOCUMENTS.filter(d => d.required).every(d => state.user.documents[d.key])

  // Load live jobs when switching to linkedin or wuzzuf tab
  useEffect(() => {
    if (tab === 'linkedin' && state.liveJobs.length === 0 && !state.liveJobsLoading) {
      dispatch({ type: 'SET_LIVE_JOBS_LOADING', loading: true })
      fetchLiveJobs('intern Egypt').then(jobs => {
        dispatch({ type: 'SET_LIVE_JOBS', jobs })
        dispatch({ type: 'SET_LIVE_JOBS_LOADING', loading: false })
      })
    }
  }, [tab]) // eslint-disable-line react-hooks/exhaustive-deps

  const wuzzufJobs = getWuzzufMockJobs()

  const filtered = JOBS.filter(j => {
    const q = searchQuery.toLowerCase()
    const matchQ = !q || (ar ? j.titleAr : j.title).toLowerCase().includes(q) ||
      j.skills.some(s => s.toLowerCase().includes(q)) ||
      COMPANIES.find(c => c.id === j.companyId)?.name.toLowerCase().includes(q)
    const matchL = locationFilter === 'All' || j.location === locationFilter
    const matchT = jobTypeFilter === 'all' || j.type === jobTypeFilter
    return matchQ && matchL && matchT
  })

  const featured = JOBS.filter(j => j.featured)

  return (
    <div className="min-h-dvh bg-neutral-50 pb-6">
      {/* Topbar */}
      <div className="sticky top-0 z-20 bg-white border-b border-neutral-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-serif text-lg text-neutral-900">Sho8lana</span>
          {ar && <span className="text-sm text-neutral-400">شغلانة</span>}
        </div>
        <div className="flex gap-2">
          <button onClick={() => dispatch({ type: 'GO', screen: 'map' })}
            className="w-8 h-8 rounded-lg border border-neutral-200 bg-white flex items-center justify-center text-brand-600 hover:bg-brand-50 transition-colors"
            title={ar ? 'خريطة الفرص' : 'Opportunity Map'}>
            <Map className="w-4 h-4" />
          </button>
          <button onClick={() => dispatch({ type: 'GO', screen: 'companyPortal' })}
            className="w-8 h-8 rounded-lg border border-neutral-200 bg-white flex items-center justify-center text-neutral-500 hover:bg-neutral-50 transition-colors"
            title={ar ? 'بوابة الشركات' : 'Employer Portal'}>
            <Building2 className="w-4 h-4" />
          </button>
          <button onClick={() => dispatch({ type: 'GO', screen: 'feeds' })}
            className="w-8 h-8 rounded-lg border border-neutral-200 bg-white flex items-center justify-center text-success-500 hover:bg-neutral-50 transition-colors">
            <Wifi className="w-4 h-4" />
          </button>
          <button onClick={() => dispatch({ type: 'GO', screen: 'lang' })}
            className="w-8 h-8 rounded-lg border border-neutral-200 bg-white flex items-center justify-center text-neutral-500 hover:bg-neutral-50 transition-colors">
            <Globe className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-3">
        {/* Source tabs */}
        <div className="flex gap-1 bg-neutral-100 rounded-xl p-1">
          {(['local', 'linkedin', 'wuzzuf'] as HomeTab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors',
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

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 transition-all"
            placeholder={ar ? 'ابحث بالعنوان أو المهارة...' : 'Search title, skill, company…'}
            value={searchQuery}
            onChange={e => dispatch({ type: 'SET_SEARCH', query: e.target.value })}
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
          </>
        )}

        {/* Profile completion banner */}
        {!isProfileDone && tab === 'local' && (
          <motion.button
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            onClick={() => dispatch({ type: 'GO', screen: 'onboard' })}
            className="w-full rounded-xl p-4 text-left"
            style={{ background: 'linear-gradient(135deg, #0F172A, #0F766E)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">
                  {ar ? 'أكمل ملفك للتقديم بنقرة واحدة' : 'Complete profile to apply in 1 tap'}
                </p>
                <p className="text-xs text-white/60 mt-0.5">
                  {ar ? 'ارفع مستنداتك مرة واحدة، قدّم في كل مكان' : 'Upload docs once, apply everywhere'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-xs font-bold text-white">
                {Math.round((Object.keys(state.user.documents).length / DOCUMENTS.length) * 100)}%
              </div>
            </div>
          </motion.button>
        )}

        {/* Talent Intelligence quick access */}
        {tab === 'local' && (
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: TrendingUp, label: ar ? 'ملفي' : 'My Profile', screen: 'talentProfile', color: 'bg-emerald-500' },
              { icon: Briefcase,  label: ar ? 'التدريب' : 'Internships', screen: 'internshipHub', color: 'bg-violet-500' },
              { icon: BarChart2,  label: ar ? 'تحليلاتي' : 'Analytics', screen: 'careerAnalytics', color: 'bg-indigo-500' },
            ].map(({ icon: Icon, label, screen, color }) => (
              <button
                key={screen}
                onClick={() => dispatch({ type: 'GO', screen: screen as never })}
                className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-xl border border-neutral-100 hover:border-neutral-200 hover:shadow-sm transition-all"
              >
                <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-semibold text-neutral-700">{label}</span>
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

            {/* All jobs list */}
            <div>
              <h3 className="text-sm font-bold text-neutral-900 mb-2">
                {filtered.length < JOBS.length
                  ? `${filtered.length} ${ar ? 'نتائج' : 'results'}`
                  : (ar ? 'جميع الوظائف' : `All ${JOBS.length} opportunities`)}
              </h3>
              <motion.div variants={stagger} initial="hidden" animate="visible" className="flex flex-col gap-3">
                {filtered.length === 0
                  ? <p className="text-center text-sm text-neutral-400 py-8">{ar ? 'لا توجد نتائج' : 'No results found'}</p>
                  : filtered.map((j, i) => <JobCard key={j.id} job={j} index={i} />)}
              </motion.div>
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
              <div className="flex flex-col gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-neutral-100 p-4 animate-pulse">
                    <div className="h-3 bg-neutral-100 rounded w-1/2 mb-2" />
                    <div className="h-2 bg-neutral-100 rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {(state.liveJobs.length > 0 ? state.liveJobs : []).map(j => (
                  <div key={j.id} className="bg-white rounded-xl border border-neutral-100 p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-neutral-900">{j.title}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">{j.company}</p>
                      </div>
                      <span className="text-2xs font-bold px-2 py-0.5 rounded" style={{ background: '#0077B515', color: '#0077B5' }}>
                        LinkedIn
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="inline-flex items-center gap-1 text-2xs text-neutral-500 bg-neutral-50 px-2 py-1 rounded-lg">
                        <MapPin className="w-2.5 h-2.5" />{j.location}
                      </span>
                      {j.salary && (
                        <span className="text-2xs font-semibold text-warning-700 bg-warning-50 px-2 py-1 rounded-lg">{j.salary}</span>
                      )}
                      <span className="text-2xs text-neutral-400">{formatTimeAgo(j.postedAt)}</span>
                    </div>
                    <a
                      href={j.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 flex items-center gap-1 text-xs text-brand-600 font-semibold hover:underline"
                    >
                      {ar ? 'اعرض على LinkedIn' : 'View on LinkedIn'}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
                <p className="text-center text-xs text-neutral-400 py-2">
                  {ar ? 'لإضافة بيانات LinkedIn الحقيقية، أضف مفتاح JSearch API إلى .env.local' : 'Add your JSearch API key to .env.local for live LinkedIn data'}
                </p>
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
              {wuzzufJobs.map(j => (
                <div key={j.id} className="bg-white rounded-xl border border-neutral-100 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-neutral-900">{j.title}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">{j.company}</p>
                    </div>
                    <span className="text-2xs font-bold px-2 py-0.5 rounded" style={{ background: '#E8464E15', color: '#E8464E' }}>
                      Wuzzuf
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="inline-flex items-center gap-1 text-2xs text-neutral-500 bg-neutral-50 px-2 py-1 rounded-lg">
                      <MapPin className="w-2.5 h-2.5" />{j.location}
                    </span>
                    {j.salary && (
                      <span className="text-2xs font-semibold text-warning-700 bg-warning-50 px-2 py-1 rounded-lg">{j.salary}</span>
                    )}
                    <span className={cn(
                      'text-2xs font-semibold px-2 py-1 rounded-lg',
                      j.type === 'INTERN' ? 'text-brand-600 bg-brand-50' : 'text-violet-600 bg-violet-50',
                    )}>
                      {j.type === 'INTERN' ? (ar ? 'تدريب' : 'Internship') : (ar ? 'دوام كامل' : 'Full-time')}
                    </span>
                    <span className="text-2xs text-neutral-400">{formatTimeAgo(j.postedAt)}</span>
                  </div>
                  <a
                    href={j.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex items-center gap-1 text-xs text-[#E8464E] font-semibold hover:underline"
                  >
                    {ar ? 'اعرض على Wuzzuf' : 'View on Wuzzuf'}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
