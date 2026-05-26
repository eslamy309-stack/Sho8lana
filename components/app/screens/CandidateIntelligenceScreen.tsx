'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronLeft, MapPin, GraduationCap, Star, Zap,
  TrendingUp, Brain, Users, Target, Clock, Award,
  Mail, UserPlus, Download, CheckCircle,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { TALENT_POOL, TIER_COLORS } from '@/lib/hr-data'
import { cn } from '@/lib/utils'

const up = {
  hidden:  { opacity: 0, y: 12 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 } }),
}

function KpiBar({ label, value, color, delay }: { label: string; value: number; color: string; delay: number }) {
  return (
    <motion.div variants={up} custom={delay} className="flex items-center gap-3">
      <span className="text-xs text-neutral-500 w-28 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: delay * 0.06 + 0.2 }}
        />
      </div>
      <span className="text-xs font-bold text-neutral-700 w-7 text-right">{value}</span>
    </motion.div>
  )
}

function BehaviorChip({ label, value, icon }: { label: string; value: string; icon: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    improves:      { bg: '#DCFCE7', text: '#16A34A' },
    stable:        { bg: '#FEF9E7', text: '#D97706' },
    degrades:      { bg: '#FEE2E2', text: '#DC2626' },
    moderate:      { bg: '#EFF6FF', text: '#2563EB' },
    conservative:  { bg: '#F0FDF4', text: '#16A34A' },
    aggressive:    { bg: '#FFF7ED', text: '#EA580C' },
  }
  const c = colors[value] ?? { bg: '#F3F4F6', text: '#6B7280' }
  return (
    <div className="flex flex-col gap-1 flex-1 min-w-0">
      <span className="text-[9px] text-neutral-400 uppercase tracking-wide">{label}</span>
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl" style={{ background: c.bg }}>
        <span className="text-sm">{icon}</span>
        <span className="text-[11px] font-semibold capitalize truncate" style={{ color: c.text }}>{value}</span>
      </div>
    </div>
  )
}

