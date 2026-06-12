// POST /api/forage/certificate
// The strongest completion signal we can get without a Forage data partnership:
// the user pastes their public Forage certificate link. We validate it is a real
// theforage.com URL (host allow-list — prevents SSRF) and best-effort fetch the
// public page to confirm it resolves and pull the recipient name. A completed
// attempt is recorded either way; `certificate_verified` reflects the fetch.

import { NextRequest } from 'next/server'
import { checkRateLimit } from '@/lib/integration-gateway'
import {
  forageDb, resolveUserId, appendForageEvent, onForageCompleted, FORAGE_EVENTS,
} from '@/lib/forage-server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Only these hosts may be fetched server-side.
function isForageCertUrl(raw: string): URL | null {
  let url: URL
  try { url = new URL(raw) } catch { return null }
  if (url.protocol !== 'https:') return null
  const h = url.hostname.toLowerCase()
  if (h === 'theforage.com' || h === 'www.theforage.com' || h.endsWith('.theforage.com')) return url
  return null
}

interface CertInfo { verified: boolean; issuedTo?: string }

async function inspectCertificate(url: URL): Promise<CertInfo> {
  try {
    const res = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Sho8lana/1.0; +https://sho8lana.com)',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(4000),
      redirect: 'follow',
    })
    if (!res.ok) return { verified: false }
    const html = await res.text()
    // Pull a name from OpenGraph / <title> when present (best-effort only).
    const og = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
    const ttl = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const raw = (og?.[1] ?? ttl?.[1] ?? '').trim()
    const issuedTo = raw
      .replace(/\s*[|\-–]\s*Forage.*$/i, '')
      .replace(/\s*certificate.*$/i, '')
      .trim() || undefined
    return { verified: true, issuedTo }
  } catch {
    return { verified: false }
  }
}

export async function POST(req: NextRequest) {
  const db = forageDb()

  const { userId, error: authErr } = await resolveUserId(req, db)
  if (!userId) return Response.json({ error: authErr ?? 'Unauthorized' }, { status: 401 })

  const rl = checkRateLimit(`forage:cert:${userId}`, 20)
  if (!rl.allowed) return Response.json({ error: 'Too many submissions' }, { status: 429 })

  let body: { attemptToken?: string; certificateUrl?: string }
  try { body = await req.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const attemptToken  = (body.attemptToken ?? '').trim()
  const certificateUrl = (body.certificateUrl ?? '').trim()
  if (!attemptToken)   return Response.json({ error: 'attemptToken is required' }, { status: 400 })

  const url = isForageCertUrl(certificateUrl)
  if (!url) return Response.json({ error: 'Must be a valid https://theforage.com certificate URL' }, { status: 400 })

  // Ownership check
  const { data: attempt } = await db
    .from('forage_attempts')
    .select('*')
    .eq('attempt_token', attemptToken)
    .maybeSingle()
  if (!attempt)                   return Response.json({ error: 'Attempt not found' }, { status: 404 })
  if (attempt.user_id !== userId) return Response.json({ error: 'Forbidden' }, { status: 403 })

  await appendForageEvent(db, {
    attemptToken, userId, programId: attempt.program_id as string,
    eventType: FORAGE_EVENTS.certSubmit, progressPct: 100, source: 'self_report',
    payload: { certificateUrl: url.toString() },
  })

  // Best-effort server-side verification
  const info = await inspectCertificate(url)
  const now = new Date().toISOString()

  const { error: updErr } = await db.from('forage_attempts').update({
    status:                'completed',
    progress_pct:          100,
    completed_at:          attempt.completed_at ?? now,
    certificate_url:       url.toString(),
    certificate_verified:  info.verified,
    certificate_issued_to: info.issuedTo ?? null,
    certificate_issued_at: info.verified ? now : null,
    last_activity_at:      now,
    source:                'self_report',
  }).eq('attempt_token', attemptToken)
  if (updErr) return Response.json({ error: updErr.message }, { status: 500 })

  if (info.verified) {
    await appendForageEvent(db, {
      attemptToken, userId, programId: attempt.program_id as string,
      eventType: FORAGE_EVENTS.certVerify, progressPct: 100, source: 'self_report',
      payload: { issuedTo: info.issuedTo ?? null },
    })
  }

  // Fire completion side-effects once, on transition into completed
  if (attempt.status !== 'completed') {
    await onForageCompleted(db, { userId, programId: attempt.program_id as string, verified: info.verified })
  }

  return Response.json({
    ok: true,
    verified: info.verified,
    issuedTo: info.issuedTo ?? null,
    status: 'completed',
  })
}
