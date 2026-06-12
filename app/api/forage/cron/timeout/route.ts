// GET /api/forage/cron/timeout
// Scheduled cleanup: marks attempts that have sat in launched/in_progress with no
// activity for N days (default 30) as `abandoned`, so "active now" stays honest
// and history reflects reality. Wired via vercel.json crons.
//
// Auth: Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` automatically when
// CRON_SECRET is set. A manual run may pass `?key=<CRON_SECRET>`. In local dev with
// FORAGE_ALLOW_TEST_AUTH=true it runs unauthenticated for testing.

import { NextRequest } from 'next/server'
import { forageDb, FORAGE_EVENTS } from '@/lib/forage-server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const bearer = req.headers.get('authorization')
    if (bearer === `Bearer ${secret}`) return true
    if (req.nextUrl.searchParams.get('key') === secret) return true
    return false
  }
  // No secret configured → only allow the dev test path
  return process.env.NODE_ENV !== 'production' && process.env.FORAGE_ALLOW_TEST_AUTH === 'true'
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const db   = forageDb()
  const days = Math.max(1, Math.min(Number(req.nextUrl.searchParams.get('days') ?? 30), 365))
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const { data: stale, error } = await db
    .from('forage_attempts')
    .update({ status: 'abandoned', source: 'system' })
    .in('status', ['launched', 'in_progress'])
    .lt('last_activity_at', cutoff)
    .select('attempt_token, user_id, program_id, progress_pct')
  if (error) return Response.json({ error: error.message }, { status: 500 })

  if (stale && stale.length > 0) {
    await db.from('forage_events').insert(stale.map(a => ({
      attempt_token:      a.attempt_token,
      user_id:            a.user_id,
      program_id:         a.program_id,
      event_type:         FORAGE_EVENTS.abandoned,
      progress_pct:       a.progress_pct,
      source:             'system',
      payload:            { reason: `auto_timeout_${days}d` },
    })))
  }

  return Response.json({ ok: true, timedOut: stale?.length ?? 0, cutoff, days })
}
