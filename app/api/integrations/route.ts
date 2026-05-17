// /api/integrations — Company integration CRUD
// GET  → list all integrations (platform admin only)
// POST → register a new company integration

import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateApiKey, gatewayError, gatewaySuccess } from '@/lib/integration-gateway'
import type { CompanyIntegrationCreate } from '@/lib/integration-types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const status = searchParams.get('status')
  const tier   = searchParams.get('tier')
  const limit  = Math.min(parseInt(searchParams.get('limit') ?? '50'), 200)
  const offset = parseInt(searchParams.get('offset') ?? '0')

  let query = supabase
    .from('company_integrations')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) query = query.eq('status', status)
  if (tier)   query = query.eq('tier', tier)

  const { data, count, error } = await query
  if (error) return gatewayError(500, 'DB_ERROR', error.message)

  return gatewaySuccess(data, 200, { total: count, limit, offset })
}

export async function POST(req: NextRequest) {
  let body: CompanyIntegrationCreate
  try {
    body = await req.json()
  } catch {
    return gatewayError(400, 'INVALID_JSON', 'Request body must be valid JSON')
  }

  // Validate required fields
  const missing = ['companyId', 'companyName', 'contactEmail'].filter(f => !body[f as keyof typeof body])
  if (missing.length) {
    return gatewayError(400, 'MISSING_FIELDS', `Required fields: ${missing.join(', ')}`)
  }

  // Email format
  if (!/\S+@\S+\.\S+/.test(body.contactEmail)) {
    return gatewayError(400, 'INVALID_EMAIL', 'contactEmail is not a valid email address')
  }

  // Slug format
  if (!/^[a-z0-9-]{3,40}$/.test(body.companyId)) {
    return gatewayError(400, 'INVALID_COMPANY_ID', 'companyId must be 3-40 lowercase alphanumeric chars and hyphens')
  }

  // Insert company
  const { data: company, error: insertErr } = await supabase
    .from('company_integrations')
    .insert([{
      company_id:         body.companyId,
      company_name:       body.companyName,
      contact_email:      body.contactEmail,
      logo_url:           body.logoUrl,
      base_url:           body.baseUrl,
      tier:               body.tier ?? 'standard',
      rate_limit_per_min: body.rateLimitPerMin ?? 100,
      ip_whitelist:       body.ipWhitelist ?? [],
      allowed_origins:    body.allowedOrigins ?? [],
      status:             'pending',
    }])
    .select()
    .single()

  if (insertErr) {
    if (insertErr.code === '23505') {
      return gatewayError(409, 'CONFLICT', `Company ID "${body.companyId}" is already registered`)
    }
    return gatewayError(500, 'DB_ERROR', insertErr.message)
  }

  // Generate initial live + test API keys
  const [liveKey, testKey] = await Promise.all([
    generateApiKey('live'),
    generateApiKey('test'),
  ])

  await supabase.from('api_keys').insert([
    {
      key_hash:   liveKey.keyHash,
      key_prefix: liveKey.keyPrefix,
      company_id: body.companyId,
      name:       'Default Live Key',
      environment:'live',
      permissions: ['simulations:read','simulations:write','simulations:execute','analytics:read','webhooks:write'],
    },
    {
      key_hash:   testKey.keyHash,
      key_prefix: testKey.keyPrefix,
      company_id: body.companyId,
      name:       'Default Test Key',
      environment:'test',
      permissions: ['simulations:read','simulations:write','simulations:execute','analytics:read','webhooks:write'],
    },
  ])

  await supabase.from('integration_events').insert([{
    company_id: body.companyId,
    event_type: 'key.created',
    severity:   'info',
    metadata:   { event: 'company_registered', tier: body.tier ?? 'standard' },
  }])

  return gatewaySuccess(
    {
      company,
      keys: {
        live: { prefix: liveKey.keyPrefix, rawKey: liveKey.rawKey },
        test: { prefix: testKey.keyPrefix, rawKey: testKey.rawKey },
      },
      warning: 'Store these keys securely — they will NOT be shown again.',
    },
    201,
  )
}
