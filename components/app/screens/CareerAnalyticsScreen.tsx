'use client'

import { motion } from 'framer-motion'
import {
  ChevronLeft, TrendingUp, Lightbulb, BarChart2,
} from 'lucide-react'
import { useApp } from '@/lib/store'

// ── Animation variants ────────────────────────────────────────────────────────

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

const up = {
  hidden:  { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
}

// ── Static recommendations (generic advice, not mock data) ───────────────────

const RECOMMENDATIONS = [
  {
    icon: '🎯',
    text: 'Complete the Finance Simulation to boost your KPI by ~8 points',
    cta: 'Start Simulation',
    color: '#6366F1',
  },
  {
    icon: '🔗',
    text: 'Add portfolio links to increase recruiter visibility by 15%',
    cta: 'Update Profile',
    color: '#10B981',
  },
  {
    icon: '💻',
    text: 'Connect your GitHub to unlock the Tech Verified badge',
    cta: 'Connect GitHub',
    color: '#F59E0B',
  },
]

// ── Animated bar ──────────────────────────────────────────────────────────────

function AnimatedBar({
  value,
  color,
  delay = 0,
  height = 'h-2',
}: {
  value: number
  color: string
  delay?: number
  height?: string
}) {
  return (
    <div
      className={`${height} rounded-full overflow-hidden`}
      style={{ background: 'rgba(255,255,255,0.06)' }}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function CareerAnalyticsScreen() {
  const { state, dispatch } = useApp()
  const talentScore = state.user.kpiScore ?? 0
  const visibilityScore = 0

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: '#0F1117', color: '#F1F5F9' }}
    >
      {/* ── Header ── */}
      <div
        className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3"
        style={{ background: 'rgba(15,17,23,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <button
          onClick={() => dispatch({ type: 'GO_BACK' })}
          className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: '#94A3B8' }}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4" style={{ color: '#10B981' }} />
          <span className="text-sm font-bold" style={{ color: '#F1F5F9' }}>Career Analytics</span>
        </div>
      </div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="px-4 pt-5 space-y-4"
      >
        {/* ── 1. Talent Score card ── */}
        <motion.div
          variants={up}
          className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium" style={{ color: '#64748B' }}>Talent Score</p>
              <div className="flex items-end gap-1.5 mt-1">
                <motion.span
                  className="text-6xl font-black"
                  style={{ color: '#10B981', lineHeight: 1 }}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  {talentScore}
                </motion.span>
                <span className="text-xl font-bold mb-2" style={{ color: 'rgba(16,185,129,0.5)' }}>/100</span>
              </div>
              <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>
                {talentScore === 0 ? 'Complete simulations to build your score' : 'Based on your simulation performance'}
              </p>
              {talentScore > 0 && (
                <div
                  className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981' }}
                >
                  <TrendingUp className="w-3 h-3" />
                  Score from simulations
                </div>
              )}
            </div>

            {/* Circular progress display */}
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg viewBox="0 0 96 96" className="w-full h-full -rotate-90">
                <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                <motion.circle
                  cx="48" cy="48" r="40"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - talentScore / 100) }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-black" style={{ color: '#10B981' }}>🎯</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── 2. Recruiter Visibility Score ── */}
        <motion.div
          variants={up}
          className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-medium" style={{ color: '#64748B' }}>Recruiter Visibility</p>
              <div className="flex items-end gap-1 mt-1">
                <span className="text-3xl font-black" style={{ color: '#6366F1' }}>{visibilityScore}</span>
                <span className="text-sm font-bold mb-1" style={{ color: 'rgba(99,102,241,0.5)' }}>/100</span>
              </div>
            </div>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}
            >
              <span className="text-xl">👁️</span>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Profile Complete',    value: 0, color: '#10B981' },
              { label: 'Simulation Activity', value: 0, color: '#6366F1' },
              { label: 'Leaderboard Rank',    value: 0, color: '#F59E0B' },
            ].map((bar, i) => (
              <div key={bar.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium" style={{ color: '#94A3B8' }}>{bar.label}</span>
                  <span className="text-xs font-bold" style={{ color: bar.color }}>{bar.value}%</span>
                </div>
                <AnimatedBar value={bar.value} color={bar.color} delay={i * 0.1 + 0.3} />
              </div>
            ))}
            <p className="text-xs pt-1" style={{ color: '#64748B' }}>Complete your profile and simulations to boost visibility</p>
          </div>
        </motion.div>

        {/* ── 3. Performance Timeline ── */}
        <motion.div
          variants={up}
          className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <h3 className="text-sm font-bold mb-4" style={{ color: '#F1F5F9' }}>Performance Timeline</h3>
          <p className="text-xs py-2" style={{ color: '#64748B' }}>Complete simulations to track your progress over time</p>
        </motion.div>

        {/* ── 4. Skill Gap Analysis ── */}
        <motion.div
          variants={up}
          className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <h3 className="text-sm font-bold mb-4" style={{ color: '#F1F5F9' }}>Skill Gap Analysis</h3>
          <p className="text-xs py-2" style={{ color: '#64748B' }}>Complete simulations to see how your skills compare to market demand</p>
        </motion.div>

        {/* ── 5. Monthly Growth Chart ── */}
        <motion.div
          variants={up}
          className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold" style={{ color: '#F1F5F9' }}>Monthly Growth</h3>
            <span className="text-xs font-medium" style={{ color: '#64748B' }}>KPI Score · Last 6 months</span>
          </div>
          <p className="text-xs py-2" style={{ color: '#64748B' }}>Your KPI growth chart will appear here after your first simulation</p>
        </motion.div>

        {/* ── 6. AI Recommendations ── */}
        <motion.div
          variants={up}
          className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-4 h-4" style={{ color: '#F59E0B' }} />
            <h3 className="text-sm font-bold" style={{ color: '#F1F5F9' }}>AI Recommendations</h3>
          </div>
          <div className="space-y-3">
            {RECOMMENDATIONS.map((rec, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 + 0.4, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-start gap-3 p-4 rounded-xl"
                style={{ background: `${rec.color}0a`, border: `1px solid ${rec.color}22` }}
              >
                <span className="text-xl flex-shrink-0 mt-0.5">{rec.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs leading-relaxed" style={{ color: '#CBD5E1' }}>{rec.text}</p>
                  <button
                    className="mt-2 text-xs font-bold transition-opacity hover:opacity-80"
                    style={{ color: rec.color }}
                  >
                    {rec.cta} →
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
