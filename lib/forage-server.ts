// ═══════════════════════════════════════════════════════════════════════════════
// Forage tracking — shared server utilities
// Reused across app/api/forage/* routes. Keeps each route thin and consistent.
// ═══════════════════════════════════════════════════════════════════════════════

import type { NextRequest } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from './supabaseAdmin'
import { extractApiKey, generateId } from './integration-gateway'
import { FORAGE_PROGRAMS, type ForageProgram } from './forage-programs'

// ── Domain constants ───────────────────────────────────────────────────────────

export type ForageStatus = 'launched' | 'in_progress' | 'completed' | 'abandoned'
export const FORAGE_STATUSES: ForageStatus[] = ['launched', 'in_progress', 'completed', 'abandoned']

export type ForageSource = 'launch' | 'self_report' | 'webhook' | 'admin'

export const FORAGE_EVENTS = {
  launched:    'simulation.launched',
  opened:      'simulation.opened',
  progress:    'progress.updated',
  completed:   'simulation.completed',
  abandoned:   'simulation.abandoned',
  certSubmit:  'certificate.submitted',
  certVerify:  'certificate.verified',
} as const

// ── DB client (service role — bypasses RLS) ────────────────────────────────────

export function forageDb(): SupabaseClient {
  return createAdminClient()
}

// ── Identity resolution ────────────────────────────────────────────────────────
// Verifies the caller's Supabase JWT (Authorization: Bearer <access_token>) and
// returns the auth user id. A guarded dev-only bypass lets the local test script
// run without minting a real JWT — it is impossible to enable in production.

export interface ResolvedUser {
  userId: string | null
  error: string | null
}

function testBypassUser(req: NextRequest): string | null {
  if (process.env.NODE_ENV === 'production') return null
  if (process.env.FORAGE_ALLOW_TEST_AUTH !== 'true') return null
  const u = req.headers.get('x-forage-test-user')
  return u && u.trim() ? u.trim() : null
}

export async function resolveUserId(req: NextRequest, db: SupabaseClient): Promise<ResolvedUser> {
  const bypass = testBypassUser(req)
  if (bypass) return { userId: bypass, error: null }

  const token = extractApiKey(req.headers.get('authorization'))
  if (!token) return { userId: null, error: 'Missing bearer token' }

  const { data, error } = await db.auth.getUser(token)
  if (error || !data?.user) return { userId: null, error: 'Invalid or expired session' }
  return { userId: data.user.id, error: null }
}

// ── Program catalog lookup ─────────────────────────────────────────────────────

export function getProgram(programId: string): ForageProgram | undefined {
  return FORAGE_PROGRAMS.find(p => p.id === programId)
}

// ── Tracking token ─────────────────────────────────────────────────────────────

export function newAttemptToken(): string {
  return generateId('fa_')
}

// ── Build the outbound Forage URL with our tracking ref appended ────────────────
// Forage ignores unknown query params; we keep `fa` so support can correlate.

export function buildRedirectUrl(program: ForageProgram, attemptToken: string): string {
  try {
    const url = new URL(program.url)
    url.searchParams.set('ref', 'sho8lana')
    url.searchParams.set('fa', attemptToken)
    return url.toString()
  } catch {
    const sep = program.url.includes('?') ? '&' : '?'
    return `${program.url}${sep}ref=sho8lana&fa=${encodeURIComponent(attemptToken)}`
  }
}

// ── Append an immutable timeline event ──────────────────────────────────────────

export interface ForageEventInput {
  attemptToken: string
  userId: string
  programId: string
  eventType: string
  progressPct?: number | null
  score?: number | null
  timeSpentSeconds?: number | null
  source: ForageSource
  payload?: Record<string, unknown>
}

