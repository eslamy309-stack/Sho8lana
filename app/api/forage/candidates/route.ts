// GET /api/forage/candidates?program=<id>&verifiedOnly=true
// Recruiter-facing talent search: returns real candidates who completed Forage
// simulations, grouped with their completion list. Powers the "Forage-verified"
// filter in the Talent marketplace. Any authenticated user may query it; only
// completed (non-sensitive) attempt data + basic profile fields are returned.

import { NextRequest } from 'next/server'
import { forageDb, resolveUserId } from '@/lib/forage-server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface Completion {
  program_id: string
  company: string
  title: string
  score: number | null
  certificate_verified: boolean
  completed_at: string | null
}

export async function GET(req: NextRequest) {
  const db = forageDb()

  const { userId: caller, error } = await resolveUserId(req, db)
  if (!caller) return Response.json({ error: error ?? 'Unauthorized' }, { status: 401 })

  const program      = req.nextUrl.searchParams.get('program')?.trim()
  const verifiedOnly = req.nextUrl.searchParams.get('verifiedOnly') === 'true'

  // 1) Completed attempts (optionally filtered)
  let q = db
    .from('forage_attempts')
    .select('user_id, program_id, company, title, score, certificate_verified, completed_at')
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(1000)
  if (program && program !== 'all') q = q.eq('program_id', program)
  if (verifiedOnly)                 q = q.eq('certificate_verified', true)

  const { data: attempts, error: aErr } = await q
  if (aErr) return Response.json({ error: aErr.message }, { status: 500 })
  if (!attempts || attempts.length === 0) return Response.json({ candidates: [] })

  // 2) Group completions by user
  const byUser = new Map<string, Completion[]>()
  for (const a of attempts) {
    const list = byUser.get(a.user_id as string) ?? []
    list.push({
      program_id: a.program_id as string,
      company: a.company as string,
      title: a.title as string,
      score: a.score as number | null,
      certificate_verified: Boolean(a.certificate_verified),
      completed_at: a.completed_at as string | null,
    })
    byUser.set(a.user_id as string, list)
  }

  // 3) Enrich with profile basics
  const userIds = [...byUser.keys()]
  const { data: profiles } = await db
    .from('profiles')
    .select('id, name, university, major, kpi_score')
    .in('id', userIds)
  const profMap = new Map((profiles ?? []).map(p => [p.id as string, p]))

  // 4) Build + sort candidates
  const candidates = userIds.map(uid => {
    const completions = byUser.get(uid)!
    const prof = profMap.get(uid)
    return {
      userId: uid,
      name: (prof?.name as string) || 'Candidate',
      university: (prof?.university as string) || '',
      major: (prof?.major as string) || '',
      kpiScore: (prof?.kpi_score as number) ?? 0,
      verifiedCount: completions.filter(c => c.certificate_verified).length,
      completionCount: completions.length,
      completions,
    }
  }).sort((a, b) =>
    b.verifiedCount - a.verifiedCount ||
    b.completionCount - a.completionCount ||
    b.kpiScore - a.kpiScore,
  )

  return Response.json({ candidates })
}
