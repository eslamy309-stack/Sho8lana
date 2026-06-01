'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, SlidersHorizontal, Star, MapPin, GraduationCap,
  ChevronLeft, UserPlus, Eye, Zap, X,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { TALENT_POOL, TIER_COLORS, TIER_LABELS } from '@/lib/hr-data'
import type { TalentCandidate, HRTier } from '@/lib/hr-types'
import { cn } from '@/lib/utils'

const up = {
  hidden:  { opacity: 0, y: 10 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: i * 0.04 } }),
}

const TRACKS        = ['All', 'Finance', 'Marketing', 'Business', 'Engineering', 'Leadership']
const TIERS         = ['All', 'Platinum', 'Gold', 'Silver', 'Bronze']
const SORT_BY       = ['Talent Score', 'Rank', 'GPA', 'XP', 'Latest']
const MIN_SCORE_OPTS = [
  { label: 'Any',  value: 0   },
  { label: '70+',  value: 70  },
  { label: '80+',  value: 80  },
  { label: '90+',  value: 90  },
]

function talentScoreColor(score: number) {
  if (score >= 90) return '#10B981'   // emerald
  if (score >= 75) return '#6366F1'   // indigo
  if (score >= 60) return '#F59E0B'   // amber
  return '#EF4444'                    // red
}

/** 44 px circle badge for Talent Score */
function TalentScoreCircle({ score }: { score: number }) {
  const color = talentScoreColor(score)
  return (
    <div
      className="flex flex-col items-center justify-center shrink-0"
      style={{
        width: 44, height: 44,
        borderRadius: '50%',
        border: `2.5px solid ${color}`,
        background: `${color}12`,
      }}
    >
      <span className="text-sm font-extrabold leading-none" style={{ color }}>{score}</span>
      <span className="text-[7px] font-semibold uppercase tracking-wide mt-0.5" style={{ color: `${color}BB` }}>TS</span>
    </div>
  )
}

