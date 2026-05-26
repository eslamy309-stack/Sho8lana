import type {
  TalentCandidate, PipelineCandidate, HiringCampaign,
  HRAnalytics, RecruiterActivity,
} from './hr-types'

// ── Talent Pool ───────────────────────────────────────────────────────────────

export const TALENT_POOL: TalentCandidate[] = [
  {
    id: 'c1', name: 'Ahmed Mostafa', initials: 'AM',
    university: 'AUC', major: 'Business Administration', gpa: 3.9, location: 'Cairo',
    overallScore: 94, recruiterReadiness: 91, tier: 'platinum', rank: 1,
    accuracy: 96, speed: 89, decision: 95, communication: 92,
    collaboration: 88, leadership: 94, adaptability: 90, problemSolving: 97,
    completedSimulations: 18, totalXP: 4200, streak: 24,
    badges: ['🏆', '⚡', '🎯', '🔥'],
    skills: ['Financial Modeling', 'Strategy', 'Excel', 'Tableau', 'Python'],
    tracks: ['Finance', 'Business'],
    riskProfile: 'moderate', pressureResponse: 'improves', consistencyScore: 92, optimalDecisionRate: 0.89,
    joinedAt: '2025-09-01', lastActiveAt: '2026-05-25', availableFrom: 'June 2026',
  },
  {
    id: 'c2', name: 'Sara Khalil', initials: 'SK',
    university: 'GUC', major: 'Marketing', gpa: 3.8, location: 'Cairo',
    overallScore: 91, recruiterReadiness: 94, tier: 'platinum', rank: 2,
    accuracy: 88, speed: 93, decision: 90, communication: 97,
    collaboration: 95, leadership: 89, adaptability: 93, problemSolving: 86,
    completedSimulations: 15, totalXP: 3800, streak: 18,
    badges: ['🌟', '💬', '🤝', '🚀'],
    skills: ['Brand Strategy', 'Social Media', 'Analytics', 'Copywriting', 'SEO'],
    tracks: ['Marketing', 'Leadership'],
    riskProfile: 'aggressive', pressureResponse: 'improves', consistencyScore: 88, optimalDecisionRate: 0.84,
    joinedAt: '2025-10-05', lastActiveAt: '2026-05-24', availableFrom: 'July 2026',
  },
  {
    id: 'c3', name: 'Omar Hassan', initials: 'OH',
    university: 'Cairo University', major: 'Computer Engineering', gpa: 3.7, location: 'Giza',
    overallScore: 89, recruiterReadiness: 86, tier: 'gold', rank: 3,
    accuracy: 92, speed: 87, decision: 88, communication: 78,
    collaboration: 82, leadership: 80, adaptability: 91, problemSolving: 94,
    completedSimulations: 22, totalXP: 4600, streak: 30,
    badges: ['💻', '⚡', '🎯', '🏅'],
    skills: ['Python', 'SQL', 'Data Analysis', 'Machine Learning', 'PowerBI'],
    tracks: ['Engineering', 'Finance'],
    riskProfile: 'conservative', pressureResponse: 'stable', consistencyScore: 95, optimalDecisionRate: 0.91,
    joinedAt: '2025-08-15', lastActiveAt: '2026-05-26',
  },
  {
    id: 'c4', name: 'Nour Ibrahim', initials: 'NI',
    university: 'Ain Shams', major: 'Human Resources', gpa: 3.6, location: 'Cairo',
    overallScore: 86, recruiterReadiness: 89, tier: 'gold', rank: 4,
    accuracy: 84, speed: 88, decision: 87, communication: 94,
    collaboration: 97, leadership: 88, adaptability: 85, problemSolving: 82,
    completedSimulations: 12, totalXP: 2900, streak: 14,
    badges: ['🤝', '💬', '🌟'],
    skills: ['Talent Acquisition', 'HRIS', 'Interviewing', 'Onboarding', 'Labor Law'],
    tracks: ['Leadership', 'Business'],
    riskProfile: 'moderate', pressureResponse: 'stable', consistencyScore: 87, optimalDecisionRate: 0.82,
    joinedAt: '2025-11-01', lastActiveAt: '2026-05-23', availableFrom: 'August 2026',
  },
  {
    id: 'c5', name: 'Karim Fahmy', initials: 'KF',
    university: 'AUC', major: 'Finance', gpa: 3.85, location: 'Cairo',
    overallScore: 88, recruiterReadiness: 85, tier: 'gold', rank: 5,
    accuracy: 91, speed: 83, decision: 92, communication: 80,
    collaboration: 79, leadership: 84, adaptability: 87, problemSolving: 90,
    completedSimulations: 16, totalXP: 3500, streak: 21,
    badges: ['📊', '💹', '🎯'],
    skills: ['Financial Analysis', 'Valuation', 'Bloomberg', 'Excel', 'Risk Management'],
    tracks: ['Finance'],
    riskProfile: 'conservative', pressureResponse: 'improves', consistencyScore: 90, optimalDecisionRate: 0.87,
    joinedAt: '2025-09-20', lastActiveAt: '2026-05-22',
  },
  {
    id: 'c6', name: 'Mariam Saad', initials: 'MS',
    university: 'BUE', major: 'Marketing', gpa: 3.5, location: 'Alexandria',
    overallScore: 82, recruiterReadiness: 84, tier: 'gold', rank: 6,
    accuracy: 80, speed: 86, decision: 83, communication: 91,
    collaboration: 88, leadership: 79, adaptability: 84, problemSolving: 78,
    completedSimulations: 10, totalXP: 2400, streak: 9,
    badges: ['🎨', '📱', '🌟'],
    skills: ['Content Creation', 'Instagram Ads', 'Canva', 'Email Marketing'],
    tracks: ['Marketing'],
    riskProfile: 'moderate', pressureResponse: 'stable', consistencyScore: 83, optimalDecisionRate: 0.79,
    joinedAt: '2025-12-01', lastActiveAt: '2026-05-20',
  },
  {
    id: 'c7', name: 'Youssef Ali', initials: 'YA',
    university: 'AAST', major: 'Operations Management', gpa: 3.4, location: 'Cairo',
    overallScore: 79, recruiterReadiness: 77, tier: 'silver', rank: 7,
    accuracy: 78, speed: 82, decision: 80, communication: 75,
    collaboration: 80, leadership: 74, adaptability: 79, problemSolving: 81,
    completedSimulations: 9, totalXP: 1900, streak: 6,
    badges: ['⚙️', '📦'],
    skills: ['Supply Chain', 'Logistics', 'SAP', 'Project Management'],
    tracks: ['Business'],
    riskProfile: 'conservative', pressureResponse: 'stable', consistencyScore: 80, optimalDecisionRate: 0.76,
    joinedAt: '2026-01-10', lastActiveAt: '2026-05-18',
  },
  {
    id: 'c8', name: 'Laila Mansour', initials: 'LM',
    university: 'Helwan', major: 'Accounting', gpa: 3.3, location: 'Cairo',
    overallScore: 74, recruiterReadiness: 72, tier: 'silver', rank: 12,
    accuracy: 82, speed: 70, decision: 75, communication: 72,
    collaboration: 71, leadership: 68, adaptability: 73, problemSolving: 76,
    completedSimulations: 7, totalXP: 1500, streak: 4,
    badges: ['📋', '💼'],
    skills: ['Accounting', 'Auditing', 'QuickBooks', 'Tax'],
    tracks: ['Finance'],
    riskProfile: 'conservative', pressureResponse: 'degrades', consistencyScore: 77, optimalDecisionRate: 0.72,
    joinedAt: '2026-02-05', lastActiveAt: '2026-05-15',
  },
]

