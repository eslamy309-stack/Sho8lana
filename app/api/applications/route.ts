import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const FREE_MONTHLY_LIMIT = 5

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  )
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      userId,
      jobId,          // UUID — set for company-posted DB jobs, null for external
      jobTitle,
      company,
      companyLogo,
      coverNote,
      externalJobId,  // e.g. JSearch job_id or Wuzzuf 'w1'
      externalUrl,    // direct link to the original posting
      source,         // 'linkedin' | 'wuzzuf' | 'company'
    } = body

    if (!userId) {
      return NextResponse.json({ error: 'You must be signed in to apply.' }, { status: 401 })
    }
    if (!jobId && !externalJobId && !externalUrl) {
      return NextResponse.json({ error: 'Missing job reference.' }, { status: 400 })
    }

    const db = getAdmin()

    // ── Duplicate check ───────────────────────────────────────────────────────
    let dupQuery = db.from('applications').select('id').eq('user_id', userId)
    if (jobId) {
      dupQuery = dupQuery.eq('job_id', jobId)
    } else if (externalJobId) {
      dupQuery = dupQuery.eq('external_job_id', externalJobId)
    } else {
      dupQuery = dupQuery.eq('external_url', externalUrl)
    }
    const { data: existing } = await dupQuery.maybeSingle()
    if (existing) {
      return NextResponse.json({ error: 'You have already applied to this position.' }, { status: 409 })
    }

    // ── Free-plan limit: 5 applications per calendar month ───────────────────
    const { data: profile } = await db
      .from('profiles')
      .select('subscription')
      .eq('id', userId)
      .maybeSingle()

    const subscription = profile?.subscription ?? 'free'
    if (subscription === 'free') {
      const monthStart = new Date()
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)
      const { count } = await db
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('applied_at', monthStart.toISOString())

      if ((count ?? 0) >= FREE_MONTHLY_LIMIT) {
        return NextResponse.json({
          error: `Free plan limit reached (${FREE_MONTHLY_LIMIT} applications/month). Upgrade to Pro for unlimited applications.`,
          limitReached: true,
        }, { status: 429 })
      }
    }

    // ── Insert application ────────────────────────────────────────────────────
    const { data, error } = await db.from('applications').insert({
      user_id:         userId,
      job_id:          jobId ?? null,
      job_title:       jobTitle ?? null,
      company:         company ?? null,
      company_logo:    companyLogo ?? null,
      cover_note:      coverNote ?? '',
      status:          'applied',
      applied_at:      new Date().toISOString(),
      external_job_id: externalJobId ?? null,
      external_url:    externalUrl ?? null,
      source:          source ?? 'company',
    }).select().single()

    if (error) throw error
    return NextResponse.json({ application: data })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

  const db = getAdmin()
  const { data, error } = await db
    .from('applications')
    .select('*')
    .eq('user_id', userId)
    .order('applied_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ applications: data })
}
