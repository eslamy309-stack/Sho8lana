// ═══════════════════════════════════════════════════════════════════════════════
// Universal Simulation Contract — Schema Validator
// All external company simulations must conform to this contract.
// ═══════════════════════════════════════════════════════════════════════════════

import type {
  SimulationResult,
  ContractScore,
  ContractKpiMetric,
  ContractDecisionEntry,
  ContractBehavioralAnalytics,
  ContractEventEntry,
} from './integration-types'

// ── Validation result ─────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  contractVersion: string
  normalizedResult?: SimulationResult
}

export interface ValidationError {
  field: string
  message: string
  received?: unknown
}

export interface ValidationWarning {
  field: string
  message: string
}

// ── Contract versions ─────────────────────────────────────────────────────────

const SUPPORTED_VERSIONS = ['1.0', '1.1', '2.0'] as const

// ── Field validators ──────────────────────────────────────────────────────────

function isString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0
}

function isNumber(v: unknown, min = -Infinity, max = Infinity): v is number {
  return typeof v === 'number' && !isNaN(v) && v >= min && v <= max
}

function isIso8601(v: unknown): v is string {
  if (!isString(v)) return false
  const d = new Date(v)
  return !isNaN(d.getTime())
}

function isArray(v: unknown): v is unknown[] {
  return Array.isArray(v)
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

// ── Score validation ──────────────────────────────────────────────────────────

function validateScore(score: unknown, errors: ValidationError[], path: string): ContractScore | null {
  if (!isObject(score)) {
    errors.push({ field: path, message: 'Must be an object', received: score })
    return null
  }
  const s = score as Record<string, unknown>
  const required = ['accuracy', 'speed', 'decision', 'overall']
  for (const field of required) {
    if (!isNumber(s[field], 0, 100)) {
      errors.push({ field: `${path}.${field}`, message: 'Must be a number between 0 and 100', received: s[field] })
    }
  }
  return {
    accuracy:      Math.round(Number(s.accuracy)      ?? 0),
    speed:         Math.round(Number(s.speed)         ?? 0),
    decision:      Math.round(Number(s.decision)      ?? 0),
    communication: isNumber(s.communication, 0, 100) ? Math.round(Number(s.communication)) : undefined,
    collaboration: isNumber(s.collaboration, 0, 100) ? Math.round(Number(s.collaboration)) : undefined,
    overall:       Math.round(Number(s.overall)       ?? 0),
  }
}

// ── KPI metrics validation ────────────────────────────────────────────────────

function validateKpiMetrics(
  metrics: unknown,
  errors: ValidationError[],
  warnings: ValidationWarning[],
  path: string,
): ContractKpiMetric[] {
  if (!isArray(metrics)) {
    errors.push({ field: path, message: 'Must be an array', received: metrics })
    return []
  }
  if (metrics.length === 0) {
    warnings.push({ field: path, message: 'No KPI metrics provided — leaderboard integration will be limited' })
    return []
  }

  const validated: ContractKpiMetric[] = []
  metrics.forEach((m, i) => {
    if (!isObject(m)) {
      errors.push({ field: `${path}[${i}]`, message: 'Each metric must be an object', received: m })
      return
    }
    const metric = m as Record<string, unknown>
    if (!isString(metric.id))    errors.push({ field: `${path}[${i}].id`,    message: 'Required string', received: metric.id })
    if (!isString(metric.label)) errors.push({ field: `${path}[${i}].label`, message: 'Required string', received: metric.label })
    if (!isNumber(metric.value, 0, 100)) errors.push({ field: `${path}[${i}].value`, message: '0–100 number required', received: metric.value })
    if (!isNumber(metric.weight, 0, 1))  errors.push({ field: `${path}[${i}].weight`, message: '0–1 weight required', received: metric.weight })

    validated.push({
      id:        String(metric.id    ?? `metric_${i}`),
      label:     String(metric.label ?? `Metric ${i}`),
      value:     Math.round(Number(metric.value) ?? 0),
      weight:    Number(metric.weight) ?? 0.1,
      category:  String(metric.category ?? 'general'),
      benchmark: isNumber(metric.benchmark, 0, 100) ? Math.round(Number(metric.benchmark)) : undefined,
    })
  })

  // Validate weight sum (warn if far from 1.0)
  const weightSum = validated.reduce((s, m) => s + m.weight, 0)
  if (Math.abs(weightSum - 1.0) > 0.05) {
    warnings.push({ field: path, message: `KPI weights sum to ${weightSum.toFixed(2)}, expected 1.0 — scores may be skewed` })
  }

  return validated
}

// ── Decision log validation ───────────────────────────────────────────────────

function validateDecisionLog(
  log: unknown,
  warnings: ValidationWarning[],
  path: string,
): ContractDecisionEntry[] {
  if (!isArray(log)) {
    warnings.push({ field: path, message: 'Expected an array — behavioral analytics will be unavailable' })
    return []
  }
  return (log as unknown[]).map((entry, i) => {
    const e = isObject(entry) ? entry as Record<string, unknown> : {}
    return {
      timestamp:    isNumber(e.timestamp)    ? Number(e.timestamp)    : 0,
      questionId:   isString(e.questionId)   ? String(e.questionId)   : `q${i}`,
      questionText: isString(e.questionText) ? String(e.questionText) : '',
      choiceId:     isString(e.choiceId)     ? String(e.choiceId)     : '',
      choiceText:   isString(e.choiceText)   ? String(e.choiceText)   : '',
      isOptimal:    Boolean(e.isOptimal),
      timeSpentMs:  isNumber(e.timeSpentMs)  ? Number(e.timeSpentMs)  : 0,
      confidence:   isNumber(e.confidence, 0, 1) ? Number(e.confidence) : undefined,
    }
  })
}

// ── Behavioral analytics validation ──────────────────────────────────────────

function validateBehavioral(
  analytics: unknown,
  decisionLog: ContractDecisionEntry[],
  warnings: ValidationWarning[],
  path: string,
): ContractBehavioralAnalytics {
  // If not provided, derive from decision log
  if (!isObject(analytics)) {
    warnings.push({ field: path, message: 'Not provided — auto-deriving from decision log' })
    return deriveBehavioralAnalytics(decisionLog)
  }
  const a = analytics as Record<string, unknown>
  return {
    totalDecisions:          isNumber(a.totalDecisions)          ? Number(a.totalDecisions)          : decisionLog.length,
    optimalDecisions:        isNumber(a.optimalDecisions)        ? Number(a.optimalDecisions)        : decisionLog.filter(d => d.isOptimal).length,
    optimalRate:             isNumber(a.optimalRate, 0, 1)       ? Number(a.optimalRate)             : computeOptimalRate(decisionLog),
    averageDecisionTimeMs:   isNumber(a.averageDecisionTimeMs)   ? Number(a.averageDecisionTimeMs)   : computeAvgDecisionTime(decisionLog),
    riskProfile:             ['conservative','moderate','aggressive'].includes(String(a.riskProfile))
                               ? a.riskProfile as ContractBehavioralAnalytics['riskProfile']
                               : 'moderate',
    consistencyScore:        isNumber(a.consistencyScore, 0, 100) ? Number(a.consistencyScore) : 70,
    pressureResponse:        ['improves','stable','degrades'].includes(String(a.pressureResponse))
                               ? a.pressureResponse as ContractBehavioralAnalytics['pressureResponse']
                               : 'stable',
    peakPerformanceMinute:   isNumber(a.peakPerformanceMinute)   ? Number(a.peakPerformanceMinute)   : 0,
    focusDropoffMinute:      isNumber(a.focusDropoffMinute)      ? Number(a.focusDropoffMinute)      : undefined,
  }
}

function deriveBehavioralAnalytics(log: ContractDecisionEntry[]): ContractBehavioralAnalytics {
  const total    = log.length
  const optimal  = log.filter(d => d.isOptimal).length
  const avgTime  = computeAvgDecisionTime(log)
  return {
    totalDecisions:        total,
    optimalDecisions:      optimal,
    optimalRate:           computeOptimalRate(log),
    averageDecisionTimeMs: avgTime,
    riskProfile:           'moderate',
    consistencyScore:      total > 0 ? Math.round((optimal / total) * 100) : 70,
    pressureResponse:      'stable',
    peakPerformanceMinute: 0,
  }
}

function computeOptimalRate(log: ContractDecisionEntry[]): number {
  if (log.length === 0) return 0
  return log.filter(d => d.isOptimal).length / log.length
}

function computeAvgDecisionTime(log: ContractDecisionEntry[]): number {
  if (log.length === 0) return 0
  return log.reduce((s, d) => s + d.timeSpentMs, 0) / log.length
}

// ── Event timeline validation ─────────────────────────────────────────────────

function validateEventTimeline(events: unknown, warnings: ValidationWarning[], path: string): ContractEventEntry[] {
  if (!isArray(events)) {
    warnings.push({ field: path, message: 'No event timeline provided — session replay unavailable' })
    return []
  }
  return (events as unknown[]).map((e, i) => {
    const ev = isObject(e) ? e as Record<string, unknown> : {}
    return {
      timestamp: isNumber(ev.timestamp) ? Number(ev.timestamp) : i * 1000,
      type:      isString(ev.type)      ? String(ev.type)      : 'unknown',
      data:      isObject(ev.data)      ? (ev.data as Record<string, unknown>) : {},
    }
  })
}

// ── Main validator ────────────────────────────────────────────────────────────

export function validateSimulationResult(raw: unknown): ValidationResult {
  const errors:   ValidationError[]   = []
  const warnings: ValidationWarning[] = []

  if (!isObject(raw)) {
    return {
      valid: false,
      errors: [{ field: 'root', message: 'Result must be a JSON object', received: typeof raw }],
      warnings: [],
      contractVersion: 'unknown',
    }
  }

  const r = raw as Record<string, unknown>

  // ── contractVersion ─────────────────────────────────────────────────────────
  const contractVersion = String(r.contractVersion ?? '1.0')
  if (!SUPPORTED_VERSIONS.includes(contractVersion as (typeof SUPPORTED_VERSIONS)[number])) {
    errors.push({
      field: 'contractVersion',
      message: `Unsupported version "${contractVersion}". Supported: ${SUPPORTED_VERSIONS.join(', ')}`,
    })
  }

  // ── Required string fields ──────────────────────────────────────────────────
  for (const field of ['userId', 'simulationId', 'companyId', 'sessionId'] as const) {
    if (!isString(r[field])) {
      errors.push({ field, message: 'Required non-empty string', received: r[field] })
    }
  }

  // ── completionStatus ────────────────────────────────────────────────────────
  const validStatuses = ['completed', 'failed', 'abandoned', 'partial']
  if (!validStatuses.includes(String(r.completionStatus))) {
    errors.push({
      field: 'completionStatus',
      message: `Must be one of: ${validStatuses.join(', ')}`,
      received: r.completionStatus,
    })
  }

  // ── Timestamps ──────────────────────────────────────────────────────────────
  if (!isIso8601(r.startedAt))   errors.push({ field: 'startedAt',   message: 'Required ISO 8601 date string', received: r.startedAt })
  if (!isIso8601(r.completedAt)) errors.push({ field: 'completedAt', message: 'Required ISO 8601 date string', received: r.completedAt })

  // ── duration ────────────────────────────────────────────────────────────────
  if (!isNumber(r.durationSeconds, 0)) {
    errors.push({ field: 'durationSeconds', message: 'Required non-negative number', received: r.durationSeconds })
  }

  // ── finalScore ──────────────────────────────────────────────────────────────
  if (!isNumber(r.finalScore, 0, 100)) {
    errors.push({ field: 'finalScore', message: 'Required number between 0 and 100', received: r.finalScore })
  }

  // ── Nested objects ──────────────────────────────────────────────────────────
  const scores      = validateScore(r.scores, errors, 'scores')
  const kpiMetrics  = validateKpiMetrics(r.kpiMetrics, errors, warnings, 'kpiMetrics')
  const decisionLog = validateDecisionLog(r.decisionLog, warnings, 'decisionLog')
  const behavioral  = validateBehavioral(r.behavioralAnalytics, decisionLog, warnings, 'behavioralAnalytics')
  const events      = validateEventTimeline(r.eventTimeline, warnings, 'eventTimeline')

  const valid = errors.length === 0

  if (!valid) {
    return { valid: false, errors, warnings, contractVersion }
  }

  const normalizedResult: SimulationResult = {
    contractVersion: contractVersion as SimulationResult['contractVersion'],
    userId:          String(r.userId),
    simulationId:    String(r.simulationId),
    companyId:       String(r.companyId),
    sessionId:       String(r.sessionId),
    completionStatus: r.completionStatus as SimulationResult['completionStatus'],
    startedAt:       String(r.startedAt),
    completedAt:     String(r.completedAt),
    durationSeconds: Math.round(Number(r.durationSeconds)),
    scores:          scores!,
    kpiMetrics,
    decisionLog,
    behavioralAnalytics: behavioral,
    eventTimeline:   events,
    finalScore:      Math.round(Number(r.finalScore)),
    xpEarned:        isNumber(r.xpEarned, 0)  ? Math.round(Number(r.xpEarned)) : undefined,
    certificateEligible: Boolean(r.certificateEligible),
    metadata:        isObject(r.metadata) ? (r.metadata as Record<string, unknown>) : {},
  }

  return { valid: true, errors: [], warnings, contractVersion, normalizedResult }
}

// ── XP calculation ────────────────────────────────────────────────────────────

export function calculateXpReward(
  result: SimulationResult,
  baseXp: number,
): number {
  const scoreMultiplier = result.finalScore / 100        // 0–1
  const completionBonus = result.completionStatus === 'completed' ? 1.0 : 0.5
  const speedBonus      = result.scores.speed >= 80 ? 1.15 : 1.0
  const optimalBonus    = result.behavioralAnalytics.optimalRate >= 0.8 ? 1.1 : 1.0

  return Math.round(baseXp * scoreMultiplier * completionBonus * speedBonus * optimalBonus)
}

// ── Sample contract (for developer portal / sandbox) ──────────────────────────

export const SAMPLE_CONTRACT: SimulationResult = {
  contractVersion: '1.0',
  userId:          'user_abc123',
  simulationId:    'budget-variance-analysis',
  companyId:       'mckinsey-cairo',
  sessionId:       'sess_xyz789',
  completionStatus: 'completed',
  startedAt:       new Date(Date.now() - 3_600_000).toISOString(),
  completedAt:     new Date().toISOString(),
  durationSeconds: 3540,
  scores: {
    accuracy: 87,
    speed:    74,
    decision: 91,
    communication: 82,
    overall:  84,
  },
  kpiMetrics: [
    { id: 'analytical_thinking', label: 'Analytical Thinking', value: 88, weight: 0.3, category: 'performance', benchmark: 72 },
    { id: 'financial_acumen',    label: 'Financial Acumen',    value: 83, weight: 0.3, category: 'performance', benchmark: 68 },
    { id: 'decision_quality',    label: 'Decision Quality',    value: 91, weight: 0.2, category: 'cognitive',   benchmark: 75 },
    { id: 'communication',       label: 'Communication',       value: 79, weight: 0.2, category: 'leadership',  benchmark: 70 },
  ],
  decisionLog: [
    { timestamp: 120_000, questionId: 'q1', questionText: 'Which variance is most critical?', choiceId: 'a', choiceText: 'Revenue variance', isOptimal: true,  timeSpentMs: 18_000 },
    { timestamp: 340_000, questionId: 'q2', questionText: 'Recommend cost reduction approach?', choiceId: 'c', choiceText: 'Renegotiate supplier contracts', isOptimal: true, timeSpentMs: 24_000 },
    { timestamp: 590_000, questionId: 'q3', questionText: 'Escalation threshold?', choiceId: 'b', choiceText: '10% variance', isOptimal: false, timeSpentMs: 31_000 },
  ],
  behavioralAnalytics: {
    totalDecisions:        3,
    optimalDecisions:      2,
    optimalRate:           0.67,
    averageDecisionTimeMs: 24_333,
    riskProfile:           'moderate',
    consistencyScore:      78,
    pressureResponse:      'stable',
    peakPerformanceMinute: 15,
    focusDropoffMinute:    52,
  },
  eventTimeline: [
    { timestamp: 0,         type: 'session_start',  data: { phase: 'briefing' } },
    { timestamp: 60_000,    type: 'phase_start',    data: { phase: 'analysis' } },
    { timestamp: 120_000,   type: 'decision',       data: { questionId: 'q1' } },
    { timestamp: 3_540_000, type: 'session_end',    data: { score: 84 } },
  ],
  finalScore:          84,
  xpEarned:           120,
  certificateEligible: true,
  metadata: { difficulty: 'intermediate', scenarioVersion: '2.3' },
}
