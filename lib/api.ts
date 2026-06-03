// External Jobs API integration
// JSearch calls are proxied through /api/jobs/search (server-side) to keep the API key private.
// Falls back to enriched mock data when the route is unavailable.

import type { LiveJob } from './types'

// ── JSearch via server-side proxy ────────────────────────────────────────
// The API key is stored as JSEARCH_KEY (no NEXT_PUBLIC_ prefix) on the server.
// Clients always hit /api/jobs/search — the key never reaches the browser.
export async function fetchLiveJobs(query = 'intern Egypt', page = 1): Promise<LiveJob[]> {
  try {
    const params = new URLSearchParams({ q: query, page: String(page) })
    const res = await fetch(`/api/jobs/search?${params}`)
    if (!res.ok) throw new Error(`/api/jobs/search ${res.status}`)
    const json = await res.json()
    if (!json.data?.length) return getMockLiveJobs()
    return json.data as LiveJob[]
  } catch (err) {
    console.warn('Live job fetch failed, using mock data:', err)
    return getMockLiveJobs()
  }
}

// ── Wuzzuf feed simulation ────────────────────────────────────────────────
// Wuzzuf (wuzzuf.net) does not expose a public API.
// This simulates what their jobs feed looks like.
function wuzzufUrl(title: string, company?: string) {
  const q = company ? `${title} ${company}` : title
  return `https://wuzzuf.net/search/jobs/?q=${encodeURIComponent(q)}&l=Cairo%2C+Egypt`
}

export function getWuzzufMockJobs(): LiveJob[] {
  return [
    { id: 'w1',  title: 'Accountant — Fresh Graduate',    company: 'Al-Mansour Automotive', location: 'Giza, Egypt',          postedAt: ago(1),  url: wuzzufUrl('Accountant Fresh Graduate', 'Al-Mansour Automotive'),    source: 'wuzzuf', type: 'FULLTIME' },
    { id: 'w2',  title: 'Digital Marketing Specialist',   company: 'Cleopatra Hospitals',   location: 'Heliopolis, Egypt',    postedAt: ago(2),  url: wuzzufUrl('Digital Marketing Specialist', 'Cleopatra Hospitals'),  source: 'wuzzuf', type: 'FULLTIME', salary: 'EGP 8,000/mo' },
    { id: 'w3',  title: 'HR Coordinator',                 company: 'El-Araby Group',        location: 'Cairo, Egypt',         postedAt: ago(1),  url: wuzzufUrl('HR Coordinator', 'El-Araby Group'),                source: 'wuzzuf', type: 'FULLTIME', salary: 'EGP 7,000/mo' },
    { id: 'w4',  title: 'Sales Engineer — Fresh Grad',    company: 'Schneider Electric EG', location: 'Smart Village, Egypt', postedAt: ago(3),  url: wuzzufUrl('Sales Engineer Fresh Graduate', 'Schneider Electric'), source: 'wuzzuf', type: 'FULLTIME', salary: 'EGP 10,000/mo' },
    { id: 'w5',  title: 'Customer Success Rep',           company: 'Jumia Egypt',           location: 'Maadi, Egypt',         postedAt: ago(5),  url: wuzzufUrl('Customer Success Representative', 'Jumia Egypt'), source: 'wuzzuf', type: 'FULLTIME', salary: 'EGP 6,000/mo' },
    { id: 'w6',  title: 'Logistics Coordinator — Intern', company: 'DHL Egypt',             location: '6th October, Egypt',   postedAt: ago(2),  url: wuzzufUrl('Logistics Coordinator Intern', 'DHL Egypt'),  source: 'wuzzuf', type: 'INTERN',   salary: 'EGP 3,500/mo' },
    { id: 'w7',  title: 'UI/UX Design Intern',            company: 'Instabug',              location: 'Nasr City, Egypt',     postedAt: ago(1),  url: wuzzufUrl('UI UX Design Intern', 'Instabug'),           source: 'wuzzuf', type: 'INTERN',   salary: 'EGP 4,000/mo' },
    { id: 'w8',  title: 'Financial Planning Analyst',     company: 'Hassan Allam Group',    location: 'New Cairo, Egypt',     postedAt: ago(4),  url: wuzzufUrl('Financial Planning Analyst', 'Hassan Allam Group'),    source: 'wuzzuf', type: 'FULLTIME', salary: 'EGP 11,000/mo' },
    { id: 'w9',  title: 'Content Creator — Arabic',       company: 'Noon.com Egypt',        location: 'New Cairo, Egypt',     postedAt: ago(1),  url: wuzzufUrl('Content Creator Arabic', 'Noon.com Egypt'),        source: 'wuzzuf', type: 'FULLTIME', salary: 'EGP 7,500/mo' },
    { id: 'w10', title: 'Business Development Rep',        company: 'Khazna Data Centers',  location: 'New Capital, Egypt',   postedAt: ago(3),  url: wuzzufUrl('Business Development Representative', 'Khazna Data Centers'), source: 'wuzzuf', type: 'FULLTIME', salary: 'EGP 9,000/mo' },
  ]
}

