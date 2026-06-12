// GET /api/forage/user-completions?userId=<id>
// Recruiter-facing: returns a candidate's COMPLETED Forage simulations (verified
// work-experience signal) for HR/pipeline views. Any logged-in user may call it;
// only completed attempts and non-sensitive fields are returned.

import { NextRequest } from 'next/server'
import { forageDb, resolveUserId } from '@/lib/forage-server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const db = forageDb()

  // Must be an authenticated user (student or recruiter)
  const { userId: caller, error } = await resolveUserId(req, db)
  if (!caller) return Response.json({ error: error ?? 'Unauthorized' }, { status: 401 })

  const target = req.nextUrl.searchParams.get('userId')?.trim()
  if (!target) return Response.json({ error: 'userId is required' }, { status: 400 })

  const { data, error: dbErr } = await db
    .from('forage_attempts')
    .select('program_id, company, title, score, certificate_verified, completed_at, attempt_number')
    .eq('user_id', target)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
  if (dbErr) return Response.json({ error: dbErr.message }, { status: 500 })

  return Response.json({
    completions: data ?? [],
    verifiedCount: (data ?? []).filter(c => c.certificate_verified).length,
  })
}
