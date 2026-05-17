'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, Zap, Flame, Trophy,
  TrendingUp, TrendingDown, Minus, Star, Building2, Loader2,
  BarChart2, Grid3X3, Activity,
} from 'lucide-react'
import { useApp, callGemini } from '@/lib/store'
import {
  TIER_INFO, getTier, getLevel, getXPProgress,
  computeKPIs, computeKPIScore, getKpisByCategory,
  KPI_CATEGORY_META, POINTS,
} from '@/lib/leaderboard-data'
import type { KpiMetric, KpiCategory, KpiStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

// ── Status helpers ─────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<KpiStatus, { bg: string; text: string; dot: string }> = {
  green:  { bg: 'bg-emerald-50',  text: 'text-emerald-700', dot: 'bg-emerald-500' },
  yellow: { bg: 'bg-amber-50',    text: 'text-amber-700',   dot: 'bg-amber-400'   },
  red:    { bg: 'bg-red-50',      text: 'text-red-700',     dot: 'bg-red-500'     },
}

// ── Radar Chart (SVG) ──────────────────────────────────────────────────────────

function RadarChart({ kpis }: { kpis: KpiMetric[] }) {
  const cx = 110, cy = 110, r = 88
  const n = kpis.length
  if (n < 3) return null

  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2

  const pt = (i: number, val: number) => {
    const a = angle(i)
    const len = (val / 100) * r
    return { x: cx + len * Math.cos(a), y: cy + len * Math.sin(a) }
  }

  const outerPt = (i: number) => {
    const a = angle(i)
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
  }

  const polyPoints = kpis.map((k, i) => pt(i, k.value))
  const polyStr = polyPoints.map(p => `${p.x},${p.y}`).join(' ')

  const rings = [25, 50, 75, 100]

  return (
    <svg viewBox="0 0 220 220" className="w-full max-w-[220px] mx-auto">
      {/* Ring grid */}
      {rings.map(ring => {
        const pts = kpis.map((_, i) => {
          const a = angle(i)
          const len = (ring / 100) * r
          return `${cx + len * Math.cos(a)},${cy + len * Math.sin(a)}`
        })
        return <polygon key={ring} points={pts.join(' ')} fill="none" stroke="#E5E7EB" strokeWidth="0.8" />
      })}

      {/* Spokes */}
      {kpis.map((_, i) => {
        const p = outerPt(i)
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#E5E7EB" strokeWidth="0.8" />
      })}

      {/* Data polygon */}
      <motion.polygon
        points={polyStr}
        fill="rgba(13,148,136,0.18)"
        stroke="#0D9488"
        strokeWidth="2"
        strokeLinejoin="round"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />

      {/* Data points */}
      {polyPoints.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={3}
          fill={kpis[i].color}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 + i * 0.04, duration: 0.3 }}
        />
      ))}

      {/* Labels */}
      {kpis.map((k, i) => {
        const p = outerPt(i)
        const dx = p.x - cx, dy = p.y - cy
        const lx = cx + (dx / r) * (r + 14)
        const ly = cy + (dy / r) * (r + 14)
        return (
          <text
            key={i}
            x={lx}
            y={ly}
            fontSize="7"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#6B7280"
          >
            {k.label.split(' ')[0]}
          </text>
        )
      })}
    </svg>
  )
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KPICard({ kpi, index }: { kpi: KpiMetric; index: number }) {
  const sc = STATUS_COLORS[kpi.status]
  const trendIcon =
    kpi.trend > 0 ? <TrendingUp  className="w-3 h-3 text-emerald-500" /> :
    kpi.trend < 0 ? <TrendingDown className="w-3 h-3 text-red-400"    /> :
                    <Minus        className="w-3 h-3 text-neutral-400"  />

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.04, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white rounded-2xl border border-neutral-100 p-3 flex flex-col gap-2"
    >
      <div className="flex items-start justify-between gap-1">
        <p className="text-2xs font-semibold text-neutral-600 leading-tight">{kpi.label}</p>
        <span className={cn('flex items-center gap-1 px-1.5 py-0.5 rounded-full text-2xs font-semibold flex-shrink-0', sc.bg, sc.text)}>
          <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', sc.dot)} />
          {kpi.status === 'green' ? 'Good' : kpi.status === 'yellow' ? 'Fair' : 'Low'}
        </span>
      </div>

      <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: kpi.color }}
          initial={{ width: 0 }}
          animate={{ width: `${kpi.value}%` }}
          transition={{ delay: 0.15 + index * 0.04, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-lg font-bold text-neutral-900">{kpi.value}<span className="text-2xs text-neutral-400 font-normal">%</span></p>
        <div className="flex items-center gap-0.5">
          {trendIcon}
          {kpi.trend !== 0 && (
            <span className={cn('text-2xs font-bold', kpi.trend > 0 ? 'text-emerald-500' : 'text-red-400')}>
              {kpi.trend > 0 ? '+' : ''}{kpi.trend}%
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ── Heatmap cell ──────────────────────────────────────────────────────────────

function HeatmapCell({ kpi, index }: { kpi: KpiMetric; index: number }) {
  const intensity = kpi.value / 100
  return (
    <motion.div
      key={kpi.id}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="relative rounded-xl p-2 flex flex-col items-center gap-1 cursor-default"
      style={{ background: `${kpi.color}${Math.round(intensity * 140 + 30).toString(16).padStart(2, '0')}` }}
    >
      <span className="text-2xs font-bold text-neutral-900 text-center leading-tight">{kpi.value}%</span>
      <span className="text-2xs text-neutral-700 text-center leading-tight" style={{ fontSize: 8 }}>
        {kpi.label.split(' ').slice(0, 2).join(' ')}
      </span>
    </motion.div>
  )
}

// ── XP Bar ────────────────────────────────────────────────────────────────────

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

// ── Main screen ───────────────────────────────────────────────────────────────

type ViewMode = 'overview' | 'radar' | 'heatmap'
const CATEGORIES: KpiCategory[] = ['performance', 'productivity', 'leadership', 'readiness', 'cognitive']

export function PerformanceScreen() {
  const { state, dispatch } = useApp()
  const ar = state.lang === 'ar'

  const [aiInsight, setAiInsight]   = useState('')
  const [aiLoading, setAiLoading]   = useState(false)
  const [viewMode, setViewMode]     = useState<ViewMode>('overview')
  const [activeCategory, setActiveCategory] = useState<KpiCategory>('performance')

  const kpis          = useMemo(() => computeKPIs(state.simDone, state.simXP, 0), [state.simDone, state.simXP])
  const kpiScore      = useMemo(() => computeKPIScore(kpis), [kpis])
  const byCategory    = useMemo(() => getKpisByCategory(kpis), [kpis])
  const tier          = getTier(state.simXP)
  const tierInfo      = TIER_INFO[tier]
  const level         = getLevel(state.simXP)
  const xpProg        = getXPProgress(state.simXP)

  const statusCounts  = useMemo(() => ({
    green:  kpis.filter(k => k.status === 'green').length,
    yellow: kpis.filter(k => k.status === 'yellow').length,
    red:    kpis.filter(k => k.status === 'red').length,
  }), [kpis])

  const sortedKPIs  = useMemo(() => [...kpis].sort((a, b) => b.value - a.value), [kpis])
  const strengths   = sortedKPIs.slice(0, 4)
  const weaknesses  = sortedKPIs.slice(-4).reverse()

  // Radar uses one representative KPI per category
  const radarKpis   = CATEGORIES.map(cat => {
    const group = byCategory[cat]
    return group.reduce((best, k) => k.value > best.value ? k : best, group[0])
  })

  async function fetchAIInsight() {
    setAiLoading(true)
    const topKPIs  = strengths.map(k => k.label).join(', ')
    const weakKPIs = weaknesses.map(k => k.label).join(', ')
    const prompt   = `I'm a student on Sho8lana career platform. Stats: ${state.simDone.length} sims, ${state.simXP} XP, ${tier} tier Lv.${level}, KPI ${kpiScore}%. Green KPIs: ${topKPIs}. Red KPIs: ${weakKPIs}. Give 3 specific, actionable career tips. Keep it concise and motivating. ${ar ? 'Reply in Arabic.' : ''}`
    const insight  = await callGemini(prompt, 'You are a career performance coach for Egyptian university students.')
    setAiInsight(insight)
    setAiLoading(false)
  }

  const pointBreakdown = [
    { label: ar ? 'محاكاة مكتملة' : 'Simulations done',  value: state.simDone.length * POINTS.simBeginner, icon: '🎯' },
    { label: ar ? 'مكافأة الأداء' : 'Performance bonus',  value: Math.floor(kpiScore * 2),                  icon: '⚡' },
    { label: ar ? 'مكافأة الاتساق' : 'Consistency bonus', value: Math.min(200, state.simDone.length * 10),  icon: '🔥' },
  ]

  return (
    <div className="h-full flex flex-col bg-neutral-50 overflow-hidden">

      {/* ── Topbar ─────────────────────────────────────────────────────── */}
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

      {/* ── Scrollable body ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-4 flex flex-col gap-4">

          {/* ── Tier hero ───────────────────────────────────────────────── */}
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

            <div className="mb-1.5">
              <div className="flex justify-between text-xs text-white/70 mb-1.5">
                <span>{xpProg.current.toLocaleString()} XP</span>
                {xpProg.nextTier
                  ? <span>{ar ? 'حتى' : 'to'} {ar ? TIER_INFO[xpProg.nextTier].labelAr : TIER_INFO[xpProg.nextTier].label} · {xpProg.total.toLocaleString()} XP</span>
                  : <span>{ar ? 'أعلى مستوى! 🎉' : 'Max tier! 🎉'}</span>}
              </div>
              <XPBar pct={xpProg.pct} color="rgba(255,255,255,0.8)" />
            </div>

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

          {/* ── Status summary strip ────────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: 'green' as const,  label: ar ? 'ممتاز' : 'Strong',   count: statusCounts.green  },
              { key: 'yellow' as const, label: ar ? 'متوسط' : 'Moderate', count: statusCounts.yellow },
              { key: 'red' as const,    label: ar ? 'يحتاج عمل' : 'Needs Work', count: statusCounts.red },
            ].map(s => {
              const sc = STATUS_COLORS[s.key]
              return (
                <motion.div
                  key={s.key}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className={cn('rounded-2xl p-3 flex flex-col items-center gap-1', sc.bg)}
                >
                  <span className={cn('w-2.5 h-2.5 rounded-full', sc.dot)} />
                  <p className={cn('text-xl font-bold', sc.text)}>{s.count}</p>
                  <p className={cn('text-2xs font-semibold', sc.text)}>{s.label}</p>
                </motion.div>
              )
            })}
          </div>

          {/* ── View mode toggle ────────────────────────────────────────── */}
          <div className="flex gap-1.5 bg-neutral-100 rounded-2xl p-1">
            {[
              { id: 'overview' as ViewMode, label: ar ? 'نظرة عامة' : 'Overview', icon: BarChart2 },
              { id: 'radar'    as ViewMode, label: ar ? 'رادار' : 'Radar',         icon: Activity  },
              { id: 'heatmap'  as ViewMode, label: ar ? 'خريطة' : 'Heatmap',      icon: Grid3X3   },
            ].map(m => {
              const Icon = m.icon
              return (
                <button
                  key={m.id}
                  onClick={() => setViewMode(m.id)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200',
                    viewMode === m.id ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {m.label}
                </button>
              )
            })}
          </div>

          {/* ── View: Overview ──────────────────────────────────────────── */}
          <AnimatePresence mode="wait">
            {viewMode === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-4"
              >
                {/* Category tabs */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {CATEGORIES.map(cat => {
                    const meta = KPI_CATEGORY_META[cat]
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border flex-shrink-0 transition-colors',
                          activeCategory === cat
                            ? 'text-white border-transparent'
                            : 'bg-white text-neutral-500 border-neutral-200'
                        )}
                        style={activeCategory === cat ? { background: meta.color, borderColor: meta.color } : {}}
                      >
                        <span>{meta.icon}</span>
                        <span className="hidden sm:block">{meta.label.split(' ')[0]}</span>
                        <span className="sm:hidden">{meta.icon}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Category label */}
                <div className="flex items-center gap-2">
                  <span className="text-base">{KPI_CATEGORY_META[activeCategory].icon}</span>
                  <div>
                    <p className="text-sm font-bold text-neutral-900">{KPI_CATEGORY_META[activeCategory].label}</p>
                    <p className="text-2xs text-neutral-400">{byCategory[activeCategory].length} indicators</p>
                  </div>
                </div>

                {/* KPI grid for active category */}
                <div className="grid grid-cols-2 gap-2.5">
                  {byCategory[activeCategory].map((kpi, i) => (
                    <KPICard key={kpi.id} kpi={kpi} index={i} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── View: Radar ───────────────────────────────────────────── */}
            {viewMode === 'radar' && (
              <motion.div
                key="radar"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-4"
              >
                <div className="bg-white rounded-2xl border border-neutral-100 p-4">
                  <p className="text-sm font-bold text-neutral-900 mb-3">{ar ? 'مخطط الرادار' : 'Competency Radar'}</p>
                  <RadarChart kpis={radarKpis} />
                  <div className="flex flex-wrap gap-2 mt-3 justify-center">
                    {CATEGORIES.map(cat => {
                      const meta = KPI_CATEGORY_META[cat]
                      return (
                        <div key={cat} className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: meta.color }} />
                          <span className="text-2xs text-neutral-500">{meta.label.split(' ')[0]}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Per-category averages */}
                <div className="bg-white rounded-2xl border border-neutral-100 p-4">
                  <p className="text-sm font-bold text-neutral-900 mb-3">{ar ? 'متوسط الفئات' : 'Category Averages'}</p>
                  <div className="flex flex-col gap-3">
                    {CATEGORIES.map(cat => {
                      const meta = KPI_CATEGORY_META[cat]
                      const group = byCategory[cat]
                      const avg = Math.round(group.reduce((s, k) => s + k.value, 0) / group.length)
                      return (
                        <div key={cat} className="flex items-center gap-3">
                          <span className="text-sm w-5 flex-shrink-0">{meta.icon}</span>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-xs font-semibold text-neutral-700">{meta.label}</span>
                              <span className="text-xs font-bold text-neutral-900">{avg}%</span>
                            </div>
                            <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ background: meta.color }}
                                initial={{ width: 0 }}
                                animate={{ width: `${avg}%` }}
                                transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── View: Heatmap ─────────────────────────────────────────── */}
            {viewMode === 'heatmap' && (
              <motion.div
                key="heatmap"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-4"
              >
                {CATEGORIES.map(cat => {
                  const meta = KPI_CATEGORY_META[cat]
                  const group = byCategory[cat]
                  return (
                    <div key={cat} className="bg-white rounded-2xl border border-neutral-100 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span>{meta.icon}</span>
                        <p className="text-xs font-bold text-neutral-700">{meta.label}</p>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {group.map((kpi, i) => <HeatmapCell key={kpi.id} kpi={kpi} index={i} />)}
                      </div>
                    </div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Strengths & Weaknesses ──────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-4">
              <p className="text-xs font-bold text-emerald-700 mb-2">💪 {ar ? 'نقاط قوتك' : 'Strengths'}</p>
              <div className="flex flex-col gap-1.5">
                {strengths.map(s => (
                  <div key={s.id} className="flex items-center justify-between">
                    <span className="text-2xs text-emerald-800 truncate pr-1">{s.label}</span>
                    <span className="text-2xs font-bold text-emerald-700 flex-shrink-0">{s.value}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-orange-50 rounded-2xl border border-orange-100 p-4">
              <p className="text-xs font-bold text-orange-700 mb-2">📈 {ar ? 'فرص التحسين' : 'Improve'}</p>
              <div className="flex flex-col gap-1.5">
                {weaknesses.map(w => (
                  <div key={w.id} className="flex items-center justify-between">
                    <span className="text-2xs text-orange-800 truncate pr-1">{w.label}</span>
                    <span className="text-2xs font-bold text-orange-700 flex-shrink-0">{w.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Skill Gap Analysis ──────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-4">
            <p className="text-sm font-bold text-neutral-900 mb-1">{ar ? 'تحليل الفجوة المهارية' : 'Skill Gap Analysis'}</p>
            <p className="text-2xs text-neutral-400 mb-3">{ar ? 'المهارات الأكثر طلباً من المجندين مقارنة بمستواك' : 'Top skills employers need vs. your current level'}</p>
            {[
              { skill: 'Critical Thinking', market: 90, yours: Math.min(95, kpis.find(k=>k.id==='critical_thinking')?.value ?? 50) },
              { skill: 'Adaptability',      market: 85, yours: Math.min(95, kpis.find(k=>k.id==='adaptability')?.value ?? 50) },
              { skill: 'Leadership',        market: 80, yours: Math.min(95, kpis.find(k=>k.id==='leadership_potential')?.value ?? 40) },
              { skill: 'Productivity',      market: 88, yours: Math.min(95, kpis.find(k=>k.id==='workflow_efficiency')?.value ?? 48) },
            ].map((item, i) => (
              <div key={item.skill} className="mb-3">
                <div className="flex justify-between text-2xs font-semibold text-neutral-600 mb-1">
                  <span>{item.skill}</span>
                  <span className={cn(item.yours >= item.market ? 'text-emerald-600' : 'text-amber-600')}>
                    {item.yours}% / {item.market}%
                  </span>
                </div>
                <div className="relative h-2 bg-neutral-100 rounded-full overflow-hidden">
                  {/* Market benchmark */}
                  <div className="absolute inset-y-0 left-0 rounded-full bg-neutral-200" style={{ width: `${item.market}%` }} />
                  {/* Your level */}
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ background: item.yours >= item.market ? '#10B981' : '#F59E0B' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.yours}%` }}
                    transition={{ delay: 0.1 * i, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* ── Points breakdown ────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-4">
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
          </div>

          {/* ── Achievements ────────────────────────────────────────────── */}
          {state.simBadges.length > 0 && (
            <div className="bg-white rounded-2xl border border-neutral-100 p-4">
              <p className="text-sm font-bold text-neutral-900 mb-3">{ar ? 'الإنجازات' : 'Achievements'}</p>
              <div className="flex flex-wrap gap-2">
                {state.simBadges.map(b => (
                  <div key={b.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100">
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
                  ? 'احصل على توصيات مخصصة بناءً على 32+ مؤشر أداء.'
                  : 'Get personalized tips based on 32+ KPI data points.'}
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
              <p className="text-xs text-neutral-500">{ar ? 'عرض ملفك من منظور صاحب العمل' : "Preview your profile from an employer's view"}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400 flex-shrink-0" />
          </button>

          <div className="h-4" />
        </div>
      </div>
    </div>
  )
}
