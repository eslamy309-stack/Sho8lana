import type { LeaderboardEntry, TierLevel, KpiMetric, LeaderboardPeriod, Badge } from './types'

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

// Deterministic KPI computation from user's sim history
export function computeKPIs(simDone: string[], simXP: number, streak: number): KpiMetric[] {
  const s = simDone.length
  const seed = simXP % 100      // 0–99 deterministic variance

  const v = (base: number, perSim: number, bonus: number, cap = 97) =>
    Math.min(cap, base + s * perSim + Math.floor((seed / 100) * bonus))

  return [
    { id: 'accuracy',      label: 'Problem-Solving',    labelAr: 'دقة حل المشكلات',    value: v(50, 7, 10),      trend: s > 0 ? +5 : 0,   color: '#0D9488', description: 'Accuracy across all simulation tasks'         },
    { id: 'speed',         label: 'Completion Speed',   labelAr: 'سرعة الإنجاز',       value: v(42, 5, 12),      trend: s > 2 ? +3 : -2,  color: '#3B82F6', description: 'Task completion time vs. average'             },
    { id: 'decision',      label: 'Decision Quality',   labelAr: 'جودة القرارات',       value: v(55, 6, 8),       trend: s > 1 ? +4 : 0,   color: '#8B5CF6', description: 'Quality of decisions made under pressure'      },
    { id: 'communication', label: 'Communication',      labelAr: 'مهارة التواصل',       value: v(48, 4, 15),      trend: +2,               color: '#F59E0B', description: 'Written & verbal communication score'         },
    { id: 'consistency',   label: 'Consistency',        labelAr: 'الاتساق',             value: Math.min(96, 38 + streak * 4 + s * 3), trend: streak > 3 ? +8 : -1, color: '#10B981', description: 'Regular high-quality performance over time' },
    { id: 'productivity',  label: 'Productivity',       labelAr: 'الإنتاجية',           value: v(46, 6, 10),      trend: +1,               color: '#EC4899', description: 'Output quality per study session'             },
    { id: 'collaboration', label: 'Collaboration',      labelAr: 'العمل الجماعي',       value: v(36, 4, 18, 90),  trend: 0,                color: '#06B6D4', description: 'Team task and peer challenge score'           },
    { id: 'success_rate',  label: 'Sim Success Rate',   labelAr: 'معدل نجاح المحاكاة', value: s === 0 ? 0 : v(68, 3, 8), trend: s > 0 ? +6 : 0, color: '#0D9488', description: 'Percentage of simulations completed & passed' },
  ]
}

export function computeKPIScore(kpis: KpiMetric[]): number {
  if (kpis.length === 0) return 0
  return Math.round(kpis.reduce((sum, k) => sum + k.value, 0) / kpis.length)
}

// ── Mock leaderboard data ─────────────────────────────────────────────────────