function CandidateCard({ candidate, onView, onAdd, delay }: {
  candidate: TalentCandidate
  onView: (c: TalentCandidate) => void
  onAdd: (c: TalentCandidate) => void
  delay: number
}) {
  const tc = TIER_COLORS[candidate.tier]
  return (
    <motion.div variants={up} custom={delay}
      className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4"
    >
      {/* Top row */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-900 flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-bold">{candidate.initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-neutral-900 truncate">{candidate.name}</p>
          </div>
          <p className="text-[10px] text-neutral-500 mt-0.5 truncate">{candidate.major}</p>
          {/* Tier badge below name */}
          <span className="inline-block mt-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
            style={{ background: tc.bg, color: tc.text }}>
            {TIER_LABELS[candidate.tier]}
          </span>
        </div>
        {/* Talent Score circle — top right, largest element */}
        <TalentScoreCircle score={candidate.overallScore} />
      </div>

      {/* Details */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
        <span className="flex items-center gap-1 text-[10px] text-neutral-500">
          <GraduationCap className="w-3 h-3" />{candidate.university}
        </span>
        <span className="flex items-center gap-1 text-[10px] text-neutral-500">
          <MapPin className="w-3 h-3" />{candidate.location}
        </span>
        <span className="flex items-center gap-1 text-[10px] text-neutral-500">
          <Star className="w-3 h-3" />GPA {candidate.gpa.toFixed(1)}
        </span>
      </div>

      {/* KPI bars */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mb-3">
        {[
          { label: 'Decision', value: candidate.decision },
          { label: 'Leadership', value: candidate.leadership },
          { label: 'Accuracy', value: candidate.accuracy },
          { label: 'Collab.', value: candidate.collaboration },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="text-[9px] text-neutral-400 w-14 shrink-0">{label}</span>
            <div className="flex-1 h-1 bg-neutral-100 rounded-full overflow-hidden">
              <motion.div className="h-full bg-brand-500 rounded-full"
                initial={{ width: 0 }} animate={{ width: `${value}%` }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} />
            </div>
            <span className="text-[9px] font-semibold text-neutral-600 w-5 text-right">{value}</span>
          </div>
        ))}
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1 mb-3">
        {candidate.skills.slice(0, 3).map(s => (
          <span key={s} className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">{s}</span>
        ))}
        {candidate.skills.length > 3 && (
          <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-400">
            +{candidate.skills.length - 3}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <motion.button whileTap={{ scale: 0.95 }}
          onClick={() => onView(candidate)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-neutral-200 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          <Eye className="w-3.5 h-3.5" /> View Profile
        </motion.button>
        <motion.button whileTap={{ scale: 0.95 }}
          onClick={() => onAdd(candidate)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-neutral-900 text-[11px] font-semibold text-white"
        >
          <UserPlus className="w-3.5 h-3.5" /> Add to Pipeline
        </motion.button>
      </div>
    </motion.div>
  )
}

export function TalentMarketplaceScreen() {
  const { dispatch } = useApp()
  const [query, setQuery]         = useState('')
  const [track, setTrack]         = useState('All')
  const [tier, setTier]           = useState('All')
  const [sortBy, setSortBy]       = useState('Talent Score')
  const [minScore, setMinScore]   = useState(0)
  const [showFilters, setFilters] = useState(false)
  const [addedId, setAddedId]     = useState<string | null>(null)

  const filtered = useMemo(() => {
    let list = [...TALENT_POOL]
    if (query) list = list.filter(c =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.university.toLowerCase().includes(query.toLowerCase()) ||
      c.skills.some(s => s.toLowerCase().includes(query.toLowerCase()))
    )
    if (track !== 'All') list = list.filter(c => c.tracks.includes(track))
    if (tier  !== 'All') list = list.filter(c => c.tier === tier.toLowerCase() as HRTier)
    if (minScore > 0)    list = list.filter(c => c.overallScore >= minScore)

    return list.sort((a, b) => {
      if (sortBy === 'Talent Score') return b.overallScore - a.overallScore
      if (sortBy === 'Rank')         return a.rank - b.rank
      if (sortBy === 'GPA')          return b.gpa - a.gpa
      if (sortBy === 'XP')           return b.totalXP - a.totalXP
      return new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime()
    })
  }, [query, track, tier, sortBy, minScore])

  function handleAdd(c: TalentCandidate) {
    setAddedId(c.id)
    setTimeout(() => setAddedId(null), 2000)
  }

  return (
    <div className="flex flex-col h-full bg-neutral-50">

      {/* ── Header ── */}
      <div className="bg-white border-b border-neutral-100 px-4 pt-10 pb-3 shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <motion.button whileTap={{ scale: 0.9 }}
            onClick={() => dispatch({ type: 'GO_BACK' })}
            className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4 text-neutral-700" />
          </motion.button>
          <div>
            <h1 className="text-base font-bold text-neutral-900">Talent Intelligence</h1>
            <p className="text-[10px] text-neutral-400">Discover candidates by real performance</p>
          </div>
          <motion.button whileTap={{ scale: 0.9 }}
            onClick={() => setFilters(f => !f)}
            className={cn(
              'ml-auto w-8 h-8 rounded-full flex items-center justify-center',
              showFilters ? 'bg-neutral-900' : 'bg-neutral-100'
            )}
          >
            <SlidersHorizontal className={cn('w-4 h-4', showFilters ? 'text-white' : 'text-neutral-700')} />
          </motion.button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-neutral-100 rounded-xl px-3 py-2.5">
          <Search className="w-4 h-4 text-neutral-400 shrink-0" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name, university, skill…"
            className="flex-1 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')}>
              <X className="w-3.5 h-3.5 text-neutral-400" />
            </button>
          )}
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="pt-3 space-y-2">
                {/* Track */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                  {TRACKS.map(t => (
                    <button key={t} onClick={() => setTrack(t)}
                      className={cn(
                        'shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold border transition-colors',
                        track === t ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-600 border-neutral-200'
                      )}
                    >{t}</button>
                  ))}
                </div>
                {/* Tier */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                  {TIERS.map(t => (
                    <button key={t} onClick={() => setTier(t)}
                      className={cn(
                        'shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold border transition-colors',
                        tier === t ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-600 border-neutral-200'
                      )}
                    >{t}</button>
                  ))}
                </div>
                {/* Min Talent Score */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-neutral-400 shrink-0">Min Score:</span>
                  <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                    {MIN_SCORE_OPTS.map(opt => (
                      <button key={opt.label} onClick={() => setMinScore(opt.value)}
                        className={cn(
                          'shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold border transition-colors',
                          minScore === opt.value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-neutral-600 border-neutral-200'
                        )}
                      >{opt.label}</button>
                    ))}
                  </div>
                </div>
                {/* Sort */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-neutral-400 shrink-0">Sort:</span>
                  <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                    {SORT_BY.map(s => (
                      <button key={s} onClick={() => setSortBy(s)}
                        className={cn(
                          'shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold border transition-colors',
                          sortBy === s ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-neutral-600 border-neutral-200'
                        )}
                      >{s}</button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Results ── */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-semibold text-neutral-700">
              {filtered.length} candidate{filtered.length !== 1 ? 's' : ''} found
            </p>
            <p className="text-[10px] text-neutral-400">Sorted by Talent Score</p>
          </div>
          {(track !== 'All' || tier !== 'All' || query || minScore > 0) && (
            <button
              onClick={() => { setQuery(''); setTrack('All'); setTier('All'); setMinScore(0) }}
              className="text-[11px] text-red-500 font-semibold"
            >Clear filters</button>
          )}
        </div>

        <motion.div initial="hidden" animate="visible" className="space-y-3 pb-4">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-3xl mb-2">🔍</p>
              <p className="text-sm font-semibold text-neutral-700">No candidates found</p>
              <p className="text-xs text-neutral-400 mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            filtered.map((c, i) => (
              <CandidateCard
                key={c.id}
                candidate={c}
                delay={i}
                onView={() => dispatch({ type: 'GO', screen: 'candidateIntelligence' as never })}
                onAdd={handleAdd}
              />
            ))
          )}
        </motion.div>
      </div>

      {/* ── Toast ── */}
      <AnimatePresence>
        {addedId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2.5 rounded-full bg-neutral-900 text-white text-xs font-semibold shadow-xl z-50"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            Added to pipeline
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
