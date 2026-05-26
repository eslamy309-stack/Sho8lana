// ═══════════════════════════════════════════════════════════════════════════════
// HR & Talent Intelligence — Type System
// ═══════════════════════════════════════════════════════════════════════════════

export type HRTier = 'bronze' | 'silver' | 'gold' | 'platinum'
export type PipelineStage = 'sourced' | 'screening' | 'assessment' | 'interview' | 'offer' | 'hired' | 'rejected'
export type HiringStatus = 'active' | 'paused' | 'closed' | 'draft'
export type CandidateLevel = 'intern' | 'junior' | 'mid' | 'senior'

// ── Talent Candidate ──────────────────────────────────────────────────────────

export interface TalentCandidate {
  id: string
  name: string
  initials: string
  university: string
  major: string
  gpa: number
  location: string
  email?: string
  avatarUrl?: string

  // Composite scores
  overallScore: number        // 0–100
  recruiterReadiness: number  // 0–100
  tier: HRTier
  rank: number                // Global rank

  // KPI breakdown
  accuracy: number            // 0–100
  speed: number               // 0–100
  decision: number            // 0–100
  communication: number       // 0–100
  collaboration: number       // 0–100
  leadership: number          // 0–100
  adaptability: number        // 0–100
  problemSolving: number      // 0–100

  // Activity
  completedSimulations: number
  totalXP: number
  streak: number
  badges: string[]
  skills: string[]
  tracks: string[]            // e.g. "Finance", "Marketing"

  // Behavioral analytics
  riskProfile: 'conservative' | 'moderate' | 'aggressive'
  pressureResponse: 'improves' | 'stable' | 'degrades'
  consistencyScore: number    // 0–100
  optimalDecisionRate: number // 0–1

  // Metadata
  joinedAt: string
  lastActiveAt: string
  availableFrom?: string
}

// ── Pipeline ──────────────────────────────────────────────────────────────────

export interface PipelineCandidate {
  id: string
  candidateId: string
  candidate: TalentCandidate
  stage: PipelineStage
  campaignId?: string
  addedAt: string
  updatedAt: string
  notes?: string
  rating?: number             // 1–5
  assignedTo?: string
  nextAction?: string
  nextActionDue?: string
  tags?: string[]
}

// ── Hiring Campaign ───────────────────────────────────────────────────────────

export interface HiringCampaign {
  id: string
  title: string
  department: string
  level: CandidateLevel
  requiredSkills: string[]
  targetTrack: string
  minScore: number
  minGPA: number
  deadline: string
  status: HiringStatus
  candidateCount: number
  hiredCount: number
  description: string
  createdAt: string
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export interface HRAnalytics {
  totalCandidates: number
  activeCampaigns: number
  avgCandidateScore: number
  hiredThisMonth: number
  assessmentCompletionRate: number  // 0–1
  avgTimeToHire: number             // days
  hireRate: number                  // 0–1
  topUniversity: string

  // Weekly trend (7 days)
  weeklyNewCandidates: number[]
  weeklyLabels: string[]

  // Distributions
  tierDistribution: { tier: HRTier; count: number; pct: number }[]
  universityBreakdown: { name: string; count: number; avgScore: number }[]
  skillDemand: { skill: string; count: number }[]
  trackBreakdown: { track: string; count: number; avgScore: number }[]
}

// ── Recruiter Activity ────────────────────────────────────────────────────────

export interface RecruiterActivity {
  id: string
  type: 'viewed' | 'shortlisted' | 'invited' | 'hired' | 'rejected' | 'note'
  candidateName: string
  candidateId: string
  message: string
  timestamp: string
}
