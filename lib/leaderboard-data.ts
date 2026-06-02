import type { LeaderboardEntry, TierLevel, KpiMetric, KpiCategory, KpiStatus, LeaderboardPeriod, Badge } from './types'

// ── Tier config ───────────────────────────────────────────────────────────────

export const TIER_INFO: Record<TierLevel, {
  label: string; labelAr: string; color: string; bg: string; border: string
  icon: string; minXP: number; maxXP: number; gradient: string
}> = {
  bronze:   { label: 'Bronze',   labelAr: 'برونز',   color: '#B45309', bg: '#FEF3C7', border: '#FDE68A', icon: '🥉', minXP: 0,    maxXP: 999,   gradient: 'from-amber-700 to-amber-500'   },
  silver:   { label: 'Silver',   labelAr: 'فضي',     color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB', icon: '🥈', minXP: 1000, maxXP: 2999,  gradient: 'from-slate-500 to-slate-400'   },
  gold:     { label: 'Gold',     labelAr: 'ذهبي',    color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', icon: '🥇', minXP: 3000, maxXP: 5999,  gradient: 'from-amber-500 to-yellow-400'  },
  platinum: { label: 'Platinum', labelAr: 'بلاتيني', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', icon: '💎', minXP: 6000, maxXP: 99999, gradient: 'from-violet-600 to-purple-500'  },
}

export const POINTS = {
  simBeginner:    50,
  simIntermediate: 100,
  simAdvanced:    150,
  perfectScore:   50,
  streakBonus:    20,
  kpiMultiplier:  1.5,
}

export const KPI_CATEGORY_META: Record<KpiCategory, { label: string; labelAr: string; color: string; icon: string }> = {
  performance:  { label: 'Performance Intelligence', labelAr: 'ذكاء الأداء',      color: '#0D9488', icon: '⚡' },
  productivity: { label: 'Productivity & Workstyle', labelAr: 'الإنتاجية والأسلوب', color: '#3B82F6', icon: '📈' },
  leadership:   { label: 'Leadership & Collaboration', labelAr: 'القيادة والتعاون',  color: '#8B5CF6', icon: '🤝' },
  readiness:    { label: 'Professional Readiness',   labelAr: 'الجاهزية المهنية',   color: '#F59E0B', icon: '💼' },
  cognitive:    { label: 'Cognitive & Behavioral',   labelAr: 'المعرفي والسلوكي',   color: '#EC4899', icon: '🧠' },
}

// ── Computation helpers ───────────────────────────────────────────────────────

export function getTier(xp: number): TierLevel {
  if (xp >= 6000) return 'platinum'
  if (xp >= 3000) return 'gold'
  if (xp >= 1000) return 'silver'
  return 'bronze'
}

export function getLevel(xp: number): number {
  return Math.max(1, Math.floor(xp / 250) + 1)
}

export function getXPProgress(xp: number): { current: number; total: number; pct: number; nextTier: TierLevel | null } {
  const tier = getTier(xp)
  const info = TIER_INFO[tier]
  if (tier === 'platinum') {
    const over = xp - 6000
    return { current: over, total: 2000, pct: Math.min(100, (over / 2000) * 100), nextTier: null }
  }
  const nextTier = tier === 'bronze' ? 'silver' : tier === 'silver' ? 'gold' : 'platinum'
  const range = info.maxXP + 1 - info.minXP
  const progress = xp - info.minXP
  return { current: progress, total: range, pct: Math.min(100, (progress / range) * 100), nextTier }
}

function kpiStatus(value: number): KpiStatus {
  if (value >= 70) return 'green'
  if (value >= 45) return 'yellow'
  return 'red'
}

// Deterministic 32-KPI computation across 5 categories
export function computeKPIs(simDone: string[], simXP: number, streak: number): KpiMetric[] {
  const s = simDone.length
  const seed = simXP % 100   // 0–99 deterministic variance

  // Helper: base + per-sim growth + seed-derived bonus, capped
  const v = (base: number, perSim: number, bonus: number, cap = 97) =>
    Math.min(cap, base + s * perSim + Math.floor((seed / 100) * bonus))

  const kpis: Omit<KpiMetric, 'status'>[] = [

    // ── Category 1: Performance Intelligence ─────────────────────────────
    {
      id: 'adaptability',
      category: 'performance',
      label: 'Adaptability Score',
      labelAr: 'درجة التكيف',
      value: v(48, 5, 12),
      trend: s > 1 ? +4 : 0,
      color: '#0D9488',
      description: 'How quickly you adapt to new task types',
    },
    {
      id: 'learning_curve',
      category: 'performance',
      label: 'Learning Curve Rate',
      labelAr: 'معدل منحنى التعلم',
      value: v(52, 6, 10),
      trend: s > 2 ? +6 : 0,
      color: '#14B8A6',
      description: 'Speed of skill acquisition across sims',
    },
    {
      id: 'critical_thinking',
      category: 'performance',
      label: 'Critical Thinking',
      labelAr: 'التفكير النقدي',
      value: v(50, 5, 14),
      trend: s > 0 ? +3 : -2,
      color: '#0F766E',
      description: 'Logical analysis and problem decomposition',
    },
    {
      id: 'risk_assessment',
      category: 'performance',
      label: 'Risk Assessment',
      labelAr: 'تقييم المخاطر',
      value: v(44, 4, 16),
      trend: s > 3 ? +5 : 0,
      color: '#134E4A',
      description: 'Accuracy in identifying task risks',
    },
    {
      id: 'innovation',
      category: 'performance',
      label: 'Innovation Score',
      labelAr: 'درجة الابتكار',
      value: v(38, 5, 20),
      trend: +2,
      color: '#0D9488',
      description: 'Creative approach to solving problems',
    },
    {
      id: 'attention_detail',
      category: 'performance',
      label: 'Attention to Detail',
      labelAr: 'الاهتمام بالتفاصيل',
      value: v(55, 4, 10),
      trend: s > 1 ? +3 : -1,
      color: '#0891B2',
      description: 'Precision and accuracy in task execution',
    },
    {
      id: 'task_priority',
      category: 'performance',
      label: 'Task Prioritization',
      labelAr: 'تحديد أولويات المهام',
      value: v(46, 5, 12),
      trend: s > 2 ? +4 : 0,
      color: '#0E7490',
      description: 'Efficiency in ordering work by impact',
    },
    {
      id: 'resource_mgmt',
      category: 'performance',
      label: 'Resource Management',
      labelAr: 'إدارة الموارد',
      value: v(42, 4, 14),
      trend: +1,
      color: '#06B6D4',
      description: 'Optimal use of time and tools',
    },

    // ── Category 2: Productivity & Workstyle ──────────────────────────────
    {
      id: 'focus_consistency',
      category: 'productivity',
      label: 'Focus Consistency',
      labelAr: 'اتساق التركيز',
      value: Math.min(96, 40 + streak * 3 + s * 4),
      trend: streak > 3 ? +7 : -2,
      color: '#3B82F6',
      description: 'Sustained focus across work sessions',
    },
    {
      id: 'response_stability',
      category: 'productivity',
      label: 'Response Stability',
      labelAr: 'استقرار الاستجابة',
      value: v(50, 4, 10),
      trend: +2,
      color: '#2563EB',
      description: 'Consistency of output quality over time',
    },
    {
      id: 'workflow_efficiency',
      category: 'productivity',
      label: 'Workflow Efficiency',
      labelAr: 'كفاءة سير العمل',
      value: v(46, 5, 12),
      trend: s > 1 ? +5 : -1,
      color: '#1D4ED8',
      description: 'Streamlined process and minimal rework',
    },
    {
      id: 'deadline_reliability',
      category: 'productivity',
      label: 'Deadline Reliability',
      labelAr: 'الالتزام بالمواعيد',
      value: v(60, 3, 8),
      trend: +3,
      color: '#1E40AF',
      description: 'On-time task and sim completion rate',
    },
    {
      id: 'multitasking',
      category: 'productivity',
      label: 'Multitasking Performance',
      labelAr: 'أداء تعدد المهام',
      value: v(36, 5, 18, 88),
      trend: s > 2 ? +4 : 0,
      color: '#60A5FA',
      description: 'Quality when handling multiple tasks',
    },
    {
      id: 'time_to_decision',
      category: 'productivity',
      label: 'Time-to-Decision',
      labelAr: 'وقت اتخاذ القرار',
      value: v(44, 4, 14),
      trend: s > 0 ? +3 : -2,
      color: '#93C5FD',
      description: 'Speed and quality of decision-making',
    },

    // ── Category 3: Leadership & Collaboration ────────────────────────────
    {
      id: 'leadership_potential',
      category: 'leadership',
      label: 'Leadership Potential',
      labelAr: 'إمكانية القيادة',
      value: v(40, 5, 16),
      trend: s > 2 ? +5 : 0,
      color: '#8B5CF6',
      description: 'Initiative and decision ownership',
    },
    {
      id: 'team_contribution',
      category: 'leadership',
      label: 'Team Contribution',
      labelAr: 'المساهمة في الفريق',
      value: v(38, 4, 18, 90),
      trend: 0,
      color: '#7C3AED',
      description: 'Value added in collaborative tasks',
    },
    {
      id: 'conflict_resolution',
      category: 'leadership',
      label: 'Conflict Resolution',
      labelAr: 'حل النزاعات',
      value: v(42, 3, 14),
      trend: +2,
      color: '#6D28D9',
      description: 'Handling disagreements constructively',
    },
    {
      id: 'delegation',
      category: 'leadership',
      label: 'Delegation Efficiency',
      labelAr: 'كفاءة التفويض',
      value: v(35, 4, 20, 88),
      trend: s > 3 ? +4 : -1,
      color: '#A78BFA',
      description: 'Effective task distribution skills',
    },
    {
      id: 'collab_reliability',
      category: 'leadership',
      label: 'Collaboration Reliability',
      labelAr: 'موثوقية التعاون',
      value: v(48, 4, 12),
      trend: +1,
      color: '#C4B5FD',
      description: 'Dependability in team settings',
    },

    // ── Category 4: Professional Readiness ────────────────────────────────
    {
      id: 'recruiter_readiness',
      category: 'readiness',
      label: 'Recruiter Readiness',
      labelAr: 'جاهزية للتوظيف',
      value: v(45, 6, 14),
      trend: s > 1 ? +6 : 0,
      color: '#F59E0B',
      description: 'Overall profile attractiveness to employers',
    },
    {
      id: 'industry_match',
      category: 'readiness',
      label: 'Industry Match Score',
      labelAr: 'توافق المجال',
      value: v(50, 5, 12),
      trend: +3,
      color: '#D97706',
      description: 'Alignment with chosen career track',
    },
    {
      id: 'professional_consistency',
      category: 'readiness',
      label: 'Professional Consistency',
      labelAr: 'الاتساق المهني',
      value: Math.min(96, 42 + streak * 4 + s * 3),
      trend: streak > 2 ? +5 : -1,
      color: '#B45309',
      description: 'Stable professional behavior over time',
    },
    {
      id: 'growth_momentum',
      category: 'readiness',
      label: 'Growth Momentum',
      labelAr: 'زخم النمو',
      value: v(38, 7, 16),
      trend: s > 0 ? +8 : -3,
      color: '#92400E',
      description: 'Rate of measurable skill improvement',
    },
    {
      id: 'engagement_level',
      category: 'readiness',
      label: 'Engagement Level',
      labelAr: 'مستوى الانخراط',
      value: v(52, 4, 10),
      trend: +2,
      color: '#FCD34D',
      description: 'Platform activity and participation rate',
    },
    {
      id: 'accountability',
      category: 'readiness',
      label: 'Accountability Score',
      labelAr: 'درجة المسؤولية',
      value: v(55, 4, 8),
      trend: +1,
      color: '#FDE68A',
      description: 'Ownership of results and follow-through',
    },

    // ── Category 5: Cognitive & Behavioral ───────────────────────────────
    {
      id: 'pressure_handling',
      category: 'cognitive',
      label: 'Pressure Handling',
      labelAr: 'التعامل مع الضغط',
      value: v(44, 5, 16),
      trend: s > 2 ? +5 : -2,
      color: '#EC4899',
      description: 'Quality of output under time pressure',
    },
    {
      id: 'decision_confidence',
      category: 'cognitive',
      label: 'Decision Confidence',
      labelAr: 'ثقة اتخاذ القرار',
      value: v(48, 5, 12),
      trend: s > 1 ? +4 : 0,
      color: '#DB2777',
      description: 'Conviction and consistency in choices',
    },
    {
      id: 'behavioral_stability',
      category: 'cognitive',
      label: 'Behavioral Stability',
      labelAr: 'الاستقرار السلوكي',
      value: Math.min(95, 50 + streak * 3 + s * 2),
      trend: streak > 1 ? +3 : -1,
      color: '#BE185D',
      description: 'Predictable professional conduct',
    },
    {
      id: 'persistence',
      category: 'cognitive',
      label: 'Persistence Score',
      labelAr: 'درجة المثابرة',
      value: Math.min(96, 40 + streak * 5 + s * 4),
      trend: streak > 3 ? +8 : 0,
      color: '#9D174D',
      description: 'Continued effort despite setbacks',
    },
    {
      id: 'curiosity',
      category: 'cognitive',
      label: 'Curiosity & Exploration',
      labelAr: 'الفضول والاستكشاف',
      value: v(42, 5, 20),
      trend: s > 0 ? +3 : 0,
      color: '#F472B6',
      description: 'Breadth of track and topic exploration',
    },
    {
      id: 'strategic_planning',
      category: 'cognitive',
      label: 'Strategic Planning',
      labelAr: 'التخطيط الاستراتيجي',
      value: v(40, 5, 14),
      trend: s > 2 ? +4 : -1,
      color: '#FBCFE8',
      description: 'Long-term goal setting and execution',
    },
  ]

  return kpis.map(k => ({ ...k, status: kpiStatus(k.value) }))
}

export function computeKPIScore(kpis: KpiMetric[]): number {
  if (kpis.length === 0) return 0
  return Math.round(kpis.reduce((sum, k) => sum + k.value, 0) / kpis.length)
}

export function getKpisByCategory(kpis: KpiMetric[]): Record<KpiCategory, KpiMetric[]> {
  const result: Record<KpiCategory, KpiMetric[]> = {
    performance: [], productivity: [], leadership: [], readiness: [], cognitive: [],
  }
  for (const k of kpis) result[k.category].push(k)
  return result
}

// No mock students — leaderboard is populated from real Supabase data only
export const MOCK_STUDENTS: LeaderboardEntry[] = []

export const TRACKS = ['All', 'Marketing', 'Finance', 'Engineering', 'Business']
export const UNIVERSITIES = ['All', 'GUC', 'AUC', 'BUE', 'Cairo Uni', 'Ain Shams', 'MSA', 'Helwan']

// ── Build the full sorted leaderboard including current user ──────────────────

export function buildLeaderboard(
  currentUser: { name: string; simXP: number; simDone: string[]; simBadges: Badge[] },
  period: LeaderboardPeriod
): LeaderboardEntry[] {
  const xp = currentUser.simXP
  const kpis = computeKPIs(currentUser.simDone, xp, 0)
  const kpiScore = computeKPIScore(kpis)

  const userEntry: LeaderboardEntry = {
    id: 'current_user',
    name: currentUser.name || 'You',
    initials: (currentUser.name || 'YO').substring(0, 2).toUpperCase(),
    university: '',
    major: '',
    track: 'All',
    rank: 0,
    prevRank: 0,
    totalXP: xp,
    weeklyXP: Math.floor(xp * 0.12),
    monthlyXP: Math.floor(xp * 0.3),
    tier: getTier(xp),
    level: getLevel(xp),
    completedSims: currentUser.simDone.length,
    kpiScore,
    badges: currentUser.simBadges.slice(0, 4).map(b => b.label.charAt(0)),
    skills: [],
    streak: 0,
    isCurrentUser: true,
  }

  const getXP = (e: LeaderboardEntry) =>
    period === 'weekly' ? e.weeklyXP : period === 'monthly' ? e.monthlyXP : e.totalXP

  return [...MOCK_STUDENTS, userEntry]
    .sort((a, b) => getXP(b) - getXP(a))
    .map((e, i) => ({ ...e, rank: i + 1 }))
}
