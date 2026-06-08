'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight, Flame, Trophy, Megaphone, CreditCard, Package,
  Users, Globe, Clock, ExternalLink, Star, Zap, RefreshCw,
  BookOpen, Search, X, BarChart2, Monitor,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { SIM_TRACKS } from '@/lib/data'
import { cn } from '@/lib/utils'
import type { ForageProgram, ForageCategory } from '@/lib/forage-programs'

// ── Lucide icon map for local SIM_TRACKS ────────────────────────────────────
const TRACK_ICONS: Record<string, React.ElementType> = {
  megaphone: Megaphone,
  'credit-card': CreditCard,
  package: Package,
  users: Users,
  'bar-chart': BarChart2,
  monitor: Monitor,
}

// ── Animation variants ───────────────────────────────────────────────────────
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }
const up = {
  hidden:  { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
}
const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35 } },
}

// ── Forage category tabs ─────────────────────────────────────────────────────
const ALL_CATEGORIES: Array<'All' | ForageCategory> = [
  'All', 'Finance', 'Technology', 'Consulting', 'Data', 'Engineering', 'Marketing',
]

// ── ForageCard component ─────────────────────────────────────────────────────
function ForageCard({ program, index }: { program: ForageProgram; index: number }) {
  return (
    <motion.div
      variants={up}
      custom={index}
      whileHover={{ y: -3, boxShadow: '0 10px 28px rgba(0,0,0,0.10)' }}
      whileTap={{ scale: 0.98 }}
      className="flex-shrink-0 w-[72vw] max-w-[268px] rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-card"
      style={{ background: `linear-gradient(148deg, ${program.color}07, #ffffff)` }}
    >
      {/* Card header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start gap-2.5 mb-3">
          {/* Company badge */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-extrabold text-white flex-shrink-0"
            style={{ background: program.color }}
          >
            {program.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <p className="text-2xs text-neutral-400 font-medium truncate">{program.company}</p>
              {program.hot && (
                <span className="text-2xs font-bold px-1.5 py-0.5 rounded-full bg-red-50 text-red-500 flex items-center gap-0.5 flex-shrink-0">
                  <Flame className="w-2.5 h-2.5" /> Hot
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-neutral-900 leading-snug line-clamp-2">
              {program.title}
            </p>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
          <span className="inline-flex items-center gap-1 text-2xs text-neutral-500 bg-neutral-50 px-2 py-1 rounded-lg">
            <Clock className="w-2.5 h-2.5" />
            {program.duration}
          </span>
          <span className="text-2xs text-neutral-500 bg-neutral-50 px-2 py-1 rounded-lg">
            {program.tasks} tasks
          </span>
          <span
            className="text-2xs font-semibold px-2 py-1 rounded-lg"
            style={{ background: `${program.color}15`, color: program.color }}
          >
            {program.category}
          </span>
        </div>

        {/* Skills */}
        <div className="flex gap-1.5 flex-wrap mb-3">
          {program.skills.slice(0, 2).map(s => (
            <span key={s} className="text-2xs text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full font-medium">
              {s}
            </span>
          ))}
          {program.skills.length > 2 && (
            <span className="text-2xs text-neutral-400 px-2 py-0.5 rounded-full bg-neutral-50">
              +{program.skills.length - 2}
            </span>
          )}
        </div>

        {/* Rating row */}
        <div className="flex items-center gap-1 mb-3">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-2xs font-bold text-neutral-700">{program.rating}</span>
          <span className="text-2xs text-neutral-400">· {program.enrolled} enrolled</span>
        </div>
      </div>

      {/* Open Program CTA */}
      <a
        href={program.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 w-full py-2.5 text-xs font-bold text-white transition-opacity hover:opacity-90 active:opacity-80"
        style={{ background: program.color }}
      >
        Start on Forage <ExternalLink className="w-3 h-3" />
      </a>
    </motion.div>
  )
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function ForageSkeleton() {
  return (
    <div className="flex-shrink-0 w-[72vw] max-w-[268px] rounded-2xl border border-neutral-100 bg-white overflow-hidden">
      <div className="px-4 pt-4 pb-3 space-y-3">
        <div className="flex items-start gap-2.5">
          <div className="skeleton w-10 h-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-2.5 w-3/5 rounded" />
            <div className="skeleton h-3 w-4/5 rounded" />
          </div>
        </div>
        <div className="flex gap-1.5">
          <div className="skeleton h-5 w-16 rounded-lg" />
          <div className="skeleton h-5 w-12 rounded-lg" />
          <div className="skeleton h-5 w-14 rounded-lg" />
        </div>
        <div className="flex gap-1.5">
          <div className="skeleton h-4 w-14 rounded-full" />
          <div className="skeleton h-4 w-16 rounded-full" />
        </div>
      </div>
      <div className="skeleton h-9 w-full" />
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export function SimHubScreen() {
  const { state, dispatch } = useApp()
  const ar = state.lang === 'ar'

  // ── Forage state ────────────────────────────────────────────────────────────
  const [foragePrograms, setForagePrograms] = useState<ForageProgram[]>([])
  const [forageLoading, setForageLoading]   = useState(true)
  const [forageError, setForageError]       = useState(false)
  const [forageSource, setForageSource]     = useState<'live' | 'curated'>('curated')
  const [category, setCategory]             = useState<'All' | ForageCategory>('All')
  const [forageSearch, setForageSearch]     = useState('')
  const [showForageSearch, setShowForageSearch] = useState(false)

  // Fetch Forage programs whenever category changes
  useEffect(() => {
    setForageLoading(true)
    setForageError(false)
    const params = new URLSearchParams()
    if (category !== 'All') params.set('category', category)
    if (forageSearch) params.set('q', forageSearch)
    fetch(`/api/forage?${params}`)
      .then(r => r.json())
      .then(data => {
        setForagePrograms(data.programs ?? [])
        setForageSource(data.source ?? 'curated')
        setForageLoading(false)
      })
      .catch(() => {
        setForageError(true)
        setForageLoading(false)
      })
  }, [category, forageSearch])

  const totalTasks = SIM_TRACKS.reduce((s, t) => s + t.tasks.length, 0)

  return (
    <div className="min-h-dvh bg-neutral-50">

      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-neutral-100 px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-neutral-900 leading-tight">
            {ar ? 'مركز التدريب' : 'Practice Hub'}
          </h2>
          <p className="text-2xs text-neutral-400">{totalTasks} simulations · real business tasks</p>
        </div>
        <div className="flex items-center gap-2">
          {state.simXP > 0 && (
            <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-500" />
              {state.simXP} XP
            </span>
          )}
        </div>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="visible" className="px-4 py-4 flex flex-col gap-5">

        {/* ── Progress hero card ── */}
        <motion.div
          variants={up}
          className="rounded-2xl p-5 overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #4338CA 60%, #7C3AED 100%)' }}
        >
          <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/5" />
          <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/5" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-violet-300" />
              <p className="text-xs font-semibold text-violet-200">
                {ar ? 'مهاراتك الحقيقية تبني مسيرتك' : 'Build real skills. Earn XP. Get hired.'}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-3xl font-black text-white">{state.simXP}</p>
                <p className="text-2xs text-white/50">{ar ? 'نقاط XP' : 'XP Earned'}</p>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div>
                <p className="text-3xl font-black text-white">{state.simDone.length}</p>
                <p className="text-2xs text-white/50">{ar ? 'مكتملة' : 'Completed'}</p>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div>
                <p className="text-3xl font-black text-white">{state.simBadges.length}</p>
                <p className="text-2xs text-white/50">{ar ? 'شارات' : 'Badges'}</p>
              </div>
            </div>
            {state.simBadges.length > 0 && (
              <div className="flex gap-1.5 flex-wrap mt-3">
                {state.simBadges.map(b => (
                  <span key={b.id} className="text-2xs font-semibold bg-white/15 text-white/90 px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <Trophy className="w-2.5 h-2.5 text-amber-300" />
                    {b.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════════════
            LIVE FROM THE FORAGE
        ═══════════════════════════════════════════════════════════════════════ */}
        <motion.div variants={up}>

          {/* Section header */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-3 h-3 text-white" />
                </div>
                <h3 className="text-sm font-extrabold text-neutral-900">
                  {ar ? 'مباشر من The Forage' : 'Live from The Forage'}
                </h3>
                <span className="text-2xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  {forageSource === 'live' ? 'Live' : ar ? 'محدّث' : 'Updated'}
                </span>
              </div>
              {!forageLoading && (
                <p className="text-2xs text-neutral-400 mt-0.5 ml-7">
                  {ar
                    ? `${foragePrograms.length} برنامج تدريبي من كبرى الشركات`
                    : `${foragePrograms.length} programs from top global companies`}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Search toggle */}
              <button
                onClick={() => setShowForageSearch(s => !s)}
                className="w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 transition-colors"
                aria-label="Search programs"
              >
                {showForageSearch ? <X className="w-3.5 h-3.5" /> : <Search className="w-3.5 h-3.5" />}
              </button>
              <a
                href="https://www.theforage.com/simulations?qfilter=recommended"
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xs font-bold text-brand-600 flex items-center gap-1 hover:underline"
              >
                {ar ? 'الكل' : 'View all'} <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>

          {/* Search input */}
          <AnimatePresence>
            {showForageSearch && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden mb-3"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                  <input
                    type="text"
                    value={forageSearch}
                    onChange={e => setForageSearch(e.target.value)}
                    placeholder="Search company, skill, or topic…"
                    className="w-full h-10 pl-9 pr-4 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 transition-all"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Category filter tabs */}
          <div className="flex gap-1.5 overflow-x-auto scroll-hide pb-1 mb-3">
            {ALL_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  'flex-shrink-0 px-3 py-1.5 rounded-full text-2xs font-bold border transition-all duration-150',
                  category === cat
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300',
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Program cards — horizontal scroll */}
          {forageError ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="w-11 h-11 rounded-2xl bg-neutral-100 flex items-center justify-center">
                <Globe className="w-5 h-5 text-neutral-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-700">Could not load programs</p>
                <p className="text-xs text-neutral-400 mt-0.5">Check your connection and try again</p>
              </div>
              <button
                onClick={() => { setCategory('All'); setForageSearch('') }}
                className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 bg-brand-50 px-3 py-2 rounded-xl"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry
              </button>
            </div>
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="flex gap-3 overflow-x-auto scroll-hide pb-2 -mx-4 px-4"
            >
              {forageLoading
                ? Array.from({ length: 4 }).map((_, i) => <ForageSkeleton key={i} />)
                : foragePrograms.length === 0
                ? (
                  <div className="w-full flex flex-col items-center gap-2 py-8 text-center">
                    <div className="w-11 h-11 rounded-2xl bg-neutral-100 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-neutral-400" />
                    </div>
                    <p className="text-sm font-semibold text-neutral-700">No programs in this category</p>
                    <button onClick={() => setCategory('All')} className="text-xs text-brand-600 font-semibold">
                      Clear filter
                    </button>
                  </div>
                )
                : foragePrograms.map((prog, i) => (
                  <ForageCard key={prog.id} program={prog} index={i} />
                ))
              }
            </motion.div>
          )}

          {/* Footer row: Powered by + View All */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1.5">
              <span className="text-2xs text-neutral-400">Powered by</span>
              <a
                href="https://www.theforage.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xs font-bold text-blue-600 hover:underline"
              >
                The Forage
              </a>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => dispatch({ type: 'GO', screen: 'forageHub' })}
              className="flex items-center gap-1 text-2xs font-bold text-violet-600 bg-violet-50 px-2.5 py-1.5 rounded-xl border border-violet-200"
            >
              Browse all programs <ChevronRight className="w-3 h-3" />
            </motion.button>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════════════
            LOCAL PRACTICE TRACKS
        ═══════════════════════════════════════════════════════════════════════ */}
        <motion.div variants={up}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-neutral-900">
              {ar ? 'مسارات التدريب' : 'Practice Tracks'}
            </h3>
            <span className="text-2xs text-neutral-400">{ar ? 'عربي + إنجليزي' : 'Arabic & English'}</span>
          </div>

          <div className="flex flex-col gap-3">
            {SIM_TRACKS.map((track, i) => {
              const done = track.tasks.filter(t => state.simDone.includes(t.id)).length
              const Icon = TRACK_ICONS[track.icon] || Megaphone
              const pct  = done / track.tasks.length

              return (
                <motion.button
                  key={track.id}
                  variants={up}
                  custom={i}
                  whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    dispatch({ type: 'OPEN_TRACK', track })
                    dispatch({ type: 'GO', screen: 'simTasks' })
                  }}
                  className="w-full rounded-2xl p-4 border text-left transition-all duration-200"
                  style={{
                    background:   `linear-gradient(145deg, ${track.color}08, #ffffff)`,
                    borderColor:  `${track.color}28`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${track.color}18`, color: track.color }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="text-sm font-bold text-neutral-900">
                          {ar ? track.labelAr : track.label}
                        </h4>
                        {done > 0 && (
                          <span
                            className="text-2xs font-semibold px-1.5 py-0.5 rounded-md"
                            style={{ background: `${track.color}15`, color: track.color }}
                          >
                            {done}/{track.tasks.length}
                          </span>
                        )}
                        {done === track.tasks.length && done > 0 && (
                          <span className="text-2xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                            ✓ Done
                          </span>
                        )}
                      </div>
                      <p className="text-2xs text-neutral-500 leading-relaxed">
                        {ar ? track.descriptionAr : track.description}
                      </p>
                      {/* Task count */}
                      <p className="text-2xs text-neutral-400 mt-1">
                        {track.tasks.length} {ar ? 'مهمة' : 'tasks'} ·{' '}
                        {track.tasks.reduce((s, t) => s + (parseInt(t.time) || 0), 0) || track.tasks.length * 40}{' '}
                        {ar ? 'دقيقة تقريباً' : 'min approx.'}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: track.color }} />
                  </div>

                  {/* Progress bar */}
                  {done > 0 && (
                    <div className="mt-3 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: track.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct * 100}%` }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                      />
                    </div>
                  )}
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Bottom spacer */}
        <div className="h-4" />
      </motion.div>
    </div>
  )
}
