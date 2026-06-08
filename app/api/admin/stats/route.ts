import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthorized } from '@/lib/adminAuth'
import { createAdminClient } from '@/lib/supabaseAdmin'

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createAdminClient()
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const iso = todayStart.toISOString()

  const [
    { count: students },
    { count: companies },
    { count: activeCompanies },
    { count: pendingCompanies },
    { count: applications },
    { count: simulations },
    { data: activity },
    { count: todayStudents },
    { count: todayCompanies },
    { count: todayApplications },
    { count: todaySimulations },
  ] = await Promise.all([
    db.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    db.from('companies').select('*', { count: 'exact', head: true }),
    db.from('companies').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    db.from('companies').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    db.from('applications').select('*', { count: 'exact', head: true }),
    db.from('simulation_submissions').select('*', { count: 'exact', head: true }),
    db.from('admin_notifications').select('id,type,body,created_at').order('created_at', { ascending: false }).limit(10),
    db.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student').gte('created_at', iso),
    db.from('companies').select('*', { count: 'exact', head: true }).gte('created_at', iso),
    db.from('applications').select('*', { count: 'exact', head: true }).gte('applied_at', iso),
    db.from('simulation_submissions').select('*', { count: 'exact', head: true }).gte('created_at', iso),
  ])

  return NextResponse.json({
    counts: {
      students: students ?? 0,
      companies: companies ?? 0,
      activeCompanies: activeCompanies ?? 0,
      pendingCompanies: pendingCompanies ?? 0,
      applications: applications ?? 0,
      simulations: simulations ?? 0,
    },
    today: {
      students: todayStudents ?? 0,
      companies: todayCompanies ?? 0,
      applications: todayApplications ?? 0,
      simulations: todaySimulations ?? 0,
    },
    recentActivity: activity ?? [],
  })
}
