// /api/apikeys — API Key management
// GET  → list keys for company
// POST → create new key
// DELETE → revoke a key

import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  extractApiKey, hashApiKey, generateApiKey, hasPermission,
  gatewayError, gatewaySuccess,
} from '@/lib/integration-gateway'
import type { ApiKeyPermission, ApiKeyEnvironment } from '@/lib/integration-types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

async function authenticate(req: NextRequest) {
  const raw = extractApiKey(req.headers.get('authorization'))
  if (!raw) throw new Error('Missing API key')
  const keyHash = await hashApiKey(raw)
  const { data: key } = await supabase
    .from('api_keys')
    .select('*')
    .eq('key_hash', keyHash)
    .eq('is_active', true)
    .single()
  if (!key) throw new Error('Invalid or inactive API key')
  return key as {
    company_id: string
    permissions: ApiKeyPermission[]
    environment: ApiKeyEnvironment
  }
}

export async function GET(req: NextRequest) {
  let authKey: Awaited<ReturnType<typeof authenticate>>
  try { authKey = await authenticate(req) }
  catch (e) { return gatewayError(401, 'UNAUTHORIZED', (e as Error).message) }

  if (!hasPermission(authKey.permissions, 'keys:read')) {
    return gatewayError(403, 'FORBIDDEN', 'keys:read permission required')
  }

  const { data, error } = await supabase
    .from('api_keys')
    .select('id, key_prefix, name, environment, permissions, is_active, last_used_at, expires_at, created_at')
    .eq('company_id', authKey.company_id)
    .order('created_at', { ascending: false })

  if (error) return gatewayError(500, 'DB_ERROR', error.message)
  return gatewaySuccess(data)
}

export async function POST(req: NextRequest) {
  let authKey: Awaited<ReturnType<typeof authenticate>>
  try { authKey = await authenticate(req) }
  catch (e) { return gatewayError(401, 'UNAUTHORIZED', (e as Error).message) }

  if (!hasPermission(authKey.permissions, 'keys:write')) {
    return gatewayError(403, 'FORBIDDEN', 'keys:write permission required')
  }

  let body: { name: string; environment?: ApiKeyEnvironment; permissions?: ApiKeyPermission[]; expiresAt?: string }
  try { body = await req.json() }
  catch { return gatewayError(400, 'INVALID_JSON', 'Request body must be valid JSON') }

  if (!body.name?.trim()) return gatewayError(400, 'MISSING_FIELDS', 'name is required')

  const env        = body.environment ?? 'live'
  const generated  = await generateApiKey(env)

  const defaultPerms: ApiKeyPermission[] = ['simulations:read','simulations:write','simulations:execute','analytics:read']
  const permissions = body.permissions ?? defaultPerms

  const { data, error } = await supabase
    .from('api_keys')
    .insert([{
      key_hash:   generated.keyHash,
      key_prefix: generated.keyPrefix,
      company_id: authKey.company_id,
      name:       body.name.trim(),
      environment: env,
      permissions,
      expires_at: body.expiresAt ?? null,
    }])
    .select('id, key_prefix, name, environment, permissions, is_active, created_at')
    .single()

  if (error) return gatewayError(500, 'DB_ERROR', error.message)

  await supabase.from('integration_events').insert([{
    company_id: authKey.company_id,
    event_type: 'key.created',
    severity:   'info',
    metadata:   { key_prefix: generated.keyPrefix, name: body.name, environment: env },
  }])

  return gatewaySuccess(
    { ...data, rawKey: generated.rawKey, warning: 'Store this key securely — it will NOT be shown again.' },
    201,
  )
}

export async function DELETE(req: NextRequest) {
  let authKey: Awaited<ReturnType<typeof authenticate>>
  try { authKey = await authenticate(req) }
  catch (e) { return gatewayError(401, 'UNAUTHORIZED', (e as Error).message) }

  if (!hasPermission(authKey.permissions, 'keys:write')) {
    return gatewayError(403, 'FORBIDDEN', 'keys:write permission required')
  }

  const keyId = req.nextUrl.searchParams.get('id')
  if (!keyId) return gatewayError(400, 'MISSING_PARAM', 'id query param required')

  const { error } = await supabase
    .from('api_keys')
    .update({ is_active: false })
    .eq('id', keyId)
    .eq('company_id', authKey.company_id)   // tenant isolation

  if (error) return gatewayError(500, 'DB_ERROR', error.message)

  await supabase.from('integration_events').insert([{
    company_id: authKey.company_id,
    event_type: 'key.revoked',
    severity:   'warning',
    metadata:   { revoked_key_id: keyId },
  }])

  return gatewaySuccess({ revoked: true })
}
