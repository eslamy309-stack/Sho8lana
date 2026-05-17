// ═══════════════════════════════════════════════════════════════════════════════
// Integration Gateway Utilities
// API key lifecycle, HMAC signing, rate limiting, tenant isolation
// ═══════════════════════════════════════════════════════════════════════════════

import type { RateLimitResult, ApiKeyPermission, ApiKeyEnvironment } from './integration-types'

// ── Crypto helpers (Web Crypto API — works in Next.js edge/node) ───────────────

async function sha256Hex(input: string): Promise<string> {
  const enc  = new TextEncoder()
  const data = enc.encode(input)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const enc        = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', keyMaterial, enc.encode(message))
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

// ── Random generation ─────────────────────────────────────────────────────────

function randomBytes(length: number): string {
  const arr = new Uint8Array(length)
  crypto.getRandomValues(arr)
  return Array.from(arr)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

function generateId(prefix = ''): string {
  return `${prefix}${randomBytes(12)}`
}

// ── API Key Management ────────────────────────────────────────────────────────

export interface GeneratedApiKey {
  rawKey: string       // Full key — shown to user ONCE, never stored
  keyHash: string      // SHA-256 hash stored in DB
  keyPrefix: string    // First 12 chars for display: "sk_live_ab12"
  environment: ApiKeyEnvironment
}

export async function generateApiKey(environment: ApiKeyEnvironment = 'live'): Promise<GeneratedApiKey> {
  const secret   = randomBytes(24)             // 48 hex chars of entropy
  const rawKey   = `sk_${environment}_${secret}`
  const keyHash  = await sha256Hex(rawKey)
  const keyPrefix = rawKey.substring(0, 16)    // "sk_live_ab12cd34"
  return { rawKey, keyHash, keyPrefix, environment }
}

export async function hashApiKey(rawKey: string): Promise<string> {
  return sha256Hex(rawKey)
}

export function extractKeyPrefix(rawKey: string): string {
  return rawKey.substring(0, 16)
}

export function isTestKey(rawKey: string): boolean {
  return rawKey.startsWith('sk_test_')
}

// ── Webhook Secret ────────────────────────────────────────────────────────────

export interface GeneratedWebhookSecret {
  rawSecret: string
  secretHash: string
  secretPrefix: string
}

export async function generateWebhookSecret(): Promise<GeneratedWebhookSecret> {
  const rawSecret    = `whsec_${randomBytes(20)}`
  const secretHash   = await sha256Hex(rawSecret)
  const secretPrefix = rawSecret.substring(0, 14)
  return { rawSecret, secretHash, secretPrefix }
}

// ── Request Signing (HMAC-SHA256) ─────────────────────────────────────────────
//
// Signature format (for both outbound webhooks and inbound verification):
//   header: X-Sho8lana-Signature: t=<timestamp>,v1=<hex_hmac>
//   signed payload: "<timestamp>.<body_string>"
//

export async function signWebhookPayload(
  secret: string,
  body: string,
  timestamp = Date.now(),
): Promise<string> {
  const payload   = `${timestamp}.${body}`
  const signature = await hmacSha256Hex(secret, payload)
  return `t=${timestamp},v1=${signature}`
}

export async function verifyWebhookSignature(
  secret: string,
  body: string,
  signatureHeader: string,
  toleranceMs = 300_000,   // 5 minutes
): Promise<boolean> {
  try {
    const parts     = Object.fromEntries(signatureHeader.split(',').map(p => p.split('=')))
    const timestamp = parseInt(parts['t'] ?? '0', 10)
    const received  = parts['v1'] ?? ''

    if (Math.abs(Date.now() - timestamp) > toleranceMs) return false  // replay attack

    const expected = await hmacSha256Hex(secret, `${timestamp}.${body}`)
    return constantTimeEqual(expected, received)
  } catch {
    return false
  }
}

// ── Permission checking ───────────────────────────────────────────────────────

export function hasPermission(
  keyPermissions: ApiKeyPermission[],
  required: ApiKeyPermission,
): boolean {
  if (keyPermissions.includes('admin')) return true
  return keyPermissions.includes(required)
}

export function hasAnyPermission(
  keyPermissions: ApiKeyPermission[],
  required: ApiKeyPermission[],
): boolean {
  return required.some(p => hasPermission(keyPermissions, p))
}

// ── Tenant Isolation ──────────────────────────────────────────────────────────

export interface TenantContext {
  companyId: string
  simulationId?: string
  userId?: string
}

export function assertTenantAccess(
  requestedCompanyId: string,
  authedCompanyId: string,
): void {
  if (requestedCompanyId !== authedCompanyId) {
    throw new TenantIsolationError(
      `Tenant isolation violation: key belongs to "${authedCompanyId}" but request targets "${requestedCompanyId}"`,
    )
  }
}

export class TenantIsolationError extends Error {
  statusCode = 403
  constructor(message: string) {
    super(message)
    this.name = 'TenantIsolationError'
  }
}

export class AuthenticationError extends Error {
  statusCode = 401
  constructor(message = 'Invalid or missing API key') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class RateLimitError extends Error {
  statusCode = 429
  retryAfterMs: number
  constructor(retryAfterMs: number) {
    super('Rate limit exceeded')
    this.name = 'RateLimitError'
    this.retryAfterMs = retryAfterMs
  }
}

// ── In-memory rate limiter (sliding window) ───────────────────────────────────
// For production, replace with Redis or Supabase-backed sliding window.

const rateLimitMap = new Map<string, { count: number; windowStart: number }>()

export function checkRateLimit(
  key: string,
  limitPerMin: number,
  windowMs = 60_000,
): RateLimitResult {
  const now    = Date.now()
  const entry  = rateLimitMap.get(key)

  if (!entry || now - entry.windowStart > windowMs) {
    rateLimitMap.set(key, { count: 1, windowStart: now })
    return { allowed: true, remaining: limitPerMin - 1 }
  }

  if (entry.count >= limitPerMin) {
    const retryAfterMs = windowMs - (now - entry.windowStart)
    return { allowed: false, retryAfterMs }
  }

  entry.count++
  return { allowed: true, remaining: limitPerMin - entry.count }
}

// ── Session ID generation ─────────────────────────────────────────────────────

export function generateSessionId(): string {
  return `sess_${randomBytes(12)}`
}

export function generateCompanyId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 40)
}

export { generateId }

// ── IP Whitelist check ────────────────────────────────────────────────────────

export function isIpAllowed(ip: string, whitelist: string[]): boolean {
  if (whitelist.length === 0) return true   // empty = allow all
  return whitelist.some(allowed => {
    // Simple CIDR check for /24 networks, otherwise exact match
    if (allowed.endsWith('/24')) {
      const prefix = allowed.slice(0, allowed.lastIndexOf('.'))
      return ip.startsWith(prefix + '.')
    }
    return ip === allowed
  })
}

// ── Extract API key from request ──────────────────────────────────────────────

export function extractApiKey(authHeader: string | null): string | null {
  if (!authHeader) return null
  if (authHeader.startsWith('Bearer ')) return authHeader.slice(7).trim()
  if (authHeader.startsWith('Basic '))  {
    const decoded = Buffer.from(authHeader.slice(6), 'base64').toString('utf8')
    return decoded.split(':')[0] || null
  }
  return authHeader.trim() || null
}

// ── Standard API response helpers ─────────────────────────────────────────────

export function gatewayError(
  statusCode: number,
  code: string,
  message: string,
  details?: unknown,
): Response {
  return Response.json(
    { error: { code, message, details }, timestamp: new Date().toISOString() },
    { status: statusCode, headers: gatewayHeaders() },
  )
}

export function gatewaySuccess<T>(data: T, statusCode = 200, meta?: Record<string, unknown>): Response {
  return Response.json(
    { data, meta: { timestamp: new Date().toISOString(), ...meta } },
    { status: statusCode, headers: gatewayHeaders() },
  )
}

export function gatewayHeaders(): HeadersInit {
  return {
    'Content-Type':              'application/json',
    'X-Sho8lana-Version':        '1.0',
    'X-Content-Type-Options':    'nosniff',
    'X-Frame-Options':           'DENY',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  }
}

// ── Audit event builder ───────────────────────────────────────────────────────

export interface AuditRecord {
  companyId?: string
  eventType: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  requestPath?: string
  statusCode?: number
  durationMs?: number
  ipAddress?: string
  errorMessage?: string
  metadata?: Record<string, unknown>
}

export function buildAuditRecord(partial: AuditRecord): AuditRecord & { createdAt: string } {
  return { ...partial, createdAt: new Date().toISOString() }
}

// ── Proxy helper ──────────────────────────────────────────────────────────────

export interface ProxyOptions {
  targetUrl: string
  method: string
  headers: HeadersInit
  body?: string
  timeoutMs?: number
}

export async function proxyRequest(opts: ProxyOptions): Promise<{ status: number; body: unknown; durationMs: number }> {
  const controller = new AbortController()
  const timer      = setTimeout(() => controller.abort(), opts.timeoutMs ?? 30_000)
  const start      = Date.now()

  try {
    const res = await fetch(opts.targetUrl, {
      method:  opts.method,
      headers: opts.headers,
      body:    opts.method !== 'GET' ? opts.body : undefined,
      signal:  controller.signal,
    })

    const durationMs = Date.now() - start
    let body: unknown

    const contentType = res.headers.get('content-type') ?? ''
    if (contentType.includes('application/json')) {
      body = await res.json()
    } else {
      body = await res.text()
    }

    return { status: res.status, body, durationMs }
  } catch (err) {
    const durationMs = Date.now() - start
    if ((err as Error).name === 'AbortError') {
      throw new Error(`Upstream timeout after ${opts.timeoutMs ?? 30_000}ms`)
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}
