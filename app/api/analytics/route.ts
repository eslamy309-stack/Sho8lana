// /api/analytics — Unified analytics aggregation endpoint
// GET ?scope=company   → analytics for authenticated company
// GET ?scope=platform  → full platform analytics (admin only)

import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { extractApiKey, hashApiKey, gatewayError, gatewaySuccess } from '@/lib/integration-gateway'

export async function GET(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
  const { searchParams } = req.nextUrl
  const scope  = searchParams.get('scope') ?? 'company'
  const period = searchParams.get('period') ?? 'month'

  // Authenticate
  const raw = extractApiKey(req.headers.get('authorization'))
  if (!raw) return gatewayError(401, 'UNAUTHORIZED', 'Missing API key')

  const keyHash = await hashApiKey(raw)
  const { data: key } = await supabase
    .from('api_keys')
    .select('company_id, permissions, is_active')
    .eq('key_hash', keyHash)
    .eq('is_active', true)
    .single()

  if (!key) return gatewayError(401, 'UNAUTHORIZED', 'Invalid API key')

  const companyId = key.company_id as string

  // ── Company-scoped analytics ───────────────────────────────────────────────

  if (scope === 'company') {
    // Time filter
    const since = getPeriodStart(period)

    const [sessions, results, events, endpoints] = await Promise.all([
      supabase
        .from('simulation_sessions')
        .select('status, final_score, xp_awarded, duration_seconds, started_at')
        .eq('company_id', companyId)
        .gte('started_at', since.toISOString()),

      supabase
        .from('simulation_results')
        .select('final_score, completion_status, score_accuracy, score_speed, score_decision')
        .eq('company_id', companyId)
        .gte('created_at', since.toISOString()),

      supabase
        .from('integration_events')
        .select('event_type, severity, status_code, duration_ms, created_at')
        .eq('company_id', companyId)
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: false })
        .limit(500),

      supabase
        .from('simulation_endpoints')
        .select('simulation_id, name, is_active, category')
        .eq('company_id', companyId),
    ])

    const s = sessions.data ?? []
    const r = results.data ?? []
    const e = events.data ?? []

    const totalSessions  = s.length
    const completed      = s.filter(x => x.status === 'completed').length
    const avgScore       = r.length > 0 ? avg(r.map(x => x.final_score ?? 0)) : 0
    const avgDuration    = s.length > 0 ? avg(s.map(x => x.duration_seconds ?? 0)) : 0
    const totalXp        = s.reduce((sum, x) => sum + (x.xp_awarded ?? 0), 0)
    const apiCalls       = e.filter(x => x.event_type === 'api.request').length
    const errors         = e.filter(x => x.event_type === 'api.error').length
    const avgLatency     = avg(e.filter(x => x.duration_ms).map(x => x.duration_ms!))

    // Top simulations by session count
    const simCount: Record<string, number> = {}
    s.forEach(sess => {
      // We don't have sim name in sessions directly — use endpoint lookup
    })

    return gatewaySuccess({
      companyId,
      period,
      since: since.toISOString(),
      sessions: {
        total:          totalSessions,
        completed,
        completionRate: totalSessions > 0 ? +(completed / totalSessions).toFixed(3) : 0,
        avgFinalScore:  +avgScore.toFixed(1),
        avgDurationSeconds: +avgDuration.toFixed(0),
        totalXpAwarded: totalXp,
      },
      scores: {
        avgOverall:   +avgScore.toFixed(1),
        avgAccuracy:  +(r.length > 0 ? avg(r.map(x => x.score_accuracy ?? 0)) : 0).toFixed(1),
        avgSpeed:     +(r.length > 0 ? avg(r.map(x => x.score_speed ?? 0)) : 0).toFixed(1),
        avgDecision:  +(r.length > 0 ? avg(r.map(x => x.score_decision ?? 0)) : 0).toFixed(1),
      },
      api: {
        totalCalls:  apiCalls,
        errorCount:  errors,
        errorRate:   apiCalls > 0 ? +(errors / apiCalls).toFixed(3) : 0,
        avgLatencyMs: +avgLatency.toFixed(0),
      },
      simulations: {
        total:  (endpoints.data ?? []).length,
        active: (endpoints.data ?? []).filter(x => x.is_active).length,
      },
      recentEvents: e.slice(0, 20),
    })
  }

  // ── Platform-wide (admin key required) ────────────────────────────────────

  if (scope === 'platform') {
    if (!(key.permissions as string[]).includes('admin')) {
      return gatewayError(403, 'FORBIDDEN', 'admin permission required for platform analytics')
    }

    const { data: summary } = await supabase.rpc('get_platform_analytics')
    const { data: companies } = await supabase
      .from('company_analytics_summary')
      .select('*')

    return gatewaySuccess({ platform: summary, companies })
  }

  return gatewayError(400, 'INVALID_SCOPE', 'scope must be "company" or "platform"')
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0
  return nums.reduce((s, n) => s + n, 0) / nums.length
}

function getPeriodStart(period: string): Date {
  const now = new Date()
  switch (period) {
    case 'day':   return new Date(now.getTime() - 86_400_000)
    case 'week':  return new Date(now.getTime() - 7 * 86_400_000)
    case 'month': return new Date(now.getTime() - 30 * 86_400_000)
    default:      return new Date(0)   // 'alltime'
  }
}
