import { NextRequest, NextResponse } from 'next/server'

const JSEARCH_KEY  = process.env.JSEARCH_KEY ?? ''   // server-only — no NEXT_PUBLIC_
const JSEARCH_HOST = 'jsearch.p.rapidapi.com'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const query = searchParams.get('q') ?? 'intern Egypt'
  const page  = searchParams.get('page') ?? '1'

  if (!JSEARCH_KEY) {
    return NextResponse.json({ data: [], source: 'unavailable' })
  }

  try {
    const params = new URLSearchParams({ query, page, num_pages: '1', country: 'eg', language: 'en_gb' })
    const res = await fetch(`https://${JSEARCH_HOST}/search?${params}`, {
      headers: {
        'x-rapidapi-key':  JSEARCH_KEY,
        'x-rapidapi-host': JSEARCH_HOST,
      },
      next: { revalidate: 300 }, // cache for 5 minutes
    })

    if (!res.ok) throw new Error(`JSearch ${res.status}`)
    const json = await res.json()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jobs = (json.data ?? []).slice(0, 20).map((j: any) => ({
      id:       j.job_id,
      title:    j.job_title,
      company:  j.employer_name,
      location: `${j.job_city ?? ''}, Egypt`.trim(),
      salary:   j.job_min_salary ? `EGP ${(j.job_min_salary / 12).toFixed(0)}/mo` : undefined,
      postedAt: j.job_posted_at_datetime_utc ?? new Date().toISOString(),
      url:      j.job_apply_link ?? j.job_google_link ?? '#',
      source:   j.job_publisher?.toLowerCase().includes('linkedin') ? 'linkedin' : 'indeed',
      type:     j.job_employment_type ?? 'INTERN',
    }))

    return NextResponse.json({ data: jobs, source: 'jsearch' })
  } catch (err) {
    console.warn('JSearch API error:', err)
    return NextResponse.json({ data: [], source: 'error' })
  }
}
