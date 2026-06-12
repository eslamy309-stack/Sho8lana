// /api/forage/admin
// Privileged read + manual-verify for the admin Forage dashboard and tooling.
// Authorized by EITHER the owner token (isAdminAuthorized) OR a logged-in
// super_admin Supabase JWT. The in-app panel reads Supabase directly (super_admin
// RLS); this service-role route powers the test script and programmatic access.
//
//   GET  ?user=&program=&status=&from=&to=&limit=   → { analytics, attempts }
//   POST { attemptToken, action: 'verify'|'unverify' } → manual completion review

import { NextRequest } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { isAdminAuthorized } from '@/lib/adminAuth'
import { extractApiKey } from '@/lib/integration-gateway'
import { forageDb, appendForageEvent, onForageCompleted, FORAGE_EVENTS } from '@/lib/forage-server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function authorize(req: NextRequest, db: SupabaseClient): Promise<boolean> {
  if (isAdminAuthorized(req)) return true

  // Dev-only escape hatch for the local end-to-end test script.
  if (process.env.NODE_ENV !== 'production'
      && process.env.FORAGE_ALLOW_TEST_AUTH === 'true'
      && req.headers.get('x-forage-test-admin') === 'true') {
    return true
  }

  // Logged-in super_admin session
  const token = extractApiKey(req.headers.get('authorization'))
  if (!token) return false
  const { data } = await db.auth.getUser(token)
  if (!data?.user) return false
  const { data: profile } = await db.from('profiles').select('role')
    .or(`id.eq.${data.user.id},user_id.eq.${data.user.id}`).maybeSingle()
  return profile?.role === 'super_admin'
}

export async function GET(req: NextRequest) {
  const db = forageDb()
  if (!await authorize(req, db)) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const sp      = req.nextUrl.searchParams

  // Drill-down: recent timeline events for one user
  const eventsForUser = sp.get('eventsForUser')?.trim()
  if (eventsForUser) {
    const { data: events, error } = await db
      .from('forage_events').select('*')
      .eq('user_id', eventsForUser)
      .order('created_at', { ascending: false })
      .limit(100)
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ events: events ?? [] })
  }

  const user    = sp.get('user')?.trim()
  const program = sp.get('program')?.trim()
  const status  = sp.get('status')?.trim()
  const from    = sp.get('from')?.trim()
  const to      = sp.get('to')?.trim()
  const limit   = Math.min(Number(sp.get('limit') ?? 200), 500)

  let q = db.from('forage_attempts').select('*').order('last_activity_at', { ascending: false }).limit(limit)
  if (user)    q = q.eq('user_id', user)
  if (program) q = q.eq('program_id', program)
  if (status)  q = q.eq('status', status)
  if (from)    q = q.gte('last_activity_at', from)
  if (to)      q = q.lte('last_activity_at', to)

  const [{ data: attempts, error }, { data: analytics }] = await Promise.all([
    q,
    db.rpc('get_forage_analytics'),
  ])
  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ analytics: analytics ?? null, attempts: attempts ?? [] })
}

export async function POST(req: NextRequest) {
  const db = forageDb()
  if (!await authorize(req, db)) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { attemptToken?: string; action?: 'verify' | 'unverify' }
  try { body = await req.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const attemptToken = (body.attemptToken ?? '').trim()
  const action       = body.action ?? 'verify'
  if (!attemptToken) return Response.json({ error: 'attemptToken is required' }, { status: 400 })

  const { data: attempt } = await db.from('forage_attempts').select('*').eq('attempt_token', attemptToken).maybeSingle()
  if (!attempt) return Response.json({ error: 'Attempt not found' }, { status: 404 })

  const verify = action === 'verify'
  const now = new Date().toISOString()
  const { error } = await db.from('forage_attempts').update({
    certificate_verified:  verify,
    certificate_issued_at: verify ? (attempt.certificate_issued_at ?? now) : null,
    status:                verify ? 'completed' : attempt.status,
    progress_pct:          verify ? 100 : attempt.progress_pct,
    completed_at:          verify ? (attempt.completed_at ?? now) : attempt.completed_at,
    last_activity_at:      now,
    source:                'admin',
  }).eq('attempt_token', attemptToken)
  if (error) return Response.json({ error: error.message }, { status: 500 })

  await appendForageEvent(db, {
    attemptToken,
    userId: attempt.user_id as string,
    programId: attempt.program_id as string,
    eventType: verify ? FORAGE_EVENTS.certVerify : 'certificate.unverified',
    progressPct: verify ? 100 : (attempt.progress_pct as number),
    source: 'admin',
    payload: { action, by: 'admin' },
  })

  // Fire completion side-effects once, if admin verification newly completes it
  if (verify && attempt.status !== 'completed') {
    await onForageCompleted(db, { userId: attempt.user_id as string, programId: attempt.program_id as string, verified: true })
  }

  return Response.json({ ok: true, attemptToken, verified: verify })
}