// ── Pipeline ──────────────────────────────────────────────────────────────────

export const PIPELINE: PipelineCandidate[] = [
  {
    id: 'p1', candidateId: 'c1', candidate: TALENT_POOL[0],
    stage: 'interview', campaignId: 'camp1',
    addedAt: '2026-05-10', updatedAt: '2026-05-20',
    notes: 'Exceptional simulation performance. Strong fit for Finance Analyst role.',
    rating: 5, assignedTo: 'Hana Youssef',
    nextAction: 'Final round interview', nextActionDue: '2026-05-28',
    tags: ['Top Candidate', 'Fast Track'],
  },
  {
    id: 'p2', candidateId: 'c2', candidate: TALENT_POOL[1],
    stage: 'offer', campaignId: 'camp2',
    addedAt: '2026-05-05', updatedAt: '2026-05-22',
    notes: 'Marketing simulation score 91/100. Outstanding communication skills.',
    rating: 5, assignedTo: 'Mohamed Tarek',
    nextAction: 'Send offer letter', nextActionDue: '2026-05-27',
    tags: ['Offer Ready'],
  },
  {
    id: 'p3', candidateId: 'c3', candidate: TALENT_POOL[2],
    stage: 'assessment', campaignId: 'camp1',
    addedAt: '2026-05-12', updatedAt: '2026-05-21',
    rating: 4, assignedTo: 'Hana Youssef',
    nextAction: 'Review assessment results',
    tags: ['Technical'],
  },
  {
    id: 'p4', candidateId: 'c4', candidate: TALENT_POOL[3],
    stage: 'screening', campaignId: 'camp3',
    addedAt: '2026-05-18', updatedAt: '2026-05-18',
    rating: 4, assignedTo: 'Dina Hassan',
    nextAction: 'Schedule screening call', nextActionDue: '2026-05-28',
  },
  {
    id: 'p5', candidateId: 'c5', candidate: TALENT_POOL[4],
    stage: 'interview', campaignId: 'camp1',
    addedAt: '2026-05-08', updatedAt: '2026-05-19',
    notes: 'Strong analytical thinking. Verify Excel proficiency.',
    rating: 4, assignedTo: 'Hana Youssef',
    nextAction: 'Technical interview', nextActionDue: '2026-05-29',
  },
  {
    id: 'p6', candidateId: 'c6', candidate: TALENT_POOL[5],
    stage: 'sourced', campaignId: 'camp2',
    addedAt: '2026-05-24', updatedAt: '2026-05-24',
    assignedTo: 'Mohamed Tarek',
  },
  {
    id: 'p7', candidateId: 'c7', candidate: TALENT_POOL[6],
    stage: 'screening',
    addedAt: '2026-05-20', updatedAt: '2026-05-20',
    rating: 3, assignedTo: 'Dina Hassan',
  },
  {
    id: 'p8', candidateId: 'c8', candidate: TALENT_POOL[7],
    stage: 'sourced',
    addedAt: '2026-05-25', updatedAt: '2026-05-25',
    assignedTo: 'Mohamed Tarek',
  },
]

