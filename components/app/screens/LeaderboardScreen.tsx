'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, TrendingUp, TrendingDown, Minus, Filter, ChevronRight, Zap, Medal } from 'lucide-react'
import { useApp } from '@/lib/store'
import {
  buildLeaderboard, TIER_INFO, TRACKS, UNIVERSITIES,
} from '@/lib/leaderboard-data'
import type { LeaderboardEntry, LeaderboardPeriod } from '@/lib/types'
import { cn } from '@/lib/utils'

// ── Helpers ───────────────────────────────────────────────────────────────────

const PERIOD_LABELS: Record<LeaderboardPeriod, { en: string; ar: string }> = {
  weekly:  { en: 'This Week', ar: 'هذا الأسبوع' },
  monthly: { en: 'This Month', ar: 'هذا الشهر' },
  alltime: { en: 'All-Time',   ar: 'كل الوقت'   },
}

function RankDelta({ entry }: { entry: LeaderboardEntry }) {
  const delta = entry.prevRank - entry.rank  // positive = moved up
  if (entry.prevRank === 0 || delta === 0)
    return <Minus className="w-3 h-3 text-neutral-400" />
  if (delta > 0)
    return (
      <span className="flex items-center gap-0.5 text-emerald-500 text-2xs font-bold">
        <TrendingUp className="w-3 h-3" />{delta}
      </span>
    )
  return (
    <span className="flex items-center gap-0.5 text-red-400 text-2xs font-bold">
      <TrendingDown className="w-3 h-3" />{Math.abs(delta)}
    </span>
  )
}

function Avatar({ initials, tier, size = 'md' }: { initials: string; tier: LeaderboardEntry['tier']; size?: 'sm' | 'md' | 'lg' }) {
  const info = TIER_INFO[tier]
  const sz = size === 'lg' ? 'w-14 h-14 text-lg' : size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'
  return (
    <div
      className={cn('rounded-2xl flex items-center justify-center font-bold text-white flex-shrink-0', sz)}
      style={{ background: `linear-gradient(135deg, ${info.color}, ${info.color}99)` }}
    >
      {initials}
    </div>
  )
}

// ── Podium card ───────────────────────────────────────────────────────────────

function PodiumCard({ entry, position }: { entry: LeaderboardEntry; position: 1 | 2 | 3 }) {
  const info = TIER_INFO[entry.tier]
  const heights   = { 1: 'h-28', 2: 'h-20', 3: 'h-16' }
  const sizes     = { 1: 'w-20', 2: 'w-16', 3: 'w-16' }
  const medals    = { 1: '🥇', 2: '🥈', 3: '🥉' }
  const bgColors  = { 1: 'from-amber-400 to-yellow-300', 2: 'from-slate-400 to-slate-300', 3: 'from-amber-700 to-amber-600' }
  const order     = { 1: 'order-2', 2: 'order-1', 3: 'order-3' }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: position * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn('flex flex-col items-center gap-1', order[position])}
    >
      {/* Avatar + medal */}
      <div className="relative">
        <Avatar initials={entry.initials} tier={entry.tier} size={position === 1 ? 'lg' : 'md'} />
        <span className="absolute -bottom-1 -right-1 text-base">{medals[position]}</span>
        {entry.isCurrentUser && (
          <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-brand-600 border-2 border-white text-white text-2xs flex items-center justify-center font-bold">✦</span>
        )}
      </div>

      {/* Name */}
      <p className={cn('font-bold text-center text-neutral-900 leading-tight', position === 1 ? 'text-sm' : 'text-xs')}>
        {entry.name.split(' ')[0]}
      </p>
      <p className="text-2xs text-neutral-400 text-center">{entry.university || 'You'}</p>

      {/* XP */}
      <span className="text-2xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: info.color }}>
        {entry.totalXP.toLocaleString()} XP
      </span>

      {/* Podium bar */}
      <div className={cn('w-full rounded-t-xl bg-gradient-to-t mt-1', sizes[position], heights[position], bgColors[position])} />
    </motion.div>
  )
}

// ── Rank row ──────────────────────────────────────────────────────────────────

function RankRow({ entry, index }: { entry: LeaderboardEntry; index: number }) {
  const info = TIER_INFO[entry.tier]

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'flex items-center gap-3 p-3 rounded-2xl border transition-colors',
        entry.isCurrentUser
          ? 'bg-brand-50 border-brand-200'
          : 'bg-white border-neutral-100'
      )}
    >
      {/* Rank + delta */}
      <div className="w-10 flex flex-col items-center gap-0.5 flex-shrink-0">
        <span className="text-sm font-bold text-neutral-700">#{entry.rank}</span>
        <RankDelta entry={entry} />
      </div>

      {/* Avatar */}
      <Avatar initials={entry.initials} tier={entry.tier} size="sm" />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <p className={cn('text-sm font-bold truncate', entry.isCurrentUser ? 'text-brand-700' : 'text-neutral-900')}>
            {entry.name}{entry.isCurrentUser && ' (You)'}
          </p>
          {entry.isCurrentUser && <Zap className="w-3 h-3 text-brand-500 flex-shrink-0" />}
        </div>
        <p className="text-2xs text-neutral-400 truncate">{entry.university || '—'} · {entry.completedSims} sims</p>
      </div>

      {/* Right: XP + tier + KPI */}
      <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
        <span className="text-sm font-bold text-neutral-800">{entry.totalXP.toLocaleString()}</span>
        <div className="flex items-center gap-1">
          <span className="text-2xs">{info.icon}</span>
          <span className="text-2xs font-semibold" style={{ color: info.color }}>{info.label}</span>
          <span className="text-2xs text-neutral-400">· {entry.kpiScore}%</span>
        </div>
      </div>
    </motion.div>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────

