import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthorized } from '@/lib/adminAuth'
import { createAdminClient } from '@/lib/supabaseAdmin'

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createAdminClient()

  const [{ data: students }, { data: companies }] = await Promise.all([
    db.from('profiles')
      .select('id,name,email,subscription,created_at')
      .eq('subscription', 'pro')
      .order('created_at', { ascending: false })
      .limit(200),
    db.from('companies')
      .select('id,name,subscription_plan,subscription_status,subscription_updated_at,created_at')
      .neq('subscription_plan', 'free')
      .order('created_at', { ascending: false })
      .limit(200),
  ])

  return NextResponse.json({
    students: students ?? [],
    companies: companies ?? [],
  })
}
