// POST /api/forage/launch
// A logged-in user is launching a Forage simulation. We create (or resume) an
// attempt tied to their account, then hand back the Forage URL with our tracking
// ref appended. This is the one moment we fully control, so it anchors all
// downstream tracking. Returning users get a NEW attempt — never a new identity.

import { NextRequest } from 'next/server'
import { checkRateLimit } from '@/lib/integration-gateway'
import {
  forageDb, resolveUserId, getProgram, newAttemptToken, buildRedirectUrl,
  appendForageEvent, FORAGE_EVENTS,
} from '@/lib/forage-server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const db = forageDb()

  // ── 1. Authenticate the user ──────────────────────────────────────────────
  const { userId, error: authErr } = await resolveUserId(req, db)
  if (!userId) return Response.json({ error: authErr ?? 'Unauthorized' }, { status: 401 })

  // ── 2. Rate limit per user ────────────────────────────────────────────────
  const rl = checkRateLimit(`forage:launch:${userId}`, 30)
  if (!rl.allowed) return Response.json({ error: 'Too many launches, slow down' }, { status: 429 })

  // ── 3. Validate program ───────────────────────────────────────────────────
  let body: { programId?: string }
  try { body = await req.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const programId = (body.programId ?? '').trim()
  if (!programId) return Response.json({ error: 'programId is required' }, { status: 400 })

  const program = getProgram(programId)
  if (!program) return Response.json({ error: `Unknown program "${programId}"` }, { status: 404 })

  // ── 4. Resume an open attempt, or open a fresh one ────────────────────────
  const { data: last } = await db
    .from('forage_attempts')
    .select('attempt_token, attempt_number, status')
    .eq('user_id', userId)
    .eq('program_id', programId)
    .order('attempt_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  const isOpen = last && (last.status === 'launched' || last.status === 'in_progress')

  let attemptToken: string
  let attemptNumber: number
  const resumed = Boolean(isOpen)

  if (isOpen) {
    attemptToken  = last!.attempt_token as string
    attemptNumber = last!.attempt_number as number
    await db.from('forage_attempts')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('attempt_token', attemptToken)
  } else {
    attemptToken  = newAttemptToken()
    attemptNumber = ((last?.attempt_number as number) ?? 0) + 1
    const { error: insErr } = await db.from('forage_attempts').insert([{
      attempt_token:  attemptToken,
      user_id:        userId,
      program_id:     programId,
      company:        program.company,
      title:          program.title,
      attempt_number: attemptNumber,
      status:         'launched',
      source:         'launch',
      metadata:       { category: program.category, level: program.level },
    }])
    if (insErr) return Response.json({ error: insErr.message }, { status: 500 })
  }

  // ── 5. Record the launch on the timeline ──────────────────────────────────
  await appendForageEvent(db, {
    attemptToken, userId, programId,
    eventType: FORAGE_EVENTS.launched,
    progressPct: 0,
    source: 'launch',
    payload: { resumed, attemptNumber },
  })

  return Response.json({
    attemptToken,
    attemptNumber,
    resumed,
    redirectUrl: buildRedirectUrl(program, attemptToken),
    program: { id: program.id, company: program.company, title: program.title },
  })
}