export async function appendForageEvent(db: SupabaseClient, ev: ForageEventInput): Promise<void> {
  await db.from('forage_events').insert([{
    attempt_token:      ev.attemptToken,
    user_id:            ev.userId,
    program_id:         ev.programId,
    event_type:         ev.eventType,
    progress_pct:       ev.progressPct ?? null,
    score:              ev.score ?? null,
    time_spent_seconds: ev.timeSpentSeconds ?? null,
    source:             ev.source,
    payload:            ev.payload ?? {},
  }])
}

// ── Numeric coercion helpers (defensive against untrusted client input) ─────────

export function clampPct(v: unknown): number | null {
  const n = Number(v)
  if (!Number.isFinite(n)) return null
  return Math.max(0, Math.min(100, Math.round(n)))
}

export function clampScore(v: unknown): number | null {
  const n = Number(v)
  if (!Number.isFinite(n)) return null
  return Math.max(0, Math.min(100, Math.round(n * 100) / 100))
}

export function clampSeconds(v: unknown): number | null {
  const n = Number(v)
  if (!Number.isFinite(n) || n < 0) return null
  return Math.round(n)
}

// ── Completion side-effects ─────────────────────────────────────────────────────
// Called exactly once when an attempt transitions INTO `completed` (from any path:
// self-report, certificate, webhook, admin verify). Durable effects only — XP and
// badges are awarded client-side via the store. Best-effort: never throws.

export async function onForageCompleted(
  db: SupabaseClient,
  opts: { userId: string; programId: string; verified: boolean },
): Promise<void> {
  const program = getProgram(opts.programId)
  if (!program) return

  // 1) Merge the simulation's skills into the user's verified profile skills
  try {
    const { data: prof } = await db.from('profiles').select('skills').eq('id', opts.userId).maybeSingle()
    const existing: string[] = Array.isArray(prof?.skills) ? (prof!.skills as string[]) : []
    const merged = Array.from(new Set([...existing, ...program.skills]))
    if (merged.length !== existing.length) {
      await db.from('profiles').update({ skills: merged }).eq('id', opts.userId)
    }
  } catch { /* non-critical */ }

  // 2) In-app notification (realtime-delivered to the client store)
  try {
    await db.from('notifications').insert([{
      user_id:       opts.userId,
      type:          'sim_complete',
      title:         opts.verified ? 'Forage simulation verified 🎓' : 'Forage simulation completed 🎉',
      body:          `You completed "${program.title}" at ${program.company}. ${program.skills.length} skills added to your profile.`,
      read:          false,
      action_screen: 'forageHub',
    }])
  } catch { /* table may differ in some envs */ }

  // 3) Best-effort congratulatory email via Resend (skips silently if unconfigured)
  try {
    if (!process.env.RESEND_API_KEY) return
    const { data: u } = await db.auth.admin.getUserById(opts.userId)
    const email = u?.user?.email
    const name  = (u?.user?.user_metadata?.name as string) ?? (email ? email.split('@')[0] : 'there')
    if (!email) return
    const html = `<div style="font-family:sans-serif;max-width:560px;margin:0 auto">
      <div style="background:#0F172A;padding:24px 32px;border-radius:12px 12px 0 0"><span style="color:#fff;font-size:18px;font-weight:700">⚡ Sho8lana</span></div>
      <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
        <h2 style="color:#0f172a;margin:0 0 12px">Nice work, ${name}! 🎉</h2>
        <p style="color:#64748b;line-height:1.6">You completed the <strong>${program.company} — ${program.title}</strong> Forage simulation. We've added <strong>${program.skills.join(', ')}</strong> to your verified skills and updated your KPI profile.</p>
        <a href="https://sho8lana.vercel.app" style="display:inline-block;margin-top:20px;background:#3B82F6;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">View your profile →</a>
      </div></div>`
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      body: JSON.stringify({ from: 'Sho8lana <noreply@sho8lana.com>', to: email, subject: `You completed ${program.company} on Forage 🎓`, html }),
    })
  } catch { /* email is best-effort */ }
}
