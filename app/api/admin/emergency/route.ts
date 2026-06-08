import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthorized } from '@/lib/adminAuth'
import { createAdminClient } from '@/lib/supabaseAdmin'

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createAdminClient()
  const { data, error } = await db.from('platform_settings').select('key,value')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ settings: data ?? [] })
}

export async function PATCH(req: NextRequest) {
  if (!isAdminAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { key, value } = await req.json()
  if (!key || value === undefined) return NextResponse.json({ error: 'key and value required' }, { status: 400 })

  const db = createAdminClient()
  const { error } = await db.from('platform_settings')
    .update({ value: value ? 'true' : 'false', updated_at: new Date().toISOString(), updated_by: 'admin' })
    .eq('key', key)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { action } = await req.json()
  if (action !== 'reset') return NextResponse.json({ error: 'Unknown action' }, { status: 400 })

  const db = createAdminClient()
  const { data, error } = await db.rpc('perform_platform_reset')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ result: data })
}
