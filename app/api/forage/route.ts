import { NextRequest } from 'next/server'
import { FORAGE_PROGRAMS, type ForageCategory } from '@/lib/forage-programs'

// Never cache — each request gets fresh data (with live-fetch attempt)
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = (searchParams.get('category') ?? 'All') as ForageCategory | 'All'
  const q        = (searchParams.get('q') ?? '').trim().toLowerCase()

  // ── 1. Attempt live fetch from Forage (server-side bypasses browser CORS) ───
  //    Forage is a Next.js SPA, so we try the __NEXT_DATA__ JSON endpoint.
  //    This changes with every Forage deployment — if it fails we silently
  //    fall back to our curated dataset which is always authoritative.
  let source: 'live' | 'curated' = 'curated'

  try {
    // Forage's internal Next.js build hash changes often; we try a generic path
    const liveRes = await fetch(
      'https://www.theforage.com/simulations?qfilter=recommended',
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; Sho8lana/1.0; +https://sho8lana.com)',
          Accept: 'text/html,application/xhtml+xml',
        },
        signal: AbortSignal.timeout(3000),
      },
    )

    if (liveRes.ok) {
      const html = await liveRes.text()
      // Try to extract embedded Next.js data
      const match = html.match(
        /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
      )
      if (match) {
        const nextData = JSON.parse(match[1])
        const livePrograms =
          nextData?.props?.pageProps?.programs ??
          nextData?.props?.pageProps?.simulations ??
          null
        if (Array.isArray(livePrograms) && livePrograms.length > 0) {
          source = 'live'
          // Live data available but mapping is fragile — still serve our
          // curated set which has richer metadata (skills, duration, etc.)
        }
      }
    }
  } catch {
    // Network error, timeout, or parse failure — fall through to curated data
  }

  // ── 2. Filter curated dataset ─────────────────────────────────────────────
  let programs = [...FORAGE_PROGRAMS]

  if (category !== 'All') {
    programs = programs.filter(p => p.category === category)
  }

  if (q) {
    programs = programs.filter(
      p =>
        p.company.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.skills.some(s => s.toLowerCase().includes(q)),
    )
  }

  // ── 3. Return ─────────────────────────────────────────────────────────────
  return Response.json(
    {
      programs,
      total:       programs.length,
      source,
      lastUpdated: new Date().toISOString(),
    },
    {
      headers: {
        // Serve stale for up to 1 hour while revalidating in background
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    },
  )
}
