// POST /api/forage/track
// Self-reported progress from the client (return-detection modal + "My Activity"
// controls). Updates the owning attempt and appends an immutable timeline event.
// Progress and time are monotonic so a stale report can never roll a user back.

import { NextRequest } from 'next/server'
import { checkRateLimit } from '@/lib/integration-gateway'
import {
  forageDb, resolveUserId, appendForageEvent, onForageCompleted, FORAGE_EVENTS,
  clampPct, clampScore, clampSeconds, type ForageStatus,
} from '@/lib/forage-server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type TrackEvent = 'opened' | 'progress' | 'completed' | 'abandoned'

const EVENT_MAP: Record<TrackEvent, { status: ForageStatus; type: string }> = {
  opened:    { status: 'in_progress', type: FORAGE_EVENTS.opened },
  progress:  { status: 'in_progress', type: FORAGE_EVENTS.progress },
  completed: { status: 'completed',   type: FORAGE_EVENTS.completed },
  abandoned: { status: 'abandoned',   type: FORAGE_EVENTS.abandoned },
}

export async function POST(req: NextRequest) {
  const db = forageDb()

  const { userId, error: authErr } = await resolveUserId(req, db)
  if (!userId) return Response.json({ error: authErr ?? 'Unauthorized' }, { status: 401 })

  const rl = checkRateLimit(`forage:track:${userId}`, 120)
  if (!rl.allowed) return Response.json({ error: 'Too many updates' }, { status: 429 })

  let body: { attemptToken?: string; event?: TrackEvent; progressPct?: unknown; timeSpentSeconds?: unknown; score?: unknown }
  try { body = await req.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const attemptToken = (body.attemptToken ?? '').trim()
  const event        = body.event as TrackEvent
  if (!attemptToken)        return Response.json({ error: 'attemptToken is required' }, { status: 400 })
  if (!EVENT_MAP[event])    return Response.json({ error: 'event must be opened|progress|completed|abandoned' }, { status: 400 })

  // ── Ownership check (tenant isolation) ────────────────────────────────────
  const { data: attempt } = await db
    .from('forage_attempts')
    .select('*')
    .eq('attempt_token', attemptToken)
    .maybeSingle()

  if (!attempt)                       return Response.json({ error: 'Attempt not found' }, { status: 404 })
  if (attempt.user_id !== userId)     return Response.json({ error: 'Forbidden' }, { status: 403 })

  // ── Build the update (monotonic progress + time) ──────────────────────────
  const map = EVENT_MAP[event]
  const now = new Date().toISOString()

  const incomingPct  = clampPct(body.progressPct)
  const incomingTime = clampSeconds(body.timeSpentSeconds)
  const incomingScore = clampScore(body.score)

  const nextProgress = event === 'completed'
    ? 100
    : Math.max(attempt.progress_pct as number, incomingPct ?? 0)
  const nextTime = Math.max(attempt.time_spent_seconds as number, incomingTime ?? 0)

  const update: Record<string, unknown> = {
    status:             map.status,
    progress_pct:       nextProgress,
    time_spent_seconds: nextTime,
    last_activity_at:   now,
    source:             'self_report',
  }
  if (event === 'opened' && !attempt.opened_at) update.opened_at = now
  if (event === 'completed') update.completed_at = now
  if (incomingScore != null) update.score = incomingScore

  const { error: updErr } = await db.from('forage_attempts').update(update).eq('attempt_token', attemptToken)
  if (updErr) return Response.json({ error: updErr.message }, { status: 500 })

  await appendForageEvent(db, {
    attemptToken, userId,
    programId: attempt.program_id as string,
    eventType: map.type,
    progressPct: nextProgress,
    score: incomingScore,
    timeSpentSeconds: nextTime,
    source: 'self_report',
    payload: { event },
  })

  // Fire completion side-effects once, on transition into completed
  if (event === 'completed' && attempt.status !== 'completed') {
    await onForageCompleted(db, { userId, programId: attempt.program_id as string, verified: false })
  }

  return Response.json({
    ok: true,
    attempt: {
      attemptToken,
      status: map.status,
      progressPct: nextProgress,
      timeSpentSeconds: nextTime,
      score: update.score ?? attempt.score ?? null,
    },
  })
}