export function CandidateIntelligenceScreen() {
  const { dispatch } = useApp()
  // Show first candidate as demo — in prod this would come from navigation state
  const candidate = TALENT_POOL[0]
  const tc = TIER_COLORS[candidate.tier]
  const [tab, setTab] = useState<'kpi' | 'behavior' | 'history'>('kpi')
  const [invited, setInvited] = useState(false)

  const kpis = [
    { label: 'Problem Solving', value: candidate.problemSolving, color: '#6366F1' },
    { label: 'Decision Making', value: candidate.decision,       color: '#F59E0B' },
    { label: 'Accuracy',        value: candidate.accuracy,       color: '#10B981' },
    { label: 'Leadership',      value: candidate.leadership,     color: '#EF4444' },
    { label: 'Communication',   value: candidate.communication,  color: '#3B82F6' },
    { label: 'Collaboration',   value: candidate.collaboration,  color: '#8B5CF6' },
    { label: 'Adaptability',    value: candidate.adaptability,   color: '#06B6D4' },
    { label: 'Speed',           value: candidate.speed,          color: '#F97316' },
  ]

  const simHistory = [
    { name: 'Budget Variance Analysis', score: 96, date: '2026-05-20', xp: 280, status: 'completed' },
    { name: 'Market Entry Strategy',    score: 92, date: '2026-05-15', xp: 240, status: 'completed' },
    { name: 'Supply Chain Disruption',  score: 88, date: '2026-05-10', xp: 210, status: 'completed' },
    { name: 'Investor Pitch Deck',      score: 95, date: '2026-05-03', xp: 260, status: 'completed' },
    { name: 'Operations Optimization',  score: 91, date: '2026-04-28', xp: 230, status: 'completed' },
  ]

  return (
    <div className="flex flex-col h-full bg-neutral-50 overflow-y-auto">

      {/* ── Hero Header ── */}
      <div className="bg-neutral-900 px-4 pt-10 pb-0 shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <motion.button whileTap={{ scale: 0.9 }}
            onClick={() => dispatch({ type: 'GO_BACK' })}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </motion.button>
          <p className="text-white text-sm font-semibold">Candidate Profile</p>
        </div>

        {/* Profile */}
        <motion.div variants={up} initial="hidden" animate="visible" custom={0}
          className="flex items-start gap-4 mb-5"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neutral-600 to-neutral-800 flex items-center justify-center border-2 border-white/10 shrink-0">
            <span className="text-white text-xl font-bold">{candidate.initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-white text-lg font-bold">{candidate.name}</h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: tc.bg, color: tc.text }}>
                #{candidate.rank} · {candidate.tier.charAt(0).toUpperCase() + candidate.tier.slice(1)}
              </span>
            </div>
            <p className="text-neutral-400 text-xs mt-0.5">{candidate.major}</p>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
              <span className="flex items-center gap-1 text-[10px] text-neutral-400">
                <GraduationCap className="w-3 h-3" />{candidate.university}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-neutral-400">
                <MapPin className="w-3 h-3" />{candidate.location}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-neutral-400">
                <Star className="w-3 h-3" />GPA {candidate.gpa.toFixed(1)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Score row */}
        <motion.div variants={up} initial="hidden" animate="visible" custom={1}
          className="grid grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden mb-5"
        >
          {[
            { label: 'Overall',    value: candidate.overallScore,      suffix: '' },
            { label: 'Readiness', value: candidate.recruiterReadiness, suffix: '' },
            { label: 'XP',        value: `${(candidate.totalXP / 1000).toFixed(1)}K`, suffix: '' },
            { label: 'Sims',      value: candidate.completedSimulations, suffix: '' },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center py-3 bg-white/5">
              <span className="text-white text-lg font-bold">{value}</span>
              <span className="text-neutral-400 text-[9px] uppercase tracking-wide">{label}</span>
            </div>
          ))}
        </motion.div>

        {/* Tab bar */}
        <div className="flex border-b border-white/10">
          {(['kpi', 'behavior', 'history'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={cn(
                'flex-1 py-2.5 text-xs font-semibold capitalize transition-colors',
                tab === t ? 'text-white border-b-2 border-white' : 'text-neutral-500'
              )}
            >
              {t === 'kpi' ? 'KPI Analytics' : t === 'behavior' ? 'Behavioral' : 'Sim History'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4">

        {tab === 'kpi' && (
          <motion.div initial="hidden" animate="visible" className="space-y-4">
            {/* KPI bars */}
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4">
              <p className="text-sm font-semibold text-neutral-900 mb-4">KPI Breakdown</p>
              <div className="space-y-3">
                {kpis.map((k, i) => (
                  <KpiBar key={k.label} label={k.label} value={k.value} color={k.color} delay={i} />
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4">
              <p className="text-sm font-semibold text-neutral-900 mb-3">Verified Skills</p>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map(s => (
                  <span key={s} className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-100">
                    <CheckCircle className="w-3 h-3" />{s}
                  </span>
                ))}
              </div>
            </div>

            {/* Tracks & Badges */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-3">
                <p className="text-xs font-semibold text-neutral-700 mb-2">Tracks</p>
                {candidate.tracks.map(t => (
                  <span key={t} className="inline-block mr-1 mb-1 text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">{t}</span>
                ))}
              </div>
              <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-3">
                <p className="text-xs font-semibold text-neutral-700 mb-2">Badges</p>
                <p className="text-xl tracking-wide">{candidate.badges.join(' ')}</p>
              </div>
            </div>

            {/* Availability */}
            {candidate.availableFrom && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-emerald-800">Available from {candidate.availableFrom}</p>
                  <p className="text-[10px] text-emerald-600">Open to internship &amp; full-time opportunities</p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {tab === 'behavior' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4">
              <p className="text-sm font-semibold text-neutral-900 mb-3">Behavioral Profile</p>
              <div className="flex gap-2 mb-4">
                <BehaviorChip label="Under Pressure"  value={candidate.pressureResponse} icon="⚡" />
                <BehaviorChip label="Risk Profile"    value={candidate.riskProfile}      icon="🎯" />
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Consistency Score',  value: candidate.consistencyScore, icon: <Target className="w-4 h-4" />,   color: '#6366F1' },
                  { label: 'Optimal Decisions',  value: Math.round(candidate.optimalDecisionRate * 100), icon: <Brain className="w-4 h-4" />, color: '#10B981' },
                  { label: 'Streak (days)',       value: candidate.streak, icon: <Zap className="w-4 h-4" />,               color: '#F59E0B' },
                ].map(({ label, value, icon, color }) => (
                  <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}15`, color }}>
                      {icon}
                    </div>
                    <span className="flex-1 text-xs font-medium text-neutral-700">{label}</span>
                    <span className="text-sm font-bold text-neutral-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4">
              <p className="text-sm font-semibold text-neutral-900 mb-3">AI Recruiter Summary</p>
              <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-xl p-3 text-xs text-neutral-600 leading-relaxed">
                <p className="font-semibold text-neutral-800 mb-1">🤖 AI Assessment</p>
                <strong>{candidate.name}</strong> demonstrates exceptional analytical capabilities with a top-tier
                consistency score of <strong>{candidate.consistencyScore}/100</strong>. Performance improves under
                pressure — a strong indicator of leadership potential. Optimal decision rate of{' '}
                <strong>{Math.round(candidate.optimalDecisionRate * 100)}%</strong> places this candidate in the
                top 5% of the talent pool. Highly recommended for Finance and Strategy roles.
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4">
              <p className="text-sm font-semibold text-neutral-900 mb-3">Recruiter Readiness</p>
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 shrink-0">
                  <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                    <path d="M18 2 a 16 16 0 0 1 0 32 a 16 16 0 0 1 0 -32" fill="none" stroke="#E5E7EB" strokeWidth="3" />
                    <path d="M18 2 a 16 16 0 0 1 0 32 a 16 16 0 0 1 0 -32" fill="none" stroke="#10B981" strokeWidth="3"
                      strokeDasharray={`${candidate.recruiterReadiness} 100`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-neutral-900">{candidate.recruiterReadiness}</span>
                    <span className="text-[8px] text-neutral-400">/ 100</span>
                  </div>
                </div>
                <div className="flex-1 text-xs text-neutral-600 leading-relaxed">
                  This candidate has a <strong className="text-emerald-600">high recruiter readiness score</strong>,
                  indicating strong interview performance potential, professional communication, and verified
                  domain skills across {candidate.tracks.join(' and ')} tracks.
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {tab === 'history' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
              <div className="px-4 pt-4 pb-3 border-b border-neutral-50 flex items-center justify-between">
                <p className="text-sm font-semibold text-neutral-900">Simulation Results</p>
                <span className="text-[10px] text-neutral-400">{candidate.completedSimulations} total</span>
              </div>
              <div className="divide-y divide-neutral-50">
                {simHistory.map((sim, i) => (
                  <motion.div key={i} variants={up} initial="hidden" animate="visible" custom={i}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <div className="w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0">
                      <Award className="w-4 h-4 text-neutral-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-neutral-900 truncate">{sim.name}</p>
                      <p className="text-[10px] text-neutral-400 mt-0.5">{sim.date} · +{sim.xp} XP</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold" style={{ color: sim.score >= 90 ? '#10B981' : '#F59E0B' }}>
                        {sim.score}
                      </p>
                      <p className="text-[9px] text-neutral-400">/100</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4">
              <p className="text-sm font-semibold text-neutral-900 mb-3">Performance Trend</p>
              <div className="flex items-end gap-1.5 h-16">
                {simHistory.map((sim, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <motion.div
                      className="w-full rounded-t-md"
                      style={{ background: '#6366F1', opacity: 0.7 + (i * 0.06) }}
                      initial={{ height: 0 }}
                      animate={{ height: `${(sim.score - 60) * 1.6}px` }}
                      transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    />
                    <span className="text-[8px] text-neutral-400">{sim.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div className="h-4" />
      </div>

      {/* ── Action Bar ── */}
      <div className="shrink-0 bg-white border-t border-neutral-100 px-4 py-3 flex gap-2">
        <motion.button whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-xl border border-neutral-200 flex items-center justify-center shrink-0"
        >
          <Download className="w-4 h-4 text-neutral-600" />
        </motion.button>
        <motion.button whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-xl border border-neutral-200 flex items-center justify-center shrink-0"
        >
          <Mail className="w-4 h-4 text-neutral-600" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setInvited(true)}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors',
            invited ? 'bg-emerald-500 text-white' : 'bg-neutral-900 text-white'
          )}
        >
          {invited
            ? <><CheckCircle className="w-4 h-4" /> Invited to Interview</>
            : <><UserPlus className="w-4 h-4" /> Invite to Interview</>}
        </motion.button>
      </div>
    </div>
  )
}
