import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  )
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, jobId, jobTitle, company, companyLogo, coverNote } = body

    if (!userId || !jobId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const db = getAdmin()

    const { data: existing } = await db
      .from('applications')
      .select('id')
      .eq('user_id', userId)
      .eq('job_id', jobId)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Already applied' }, { status: 409 })
    }

    const { data, error } = await db.from('applications').insert({
      user_id:      userId,
      job_id:       jobId,
      job_title:    jobTitle,
      company,
      company_logo: companyLogo,
      cover_note:   coverNote ?? '',
      status:       'applied',
      applied_at:   new Date().toISOString(),
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
