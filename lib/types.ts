export type Lang = 'en' | 'ar'

export type Screen =
  | 'lang' | 'welcome' | 'onboard' | 'login'
  | 'forgotPassword' | 'otpVerify' | 'resetPassword'
  | 'home' | 'detail' | 'tracker'
  | 'sim' | 'simTasks' | 'simTask' | 'simDone'
  | 'ai' | 'profile' | 'feeds' | 'map' | 'companyPortal'
  | 'leaderboard' | 'performance'
  | 'integrationPortal' | 'simulationRuntime' | 'devPortal'

export type AppStatus = 'applied' | 'reviewing' | 'interview' | 'offer' | 'rejected'

export interface LatLng { lat: number; lng: number }

export interface Company {
  id: number
  name: string
  logo: string
  industry: string
  location: string
  rating: number
  color: string
  description: string
  descriptionAr: string
  coords?: LatLng
  website?: string
  employees?: string
  founded?: string
}

export interface Job {
  id: number
  companyId: number
  title: string
  titleAr: string
  location: string
  salary: string
  postedAgo: string
  applicants: number
  skills: string[]
  industry: string
  type?: 'internship' | 'full-time' | 'part-time'
  description: string
  descriptionAr: string
  requirements: string[]
  requirementsAr: string[]
  featured: boolean
  source: 'linkedin' | 'wuzzuf' | 'company'
  deadline?: string
}

export interface Document {
  key: string
  label: string
  labelAr: string
  description: string
  descriptionAr: string
  required: boolean
  acceptedTypes: string   // HTML input accept attribute value
  mimeTypes: string[]     // MIME types for JS validation
  maxSizeMB: number
}

export interface DocumentFile {
  key: string
  name: string
  size: number
  mimeType: string
  uploadedAt: string
  status: 'uploading' | 'uploaded' | 'failed'
  storageType: 'local' | 'supabase'
  url?: string   // Supabase signed URL (1h) or Object URL (session-only)
  error?: string
}

export interface Tutorial {
  title: string
  titleAr: string
  channel: string
  duration: string
  url: string
  thumbnail: string
}

export interface SimStep {
  title: string
  titleAr: string
  type: 'text' | 'multi'
  placeholder?: string
  placeholderAr?: string
  options?: string[]
  hint: string
  hintAr: string
  tutorials?: Tutorial[]
}

export interface SimTask {
  id: string
  title: string
  titleAr: string
  scenario: string
  scenarioAr: string
  xp: number
  badge: string
  badgeAr: string
  time: string
  steps: SimStep[]
}

export interface SimTrack {
  id: string
  label: string
  labelAr: string
  color: string
  icon: string
  description: string
  descriptionAr: string
  tasks: SimTask[]
}

export interface UserProfile {
  name: string
  university: string
  major: string
  gpa: string
  email: string
  phone: string
  location: string
  graduationYear: string
  documents: Partial<Record<string, boolean>>  // true = uploaded (legacy compat)
  bio?: string
  linkedinUrl?: string
  portfolioUrl?: string
  supabaseId?: string      // Supabase auth user id
  avatarUrl?: string       // OAuth provider avatar
  githubUsername?: string  // GitHub login handle
  authProvider?: string    // 'google' | 'github' | 'email'
  onboardingCompleted?: boolean
}

export interface Application {
  id: number
  jobId: number
  title: string
  company: string
  status: AppStatus
  date: string
  logo: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  text: string
}

export interface Badge {
  id: string
  label: string
  trackId: string
}

export interface MatchScore {
  score: number
  reasons: string[]
  tips: string[]
}

// Company Portal types
export interface CompanyUser {
  id: string
  name: string
  email: string
  company: string
  role: string
  companyId?: number
}

export interface JobPosting {
  id: string
  companyName: string
  companyLogo: string
  title: string
  titleAr: string
  location: string
  salary: string
  type: 'internship' | 'full-time' | 'part-time'
  industry: string
  description: string
  requirements: string[]
  skills: string[]
  deadline: string
  postedAt: string
  applicants: number
  source: 'company'
  featured: boolean
}

export interface PortalApplicant {
  id: string
  name: string
  university: string
  major: string
  gpa: string
  jobId: string
  jobTitle: string
  appliedAt: string
  status: AppStatus
  documents: string[]
}

// ── Leaderboard & Performance ─────────────────────────────────────────────────

export type TierLevel = 'bronze' | 'silver' | 'gold' | 'platinum'
export type LeaderboardPeriod = 'weekly' | 'monthly' | 'alltime'

export interface LeaderboardEntry {
  id: string
  name: string
  initials: string
  university: string
  major: string
  track: string
  rank: number
  prevRank: number
  totalXP: number
  weeklyXP: number
  monthlyXP: number
  tier: TierLevel
  level: number
  completedSims: number
  kpiScore: number      // 0–100 composite KPI
  badges: string[]      // emoji badges
  skills: string[]
  streak: number
  isCurrentUser?: boolean
}

export type KpiStatus = 'green' | 'yellow' | 'red'
export type KpiCategory =
  | 'performance'
  | 'productivity'
  | 'leadership'
  | 'readiness'
  | 'cognitive'

export interface KpiMetric {
  id: string
  label: string
  labelAr: string
  value: number         // 0–100
  trend: number         // positive = improved, negative = declined
  color: string
  description: string
  category: KpiCategory
  status: KpiStatus
}

// Live jobs from external APIs
export interface LiveJob {
  id: string
  title: string
  company: string
  location: string
  salary?: string
  postedAt: string
  url: string
  source: 'linkedin' | 'wuzzuf' | 'indeed'
  type: string
}
