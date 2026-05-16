// External Jobs API integration
// Supports: JSearch (LinkedIn/Indeed via RapidAPI) + Wuzzuf mock
// Falls back to enriched mock data when API keys are not configured.

import type { LiveJob } from './types'

const JSEARCH_KEY = process.env.NEXT_PUBLIC_JSEARCH_KEY ?? ''
const JSEARCH_HOST = 'jsearch.p.rapidapi.com'

// ── JSearch (LinkedIn + Indeed jobs via RapidAPI) ────────────────────────
// Sign up at: https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
// Add your key to .env.local: NEXT_PUBLIC_JSEARCH_KEY=your_key_here
export async function fetchLiveJobs(query = 'intern Egypt', page = 1): Promise<LiveJob[]> {
  if (!JSEARCH_KEY) return getMockLiveJobs()

  try {
    const params = new URLSearchParams({
      query,
      page: String(page),
      num_pages: '1',
      country: 'eg',
      language: 'en_gb',
    })

    const res = await fetch(
      `https://${JSEARCH_HOST}/search?${params}`,
      {
        headers: {
          'x-rapidapi-key':  JSEARCH_KEY,
          'x-rapidapi-host': JSEARCH_HOST,
        },
      },
    )

    if (!res.ok) throw new Error(`JSearch API error: ${res.status}`)
    const json = await res.json()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (json.data ?? []).slice(0, 20).map((j: any): LiveJob => ({
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
  } catch (err) {
    console.warn('JSearch API failed, using mock data:', err)
    return getMockLiveJobs()
  }
}

// ── Wuzzuf feed simulation ────────────────────────────────────────────────
// Wuzzuf (wuzzuf.net) does not expose a public API.
// This simulates what their jobs feed looks like.
export function getWuzzufMockJobs(): LiveJob[] {
  return [
    { id: 'w1',  title: 'Accountant — Fresh Graduate',   company: 'Al-Mansour Automotive', location: 'Giza, Egypt',        postedAt: ago(1),  url: 'https://wuzzuf.net/jobs/egypt', source: 'wuzzuf', type: 'FULLTIME' },
    { id: 'w2',  title: 'Digital Marketing Specialist',  company: 'Cleopatra Hospitals',   location: 'Heliopolis, Egypt',  postedAt: ago(2),  url: 'https://wuzzuf.net/jobs/egypt', source: 'wuzzuf', type: 'FULLTIME', salary: 'EGP 8,000/mo' },
    { id: 'w3',  title: 'HR Coordinator',                company: 'El-Araby Group',         location: 'Cairo, Egypt',       postedAt: ago(1),  url: 'https://wuzzuf.net/jobs/egypt', source: 'wuzzuf', type: 'FULLTIME', salary: 'EGP 7,000/mo' },
    { id: 'w4',  title: 'Sales Engineer — Fresh Grad',   company: 'Schneider Electric EG', location: 'Smart Village, Egypt', postedAt: ago(3), url: 'https://wuzzuf.net/jobs/egypt', source: 'wuzzuf', type: 'FULLTIME', salary: 'EGP 10,000/mo' },
    { id: 'w5',  title: 'Customer Success Rep',          company: 'Jumia Egypt',            location: 'Maadi, Egypt',       postedAt: ago(5),  url: 'https://wuzzuf.net/jobs/egypt', source: 'wuzzuf', type: 'FULLTIME', salary: 'EGP 6,000/mo' },
    { id: 'w6',  title: 'Logistics Coordinator — Intern',company: 'DHL Egypt',              location: '6th October, Egypt', postedAt: ago(2),  url: 'https://wuzzuf.net/jobs/egypt', source: 'wuzzuf', type: 'INTERN',   salary: 'EGP 3,500/mo' },
    { id: 'w7',  title: 'UI/UX Design Intern',           company: 'Instabug',               location: 'Nasr City, Egypt',   postedAt: ago(1),  url: 'https://wuzzuf.net/jobs/egypt', source: 'wuzzuf', type: 'INTERN',   salary: 'EGP 4,000/mo' },
    { id: 'w8',  title: 'Financial Planning Analyst',    company: 'Hassan Allam Group',     location: 'New Cairo, Egypt',   postedAt: ago(4),  url: 'https://wuzzuf.net/jobs/egypt', source: 'wuzzuf', type: 'FULLTIME', salary: 'EGP 11,000/mo' },
    { id: 'w9',  title: 'Content Creator — Arabic',      company: 'Noon.com Egypt',         location: 'New Cairo, Egypt',   postedAt: ago(1),  url: 'https://wuzzuf.net/jobs/egypt', source: 'wuzzuf', type: 'FULLTIME', salary: 'EGP 7,500/mo' },
    { id: 'w10', title: 'Business Development Rep',       company: 'Khazna Data Centers',   location: 'New Capital, Egypt', postedAt: ago(3),  url: 'https://wuzzuf.net/jobs/egypt', source: 'wuzzuf', type: 'FULLTIME', salary: 'EGP 9,000/mo' },
  ]
}

// ── LinkedIn feed simulation (shown when JSearch key absent) ─────────────
function getMockLiveJobs(): LiveJob[] {
  return [
    { id: 'li1',  title: 'Marketing Intern',              company: 'Vodafone Egypt',       location: 'Smart Village, Egypt',  postedAt: ago(1),  url: 'https://linkedin.com/jobs',   source: 'linkedin', type: 'INTERN',   salary: 'EGP 5,000/mo' },
    { id: 'li2',  title: 'Software Engineer – New Grad',   company: 'Amazon Egypt',         location: 'New Capital, Egypt',    postedAt: ago(2),  url: 'https://linkedin.com/jobs',   source: 'linkedin', type: 'FULLTIME', salary: 'EGP 18,000/mo' },
    { id: 'li3',  title: 'Data Analyst Intern',            company: 'Fawry',                location: 'Maadi, Egypt',          postedAt: ago(1),  url: 'https://linkedin.com/jobs',   source: 'linkedin', type: 'INTERN',   salary: 'EGP 5,500/mo' },
    { id: 'li4',  title: 'Financial Analyst',              company: 'EFG Hermes',           location: 'New Cairo, Egypt',      postedAt: ago(3),  url: 'https://linkedin.com/jobs',   source: 'linkedin', type: 'FULLTIME', salary: 'EGP 14,000/mo' },
    { id: 'li5',  title: 'Product Manager Intern',         company: 'Careem',               location: 'Nasr City, Egypt',      postedAt: ago(1),  url: 'https://linkedin.com/jobs',   source: 'linkedin', type: 'INTERN',   salary: 'EGP 6,000/mo' },
    { id: 'li6',  title: 'HR Generalist – Entry Level',    company: 'P&G Egypt',            location: '6th October, Egypt',    postedAt: ago(2),  url: 'https://linkedin.com/jobs',   source: 'linkedin', type: 'FULLTIME', salary: 'EGP 9,000/mo' },
    { id: 'li7',  title: 'Business Analyst',               company: 'Deloitte Egypt',       location: 'New Cairo, Egypt',      postedAt: ago(1),  url: 'https://linkedin.com/jobs',   source: 'linkedin', type: 'FULLTIME', salary: 'EGP 12,000/mo' },
    { id: 'li8',  title: 'Cloud Engineer Intern',          company: 'Microsoft Egypt',      location: 'Smart Village, Egypt',  postedAt: ago(4),  url: 'https://linkedin.com/jobs',   source: 'linkedin', type: 'INTERN',   salary: 'EGP 8,000/mo' },
    { id: 'li9',  title: 'Supply Chain Analyst',           company: 'Nestlé Egypt',         location: '6th October, Egypt',    postedAt: ago(2),  url: 'https://linkedin.com/jobs',   source: 'linkedin', type: 'FULLTIME', salary: 'EGP 10,000/mo' },
    { id: 'li10', title: 'Investment Banking Analyst',     company: 'CIB Egypt',            location: 'New Cairo, Egypt',      postedAt: ago(1),  url: 'https://linkedin.com/jobs',   source: 'linkedin', type: 'FULLTIME', salary: 'EGP 15,000/mo' },
    { id: 'li11', title: 'UX Researcher Intern',           company: 'Paymob',               location: 'Maadi, Egypt',          postedAt: ago(3),  url: 'https://linkedin.com/jobs',   source: 'linkedin', type: 'INTERN',   salary: 'EGP 4,500/mo' },
    { id: 'li12', title: 'Operations Associate',           company: 'Breadfast',            location: 'Heliopolis, Egypt',     postedAt: ago(1),  url: 'https://linkedin.com/jobs',   source: 'linkedin', type: 'FULLTIME', salary: 'EGP 8,000/mo' },
  ]
}

function ago(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

export function formatTimeAgo(isoDate: string): string {
  const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000)
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}
