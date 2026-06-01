import { NextRequest, NextResponse } from 'next/server'

// ── Rate limiting store (in-memory, resets on cold start) ─────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(key)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (entry.count >= limit) return false
  entry.count++
  return true
}

function getIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

// ── Owner token validation using Web Crypto API (Edge Runtime compatible) ───
async function isValidOwnerToken(token: string | null): Promise<boolean> {
  const secret = process.env.OWNER_SECRET
  if (!secret || !token) return false
  try {
    const decoded = atob(token.replace(/-/g, '+').replace(/_/g, '/'))
    const [ts, sig] = decoded.split('.')
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    )
    const sigBytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(ts))
    const expected = Array.from(new Uint8Array(sigBytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    const age = Date.now() - parseInt(ts)
    return sig === expected && age < 8 * 60 * 60 * 1000
  } catch {
    return false
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const ip = getIP(req)

  // ── /admin — require valid owner token ──────────────────────────────────
  if (pathname.startsWith('/admin')) {
    const token =
      req.cookies.get('sho8_owner_token')?.value ??
      req.headers.get('x-owner-token') ??
      null

    if (!(await isValidOwnerToken(token))) {
      // Redirect to home with a query param so the landing page opens owner panel
      const url = req.nextUrl.clone()
      url.pathname = '/'
      url.searchParams.set('owner_required', '1')
      return NextResponse.redirect(url)
    }
  }

  // ── /api/ai — 20 req/min per IP ─────────────────────────────────────────
  if (pathname === '/api/ai') {
    if (!rateLimit(`ai:${ip}`, 20, 60_000)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment.' },
        { status: 429 }
      )
    }
  }

  // ── /api/email — 5 req/min per IP ───────────────────────────────────────
  if (pathname === '/api/email') {
    if (!rateLimit(`email:${ip}`, 5, 60_000)) {
      return NextResponse.json(
        { error: 'Too many email requests. Please slow down.' },
        { status: 429 }
      )
    }
  }

  // ── /api/stripe/checkout — 10 req/min per IP ────────────────────────────
  if (pathname === '/api/stripe/checkout') {
    if (!rateLimit(`stripe:${ip}`, 10, 60_000)) {
      return NextResponse.json(
        { error: 'Too many requests.' },
        { status: 429 }
      )
    }
  }

  // ── /api/integrations — require Supabase session header ─────────────────
  if (pathname.startsWith('/api/integrations')) {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required.' },
        { status: 401 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/ai',
    '/api/email',
    '/api/stripe/checkout',
    '/api/integrations/:path*',
  ],
}
