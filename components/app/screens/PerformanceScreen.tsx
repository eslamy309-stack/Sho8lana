'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, Zap, Flame, Trophy,
  TrendingUp, TrendingDown, Minus, Star, Building2, Loader2,
} from 'lucide-react'
import { useApp, callGemini } from '@/lib/store'
import {
  TIER_INFO, getTier, getLevel, getXPProgress,
  computeKPIs, computeKPIScore, POINTS,
} from '@/lib/leaderboard-data'
import type { KpiMetric } from '@/lib/types'
import { cn } from '@/lib/utils'

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KPICard({ kpi, index }: { kpi: KpiMetric; index: number }) {
  const trendIcon =
    kpi.trend > 0 ? <TrendingUp  className="w-3 h-3 text-emerald-500" /> :
    kpi.trend < 0 ? <TrendingDown className="w-3 h-3 text-red-400"    /> :
                    <Minus        className="w-3 h-3 text-neutral-400"  />

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white rounded-2xl border border-neutral-100 p-3.5 flex flex-col gap-2"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-neutral-600 leading-tight">{kpi.label}</p>
        <div className="flex items-center gap-0.5">
          {trendIcon}
          {kpi.trend !== 0 && (
            <span className={cn('text-2xs font-bold', kpi.trend > 0 ? 'text-emerald-500' : 'text-red-400')}>
              {kpi.trend > 0 ? '+' : ''}{kpi.trend}%
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: kpi.color }}
          initial={{ width: 0 }}
          animate={{ width: `${kpi.value}%` }}
          transition={{ delay: 0.5 + index * 0.05, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {/* Value */}
      <div className="flex items-end justify-between">
        <p className="text-xl font-bold text-neutral-900">{kpi.value}<span className="text-xs text-neutral-400 font-normal">%</span></p>
        <p className="text-2xs text-neutral-400 text-right leading-tight max-w-[90px]">{kpi.description}</p>
      </div>
    </motion.div>
  )
}

// ── Animated XP Bar ───────────────────────────────────────────────────────────

function XPBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-3 bg-white/20 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, pct)}%` }}
        transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  )
}

// ── Skill bar ─────────────────────────────────────────────────────────────────

function SkillBar({ label, value, color, index }: { label: string; value: number; color: string; index: number }) {
  return (
    <div className="flex items-center gap-3">
      <p className="text-xs font-semibold text-neutral-700 w-28 flex-shrink-0">{label}</p>
      <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ delay: 0.6 + index * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <p className="text-xs font-bold text-neutral-700 w-8 text-right">{value}%</p>
    </div>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────

export function PerformanceScreen() {
  const { state, dispatch } = useApp()
  const ar = state.lang === 'ar'

  const [aiInsight, setAiInsight]   = useState('')
  const [aiLoading, setAiLoading]   = useState(false)

  const kpis      = useMemo(() => computeKPIs(state.simDone, state.simXP, 0), [state.simDone, state.simXP])
  const kpiScore  = useMemo(() => computeKPIScore(kpis), [kpis])
  const tier      = getTier(state.simXP)
  const tierInfo  = TIER_INFO[tier]
  const level     = getLevel(state.simXP)
  const xpProg    = getXPProgress(state.simXP)

  async function fetchAIInsight() {
    setAiLoading(true)
    const topKPIs   = [...kpis].sort((a, b) => b.value - a.value).slice(0, 3).map(k => k.label).join(', ')
    const weakKPIs  = [...kpis].sort((a, b) => a.value - b.value).slice(0, 2).map(k => k.label).join(', ')
    const prompt    = `I'm a student on Sho8lana career platform. My stats: ${state.simDone.length} simulations completed, ${state.simXP} XP, ${tier} tier level ${level}, KPI score ${kpiScore}%. Top skills: ${topKPIs}. Weakest areas: ${weakKPIs}. Give me 3 specific, actionable tips to improve my ranking and career prospects. Be concise and motivating. ${ar ? 'Reply in Arabic.' : ''}`
    const insight   = await callGemini(prompt, 'You are a career performance coach for Egyptian university students.')
    setAiInsight(insight)
    setAiLoading(false)
  }

  // Scoring breakdown
  const pointBreakdown = [
    { label: ar ? 'محاكاة مكتملة' : 'Simulations done',  value: state.simDone.length * POINTS.simBeginner,   icon: '🎯' },
    { label: ar ? 'مكافأة الأداء' : 'Performance bonus',  value: Math.floor(kpiScore * 2),                    icon: '⚡' },
    { label: ar ? 'مكافأة الاتساق' : 'Consistency bonus', value: Math.min(200, state.simDone.length * 10),    icon: '🔥' },
  ]

  // Strength/weakness analysis from KPIs
  const sortedKPIs  = [...kpis].sort((a, b) => b.value - a.value)
  const strengths   = sortedKPIs.slice(0, 3)
  const weaknesses  = sortedKPIs.slice(-3).reverse()

  return (
    <div className="h-full flex flex-col bg-neutral-50 overflow-hidden">

      {/* ── Topbar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-neutral-100 flex-shrink-0">
        <button onClick={() => dispatch({ type: 'GO_BACK' })} className="p-1 text-neutral-500 hover:text-neutral-800 transition-colors">
          {ar ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
        <span className="text-sm font-bold text-neutral-900">{ar ? 'لوحة أدائي' : 'My Performance'}</span>
        <button
          onClick={() => dispatch({ type: 'GO', screen: 'leaderboard' })}
          className="flex items-center gap-1 text-xs font-semibold text-brand-600"
        >
          <Trophy className="w-3.5 h-3.5" />
          {ar ? 'الترتيب' : 'Rankings'}
        </button>
      </div>

      {/* ── Scrollable body ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-4 flex flex-col gap-4">

          {/* ── Tier hero card ─────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className={cn('rounded-3xl p-5 bg-gradient-to-br text-white', `bg-gradient-to-br ${tierInfo.gradient}`)}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-white/70 mb-0.5">{ar ? 'مستواك الحالي' : 'Current Tier'}</p>
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{tierInfo.icon}</span>
                  <div>
                    <p className="text-xl font-bold">{ar ? tierInfo.labelAr : tierInfo.label}</p>
                    <p className="text-xs text-white/70">Level {level}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{state.simXP.toLocaleString()}</p>
                <p className="text-xs text-white/70">XP</p>
              </div>
            </div>

            {/* XP progress to next tier */}
            <div className="mb-1.5">
              <div className="flex justify-between text-xs text-white/70 mb-1.5">
                <span>{xpProg.current.toLocaleString()} XP</span>
                {xpProg.nextTier
                  ? <span>{ar ? 'حتى' : 'to'} {ar ? TIER_INFO[xpProg.nextTier].labelAr : TIER_INFO[xpProg.nextTier].label} · {xpProg.total.toLocaleString()} XP</span>
                  : <span>{ar ? 'أعلى مستوى! 🎉' : 'Max tier! 🎉'}</span>}
              </div>
              <XPBar pct={xpProg.pct} color="rgba(255,255,255,0.8)" />
            </div>

            {/* Stats row */}
            <div className="flex gap-4 mt-4 pt-4 border-t border-white/20">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-300" />
                <div>
                  <p className="text-sm font-bold">{state.simDone.length}</p>
                  <p className="text-2xs text-white/60">{ar ? 'محاكاة' : 'Sims'}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-yellow-300" />
                <div>
                  <p className="text-sm font-bold">{kpiScore}%</p>
                  <p className="text-2xs text-white/60">KPI</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-cyan-300" />
                <div>
                  <p className="text-sm font-bold">{state.simBadges.length}</p>
                  <p className="text-2xs text-white/60">{ar ? 'شارات' : 'Badges'}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Points breakdown ────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="bg-white rounded-2xl border border-neutral-100 p-4"
          >
            <p className="text-sm font-bold text-neutral-900 mb-3">{ar ? 'تفاصيل النقاط' : 'Points Breakdown'}</p>
            <div className="flex flex-col gap-2">
              {pointBreakdown.map(p => (
                <div key={p.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{p.icon}</span>
                    <span className="text-xs text-neutral-600">{p.label}</span>
                  </div>
                  <span className="text-sm font-bold text-neutral-800">+{p.value} XP</span>
                </div>
              ))}
              <div className="border-t border-neutral-100 mt-1 pt-2 flex justify-between">
                <span className="text-xs font-bold text-neutral-700">{ar ? 'الإجمالي' : 'Total'}</span>
                <span className="text-sm font-bold text-brand-600">{state.simXP} XP</span>
              </div>
            </div>
          </motion.div>

          {/* ── KPI grid ────────────────────────────────────────────────── */}
          <div>
            <p className="text-sm font-bold text-neutral-900 mb-3">{ar ? 'مؤشرات الأداء الرئيسية' : 'Key Performance Indicators'}</p>
            <div className="grid grid-cols-2 gap-3">
              {kpis.map((kpi, i) => <KPICard key={kpi.id} kpi={kpi} index={i} />)}
            </div>
          </div>

          {/* ── Strengths & Weaknesses ──────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3">
            {/* Strengths */}
            <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-4">
              <p className="text-xs font-bold text-emerald-700 mb-2">
                {ar ? '💪 نقاط قوتك' : '💪 Strengths'}
              </p>
              <div className="flex flex-col gap-1.5">
                {strengths.map(s => (
                  <div key={s.id} className="flex items-center justify-between">
                    <span className="text-2xs text-emerald-800 truncate">{s.label}</span>
                    <span className="text-2xs font-bold text-emerald-700">{s.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weaknesses */}
            <div className="bg-orange-50 rounded-2xl border border-orange-100 p-4">
              <p className="text-xs font-bold text-orange-700 mb-2">
                {ar ? '📈 فرص التحسين' : '📈 Improve'}
              </p>
              <div className="flex flex-col gap-1.5">
                {weaknesses.map(w => (
                  <div key={w.id} className="flex items-center justify-between">
                    <span className="text-2xs text-orange-800 truncate">{w.label}</span>
                    <span className="text-2xs font-bold text-orange-700">{w.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Skill bars ──────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-4">
            <p className="text-sm font-bold text-neutral-900 mb-3">{ar ? 'تقدم المهارات' : 'Skill Progress'}</p>
            <div className="flex flex-col gap-3">
              {kpis.slice(0, 5).map((k, i) => (
                <SkillBar key={k.id} label={k.label} value={k.value} color={k.color} index={i} />
              ))}
            </div>
          </div>

          {/* ── Achievements ────────────────────────────────────────────── */}
          {state.simBadges.length > 0 && (
            <div className="bg-white rounded-2xl border border-neutral-100 p-4">
              <p className="text-sm font-bold text-neutral-900 mb-3">{ar ? 'الإنجازات' : 'Achievements'}</p>
              <div className="flex flex-wrap gap-2">
                {state.simBadges.map(b => (
                  <div
                    key={b.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100"
                  >
                    <span className="text-xs">🏅</span>
                    <span className="text-xs font-semibold text-brand-700">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── AI Performance Insights ─────────────────────────────────── */}
          <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{ar ? 'تحليل ذكي بالـ AI' : 'AI Performance Insights'}</p>
                <p className="text-2xs text-neutral-400">{ar ? 'مدعوم بـ Groq' : 'Powered by Groq'}</p>
              </div>
            </div>

            {aiInsight ? (
              <div className="text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap">{aiInsight}</div>
            ) : (
              <p className="text-xs text-neutral-500 mb-3">
                {ar
                  ? 'احصل على توصيات مخصصة بناءً على أداءك الفعلي.'
                  : 'Get personalized tips based on your actual performance data.'}
              </p>
            )}

            <button
              onClick={fetchAIInsight}
              disabled={aiLoading}
              className="mt-3 w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 transition-colors text-xs font-bold text-white flex items-center justify-center gap-2"
            >
              {aiLoading
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />{ar ? 'جاري التحليل...' : 'Analyzing...'}</>
                : <><Zap className="w-3.5 h-3.5" />{ar ? 'احصل على توصيات' : 'Get My Insights'}</>}
            </button>
          </div>

          {/* ── Recruiter View CTA ──────────────────────────────────────── */}
          <button
            onClick={() => dispatch({ type: 'GO', screen: 'companyPortal' })}
            className="w-full bg-white rounded-2xl border border-neutral-200 p-4 flex items-center gap-3 hover:border-brand-300 hover:bg-brand-50 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-brand-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-neutral-900">{ar ? 'ماذا ترى الشركات؟' : 'How recruiters see you'}</p>
              <p className="text-xs text-neutral-500">{ar ? 'عرض ملفك من منظور صاحب العمل' : 'Preview your profile from an employer\'s view'}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400 flex-shrink-0" />
          </button>

          <div className="h-4" />
        </div>
      </div>
    </div>
  )
}
