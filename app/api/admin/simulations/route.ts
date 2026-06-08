import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthorized } from '@/lib/adminAuth'
import { createAdminClient } from '@/lib/supabaseAdmin'

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createAdminClient()
  const { data, error } = await db
    .from('simulation_submissions')
    .select('id,title,company_name,category,created_at,status,description,duration_mins,rejection_reason')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ simulations: data ?? [] })
}

export async function PATCH(req: NextRequest) {
  if (!isAdminAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, status, rejectionReason } = await req.json()
  if (!id || !status) return NextResponse.json({ error: 'id and status required' }, { status: 400 })

  const db = createAdminClient()
  const update: Record<string, unknown> = {
    status,
    reviewed_at: new Date().toISOString(),
    reviewed_by: 'admin',
  }
  if (rejectionReason) update.rejection_reason = rejectionReason

  const { error } = await db.from('simulation_submissions').update(update).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
