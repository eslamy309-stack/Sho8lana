// /api/webhooks/simulation-events
// Receives incoming simulation results from company servers.
// Validates HMAC signature → validates contract → stores result → awards XP.

import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyWebhookSignature, generateSessionId, gatewayError, gatewaySuccess } from '@/lib/integration-gateway'
import { validateSimulationResult, calculateXpReward } from '@/lib/simulation-contract'

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

export async function POST(req: NextRequest) {
  const supabase = sb()
  const body      = await req.text()
  const sigHeader = req.headers.get('x-sho8lana-signature') ?? req.headers.get('x-webhook-signature') ?? ''
  const companyId = req.headers.get('x-company-id') ?? ''

  if (!companyId) {
    return gatewayError(400, 'MISSING_COMPANY_ID', 'X-Company-Id header is required')
  }

  // ── 1. Load webhook secret for this company ───────────────────────────────────
  const { data: webhookCfg } = await supabase
    .from('webhook_configs')
    .select('id, secret_hash, is_active')
    .eq('company_id', companyId)
    .eq('is_active', true)
    .single()

  // For now we store the secret hash — in practice, store raw secret in Supabase Vault
  // Here we use an env var fallback for demo:
  const webhookSecret = process.env[`WEBHOOK_SECRET_${companyId.toUpperCase().replace(/-/g,'_')}`]
    ?? process.env.DEFAULT_WEBHOOK_SECRET
    ?? 'dev-webhook-secret-change-me'

  // ── 2. Verify HMAC signature ──────────────────────────────────────────────────
  if (sigHeader && process.env.NODE_ENV !== 'development') {
    const valid = await verifyWebhookSignature(webhookSecret, body, sigHeader)
    if (!valid) {
      await supabase.from('integration_events').insert([{
        company_id: companyId, event_type: 'webhook.received',
        severity: 'error', status_code: 401,
        error_message: 'Invalid HMAC signature',
        ip_address: req.headers.get('x-forwarded-for') ?? 'unknown',
      }])
      return gatewayError(401, 'INVALID_SIGNATURE', 'Webhook signature verification failed')
    }
  }

  // ── 3. Parse payload ──────────────────────────────────────────────────────────
  let rawPayload: unknown
  try { rawPayload = JSON.parse(body) }
  catch { return gatewayError(400, 'INVALID_JSON', 'Webhook body must be valid JSON') }

  // ── 4. Validate simulation contract ──────────────────────────────────────────
  const validation = validateSimulationResult(rawPayload)

  // Log receipt
  await supabase.from('integration_events').insert([{
    company_id:   companyId,
    event_type:   validation.valid ? 'contract.validated' : 'contract.invalid',
    severity:     validation.valid ? 'info' : 'warning',
    status_code:  validation.valid ? 200 : 422,
    metadata:     {
      contractVersion: validation.contractVersion,
      errors:          validation.errors.map(e => e.message),
      warnings:        validation.warnings.map(w => w.message),
    },
  }])

  if (!validation.valid) {
    return gatewayError(422, 'CONTRACT_INVALID', 'Simulation result failed schema validation', {
      errors:   validation.errors,
      warnings: validation.warnings,
    })
  }

  const result = validation.normalizedResult!

  // ── 5. Verify company owns this simulation ────────────────────────────────────
  if (result.companyId !== companyId) {
    return gatewayError(403, 'TENANT_MISMATCH', 'companyId in payload does not match request header')
  }

  // ── 6. Upsert session ─────────────────────────────────────────────────────────
  const sessionId   = result.sessionId || generateSessionId()
  const durationSec = result.durationSeconds

  // Look up simulation for XP base value
  const { data: simEndpoint } = await supabase
    .from('simulation_endpoints')
    .select('xp_reward')
    .eq('company_id', companyId)
    .eq('simulation_id', result.simulationId)
    .single()

  const baseXp   = (simEndpoint?.xp_reward as number) ?? 100
  const xpEarned = calculateXpReward(result, baseXp)

  const { error: sessionErr } = await supabase
    .from('simulation_sessions')
    .upsert({
      session_id:    sessionId,
      user_id:       result.userId,
      simulation_id: result.simulationId,
      company_id:    companyId,
      status:        result.completionStatus === 'completed' ? 'completed' : 'failed',
      started_at:    result.startedAt,
      completed_at:  result.completedAt,
      duration_seconds: durationSec,
      final_score:   result.finalScore,
      xp_awarded:    xpEarned,
      raw_result:    result,
    }, { onConflict: 'session_id' })

  if (sessionErr) return gatewayError(500, 'DB_ERROR', sessionErr.message)

  // ── 7. Store validated result ─────────────────────────────────────────────────
  await supabase.from('simulation_results').upsert({
    session_id:          sessionId,
    user_id:             result.userId,
    simulation_id:       result.simulationId,
    company_id:          companyId,
    contract_version:    result.contractVersion,
    completion_status:   result.completionStatus,
    duration_seconds:    durationSec,
    score_accuracy:      result.scores.accuracy,
    score_speed:         result.scores.speed,
    score_decision:      result.scores.decision,
    score_overall:       result.scores.overall,
    kpi_metrics:         result.kpiMetrics,
    decision_log:        result.decisionLog,
    behavioral_analytics: result.behavioralAnalytics,
    event_timeline:      result.eventTimeline,
    final_score:         result.finalScore,
    xp_awarded:          xpEarned,
    validated:           true,
    validation_errors:   validation.warnings.map(w => w.message),
  }, { onConflict: 'session_id' })

  // ── 8. Broadcast SSE event ────────────────────────────────────────────────────
  // In-process broadcast (production: use Redis pub/sub or Supabase Realtime)
  sseClients.forEach(cb => cb({
    type:      'score.update',
    sessionId,
    data:      { userId: result.userId, finalScore: result.finalScore, xpEarned },
    timestamp: new Date().toISOString(),
  }))

  return gatewaySuccess({
    received:        true,
    sessionId,
    finalScore:      result.finalScore,
    xpEarned,
    warnings:        validation.warnings,
    contractVersion: validation.contractVersion,
  })
}

// ── SSE broadcaster (shared with sse/route.ts via module singleton) ────────────
// In production, replace with Redis pub/sub.

type SseCallback = (event: Record<string, unknown>) => void
export const sseClients = new Set<SseCallback>()

export function registerSseClient(cb: SseCallback): () => void {
  sseClients.add(cb)
  return () => sseClients.delete(cb)
}