export function LeaderboardScreen() {
  const { state, dispatch } = useApp()
  const ar = state.lang === 'ar'

  const [period, setPeriod]         = useState<LeaderboardPeriod>('alltime')
  const [filterTrack, setFilterTrack] = useState('All')
  const [filterUni,   setFilterUni]   = useState('All')
  const [showFilters, setShowFilters] = useState(false)

  const leaderboard = useMemo(
    () => buildLeaderboard({ name: state.user.name, simXP: state.simXP, simDone: state.simDone, simBadges: state.simBadges }, period),
    [state.user.name, state.simXP, state.simDone, state.simBadges, period]
  )

  const filtered = useMemo(
    () => leaderboard.filter(e =>
      (filterTrack === 'All' || e.track === filterTrack) &&
      (filterUni   === 'All' || e.university === filterUni)
    ),
    [leaderboard, filterTrack, filterUni]
  )

  const top3       = filtered.slice(0, 3)
  const rest       = filtered.slice(3)
  const currentUser = filtered.find(e => e.isCurrentUser)

  return (
    <div className="h-full flex flex-col bg-neutral-50 overflow-hidden">

      {/* ── Dark header ──────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-800 px-5 pt-5 pb-4 flex-shrink-0">
        {/* Title row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h1 className="text-lg font-bold text-white">{ar ? 'المتصدرون' : 'Leaderboard'}</h1>
          </div>
          <button
            onClick={() => dispatch({ type: 'GO', screen: 'performance' })}
            className="flex items-center gap-1 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
          >
            {ar ? 'أدائي' : 'My Stats'}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Current user's position card */}
        {currentUser && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center gap-3 mb-4 border border-white/10"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
              #{currentUser.rank}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/60">{ar ? 'ترتيبك الحالي' : 'Your current rank'}</p>
              <p className="text-sm font-bold text-white">
                {TIER_INFO[currentUser.tier].icon} {ar ? TIER_INFO[currentUser.tier].labelAr : TIER_INFO[currentUser.tier].label}
                {' · '}Lv.{currentUser.level}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-base font-bold text-amber-400">{currentUser.totalXP.toLocaleString()}</p>
              <p className="text-2xs text-white/50">XP</p>
            </div>
          </motion.div>
        )}

        {/* Period toggle */}
        <div className="flex gap-1.5 bg-white/10 rounded-xl p-1">
          {(['weekly', 'monthly', 'alltime'] as LeaderboardPeriod[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                'flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200',
                period === p
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-white/60 hover:text-white/90'
              )}
            >
              {ar ? PERIOD_LABELS[p].ar : PERIOD_LABELS[p].en}
            </button>
          ))}
        </div>
      </div>

      {/* ── Scrollable content ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">

        {/* Filter chips */}
        <div className="px-4 py-3 flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-neutral-100 bg-white">
          <button
            onClick={() => setShowFilters(f => !f)}
            className={cn(
              'flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border flex-shrink-0 transition-colors',
              showFilters ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-neutral-600 border-neutral-200'
            )}
          >
            <Filter className="w-3 h-3" />{ar ? 'تصفية' : 'Filter'}
          </button>
          {TRACKS.map(t => (
            <button
              key={t}
              onClick={() => setFilterTrack(t)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-semibold border flex-shrink-0 transition-colors',
                filterTrack === t
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:border-brand-300'
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* University filter (expandable) */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-white border-b border-neutral-100"
            >
              <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar">
                {UNIVERSITIES.map(u => (
                  <button
                    key={u}
                    onClick={() => setFilterUni(u)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-semibold border flex-shrink-0 transition-colors',
                      filterUni === u
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400'
                    )}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Podium */}
        {top3.length >= 3 && (
          <div className="px-5 pt-6 pb-4">
            <div className="flex items-end justify-center gap-4">
              <PodiumCard entry={top3[1]} position={2} />
              <PodiumCard entry={top3[0]} position={1} />
              <PodiumCard entry={top3[2]} position={3} />
            </div>
          </div>
        )}

        {/* Stats strip */}
        <div className="mx-5 mb-4 bg-white rounded-2xl border border-neutral-100 px-4 py-3 flex justify-around">
          {[
            { label: ar ? 'المتنافسون' : 'Competitors', value: filtered.length.toString() },
            { label: ar ? 'جامعات' : 'Universities',   value: new Set(filtered.map(e => e.university).filter(Boolean)).size.toString() },
            { label: ar ? 'مسارات' : 'Tracks',         value: new Set(filtered.map(e => e.track).filter(t => t !== 'All')).size.toString() },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-lg font-bold text-neutral-900">{s.value}</p>
              <p className="text-2xs text-neutral-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Ranked list (4th onwards) */}
        <div className="px-5 pb-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-1">
            <Medal className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              {ar ? 'القائمة الكاملة' : 'Full Rankings'}
            </span>
          </div>
          {rest.map((entry, i) => (
            <RankRow key={entry.id} entry={entry} index={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