function linkedinUrl(title: string, company: string) {
  return `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(title + ' ' + company)}&location=Egypt`
}

// ── LinkedIn feed simulation (shown when JSearch key absent) ─────────────
function getMockLiveJobs(): LiveJob[] {
  return [
    { id: 'li1',  title: 'Marketing Intern',               company: 'Vodafone Egypt',  location: 'Smart Village, Egypt', postedAt: ago(1),  url: linkedinUrl('Marketing Intern', 'Vodafone Egypt'),        source: 'linkedin', type: 'INTERN',   salary: 'EGP 5,000/mo' },
    { id: 'li2',  title: 'Software Engineer – New Grad',    company: 'Amazon Egypt',    location: 'New Capital, Egypt',   postedAt: ago(2),  url: linkedinUrl('Software Engineer New Graduate', 'Amazon Egypt'), source: 'linkedin', type: 'FULLTIME', salary: 'EGP 18,000/mo' },
    { id: 'li3',  title: 'Data Analyst Intern',             company: 'Fawry',           location: 'Maadi, Egypt',         postedAt: ago(1),  url: linkedinUrl('Data Analyst Intern', 'Fawry Egypt'),         source: 'linkedin', type: 'INTERN',   salary: 'EGP 5,500/mo' },
    { id: 'li4',  title: 'Financial Analyst',               company: 'EFG Hermes',      location: 'New Cairo, Egypt',     postedAt: ago(3),  url: linkedinUrl('Financial Analyst', 'EFG Hermes Egypt'),      source: 'linkedin', type: 'FULLTIME', salary: 'EGP 14,000/mo' },
    { id: 'li5',  title: 'Product Manager Intern',          company: 'Careem',          location: 'Nasr City, Egypt',     postedAt: ago(1),  url: linkedinUrl('Product Manager Intern', 'Careem Egypt'),     source: 'linkedin', type: 'INTERN',   salary: 'EGP 6,000/mo' },
    { id: 'li6',  title: 'HR Generalist – Entry Level',     company: 'P&G Egypt',       location: '6th October, Egypt',   postedAt: ago(2),  url: linkedinUrl('HR Generalist Entry Level', 'P&G Egypt'),     source: 'linkedin', type: 'FULLTIME', salary: 'EGP 9,000/mo' },
    { id: 'li7',  title: 'Business Analyst',                company: 'Deloitte Egypt',  location: 'New Cairo, Egypt',     postedAt: ago(1),  url: linkedinUrl('Business Analyst', 'Deloitte Egypt'),         source: 'linkedin', type: 'FULLTIME', salary: 'EGP 12,000/mo' },
    { id: 'li8',  title: 'Cloud Engineer Intern',           company: 'Microsoft Egypt', location: 'Smart Village, Egypt', postedAt: ago(4),  url: linkedinUrl('Cloud Engineer Intern', 'Microsoft Egypt'),   source: 'linkedin', type: 'INTERN',   salary: 'EGP 8,000/mo' },
    { id: 'li9',  title: 'Supply Chain Analyst',            company: 'Nestlé Egypt',    location: '6th October, Egypt',   postedAt: ago(2),  url: linkedinUrl('Supply Chain Analyst', 'Nestle Egypt'),       source: 'linkedin', type: 'FULLTIME', salary: 'EGP 10,000/mo' },
    { id: 'li10', title: 'Investment Banking Analyst',      company: 'CIB Egypt',       location: 'New Cairo, Egypt',     postedAt: ago(1),  url: linkedinUrl('Investment Banking Analyst', 'CIB Egypt'),    source: 'linkedin', type: 'FULLTIME', salary: 'EGP 15,000/mo' },
    { id: 'li11', title: 'UX Researcher Intern',            company: 'Paymob',          location: 'Maadi, Egypt',         postedAt: ago(3),  url: linkedinUrl('UX Researcher Intern', 'Paymob Egypt'),       source: 'linkedin', type: 'INTERN',   salary: 'EGP 4,500/mo' },
    { id: 'li12', title: 'Operations Associate',            company: 'Breadfast',       location: 'Heliopolis, Egypt',    postedAt: ago(1),  url: linkedinUrl('Operations Associate', 'Breadfast Egypt'),    source: 'linkedin', type: 'FULLTIME', salary: 'EGP 8,000/mo' },
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
