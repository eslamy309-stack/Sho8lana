// POST /api/forage/webhook
// HMAC-secured ingestion endpoint for Forage activity events. theforage.com does
// NOT call this on its own — it is the path for a future data partnership, an
// automation (e.g. Zapier parsing Forage completion emails), or trusted manual
// ingestion. Mirrors the security model of /api/webhooks/simulation-events.
//
// Signature: header `x-forage-signature: t=<ms>,v1=<hmac>` over `<t>.<rawBody>`
// using HMAC-SHA256 with env FORAGE_WEBHOOK_SECRET (see verifyWebhookSignature).
//
// Normalized payload:
//   { userId, programId, attemptToken?, status, progressPct?, score?,
//     timeSpentSeconds?, certificateUrl?, completedAt?, feedback?, metadata? }

import { NextRequest } from 'next/server'
import { verifyWebhookSignature, gatewaySuccess, gatewayError } from '@/lib/integration-gateway'
import {
  forageDb, getProgram, newAttemptToken, appendForageEvent, onForageCompleted, FORAGE_EVENTS,
  FORAGE_STATUSES, clampPct, clampScore, clampSeconds, type ForageStatus,
} from '@/lib/forage-server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const STATUS_EVENT: Record<ForageStatus, string> = {
  launched:    FORAGE_EVENTS.launched,
  in_progress: FORAGE_EVENTS.progress,
  completed:   FORAGE_EVENTS.completed,
  abandoned:   FORAGE_EVENTS.abandoned,
}

export async function POST(req: NextRequest) {
  const db   = forageDb()
  const body = await req.text()
  const sig  = req.headers.get('x-forage-signature') ?? req.headers.get('x-webhook-signature') ?? ''
  const ip   = req.headers.get('x-forwarded-for') ?? 'unknown'

  const secret = process.env.FORAGE_WEBHOOK_SECRET ?? 'dev-forage-secret-change-me'

  // ── 1. Verify HMAC ────────────────────────────────────────────────────────
  // A present signature is ALWAYS verified (a tampered one is rejected in every
  // environment). A missing signature is tolerated only under `next dev` for
  // local testing convenience; in production it is rejected.
  const reject = async (reason: string) => {
    await db.from('integration_events').insert([{
      company_id: 'forage', event_type: 'forage.webhook.rejected',
      severity: 'error', status_code: 401, error_message: reason, ip_address: ip,
    }])
    return gatewayError(401, 'INVALID_SIGNATURE', 'Webhook signature verification failed')
  }
  if (sig) {
    if (!await verifyWebhookSignature(secret, body, sig)) return reject('Invalid HMAC signature')
  } else if (process.env.NODE_ENV !== 'development') {
    return reject('Missing signature')
  }

  // ── 2. Parse + validate ───────────────────────────────────────────────────
  let p: Record<string, unknown>
  try { p = JSON.parse(body) } catch { return gatewayError(400, 'INVALID_JSON', 'Body must be JSON') }

  const userId    = String(p.userId ?? '').trim()
  const programId = String(p.programId ?? '').trim()
  const status    = String(p.status ?? '').trim() as ForageStatus

  if (!userId || !programId) return gatewayError(422, 'MISSING_FIELDS', 'userId and programId are required')
  if (!FORAGE_STATUSES.includes(status)) return gatewayError(422, 'BAD_STATUS', `status must be one of ${FORAGE_STATUSES.join(', ')}`)
  const program = getProgram(programId)
  if (!program) return gatewayError(404, 'UNKNOWN_PROGRAM', `Unknown program "${programId}"`)

  const progressPct = clampPct(p.progressPct)
  const score       = clampScore(p.score)
  const timeSpent   = clampSeconds(p.timeSpentSeconds)
  const now         = new Date().toISOString()

  // ── 3. Locate the target attempt (correlate → resume → create) ────────────
  let attemptToken = String(p.attemptToken ?? '').trim()
  let row: Record<string, unknown> | null = null

  if (attemptToken) {
    const { data } = await db.from('forage_attempts').select('*')
      .eq('attempt_token', attemptToken).eq('user_id', userId).maybeSingle()
    row = data ?? null
  }
  if (!row) {
    const { data } = await db.from('forage_attempts').select('*')
      .eq('user_id', userId).eq('program_id', programId)
      .order('attempt_number', { ascending: false }).limit(1).maybeSingle()
    const open = data && (data.status === 'launched' || data.status === 'in_progress')
    if (open) { row = data; attemptToken = data.attempt_token as string }
    else {
      attemptToken = newAttemptToken()
      const attemptNumber = ((data?.attempt_number as number) ?? 0) + 1
      const { data: created, error } = await db.from('forage_attempts').insert([{
        attempt_token: attemptToken, user_id: userId, program_id: programId,
        company: program.company, title: program.title, attempt_number: attemptNumber,
        status: 'launched', source: 'webhook',
      }]).select('*').maybeSingle()
      if (error) return gatewayError(500, 'DB_ERROR', error.message)
      row = created ?? null
    }
  }

  // ── 4. Apply the update (progress/time monotonic) ─────────────────────────
  const update: Record<string, unknown> = {
    status,
    progress_pct:       status === 'completed' ? 100 : Math.max(Number(row?.progress_pct ?? 0), progressPct ?? 0),
    time_spent_seconds: Math.max(Number(row?.time_spent_seconds ?? 0), timeSpent ?? 0),
    last_activity_at:   now,
    source:             'webhook',
  }
  if (score != null) update.score = score
  if (status === 'completed') update.completed_at = (p.completedAt as string) ?? now
  if (p.certificateUrl) { update.certificate_url = String(p.certificateUrl); update.certificate_verified = true; update.certificate_issued_at = now }
  if (p.feedback && typeof p.feedback === 'object') update.forage_feedback = p.feedback
  if (p.metadata && typeof p.metadata === 'object') update.metadata = p.metadata

  const { error: updErr } = await db.from('forage_attempts').update(update).eq('attempt_token', attemptToken)
  if (updErr) return gatewayError(500, 'DB_ERROR', updErr.message)

  await appendForageEvent(db, {
    attemptToken, userId, programId,
    eventType: STATUS_EVENT[status],
    progressPct: update.progress_pct as number,
    score, timeSpentSeconds: update.time_spent_seconds as number,
    source: 'webhook',
    payload: p,
  })

  await db.from('integration_events').insert([{
    company_id: 'forage', event_type: 'forage.webhook.received',
    severity: 'info', status_code: 200, ip_address: ip,
    metadata: { userId, programId, status, attemptToken },
  }])

  // Fire completion side-effects once, on transition into completed
  if (status === 'completed' && row?.status !== 'completed') {
    await onForageCompleted(db, { userId, programId, verified: Boolean(p.certificateUrl) })
  }

  return gatewaySuccess({ received: true, attemptToken, status })
}