// ── Hiring Campaigns ──────────────────────────────────────────────────────────

export const CAMPAIGNS: HiringCampaign[] = [
  {
    id: 'camp1',
    title: 'Finance Analyst — Summer 2026',
    department: 'Finance',
    level: 'intern',
    requiredSkills: ['Financial Modeling', 'Excel', 'Tableau'],
    targetTrack: 'Finance',
    minScore: 80,
    minGPA: 3.3,
    deadline: '2026-06-30',
    status: 'active',
    candidateCount: 34,
    hiredCount: 0,
    description: 'Looking for high-performing finance interns for our Cairo HQ.',
    createdAt: '2026-04-15',
  },
  {
    id: 'camp2',
    title: 'Marketing Associate — Q3 Intake',
    department: 'Marketing',
    level: 'junior',
    requiredSkills: ['Brand Strategy', 'Social Media', 'Analytics'],
    targetTrack: 'Marketing',
    minScore: 75,
    minGPA: 3.0,
    deadline: '2026-07-15',
    status: 'active',
    candidateCount: 28,
    hiredCount: 1,
    description: 'Building our digital marketing team for Q3 product launches.',
    createdAt: '2026-04-20',
  },
  {
    id: 'camp3',
    title: 'HR Generalist — Talent Team',
    department: 'Human Resources',
    level: 'junior',
    requiredSkills: ['Talent Acquisition', 'HRIS', 'Interviewing'],
    targetTrack: 'Leadership',
    minScore: 78,
    minGPA: 3.2,
    deadline: '2026-06-15',
    status: 'active',
    candidateCount: 19,
    hiredCount: 0,
    description: 'Expanding our internal talent team to support company growth.',
    createdAt: '2026-05-01',
  },
  {
    id: 'camp4',
    title: 'Operations Manager Trainee',
    department: 'Operations',
    level: 'intern',
    requiredSkills: ['Supply Chain', 'Project Management', 'SAP'],
    targetTrack: 'Business',
    minScore: 72,
    minGPA: 3.0,
    deadline: '2026-05-31',
    status: 'paused',
    candidateCount: 12,
    hiredCount: 0,
    description: 'Operations trainee program for high-potential graduates.',
    createdAt: '2026-03-10',
  },
]

