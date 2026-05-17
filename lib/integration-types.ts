// ═══════════════════════════════════════════════════════════════════════════════
// Simulation Integration Infrastructure — Type System
// ═══════════════════════════════════════════════════════════════════════════════

// ── Company / Tenant ──────────────────────────────────────────────────────────

export type IntegrationTier = 'standard' | 'professional' | 'enterprise'
export type IntegrationStatus = 'active' | 'suspended' | 'pending' | 'revoked'

export interface CompanyIntegration {
  id: string
  companyId: string            // Unique slug, e.g. "vodafone-egypt"
  companyName: string
  contactEmail: string
  logoUrl?: string
  baseUrl?: string             // Their simulation server base URL
  status: IntegrationStatus
  tier: IntegrationTier
  rateLimitPerMin: number
  ipWhitelist: string[]        // Empty = allow all
  allowedOrigins: string[]     // CORS origins
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface CompanyIntegrationCreate {
  companyId: string
  companyName: string
  contactEmail: string
  logoUrl?: string
  baseUrl?: string
  tier?: IntegrationTier
  rateLimitPerMin?: number
  ipWhitelist?: string[]
  allowedOrigins?: string[]
}

// ── API Keys ──────────────────────────────────────────────────────────────────

export type ApiKeyPermission =
  | 'simulations:read'
  | 'simulations:write'
  | 'simulations:execute'
  | 'webhooks:read'
  | 'webhooks:write'
  | 'analytics:read'
  | 'keys:read'
  | 'keys:write'
  | 'admin'

export type ApiKeyEnvironment = 'live' | 'test'

export interface ApiKey {
  id: string
  keyPrefix: string            // First 12 chars for display: "sk_live_xyzA"
  companyId: string
  name: string
  environment: ApiKeyEnvironment
  permissions: ApiKeyPermission[]
  isActive: boolean
  lastUsedAt?: string
  expiresAt?: string
  createdAt: string
}

/** Full key only returned once on creation */
export interface ApiKeyCreated extends ApiKey {
  rawKey: string
}

// ── Simulation Endpoints ──────────────────────────────────────────────────────

export type SimulationAuthType = 'api_key' | 'oauth2' | 'jwt' | 'hmac' | 'none'
export type SimulationDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert'
export type SimulationCategory = 'finance' | 'marketing' | 'engineering' | 'business' | 'leadership' | 'custom'
export type SimulationDelivery = 'api' | 'iframe' | 'sdk' | 'webhook_only'

export interface SimulationEndpoint {
  id: string
  simulationId: string         // Company-scoped slug: "budget-variance-v2"
  companyId: string
  name: string
  nameAr?: string
  description: string
  descriptionAr?: string
  endpointUrl: string          // URL we call to start/submit a session
  delivery: SimulationDelivery
  method: 'GET' | 'POST' | 'PUT'
  authType: SimulationAuthType
  authConfig: Record<string, unknown>  // api_key field name, header, etc.
  category: SimulationCategory
  difficulty: SimulationDifficulty
  estimatedDurationMins: number
  xpReward: number
  contractVersion: string      // e.g. "1.0", "2.0"
  tags: string[]
  isActive: boolean
  isSandbox: boolean
  thumbnailUrl?: string
  metadata: Record<string, unknown>
  createdAt: string
}

export interface SimulationEndpointCreate {
  simulationId: string
  name: string
  nameAr?: string
  description: string
  descriptionAr?: string
  endpointUrl: string
  delivery?: SimulationDelivery
  method?: 'GET' | 'POST' | 'PUT'
  authType?: SimulationAuthType
  authConfig?: Record<string, unknown>
  category: SimulationCategory
  difficulty: SimulationDifficulty
  estimatedDurationMins: number
  xpReward?: number
  tags?: string[]
}

// ── Webhook Configuration ─────────────────────────────────────────────────────

export type WebhookEvent =
  | 'session.started'
  | 'session.completed'
  | 'session.failed'
  | 'session.abandoned'
  | 'score.updated'
  | 'api_key.created'
  | 'api_key.revoked'
  | 'integration.suspended'

export interface WebhookConfig {
  id: string
  companyId: string
  targetUrl: string            // Where WE send events TO the company
  events: WebhookEvent[]
  secretPrefix: string         // First 8 chars of secret (for display)
  isActive: boolean
  retryCount: number
  timeoutMs: number
  createdAt: string
}

export interface WebhookConfigCreate {
  targetUrl: string
  events: WebhookEvent[]
  retryCount?: number
  timeoutMs?: number
}

export interface WebhookDelivery {
  id: string
  webhookId: string
  event: WebhookEvent
  payload: Record<string, unknown>
  statusCode?: number
  responseBody?: string
  attemptCount: number
  succeededAt?: string
  failedAt?: string
  nextRetryAt?: string
}

// ── Simulation Session ────────────────────────────────────────────────────────

export type SessionStatus =
  | 'initiated'
  | 'running'
  | 'completed'
  | 'failed'
  | 'abandoned'
  | 'timeout'

export interface SimulationSession {
  id: string
  sessionId: string            // Public ID shared with company server
  userId: string               // Supabase auth user ID
  simulationId: string
  companyId: string
  status: SessionStatus
  startedAt: string
  completedAt?: string
  durationSeconds?: number
  externalSessionToken?: string   // Token returned by company's server
  finalScore?: number
  xpAwarded?: number
  rawResult?: SimulationResult
  createdAt: string
}

// ── Universal Simulation Contract ─────────────────────────────────────────────

export interface ContractScore {
  accuracy: number             // 0–100
  speed: number                // 0–100 (relative to benchmark)
  decision: number             // 0–100
  communication?: number       // 0–100
  collaboration?: number       // 0–100
  overall: number              // 0–100 weighted
}

export interface ContractKpiMetric {
  id: string
  label: string
  value: number                // 0–100
  weight: number               // 0–1, weights sum to 1
  category: string
  benchmark?: number           // Industry average for comparison
}

export interface ContractDecisionEntry {
  timestamp: number            // ms since session start
  questionId: string
  questionText: string
  choiceId: string
  choiceText: string
  isOptimal: boolean
  timeSpentMs: number
  confidence?: number          // If the sim captures it
}

export interface ContractBehavioralAnalytics {
  totalDecisions: number
  optimalDecisions: number
  optimalRate: number          // 0–1
  averageDecisionTimeMs: number
  riskProfile: 'conservative' | 'moderate' | 'aggressive'
  consistencyScore: number     // 0–100
  pressureResponse: 'improves' | 'stable' | 'degrades'
  peakPerformanceMinute: number
  focusDropoffMinute?: number
}

export interface ContractEventEntry {
  timestamp: number
  type: 'session_start' | 'phase_start' | 'phase_end' | 'decision' | 'hint_used' | 'score_update' | 'session_end' | string
  data: Record<string, unknown>
}

/** The universal simulation result contract — all companies must conform to this */
export interface SimulationResult {
  contractVersion: '1.0' | '1.1' | '2.0'
  userId: string
  simulationId: string
  companyId: string
  sessionId: string
  completionStatus: 'completed' | 'failed' | 'abandoned' | 'partial'
  startedAt: string            // ISO 8601
  completedAt: string          // ISO 8601
  durationSeconds: number
  scores: ContractScore
  kpiMetrics: ContractKpiMetric[]
  decisionLog: ContractDecisionEntry[]
  behavioralAnalytics: ContractBehavioralAnalytics
  eventTimeline: ContractEventEntry[]
  finalScore: number           // 0–100
  xpEarned?: number
  certificateEligible?: boolean
  metadata: Record<string, unknown>
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export interface CompanyAnalyticsSummary {
  companyId: string
  companyName: string
  period: 'day' | 'week' | 'month' | 'alltime'
  totalSessions: number
  completedSessions: number
  completionRate: number       // 0–1
  avgFinalScore: number        // 0–100
  avgDurationSeconds: number
  totalParticipants: number
  activeSimulations: number
  topSimulation: string
  apiCallCount: number
  errorRate: number            // 0–1
  lastActivityAt?: string
}

export interface PlatformAnalyticsSummary {
  period: 'day' | 'week' | 'month' | 'alltime'
  totalCompanies: number
  activeCompanies: number
  totalSimulations: number
  totalSessions: number
  completionRate: number
  avgScore: number
  totalXpAwarded: number
  totalParticipants: number
  apiCallsTotal: number
  topCategories: { category: string; count: number }[]
  companyBreakdown: CompanyAnalyticsSummary[]
}

// ── Gateway Layer ─────────────────────────────────────────────────────────────

export interface GatewayRequest {
  companyId: string
  simulationId: string
  apiKeyPrefix: string
  method: string
  path: string
  headers: Record<string, string>
  body?: unknown
  ipAddress: string
  userAgent: string
  requestedAt: string
}

export interface GatewayResponse {
  statusCode: number
  body: unknown
  durationMs: number
  cached: boolean
  companyId: string
}

export type RateLimitResult = { allowed: true; remaining: number } | { allowed: false; retryAfterMs: number }

// ── Integration Events (Audit Log) ────────────────────────────────────────────

export type IntegrationEventType =
  | 'api.request'
  | 'api.error'
  | 'webhook.received'
  | 'webhook.sent'
  | 'webhook.failed'
  | 'session.initiated'
  | 'session.completed'
  | 'session.failed'
  | 'contract.validated'
  | 'contract.invalid'
  | 'key.created'
  | 'key.revoked'
  | 'key.auth_failed'
  | 'rate_limit.hit'
  | 'ip.blocked'
  | 'tenant.isolated'

export type IntegrationEventSeverity = 'info' | 'warning' | 'error' | 'critical'

export interface IntegrationEvent {
  id: string
  companyId?: string
  eventType: IntegrationEventType
  severity: IntegrationEventSeverity
  requestPath?: string
  statusCode?: number
  durationMs?: number
  ipAddress?: string
  userAgent?: string
  errorMessage?: string
  metadata: Record<string, unknown>
  createdAt: string
}

// ── Developer Portal ──────────────────────────────────────────────────────────

export interface SdkLanguage {
  id: string
  name: string
  icon: string
  installCmd: string
  importSnippet: string
  usageSnippet: string
}

export interface ApiEndpointDoc {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  path: string
  summary: string
  description: string
  requiresAuth: boolean
  permissions: ApiKeyPermission[]
  requestBody?: Record<string, unknown>
  responseExample: Record<string, unknown>
  errorCodes: { code: number; message: string }[]
}

// ── Real-time SSE ─────────────────────────────────────────────────────────────

export type SseEventType =
  | 'session.update'
  | 'score.update'
  | 'leaderboard.update'
  | 'notification'
  | 'heartbeat'

export interface SseEvent<T = unknown> {
  type: SseEventType
  data: T
  sessionId?: string
  timestamp: string
}

// ── Sandbox ───────────────────────────────────────────────────────────────────

export interface SandboxTestRequest {
  companyId: string
  simulationId: string
  payload: Record<string, unknown>
  apiKey: string
}

export interface SandboxTestResponse {
  success: boolean
  contractValid: boolean
  validationErrors: string[]
  parsedResult?: SimulationResult
  gatewayLatencyMs: number
  upstreamLatencyMs?: number
  upstreamStatusCode?: number
}

// ── postMessage bridge (iframe simulations) ───────────────────────────────────

export type PostMessageType =
  | 'sim:ready'
  | 'sim:started'
  | 'sim:progress'
  | 'sim:score_update'
  | 'sim:completed'
  | 'sim:failed'
  | 'sim:hint_request'
  | 'platform:init'
  | 'platform:user_data'
  | 'platform:close'

export interface PostMessage<T = unknown> {
  source: 'sho8lana_sim' | 'sho8lana_platform'
  type: PostMessageType
  version: string
  data: T
  sessionId: string
  timestamp: number
}

export interface SimProgressPayload {
  percentComplete: number      // 0–100
  currentPhase: string
  phaseLabel: string
  scorePreview?: number
  timeRemainingSeconds?: number
}

export interface SimCompletedPayload {
  result: SimulationResult
  celebrationMessage?: string
}
