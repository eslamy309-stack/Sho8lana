'use client'

import { motion } from 'framer-motion'
import {
  ChevronLeft, TrendingUp, Lightbulb, Activity, AlertTriangle,
  CheckCircle2, BarChart2,
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

// ── Mock data ─────────────────────────────────────────────────────────────────

const TALENT_SCORE = 87
const VISIBILITY_SCORE = 73

const TIMELINE_EVENTS = [
  { date: '2 weeks ago',  icon: '🎯', event: 'Marketing Simulation completed', impact: '+12 KPI points',  positive: true  },
  { date: '3 weeks ago',  icon: '🥇', event: 'Reached Gold Tier',              impact: 'Visibility +20%', positive: true  },
  { date: '1 month ago',  icon: '📊', event: 'Ranked #12 nationally',          impact: '+8 recruiter views', positive: true },
  { date: '6 weeks ago',  icon: '💹', event: 'Finance Simulation completed',   impact: '+8 KPI points',   positive: true  },
  { date: '2 months ago', icon: '✅', event: 'Profile completed',              impact: 'Visibility unlocked', positive: true },
]

const SKILL_GAPS = [
  { skill: 'Python',             yours: 45, market: 85, gap: 'High'   as const },
  { skill: 'Excel',              yours: 78, market: 80, gap: 'Low'    as const },
  { skill: 'Financial Modeling', yours: 62, market: 75, gap: 'Medium' as const },
  { skill: 'Data Visualization', yours: 38, market: 70, gap: 'High'   as const },
]

const MONTHLY_GROWTH = [
  { month: 'Jan', value: 54 },
  { month: 'Feb', value: 61 },
  { month: 'Mar', value: 68 },
  { month: 'Apr', value: 74 },
  { month: 'May', value: 80 },
  { month: 'Jun', value: 87 },
]

const VISIBILITY_BARS = [
  { label: 'Profile Complete',     value: 85, color: '#10B981' },
  { label: 'Simulation Activity',  value: 70, color: '#6366F1' },
  { label: 'Leaderboard Rank',     value: 65, color: '#F59E0B' },
]

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

// ── Gap color helpers ─────────────────────────────────────────────────────────

type GapLevel = 'High' | 'Medium' | 'Low'

const GAP_META: Record<GapLevel, { color: string; bg: string; icon: React.ReactNode }> = {
  High:   { color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  Medium: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  icon: <Activity className="w-3.5 h-3.5" />      },
  Low:    { color: '#10B981', bg: 'rgba(16,185,129,0.12)',  icon: <CheckCircle2 className="w-3.5 h-3.5" />  },
}

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
  const { dispatch } = useApp()

  const maxBar = Math.max(...MONTHLY_GROWTH.map(m => m.value))

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
                  {TALENT_SCORE}
                </motion.span>
                <span className="text-xl font-bold mb-2" style={{ color: 'rgba(16,185,129,0.5)' }}>/100</span>
              </div>
              <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>Top 8% of students in Marketing track</p>
              <div
                className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981' }}
              >
                <TrendingUp className="w-3 h-3" />
                +5 points this month
              </div>
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
                  animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - TALENT_SCORE / 100) }}
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
                <span className="text-3xl font-black" style={{ color: '#6366F1' }}>{VISIBILITY_SCORE}</span>
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
            {VISIBILITY_BARS.map((bar, i) => (
              <div key={bar.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium" style={{ color: '#94A3B8' }}>{bar.label}</span>
                  <span className="text-xs font-bold" style={{ color: bar.color }}>{bar.value}%</span>
                </div>
                <AnimatedBar value={bar.value} color={bar.color} delay={i * 0.1 + 0.3} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── 3. Performance Timeline ── */}
        <motion.div
          variants={up}
          className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <h3 className="text-sm font-bold mb-4" style={{ color: '#F1F5F9' }}>Performance Timeline</h3>
          <div className="space-y-0">
            {TIMELINE_EVENTS.map((event, i) => (
              <div key={i} className="flex gap-3">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    {event.icon}
                  </div>
                  {i < TIMELINE_EVENTS.length - 1 && (
                    <div className="w-px flex-1 my-1" style={{ background: 'rgba(255,255,255,0.06)', minHeight: '1.5rem' }} />
                  )}
                </div>

                {/* Content */}
                <div className="pb-4 flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold leading-snug" style={{ color: '#F1F5F9' }}>{event.event}</p>
                    <span className="text-xs flex-shrink-0" style={{ color: '#475569' }}>{event.date}</span>
                  </div>
                  <span
                    className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981' }}
                  >
                    {event.impact}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── 4. Skill Gap Analysis ── */}
        <motion.div
          variants={up}
          className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <h3 className="text-sm font-bold mb-4" style={{ color: '#F1F5F9' }}>Skill Gap Analysis</h3>
          <div className="space-y-4">
            {SKILL_GAPS.map((item, i) => {
              const meta = GAP_META[item.gap]
              return (
                <div key={item.skill}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold" style={{ color: '#F1F5F9' }}>{item.skill}</span>
                    <span
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{ background: meta.bg, color: meta.color }}
                    >
                      {meta.icon}
                      {item.gap} Gap
                    </span>
                  </div>
                  {/* Your level */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs w-16 flex-shrink-0" style={{ color: '#64748B' }}>You</span>
                    <div className="flex-1">
                      <AnimatedBar value={item.yours} color="#6366F1" delay={i * 0.08 + 0.2} />
                    </div>
                    <span className="text-xs w-6 text-right flex-shrink-0 font-semibold" style={{ color: '#6366F1' }}>{item.yours}</span>
                  </div>
                  {/* Market demand */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs w-16 flex-shrink-0" style={{ color: '#64748B' }}>Market</span>
                    <div className="flex-1">
                      <AnimatedBar value={item.market} color={meta.color} delay={i * 0.08 + 0.35} />
                    </div>
                    <span className="text-xs w-6 text-right flex-shrink-0 font-semibold" style={{ color: meta.color }}>{item.market}</span>
                  </div>
                </div>
              )
            })}
          </div>
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

          <div className="flex items-end gap-2 h-28">
            {MONTHLY_GROWTH.map((item, i) => {
              const heightPct = (item.value / maxBar) * 100
              const isLast = i === MONTHLY_GROWTH.length - 1
              return (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-1.5">
                  <span
                    className="text-xs font-bold"
                    style={{ color: isLast ? '#10B981' : '#64748B' }}
                  >
                    {item.value}
                  </span>
                  <div className="w-full rounded-t-lg overflow-hidden flex items-end" style={{ height: '80px' }}>
                    <motion.div
                      className="w-full rounded-t-lg"
                      style={{
                        background: isLast
                          ? 'linear-gradient(180deg, #10B981, #059669)'
                          : 'rgba(99,102,241,0.4)',
                      }}
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPct}%` }}
                      transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                  <span className="text-xs" style={{ color: '#475569' }}>{item.month}</span>
                </div>
              )
            })}
          </div>
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
