// ═══════════════════════════════════════════════════════════════════════════════
// API Gateway — /api/gateway/{companyId}/{simulationId}/{...rest}
//
// Responsibilities:
//   1. Authenticate API key
//   2. Enforce rate limiting
//   3. Validate tenant isolation
//   4. Check IP whitelist
//   5. Forward request to registered simulation endpoint
//   6. Log request to audit trail
// ═══════════════════════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  extractApiKey, hashApiKey, assertTenantAccess,
  checkRateLimit, isIpAllowed, proxyRequest,
  gatewayError, gatewaySuccess, gatewayHeaders,
  TenantIsolationError, AuthenticationError, RateLimitError,
  buildAuditRecord,
} from '@/lib/integration-gateway'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

// ── Auth + context loader ─────────────────────────────────────────────────────

async function resolveApiKey(rawKey: string) {
  const keyHash = await hashApiKey(rawKey)

  const { data: key, error } = await supabase
    .from('api_keys')
    .select('*, company_integrations(*)')
    .eq('key_hash', keyHash)
    .eq('is_active', true)
    .single()

  if (error || !key) throw new AuthenticationError()
  if (key.expires_at && new Date(key.expires_at) < new Date()) {
    throw new AuthenticationError('API key has expired')
  }

  // Touch last_used_at (fire-and-forget)
  supabase.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', key.id)

  return key
}

// ── Audit logger ──────────────────────────────────────────────────────────────

async function logEvent(record: ReturnType<typeof buildAuditRecord>) {
  await supabase.from('integration_events').insert([{
    company_id:    record.companyId,
    event_type:    record.eventType,
    severity:      record.severity,
    request_path:  record.requestPath,
    status_code:   record.statusCode,
    duration_ms:   record.durationMs,
    ip_address:    record.ipAddress,
    error_message: record.errorMessage,
    metadata:      record.metadata ?? {},
  }])
}

// ── Main handler ──────────────────────────────────────────────────────────────

