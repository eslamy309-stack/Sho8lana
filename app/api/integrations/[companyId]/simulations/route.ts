// /api/integrations/{companyId}/simulations — Simulation endpoint CRUD

import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  extractApiKey, hashApiKey, assertTenantAccess,
  gatewayError, gatewaySuccess,
} from '@/lib/integration-gateway'
import type { SimulationEndpointCreate } from '@/lib/integration-types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

async function auth(req: NextRequest, companyId: string) {
  const raw = extractApiKey(req.headers.get('authorization'))
  if (!raw) throw new Error('Missing API key')

  const keyHash = await hashApiKey(raw)
  const { data: key } = await supabase
    .from('api_keys')
    .select('company_id, permissions, is_active, expires_at')
    .eq('key_hash', keyHash)
    .eq('is_active', true)
    .single()

  if (!key) throw new Error('Invalid API key')
  if (key.expires_at && new Date(key.expires_at) < new Date()) throw new Error('Key expired')

  assertTenantAccess(companyId, key.company_id)
  return key
}

export async function GET(
  req: NextRequest,
  { params }: { params: { companyId: string } },
) {
  try { await auth(req, params.companyId) }
  catch (e) { return gatewayError(401, 'UNAUTHORIZED', (e as Error).message) }

  const { searchParams } = req.nextUrl
  const category = searchParams.get('category')
  const sandbox  = searchParams.get('sandbox')

  let query = supabase
    .from('simulation_endpoints')
    .select('*')
    .eq('company_id', params.companyId)
    .order('created_at', { ascending: false })

  if (category) query = query.eq('category', category)
  if (sandbox !== null) query = query.eq('is_sandbox', sandbox === 'true')

  const { data, error } = await query
  if (error) return gatewayError(500, 'DB_ERROR', error.message)

  return gatewaySuccess(data)
}

export async function POST(
  req: NextRequest,
  { params }: { params: { companyId: string } },
) {
  try { await auth(req, params.companyId) }
  catch (e) { return gatewayError(401, 'UNAUTHORIZED', (e as Error).message) }

  let body: SimulationEndpointCreate
  try { body = await req.json() }
  catch { return gatewayError(400, 'INVALID_JSON', 'Request body must be valid JSON') }

  const missing = ['simulationId','name','description','endpointUrl','category','difficulty','estimatedDurationMins']
    .filter(f => body[f as keyof typeof body] === undefined || body[f as keyof typeof body] === '')
  if (missing.length) return gatewayError(400, 'MISSING_FIELDS', `Required: ${missing.join(', ')}`)

  if (!/^[a-z0-9-]{2,60}$/.test(body.simulationId)) {
    return gatewayError(400, 'INVALID_SIM_ID', 'simulationId must be 2-60 lowercase alphanumeric/hyphen')
  }

  try { new URL(body.endpointUrl) }
  catch { return gatewayError(400, 'INVALID_URL', 'endpointUrl must be a valid HTTPS URL') }

  const { data, error } = await supabase
    .from('simulation_endpoints')
    .insert([{
      simulation_id:           body.simulationId,
      company_id:              params.companyId,
      name:                    body.name,
      name_ar:                 body.nameAr,
      description:             body.description,
      description_ar:          body.descriptionAr,
      endpoint_url:            body.endpointUrl,
      delivery:                body.delivery ?? 'api',
      method:                  body.method ?? 'POST',
      auth_type:               body.authType ?? 'api_key',
      auth_config:             body.authConfig ?? {},
      category:                body.category,
      difficulty:              body.difficulty,
      estimated_duration_mins: body.estimatedDurationMins,
      xp_reward:               body.xpReward ?? 100,
      tags:                    body.tags ?? [],
      is_active:               true,
      is_sandbox:              false,
    }])
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return gatewayError(409, 'CONFLICT', `Simulation ID "${body.simulationId}" already exists for this company`)
    return gatewayError(500, 'DB_ERROR', error.message)
  }

  return gatewaySuccess(data, 201)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { companyId: string } },
) {
  try { await auth(req, params.companyId) }
  catch (e) { return gatewayError(401, 'UNAUTHORIZED', (e as Error).message) }

  const simId = req.nextUrl.searchParams.get('simulationId')
  if (!simId) return gatewayError(400, 'MISSING_PARAM', 'simulationId query param required')

  const { error } = await supabase
    .from('simulation_endpoints')
    .update({ is_active: false })
    .eq('company_id', params.companyId)
    .eq('simulation_id', simId)

  if (error) return gatewayError(500, 'DB_ERROR', error.message)
  return gatewaySuccess({ deleted: true })
}
