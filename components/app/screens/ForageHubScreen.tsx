'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, ExternalLink, Zap, Star, Clock, BookOpen,
  TrendingUp, X, Search, Award, Flame, Globe,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { cn } from '@/lib/utils'
import {
  FORAGE_PROGRAMS,
  FORAGE_CATEGORIES,
  type ForageProgram,
  type ForageCategory,
} from '@/lib/forage-programs'

// ─── Constants ───────────────────────────────────────────────────────────────

const LEVEL_COLORS: Record<string, { bg: string; text: string }> = {
  Beginner:     { bg: '#DCFCE7', text: '#166534' },
  Intermediate: { bg: '#FEF3C7', text: '#92400E' },
}

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }
const up = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.26, ease: [0.16, 1, 0.3, 1] } },
}

// ─── Program Card ─────────────────────────────────────────────────────────────

function ProgramCard({ program, delay }: { program: ForageProgram; delay: number }) {
  const lvl = LEVEL_COLORS[program.level] ?? LEVEL_COLORS.Beginner

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
            </div>
            <p className="text-sm font-bold text-neutral-900 leading-snug line-clamp-2">{program.title}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-neutral-500 leading-relaxed mb-3 line-clamp-2">{program.description}</p>

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

        {/* CTA */}
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
      </div>
    </motion.div>
  )
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function ForageHubScreen() {
  const { state, dispatch } = useApp()
  const ar = state.lang === 'ar'

  const [activeCategory, setCategory] = useState<ForageCategory | 'All'>('All')
  const [query, setQuery]             = useState('')
  const [showSearch, setShowSearch]   = useState(false)

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
            <p className="text-[10px] text-neutral-400 mt-0.5">Real job simulations from top global companies</p>
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

      {/* ── Stats hero ── */}
      <div className="px-4 pt-3 pb-1 shrink-0">
        <div
          className="rounded-2xl p-4 text-white overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)' }}
        >
          {/* Ambient glow */}
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

          {/* Attribution */}
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
              {' '}· Complete them free on Forage's platform
            </p>
          </div>
        </div>
      </div>

      {/* ── Program list ── */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-6">
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
            filtered.map((p, i) => <ProgramCard key={p.id} program={p} delay={i} />)
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
  )
}