async function handler(req: NextRequest, { params }: { params: Promise<{ segments: string[] }> }) {
  const start     = Date.now()
  const { segments: rawSegments } = await params
  const segments  = rawSegments ?? []
  const companyId = segments[0]
  const simId     = segments[1]
  const rest      = segments.slice(2).join('/')

  const ip        = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const userAgent = req.headers.get('user-agent') ?? ''

  if (!companyId || !simId) {
    return gatewayError(400, 'INVALID_PATH', 'Path must be /api/gateway/{companyId}/{simulationId}[/...]')
  }

  // ── 1. Extract & authenticate API key ────────────────────────────────────────
  let apiKey: Awaited<ReturnType<typeof resolveApiKey>>
  try {
    const raw = extractApiKey(req.headers.get('authorization'))
    if (!raw) throw new AuthenticationError()
    apiKey = await resolveApiKey(raw)
  } catch (e) {
    await logEvent(buildAuditRecord({
      companyId, eventType: 'key.auth_failed', severity: 'warning',
      requestPath: req.nextUrl.pathname, statusCode: 401,
      ipAddress: ip, errorMessage: (e as Error).message,
    }))
    return gatewayError(401, 'UNAUTHORIZED', (e as Error).message)
  }

  const company = (apiKey as Record<string, unknown>).company_integrations as Record<string, unknown>

  // ── 2. Tenant isolation ───────────────────────────────────────────────────────
  try {
    assertTenantAccess(companyId, String(company.company_id))
  } catch (e) {
    if (e instanceof TenantIsolationError) {
      await logEvent(buildAuditRecord({
        companyId, eventType: 'tenant.isolated', severity: 'error',
        requestPath: req.nextUrl.pathname, statusCode: 403, ipAddress: ip,
        errorMessage: e.message,
      }))
      return gatewayError(403, 'FORBIDDEN', e.message)
    }
  }

  // ── 3. IP whitelist ───────────────────────────────────────────────────────────
  const whitelist = (company.ip_whitelist as string[]) ?? []
  if (!isIpAllowed(ip, whitelist)) {
    await logEvent(buildAuditRecord({
      companyId, eventType: 'ip.blocked', severity: 'warning',
      requestPath: req.nextUrl.pathname, statusCode: 403, ipAddress: ip,
    }))
    return gatewayError(403, 'IP_BLOCKED', `IP address ${ip} is not whitelisted`)
  }

  // ── 4. Rate limiting ──────────────────────────────────────────────────────────
  const limit  = (company.rate_limit_per_min as number) ?? 100
  const rlKey  = `${companyId}:${(apiKey as Record<string, unknown>).key_prefix}`
  const rl     = checkRateLimit(rlKey, limit)
  if (!rl.allowed) {
    await logEvent(buildAuditRecord({
      companyId, eventType: 'rate_limit.hit', severity: 'warning',
      requestPath: req.nextUrl.pathname, statusCode: 429, ipAddress: ip,
      metadata: { retryAfterMs: rl.retryAfterMs },
    }))
    return new Response(
      JSON.stringify({ error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' }, retryAfterMs: rl.retryAfterMs }),
      { status: 429, headers: { ...gatewayHeaders(), 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) } },
    )
  }

  // ── 5. Look up simulation endpoint ────────────────────────────────────────────
  const { data: sim, error: simErr } = await supabase
    .from('simulation_endpoints')
    .select('*')
    .eq('company_id', companyId)
    .eq('simulation_id', simId)
    .eq('is_active', true)
    .single()

  if (simErr || !sim) {
    return gatewayError(404, 'SIMULATION_NOT_FOUND', `No active simulation "${simId}" for company "${companyId}"`)
  }

  // ── 6. Proxy to company server ────────────────────────────────────────────────
  const targetUrl = rest ? `${sim.endpoint_url}/${rest}` : sim.endpoint_url
  const bodyText  = ['POST','PUT','PATCH'].includes(req.method) ? await req.text() : undefined

  // Build forwarded headers (strip sensitive internal headers)
  const forwardHeaders: Record<string, string> = {
    'Content-Type':        req.headers.get('content-type') ?? 'application/json',
    'X-Sho8lana-Company':  companyId,
    'X-Sho8lana-Sim':      simId,
    'X-Forwarded-For':     ip,
    'User-Agent':          `Sho8lana-Gateway/1.0 (${userAgent})`,
  }

  // Inject company auth credentials if configured
  const authCfg = (sim.auth_config ?? {}) as Record<string, string>
  if (sim.auth_type === 'api_key' && authCfg.headerName && authCfg.headerValue) {
    forwardHeaders[authCfg.headerName] = authCfg.headerValue
  }

  let upstreamStatus = 502
  let responseBody: unknown = null
  let durationMs = 0

  try {
    const result = await proxyRequest({
      targetUrl,
      method:    req.method,
      headers:   forwardHeaders,
      body:      bodyText,
      timeoutMs: 30_000,
    })
    upstreamStatus = result.status
    responseBody   = result.body
    durationMs     = result.durationMs
  } catch (err) {
    await logEvent(buildAuditRecord({
      companyId, eventType: 'api.error', severity: 'error',
      requestPath: req.nextUrl.pathname, statusCode: 502,
      durationMs: Date.now() - start, ipAddress: ip,
      errorMessage: (err as Error).message,
    }))
    return gatewayError(502, 'UPSTREAM_ERROR', (err as Error).message)
  }

  // ── 7. Audit log ──────────────────────────────────────────────────────────────
  await logEvent(buildAuditRecord({
    companyId, eventType: 'api.request', severity: upstreamStatus >= 400 ? 'warning' : 'info',
    requestPath: req.nextUrl.pathname, statusCode: upstreamStatus,
    durationMs, ipAddress: ip,
    metadata: { simulationId: simId, method: req.method, remaining: rl.allowed ? rl.remaining : 0 },
  }))

  return Response.json(responseBody, {
    status:  upstreamStatus,
    headers: {
      ...gatewayHeaders(),
      'X-Gateway-Duration-Ms': String(durationMs),
      'X-RateLimit-Remaining': String(rl.allowed ? rl.remaining : 0),
    },
  })
}

export const GET    = handler
export const POST   = handler
export const PUT    = handler
export const PATCH  = handler
export const DELETE = handler
