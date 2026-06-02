import type {
  TalentCandidate, PipelineCandidate, HiringCampaign,
  HRAnalytics, RecruiterActivity,
} from './hr-types'

// ── Talent Pool ───────────────────────────────────────────────────────────────

export const TALENT_POOL: TalentCandidate[] = []

// ── Pipeline ──────────────────────────────────────────────────────────────────

export const PIPELINE: PipelineCandidate[] = []

// ── Hiring Campaigns ──────────────────────────────────────────────────────────

export const CAMPAIGNS: HiringCampaign[] = []

// ── Analytics ─────────────────────────────────────────────────────────────────

export const HR_ANALYTICS: HRAnalytics = {
  totalCandidates: 0,
  activeCampaigns: 0,
  avgCandidateScore: 0,
  hiredThisMonth: 0,
  assessmentCompletionRate: 0,
  avgTimeToHire: 0,
  hireRate: 0,
  topUniversity: '',

  weeklyNewCandidates: [0, 0, 0, 0, 0, 0, 0],
  weeklyLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],

  tierDistribution: [],
  universityBreakdown: [],
  skillDemand: [],
  trackBreakdown: [],
}

// ── Activity Feed ─────────────────────────────────────────────────────────────

export const RECRUITER_ACTIVITY: RecruiterActivity[] = []

// ── Helpers ───────────────────────────────────────────────────────────────────

export const TIER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  platinum: { bg: '#E8F4FD', text: '#1E6091', border: '#AED6F1' },
  gold:     { bg: '#FEF9E7', text: '#9A7D0A', border: '#F9E79F' },
  silver:   { bg: '#F4F6F7', text: '#5D6D7E', border: '#D5DBDB' },
  bronze:   { bg: '#FDF2E9', text: '#A04000', border: '#F0B27A' },
}

export const TIER_LABELS: Record<string, string> = {
  platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze',
}

export const STAGE_LABELS: Record<string, string> = {
  sourced:    'Sourced',
  screening:  'Screening',
  assessment: 'Assessment',
  interview:  'Interview',
  offer:      'Offer',
  hired:      'Hired',
  rejected:   'Rejected',
}

export const STAGE_COLORS: Record<string, string> = {
  sourced:    '#94A3B8',
  screening:  '#60A5FA',
  assessment: '#A78BFA',
  interview:  '#F59E0B',
  offer:      '#34D399',
  hired:      '#10B981',
  rejected:   '#F87171',
}
