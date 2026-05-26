'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, Star, Clock,
  MessageSquare, Plus, MoreHorizontal, Check, X,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { PIPELINE, TIER_COLORS, STAGE_COLORS, STAGE_LABELS } from '@/lib/hr-data'
import type { PipelineCandidate, PipelineStage } from '@/lib/hr-types'
import { cn } from '@/lib/utils'

const STAGES: PipelineStage[] = ['sourced', 'screening', 'assessment', 'interview', 'offer', 'hired']

const up = {
  hidden:  { opacity: 0, y: 10 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 } }),
}

function StarRating({ rating }: { rating?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={cn('w-2.5 h-2.5', i <= (rating ?? 0) ? 'text-amber-400 fill-amber-400' : 'text-neutral-200')} />
      ))}
    </div>
  )
}

function PipelineCard({ item, onMove, onRemove }: {
  item: PipelineCandidate
  onMove: (id: string, direction: 'forward' | 'back') => void
  onRemove: (id: string) => void
}) {
  const { candidate: c } = item
  const tc = TIER_COLORS[c.tier]
  const [showActions, setShowActions] = useState(false)
  const stageIdx = STAGES.indexOf(item.stage)
  const canForward = stageIdx < STAGES.length - 1
  const canBack    = stageIdx > 0

  return (
    <motion.div layout variants={up}
      className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-3 mb-2"
    >
      {/* Header */}
      <div className="flex items-start gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-900 flex items-center justify-center shrink-0">
          <span className="text-white text-[10px] font-bold">{c.initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-neutral-900 truncate">{c.name}</p>
          <p className="text-[9px] text-neutral-400 truncate">{c.university} · {c.major}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
            style={{ background: tc.bg, color: tc.text }}>
            {c.tier.charAt(0).toUpperCase() + c.tier.slice(1)}
          </span>
          <button onClick={() => setShowActions(s => !s)}>
            <MoreHorizontal className="w-3.5 h-3.5 text-neutral-400" />
          </button>
        </div>
      </div>

      {/* Score + Rating */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-neutral-900">{c.overallScore}</span>
          <span className="text-[9px] text-neutral-400">KPI Score</span>
        </div>
        <StarRating rating={item.rating} />
      </div>

      {/* Notes */}
      {item.notes && (
        <div className="flex items-start gap-1.5 mb-2 bg-neutral-50 rounded-lg px-2 py-1.5">
          <MessageSquare className="w-3 h-3 text-neutral-400 shrink-0 mt-0.5" />
          <p className="text-[9px] text-neutral-500 leading-relaxed line-clamp-2">{item.notes}</p>
        </div>
      )}

      {/* Next action */}
      {item.nextAction && (
        <div className="flex items-center gap-1.5 mb-2">
          <Clock className="w-3 h-3 text-amber-500 shrink-0" />
          <p className="text-[9px] text-amber-600 font-medium truncate">{item.nextAction}</p>
          {item.nextActionDue && (
            <span className="text-[9px] text-neutral-400 ml-auto shrink-0">{item.nextActionDue}</span>
          )}
        </div>
      )}

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <div className="flex gap-1 flex-wrap mb-2">
          {item.tags.map(tag => (
            <span key={tag} className="text-[8px] font-medium px-1.5 py-0.5 rounded-full bg-brand-50 text-brand-600">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Assignee */}
      {item.assignedTo && (
        <p className="text-[9px] text-neutral-400 mb-2">Assigned to <strong>{item.assignedTo}</strong></p>
      )}

      {/* Quick actions */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-1.5 pt-2 border-t border-neutral-50">
              <button
                onClick={() => { onRemove(item.id); setShowActions(false) }}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 text-red-500 text-[10px] font-semibold"
              >
                <X className="w-3 h-3" /> Reject
              </button>
              <button className="flex items-center gap-1 px-2 py-1 rounded-lg bg-neutral-100 text-neutral-600 text-[10px] font-semibold">
                <MessageSquare className="w-3 h-3" /> Note
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Move controls */}
      <div className="flex gap-1.5 mt-2">
        <button disabled={!canBack}
          onClick={() => onMove(item.id, 'back')}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-neutral-100 text-neutral-600 text-[10px] font-semibold disabled:opacity-30"
        >
          <ChevronLeft className="w-3 h-3" /> Back
        </button>
        <button disabled={!canForward}
          onClick={() => onMove(item.id, 'forward')}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-neutral-900 text-white text-[10px] font-semibold disabled:opacity-30"
        >
          Advance <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  )
}

export function RecruitmentPipelineScreen() {
  const { dispatch } = useApp()
  const [items, setItems]         = useState<PipelineCandidate[]>(PIPELINE)
  const [activeStage, setActive]  = useState<PipelineStage>('interview')

  function moveCandidate(id: string, direction: 'forward' | 'back') {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item
      const idx = STAGES.indexOf(item.stage)
      const newIdx = direction === 'forward' ? idx + 1 : idx - 1
      if (newIdx < 0 || newIdx >= STAGES.length) return item
      return { ...item, stage: STAGES[newIdx], updatedAt: new Date().toISOString() }
    }))
  }

  function removeCandidate(id: string) {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, stage: 'rejected' as PipelineStage } : item
    ))
  }

  const stageCounts = STAGES.reduce((acc, s) => {
    acc[s] = items.filter(i => i.stage === s).length
    return acc
  }, {} as Record<string, number>)

  const visibleItems = items.filter(i => i.stage === activeStage)
  const totalActive  = items.filter(i => !['hired', 'rejected'].includes(i.stage)).length

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
            <h1 className="text-base font-bold text-neutral-900">Recruitment Pipeline</h1>
            <p className="text-[10px] text-neutral-400">{totalActive} active · {stageCounts['hired'] ?? 0} hired</p>
          </div>
          <button className="ml-auto w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center">
            <Plus className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Stage tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {STAGES.map(stage => {
            const isActive = stage === activeStage
            const count    = stageCounts[stage] ?? 0
            const color    = STAGE_COLORS[stage]
            return (
              <button key={stage} onClick={() => setActive(stage)}
                className={cn(
                  'shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all',
                  isActive ? 'text-white border-transparent' : 'bg-white text-neutral-600 border-neutral-200'
                )}
                style={isActive ? { background: color, borderColor: color } : {}}
              >
                {STAGE_LABELS[stage]}
                <span className={cn(
                  'text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center',
                  isActive ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-500'
                )}>{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Stage indicator ── */}
      <div className="px-4 pt-3 pb-1 shrink-0">
        <div className="flex items-center gap-1.5">
          {STAGES.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div className={cn('w-2 h-2 rounded-full', s === activeStage ? 'w-6' : '')}
                style={{ background: s === activeStage ? STAGE_COLORS[s] : '#E5E7EB',
                         transition: 'all 0.3s ease' }} />
              {i < STAGES.length - 1 && (
                <div className="w-3 h-px bg-neutral-200" />
              )}
            </div>
          ))}
          <span className="ml-2 text-[10px] font-semibold text-neutral-500">
            {STAGE_LABELS[activeStage]} · {stageCounts[activeStage] ?? 0} candidates
          </span>
        </div>
      </div>

      {/* ── Cards ── */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {visibleItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mb-3">
                  <Check className="w-7 h-7 text-neutral-300" />
                </div>
                <p className="text-sm font-semibold text-neutral-700">No candidates here</p>
                <p className="text-xs text-neutral-400 mt-1">Advance candidates from earlier stages</p>
              </div>
            ) : (
              <motion.div initial="hidden" animate="visible">
                {visibleItems.map((item, i) => (
                  <PipelineCard
                    key={item.id}
                    item={item}
                    onMove={moveCandidate}
                    onRemove={removeCandidate}
                  />
                ))}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Summary Bar ── */}
      <div className="shrink-0 bg-white border-t border-neutral-100 px-4 py-3">
        <div className="flex gap-3 justify-around">
          {[
            { label: 'Screening',  count: stageCounts['screening']  ?? 0, color: '#60A5FA' },
            { label: 'Interview',  count: stageCounts['interview']  ?? 0, color: '#F59E0B' },
            { label: 'Offer',      count: stageCounts['offer']      ?? 0, color: '#34D399' },
            { label: 'Hired',      count: stageCounts['hired']      ?? 0, color: '#10B981' },
          ].map(({ label, count, color }) => (
            <div key={label} className="flex flex-col items-center gap-0.5">
              <span className="text-sm font-bold" style={{ color }}>{count}</span>
              <span className="text-[9px] text-neutral-400">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
