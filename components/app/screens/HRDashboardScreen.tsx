'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users, Briefcase, TrendingUp, Award, Search,
  BarChart2, GitBranch, Plus, Bell, ChevronRight,
  CheckCircle, Clock, Star, Zap, ArrowUpRight,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { TALENT_POOL, PIPELINE, CAMPAIGNS, HR_ANALYTICS, RECRUITER_ACTIVITY, TIER_COLORS } from '@/lib/hr-data'
import { cn } from '@/lib/utils'

const up = {
  hidden:  { opacity: 0, y: 12 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 } }),
}

const ACTIVITY_ICONS: Record<string, { icon: string; color: string }> = {
  invited:     { icon: '📨', color: '#3B82F6' },
  shortlisted: { icon: '⭐', color: '#F59E0B' },
  viewed:      { icon: '👁️', color: '#8B5CF6' },
  note:        { icon: '📝', color: '#6B7280' },
  hired:       { icon: '✅', color: '#10B981' },
  rejected:    { icon: '❌', color: '#EF4444' },
}

function StatCard({ icon: Icon, label, value, sub, color, delay }: {
  icon: React.ElementType; label: string; value: string; sub: string; color: string; delay: number
}) {
  return (
    <motion.div variants={up} custom={delay}
      className="bg-white rounded-2xl p-4 border border-neutral-100 shadow-sm"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon className="w-4.5 h-4.5" style={{ color }} />
        </div>
        <ArrowUpRight className="w-3.5 h-3.5 text-neutral-300" />
      </div>
      <p className="text-2xl font-bold text-neutral-900 leading-none mb-1">{value}</p>
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <p className="text-[10px] text-neutral-400 mt-0.5">{sub}</p>
    </motion.div>
  )
}

function MiniBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  )
}

