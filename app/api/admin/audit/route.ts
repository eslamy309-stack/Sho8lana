import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthorized } from '@/lib/adminAuth'
import { createAdminClient } from '@/lib/supabaseAdmin'

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createAdminClient()
  const { data, error } = await db
    .from('audit_logs')
    .select('id,created_at,actor_email,action,description,ip_address')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ entries: data ?? [] })
}
