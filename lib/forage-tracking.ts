// ─── Forage tracking — client helper ──────────────────────────────────────────
// Thin wrapper around /api/forage/* that always attaches the user's Supabase
// access token, plus sessionStorage bookkeeping for the active attempt so the
// "you're back" modal can prompt the user after they return from theforage.com.

import { supabase } from './supabase'
import type { ForageProgram } from './forage-programs'

const ACTIVE_KEY = 'sho8_forage_active'

export interface ActiveAttempt {
  attemptToken: string
  programId: string
  company: string
  title: string
  launchedAt: string
}

export interface ForageAttempt {
  attempt_token: string
  program_id: string
  company: string
  title: string
  attempt_number: number
  status: 'launched' | 'in_progress' | 'completed' | 'abandoned'
  progress_pct: number
  score: number | null
  time_spent_seconds: number
  last_activity_at: string
  completed_at: string | null
  certificate_url: string | null
  certificate_verified: boolean
}

export type TrackEvent = 'opened' | 'progress' | 'completed' | 'abandoned'

// ── Auth ────────────────────────────────────────────────────────────────────

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function isLoggedIn(): Promise<boolean> {
  const { data } = await supabase.auth.getSession()
  return Boolean(data.session?.access_token)
}

// ── Active-attempt session state (drives the return modal) ────────────────────

export function getActiveAttempt(): ActiveAttempt | null {
  if (typeof window === 'undefined') return null
  try { return JSON.parse(sessionStorage.getItem(ACTIVE_KEY) ?? 'null') } catch { return null }
}

function setActiveAttempt(a: ActiveAttempt | null) {
  if (typeof window === 'undefined') return
  if (a) sessionStorage.setItem(ACTIVE_KEY, JSON.stringify(a))
  else sessionStorage.removeItem(ACTIVE_KEY)
}

export function clearActiveAttempt() { setActiveAttempt(null) }

// ── Launch (tracked) ──────────────────────────────────────────────────────────
// Creates/resumes a server-side attempt, opens Forage in a new tab, and records
// the active attempt so we can prompt for progress when the user returns.

export interface LaunchResult {
  attemptToken: string
  attemptNumber: number
  resumed: boolean
  redirectUrl: string
}

export async function launchForage(program: ForageProgram): Promise<LaunchResult> {
  const res = await fetch('/api/forage/launch', {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ programId: program.id }),
  })
  if (!res.ok) {
    const j = await res.json().catch(() => ({}))
    throw new Error(j.error ?? `Launch failed (${res.status})`)
  }
  const data: LaunchResult = await res.json()

  setActiveAttempt({
    attemptToken: data.attemptToken,
    programId: program.id,
    company: program.company,
    title: program.title,
    launchedAt: new Date().toISOString(),
  })

  // Open Forage in a new tab; user stays on sho8lana in this one.
  if (typeof window !== 'undefined') window.open(data.redirectUrl, '_blank', 'noopener,noreferrer')
  return data
}

// ── Progress / status self-report ─────────────────────────────────────────────

export async function reportProgress(input: {
  attemptToken: string
  event: TrackEvent
  progressPct?: number
  timeSpentSeconds?: number
  score?: number
}): Promise<void> {
  const res = await fetch('/api/forage/track', {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const j = await res.json().catch(() => ({}))
    throw new Error(j.error ?? `Update failed (${res.status})`)
  }
  if (input.event === 'completed' || input.event === 'abandoned') clearActiveAttempt()
}

// ── Certificate submission ────────────────────────────────────────────────────

export async function submitCertificate(attemptToken: string, certificateUrl: string): Promise<{ verified: boolean; issuedTo: string | null }> {
  const res = await fetch('/api/forage/certificate', {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ attemptToken, certificateUrl }),
  })
  const j = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(j.error ?? `Submission failed (${res.status})`)
  clearActiveAttempt()
  return { verified: Boolean(j.verified), issuedTo: j.issuedTo ?? null }
}

// ── Activity feed for the "My Forage Activity" section ────────────────────────

export async function getActivity(): Promise<{ attempts: ForageAttempt[] }> {
  const res = await fetch('/api/forage/activity', { headers: await authHeaders() })
  if (!res.ok) return { attempts: [] }
  return res.json()
}

// ── Recruiter: candidates who completed Forage simulations ────────────────────

export interface ForageCandidate {
  userId: string
  name: string
  university: string
  major: string
  kpiScore: number
  verifiedCount: number
  completionCount: number
  completions: {
    program_id: string
    company: string
    title: string
    score: number | null
    certificate_verified: boolean
    completed_at: string | null
  }[]
}

export async function getForageCandidates(
  opts: { program?: string; verifiedOnly?: boolean } = {},
): Promise<{ candidates: ForageCandidate[]; error?: string }> {
  const params = new URLSearchParams()
  if (opts.program && opts.program !== 'all') params.set('program', opts.program)
  if (opts.verifiedOnly) params.set('verifiedOnly', 'true')
  const res = await fetch(`/api/forage/candidates?${params.toString()}`, { headers: await authHeaders() })
  if (res.status === 401) return { candidates: [], error: 'unauthorized' }
  if (!res.ok) return { candidates: [], error: `failed_${res.status}` }
  return res.json()
}
