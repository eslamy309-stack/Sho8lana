import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthorized } from '@/lib/adminAuth'
import { createAdminClient } from '@/lib/supabaseAdmin'

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createAdminClient()
  const { data, error } = await db
    .from('companies')
    .select('id,name,industry,subscription_plan,status,created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ companies: data ?? [] })
}

export async function PATCH(req: NextRequest) {
  if (!isAdminAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, status } = await req.json()
  if (!id || !status) return NextResponse.json({ error: 'id and status required' }, { status: 400 })

  const db = createAdminClient()
  const dbStatus = status === 'Active' ? 'active' : status === 'Suspended' ? 'suspended' : 'pending'
  const extra = dbStatus === 'active' ? { approved_at: new Date().toISOString(), approved_by: 'admin' } : {}

  const { error } = await db.from('companies').update({ status: dbStatus, ...extra }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