// ── Analytics ─────────────────────────────────────────────────────────────────

export const HR_ANALYTICS: HRAnalytics = {
  totalCandidates: 1247,
  activeCampaigns: 3,
  avgCandidateScore: 78.4,
  hiredThisMonth: 12,
  assessmentCompletionRate: 0.84,
  avgTimeToHire: 18,
  hireRate: 0.31,
  topUniversity: 'AUC',

  weeklyNewCandidates: [38, 52, 47, 61, 55, 70, 65],
  weeklyLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],

  tierDistribution: [
    { tier: 'platinum', count: 48,  pct: 0.04 },
    { tier: 'gold',     count: 287, pct: 0.23 },
    { tier: 'silver',   count: 561, pct: 0.45 },
    { tier: 'bronze',   count: 351, pct: 0.28 },
  ],

  universityBreakdown: [
    { name: 'AUC',            count: 218, avgScore: 84 },
    { name: 'GUC',            count: 195, avgScore: 81 },
    { name: 'Cairo Univ.',    count: 312, avgScore: 77 },
    { name: 'Ain Shams',      count: 187, avgScore: 75 },
    { name: 'BUE',            count: 142, avgScore: 79 },
    { name: 'AAST',           count: 98,  avgScore: 73 },
    { name: 'Helwan',         count: 95,  avgScore: 71 },
  ],

  skillDemand: [
    { skill: 'Financial Modeling', count: 342 },
    { skill: 'Python',             count: 298 },
    { skill: 'Excel',              count: 487 },
    { skill: 'SQL',                count: 261 },
    { skill: 'Brand Strategy',     count: 194 },
    { skill: 'Data Analysis',      count: 276 },
    { skill: 'PowerBI',            count: 183 },
  ],

  trackBreakdown: [
    { track: 'Finance',     count: 387, avgScore: 80 },
    { track: 'Marketing',   count: 298, avgScore: 78 },
    { track: 'Business',    count: 245, avgScore: 76 },
    { track: 'Engineering', count: 201, avgScore: 82 },
    { track: 'Leadership',  count: 116, avgScore: 79 },
  ],
}

// ── Activity Feed ─────────────────────────────────────────────────────────────

export const RECRUITER_ACTIVITY: RecruiterActivity[] = [
  { id: 'a1', type: 'invited',     candidateName: 'Ahmed Mostafa', candidateId: 'c1', message: 'Invited to final round interview',             timestamp: '2026-05-25T14:30:00Z' },
  { id: 'a2', type: 'shortlisted', candidateName: 'Sara Khalil',   candidateId: 'c2', message: 'Moved to offer stage',                         timestamp: '2026-05-25T11:15:00Z' },
  { id: 'a3', type: 'viewed',      candidateName: 'Omar Hassan',   candidateId: 'c3', message: 'Profile viewed — strong technical scores',     timestamp: '2026-05-25T09:45:00Z' },
  { id: 'a4', type: 'note',        candidateName: 'Karim Fahmy',   candidateId: 'c5', message: 'Note added: excellent financial modeling task', timestamp: '2026-05-24T16:20:00Z' },
  { id: 'a5', type: 'hired',       candidateName: 'Layla Omar',    candidateId: 'c9', message: 'Hired for Marketing Associate role',            timestamp: '2026-05-24T12:00:00Z' },
  { id: 'a6', type: 'rejected',    candidateName: 'Tamer Said',    candidateId: 'c10', message: 'Did not meet minimum score threshold',        timestamp: '2026-05-23T10:30:00Z' },
]

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