export const MOCK_STUDENTS: LeaderboardEntry[] = [
  { id: 's1',  name: 'Sara Ahmed',     initials: 'SA', university: 'GUC',        major: 'Marketing',   track: 'Marketing',   rank: 1,  prevRank: 2,  totalXP: 8420, weeklyXP: 340, monthlyXP: 1240, tier: 'platinum', level: 34, completedSims: 18, kpiScore: 94, badges: ['🏆','🌟','⚡','🎯'], skills: ['Marketing','Analytics','Strategy'], streak: 24 },
  { id: 's2',  name: 'Omar El-Sayed',  initials: 'OE', university: 'AUC',        major: 'Finance',     track: 'Finance',     rank: 2,  prevRank: 1,  totalXP: 7890, weeklyXP: 280, monthlyXP: 1100, tier: 'platinum', level: 32, completedSims: 16, kpiScore: 91, badges: ['🥇','💡','🎯'],       skills: ['Finance','Excel','Modeling'],     streak: 18 },
  { id: 's3',  name: 'Nour Khalil',    initials: 'NK', university: 'BUE',        major: 'CS',          track: 'Engineering', rank: 3,  prevRank: 4,  totalXP: 7340, weeklyXP: 420, monthlyXP: 980,  tier: 'platinum', level: 30, completedSims: 15, kpiScore: 89, badges: ['🚀','⚡','🔥'],       skills: ['Python','Data','ML'],             streak: 31 },
  { id: 's4',  name: 'Ahmed Mostafa',  initials: 'AM', university: 'Cairo Uni',  major: 'Business',    track: 'Business',    rank: 4,  prevRank: 3,  totalXP: 6720, weeklyXP: 190, monthlyXP: 840,  tier: 'platinum', level: 27, completedSims: 14, kpiScore: 86, badges: ['🌟','💼','🤝'],       skills: ['Strategy','Leadership','Ops'],   streak: 12 },
  { id: 's5',  name: 'Hana Ibrahim',   initials: 'HI', university: 'GUC',        major: 'Marketing',   track: 'Marketing',   rank: 5,  prevRank: 7,  totalXP: 5890, weeklyXP: 310, monthlyXP: 760,  tier: 'gold',     level: 24, completedSims: 13, kpiScore: 85, badges: ['🥇','🎯','📊'],       skills: ['Social Media','Branding'],        streak: 9  },
  { id: 's6',  name: 'Karim Farouk',   initials: 'KF', university: 'Ain Shams',  major: 'Engineering', track: 'Engineering', rank: 6,  prevRank: 5,  totalXP: 5410, weeklyXP: 160, monthlyXP: 680,  tier: 'gold',     level: 22, completedSims: 12, kpiScore: 83, badges: ['⚙️','🔬','💡'],       skills: ['Ops','Lean','Six Sigma'],         streak: 7  },
  { id: 's7',  name: 'Dina Youssef',   initials: 'DY', university: 'AUC',        major: 'Economics',   track: 'Finance',     rank: 7,  prevRank: 6,  totalXP: 4980, weeklyXP: 220, monthlyXP: 590,  tier: 'gold',     level: 20, completedSims: 11, kpiScore: 81, badges: ['📈','💼','🌟'],       skills: ['Economics','Research','Excel'],   streak: 5  },
  { id: 's8',  name: 'Youssef Nasser', initials: 'YN', university: 'MSA',        major: 'Business',    track: 'Business',    rank: 8,  prevRank: 10, totalXP: 4500, weeklyXP: 290, monthlyXP: 510,  tier: 'gold',     level: 19, completedSims: 10, kpiScore: 79, badges: ['🚀','💡'],             skills: ['Business Dev','Sales'],           streak: 14 },
  { id: 's9',  name: 'Mai Hassan',     initials: 'MH', university: 'BUE',        major: 'Marketing',   track: 'Marketing',   rank: 9,  prevRank: 9,  totalXP: 4120, weeklyXP: 170, monthlyXP: 450,  tier: 'gold',     level: 17, completedSims: 10, kpiScore: 77, badges: ['🎯','📊'],             skills: ['Digital Marketing','SEO'],        streak: 6  },
  { id: 's10', name: 'Amr Elgamal',    initials: 'AE', university: 'Cairo Uni',  major: 'Accounting',  track: 'Finance',     rank: 10, prevRank: 12, totalXP: 3780, weeklyXP: 140, monthlyXP: 390,  tier: 'gold',     level: 16, completedSims: 9,  kpiScore: 75, badges: ['📉','💰'],             skills: ['Accounting','Audit'],             streak: 3  },
  { id: 's11', name: 'Rania Sobhy',    initials: 'RS', university: 'GUC',        major: 'CS',          track: 'Engineering', rank: 11, prevRank: 8,  totalXP: 3440, weeklyXP: 90,  monthlyXP: 340,  tier: 'gold',     level: 14, completedSims: 9,  kpiScore: 73, badges: ['💻','🔧'],             skills: ['React','Node.js'],                streak: 2  },
  { id: 's12', name: 'Tarek Mansour',  initials: 'TM', university: 'Ain Shams',  major: 'Management',  track: 'Business',    rank: 12, prevRank: 11, totalXP: 2940, weeklyXP: 120, monthlyXP: 290,  tier: 'silver',   level: 12, completedSims: 8,  kpiScore: 71, badges: ['🤝','📋'],             skills: ['HR','Management'],                streak: 4  },
  { id: 's13', name: 'Layla Amin',     initials: 'LA', university: 'MSA',        major: 'Marketing',   track: 'Marketing',   rank: 13, prevRank: 14, totalXP: 2580, weeklyXP: 180, monthlyXP: 260,  tier: 'silver',   level: 11, completedSims: 7,  kpiScore: 69, badges: ['🎨','📱'],             skills: ['UX','Creative Dir'],              streak: 8  },
  { id: 's14', name: 'Sherif Medhat',  initials: 'SM', university: 'Cairo Uni',  major: 'Finance',     track: 'Finance',     rank: 14, prevRank: 13, totalXP: 2200, weeklyXP: 80,  monthlyXP: 210,  tier: 'silver',   level: 9,  completedSims: 7,  kpiScore: 67, badges: ['💹'],                  skills: ['Investment','Risk'],              streak: 1  },
  { id: 's15', name: 'Nadia El-Komy',  initials: 'NE', university: 'AUC',        major: 'HR',          track: 'Business',    rank: 15, prevRank: 16, totalXP: 1920, weeklyXP: 110, monthlyXP: 190,  tier: 'silver',   level: 8,  completedSims: 6,  kpiScore: 65, badges: ['🤝','🌱'],             skills: ['HR','Talent Acq'],                streak: 5  },
  { id: 's16', name: 'Maged Samir',    initials: 'MS', university: 'BUE',        major: 'Engineering', track: 'Engineering', rank: 16, prevRank: 15, totalXP: 1650, weeklyXP: 70,  monthlyXP: 160,  tier: 'silver',   level: 7,  completedSims: 5,  kpiScore: 62, badges: ['⚙️'],                  skills: ['AutoCAD','Project Mgmt'],         streak: 0  },
  { id: 's17', name: 'Aya Fouad',      initials: 'AF', university: 'GUC',        major: 'Architecture',track: 'Engineering', rank: 17, prevRank: 18, totalXP: 1380, weeklyXP: 130, monthlyXP: 140,  tier: 'silver',   level: 6,  completedSims: 5,  kpiScore: 60, badges: ['🏛️'],                  skills: ['Design','Revit'],                 streak: 3  },
  { id: 's18', name: 'Khaled Tawfik',  initials: 'KT', university: 'Helwan',     major: 'Commerce',    track: 'Business',    rank: 18, prevRank: 17, totalXP: 950,  weeklyXP: 60,  monthlyXP: 95,   tier: 'bronze',   level: 4,  completedSims: 4,  kpiScore: 58, badges: ['📦'],                  skills: ['Supply Chain'],                   streak: 2  },
  { id: 's19', name: 'Reem Saber',     initials: 'RS', university: 'Cairo Uni',  major: 'Journalism',  track: 'Marketing',   rank: 19, prevRank: 20, totalXP: 740,  weeklyXP: 95,  monthlyXP: 80,   tier: 'bronze',   level: 3,  completedSims: 3,  kpiScore: 55, badges: ['✍️'],                  skills: ['Content','Writing'],              streak: 4  },
  { id: 's20', name: 'Hazem El-Din',   initials: 'HE', university: 'Ain Shams',  major: 'Law',         track: 'Business',    rank: 20, prevRank: 19, totalXP: 520,  weeklyXP: 40,  monthlyXP: 55,   tier: 'bronze',   level: 2,  completedSims: 2,  kpiScore: 51, badges: [],                      skills: ['Legal','Compliance'],             streak: 0  },
]

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
