// GET /api/forage/activity?userId=<id>
// Returns the caller's own Forage attempts + recent timeline events for the
// "My Forage Activity" section. Auth is the user's Supabase JWT; the userId query
// param (if present) must match the token — you can only read your own activity.

import { NextRequest } from 'next/server'
import { forageDb, resolveUserId } from '@/lib/forage-server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const db = forageDb()

  const { userId, error: authErr } = await resolveUserId(req, db)
  if (!userId) return Response.json({ error: authErr ?? 'Unauthorized' }, { status: 401 })

  const requested = req.nextUrl.searchParams.get('userId')
  if (requested && requested !== userId) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const [{ data: attempts }, { data: events }] = await Promise.all([
    db.from('forage_attempts').select('*').eq('user_id', userId).order('last_activity_at', { ascending: false }),
    db.from('forage_events').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50),
  ])

  return Response.json({ attempts: attempts ?? [], events: events ?? [] })
}
