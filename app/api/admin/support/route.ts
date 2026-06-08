import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthorized } from '@/lib/adminAuth'
import { createAdminClient } from '@/lib/supabaseAdmin'

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createAdminClient()
  const { data, error } = await db
    .from('support_tickets')
    .select('id,ticket_ref,subject,user_name,user_email,category,priority,status,created_at,body')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ tickets: data ?? [] })
}

export async function PATCH(req: NextRequest) {
  if (!isAdminAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, status } = await req.json()
  if (!id || !status) return NextResponse.json({ error: 'id and status required' }, { status: 400 })

  const db = createAdminClient()
  const dbStatus = status === 'Open' ? 'open' : status === 'In Progress' ? 'in_progress' : 'resolved'
  const { error } = await db.from('support_tickets').update({ status: dbStatus }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