export function HRDashboardScreen() {
  const { dispatch } = useApp()
  const [notifCount] = useState(4)

  const topCandidates = TALENT_POOL.slice(0, 5)
  const recentActivity = RECRUITER_ACTIVITY.slice(0, 5)
  const activeCampaigns = CAMPAIGNS.filter(c => c.status === 'active')

  const pipelineStages = [
    { label: 'Screening',  count: PIPELINE.filter(p => p.stage === 'screening').length,  color: '#60A5FA' },
    { label: 'Assessment', count: PIPELINE.filter(p => p.stage === 'assessment').length, color: '#A78BFA' },
    { label: 'Interview',  count: PIPELINE.filter(p => p.stage === 'interview').length,  color: '#F59E0B' },
    { label: 'Offer',      count: PIPELINE.filter(p => p.stage === 'offer').length,      color: '#34D399' },
  ]
  const totalPipeline = pipelineStages.reduce((s, x) => s + x.count, 0)

  function timeAgo(ts: string) {
    const diff = Date.now() - new Date(ts).getTime()
    const h = Math.floor(diff / 3600000)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  }

  return (
    <div className="flex flex-col h-full bg-neutral-50 overflow-y-auto">

      {/* ── Header ── */}
      <div className="bg-neutral-900 px-5 pt-10 pb-6">
        <motion.div variants={up} initial="hidden" animate="visible" custom={0}
          className="flex items-center justify-between mb-1"
        >
          <div>
            <p className="text-neutral-400 text-xs font-medium uppercase tracking-wider">HR Control Center</p>
            <h1 className="text-white text-xl font-bold mt-0.5">Talent Intelligence</h1>
          </div>
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
            >
              <Bell className="w-4 h-4 text-white" />
            </motion.button>
            {notifCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                {notifCount}
              </span>
            )}
          </div>
        </motion.div>

        {/* Employer badge */}
        <motion.div variants={up} initial="hidden" animate="visible" custom={1}
          className="flex items-center gap-2 mt-3"
        >
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-white text-sm font-semibold">Vodafone Egypt</p>
            <p className="text-neutral-400 text-[10px]">{activeCampaigns.length} active campaigns · Enterprise plan</p>
          </div>
          <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
            LIVE
          </span>
        </motion.div>
      </div>

      <div className="px-4 py-4 space-y-4">

        {/* ── Stats ── */}
        <motion.div variants={up} initial="hidden" animate="visible" custom={2}
          className="grid grid-cols-2 gap-3"
        >
          <StatCard icon={Users}     label="Talent Pool"      value={HR_ANALYTICS.totalCandidates.toLocaleString()} sub="↑ 65 this week"      color="#6366F1" delay={2} />
          <StatCard icon={Briefcase} label="Active Campaigns" value={String(HR_ANALYTICS.activeCampaigns)}           sub="3 closing soon"     color="#F59E0B" delay={3} />
          <StatCard icon={TrendingUp} label="Avg KPI Score"   value={`${HR_ANALYTICS.avgCandidateScore}`}            sub="↑ 2.1 vs last month" color="#10B981" delay={4} />
          <StatCard icon={Award}     label="Hired This Month" value={String(HR_ANALYTICS.hiredThisMonth)}             sub={`${Math.round(HR_ANALYTICS.hireRate * 100)}% hire rate`} color="#EF4444" delay={5} />
        </motion.div>

        {/* ── Quick Actions ── */}
        <motion.div variants={up} initial="hidden" animate="visible" custom={6}>
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: Search,    label: 'Search',   screen: 'talentMarketplace', color: '#6366F1' },
              { icon: GitBranch, label: 'Pipeline', screen: 'recruitmentPipeline', color: '#F59E0B' },
              { icon: BarChart2, label: 'Analytics', screen: 'hrAnalytics', color: '#10B981' },
              { icon: Plus,      label: 'Campaign', screen: 'hrDashboard', color: '#EF4444' },
            ].map(({ icon: Icon, label, screen, color }) => (
              <motion.button
                key={label}
                whileTap={{ scale: 0.93 }}
                onClick={() => dispatch({ type: 'GO', screen: screen as never })}
                className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-white border border-neutral-100 shadow-sm"
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <span className="text-[10px] font-medium text-neutral-600">{label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── Top Performers ── */}
        <motion.div variants={up} initial="hidden" animate="visible" custom={7}
          className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-neutral-50">
            <div>
              <p className="text-sm font-semibold text-neutral-900">Top Performers</p>
              <p className="text-[10px] text-neutral-400">Ranked by overall KPI score</p>
            </div>
            <button
              onClick={() => dispatch({ type: 'GO', screen: 'talentMarketplace' as never })}
              className="text-[11px] text-brand-600 font-semibold flex items-center gap-0.5"
            >
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-neutral-50">
            {topCandidates.map((c, i) => {
              const tc = TIER_COLORS[c.tier]
              return (
                <motion.button
                  key={c.id}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => dispatch({ type: 'GO', screen: 'candidateIntelligence' as never })}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors text-left"
                >
                  <span className="text-xs font-bold text-neutral-300 w-4 shrink-0">#{i + 1}</span>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-900 flex items-center justify-center shrink-0">
                    <span className="text-white text-[10px] font-bold">{c.initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 truncate">{c.name}</p>
                    <p className="text-[10px] text-neutral-400 truncate">{c.university} · {c.tracks[0]}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-sm font-bold text-neutral-900">{c.overallScore}</span>
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ background: tc.bg, color: tc.text }}>
                      {c.tier.charAt(0).toUpperCase() + c.tier.slice(1)}
                    </span>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* ── Pipeline Overview ── */}
        <motion.div variants={up} initial="hidden" animate="visible" custom={8}
          className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-neutral-900">Active Pipeline</p>
              <p className="text-[10px] text-neutral-400">{totalPipeline} candidates in review</p>
            </div>
            <button
              onClick={() => dispatch({ type: 'GO', screen: 'recruitmentPipeline' as never })}
              className="text-[11px] text-brand-600 font-semibold flex items-center gap-0.5"
            >
              Manage <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {pipelineStages.map(({ label, count, color }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-[11px] text-neutral-500 w-20 shrink-0">{label}</span>
                <MiniBar value={totalPipeline > 0 ? (count / totalPipeline) * 100 : 0} color={color} />
                <span className="text-xs font-bold text-neutral-700 w-4 text-right shrink-0">{count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Active Campaigns ── */}
        <motion.div variants={up} initial="hidden" animate="visible" custom={9}
          className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-neutral-50">
            <p className="text-sm font-semibold text-neutral-900">Active Campaigns</p>
            <button className="w-6 h-6 rounded-lg bg-neutral-900 flex items-center justify-center">
              <Plus className="w-3 h-3 text-white" />
            </button>
          </div>

          <div className="divide-y divide-neutral-50">
            {activeCampaigns.map(campaign => (
              <div key={campaign.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 truncate">{campaign.title}</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">{campaign.department} · Min score {campaign.minScore}</p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 shrink-0">
                    {campaign.candidateCount} applied
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="w-3 h-3 text-neutral-400" />
                  <span className="text-[10px] text-neutral-400">Deadline: {campaign.deadline}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Recent Activity ── */}
        <motion.div variants={up} initial="hidden" animate="visible" custom={10}
          className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden"
        >
          <div className="px-4 pt-4 pb-3 border-b border-neutral-50">
            <p className="text-sm font-semibold text-neutral-900">Recent Activity</p>
          </div>
          <div className="divide-y divide-neutral-50">
            {recentActivity.map(act => {
              const meta = ACTIVITY_ICONS[act.type]
              return (
                <div key={act.id} className="flex items-start gap-3 px-4 py-3">
                  <span className="text-base shrink-0 mt-0.5">{meta.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-neutral-900">{act.candidateName}</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5 leading-relaxed">{act.message}</p>
                  </div>
                  <span className="text-[9px] text-neutral-400 shrink-0 mt-0.5">{timeAgo(act.timestamp)}</span>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* ── Tier Breakdown ── */}
        <motion.div variants={up} initial="hidden" animate="visible" custom={11}
          className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4 mb-4"
        >
          <p className="text-sm font-semibold text-neutral-900 mb-3">Talent Pool Tiers</p>
          <div className="grid grid-cols-4 gap-2">
            {HR_ANALYTICS.tierDistribution.map(({ tier, count, pct }) => {
              const tc = TIER_COLORS[tier]
              return (
                <div key={tier} className="flex flex-col items-center gap-1 py-2.5 rounded-xl border"
                  style={{ background: tc.bg, borderColor: tc.border }}>
                  <span className="text-sm font-bold" style={{ color: tc.text }}>{count}</span>
                  <span className="text-[9px] font-semibold" style={{ color: tc.text }}>
                    {tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </span>
                  <span className="text-[9px]" style={{ color: tc.text }}>{Math.round(pct * 100)}%</span>
                </div>
              )
            })}
          </div>
        </motion.div>

      </div>
    </div>
  )
}
