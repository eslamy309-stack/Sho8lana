#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// End-to-end smoke test for the Forage tracking system.
// Drives the running dev server through every flow in the spec.
//
// Prerequisites (the script checks and tells you what's missing):
//   1. Run the migration:  supabase/schema/patch_v6_forage_tracking.sql
//   2. Start the app with the dev test-auth bypass + a webhook secret, e.g.:
//        FORAGE_ALLOW_TEST_AUTH=true FORAGE_WEBHOOK_SECRET=whsec_test npm run dev
//   3. Export a REAL Supabase auth user id (forage_attempts.user_id is an FK to
//      auth.users): export TEST_USER_ID=<uuid>
//
//   Usage:  node scripts/test-forage-flow.mjs
//   Env:    BASE_URL (default http://localhost:3000)
//           TEST_USER_ID (required)  FORAGE_WEBHOOK_SECRET (for webhook step)
// ─────────────────────────────────────────────────────────────────────────────

import crypto from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const BASE      = process.env.BASE_URL ?? 'http://localhost:3000'
const SECRET    = process.env.FORAGE_WEBHOOK_SECRET ?? 'whsec_test'
const SB_URL    = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SB_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
let USER        = process.env.TEST_USER_ID ?? ''

// Auto-discover a real auth user + confirm the migration ran (service role).
async function discoverContext() {
  if (!SB_URL || !SB_SERVICE) return { ok: false, why: 'SUPABASE_SERVICE_ROLE_KEY / URL not set' }
  const db = createClient(SB_URL, SB_SERVICE, { auth: { persistSession: false } })

  const probe = await db.from('forage_attempts').select('attempt_token').limit(1)
  if (probe.error && /relation .* does not exist|42P01/i.test(probe.error.message + (probe.error.code ?? ''))) {
    return { ok: false, why: 'migration not applied — run supabase/schema/patch_v6_forage_tracking.sql' }
  }
  if (!USER) {
    const { data, error } = await db.auth.admin.listUsers({ page: 1, perPage: 1 })
    if (error) return { ok: false, why: `could not list users: ${error.message}` }
    if (!data?.users?.length) return { ok: false, why: 'no auth users exist — sign up one user first' }
    USER = data.users[0].id
  }
  return { ok: true }
}

const PROG_A = 'gs-excel'      // first program
const PROG_B = 'aws-architect' // second program (for the webhook step)

let pass = 0, fail = 0
const ok   = (m) => { pass++; console.log(`  \x1b[32m✓\x1b[0m ${m}`) }
const bad  = (m) => { fail++; console.log(`  \x1b[31m✗ ${m}\x1b[0m`) }
const head = (m) => console.log(`\n\x1b[1m${m}\x1b[0m`)

function userHeaders() {
  return { 'Content-Type': 'application/json', 'x-forage-test-user': USER }
}

async function jpost(path, body, headers = {}) {
  const res = await fetch(`${BASE}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) })
  let json = null; try { json = await res.json() } catch {}
  return { status: res.status, json }
}
async function jget(path, headers = {}) {
  const res = await fetch(`${BASE}${path}`, { headers })
  let json = null; try { json = await res.json() } catch {}
  return { status: res.status, json }
}

function signWebhook(bodyStr) {
  const t = Date.now()
  const hmac = crypto.createHmac('sha256', SECRET).update(`${t}.${bodyStr}`).digest('hex')
  return `t=${t},v1=${hmac}`
}

async function main() {
  console.log(`\x1b[1mForage flow test\x1b[0m → ${BASE}`)

  const ctx = await discoverContext()
  if (!ctx.ok) {
    console.log(`\n\x1b[33mCannot run yet:\x1b[0m ${ctx.why}`)
    process.exit(2)
  }
  console.log(`  using test user ${USER}`)

  // Pre-flight: confirm the dev test-auth bypass is enabled
  const pre = await jpost('/api/forage/launch', { programId: PROG_A }, userHeaders())
  if (pre.status === 401) {
    console.log('\n\x1b[33mUser routes returned 401.\x1b[0m Start the server with FORAGE_ALLOW_TEST_AUTH=true (dev only).')
    process.exit(2)
  }

  // ── 1. New user: launch → progress → complete via certificate ─────────────
  head('1) New user — launch, progress, complete')
  pre.status === 200 ? ok(`launch #1 → attempt ${pre.json?.attemptToken}`) : bad(`launch failed (${pre.status})`)
  const token1 = pre.json?.attemptToken
  pre.json?.attemptNumber === 1 ? ok('attempt_number = 1') : bad(`expected attempt 1, got ${pre.json?.attemptNumber}`)

  const opened = await jpost('/api/forage/track', { attemptToken: token1, event: 'opened' }, userHeaders())
  opened.status === 200 ? ok('opened') : bad(`opened failed (${opened.status})`)

  const p25 = await jpost('/api/forage/track', { attemptToken: token1, event: 'progress', progressPct: 25, timeSpentSeconds: 600 }, userHeaders())
  const p60 = await jpost('/api/forage/track', { attemptToken: token1, event: 'progress', progressPct: 60, timeSpentSeconds: 1800 }, userHeaders())
  p60.json?.attempt?.progressPct === 60 ? ok('progress → 60%') : bad(`progress wrong: ${JSON.stringify(p60.json)}`)

  // monotonic: a stale 25% must not roll back
  const pStale = await jpost('/api/forage/track', { attemptToken: token1, event: 'progress', progressPct: 25 }, userHeaders())
  pStale.json?.attempt?.progressPct === 60 ? ok('progress is monotonic (stale 25% ignored)') : bad('progress rolled back!')

  const cert = await jpost('/api/forage/certificate', { attemptToken: token1, certificateUrl: 'https://www.theforage.com/share/sample-certificate' }, userHeaders())
  cert.status === 200 && cert.json?.status === 'completed' ? ok(`certificate → completed (verified=${cert.json?.verified})`) : bad(`certificate failed (${cert.status}) ${JSON.stringify(cert.json)}`)

  // ── 2. Returning user / multiple attempts ─────────────────────────────────
  head('2) Returning user — relaunch creates a new attempt, history preserved')
  const relaunch = await jpost('/api/forage/launch', { programId: PROG_A }, userHeaders())
  relaunch.json?.attemptNumber === 2 ? ok('attempt_number = 2') : bad(`expected attempt 2, got ${relaunch.json?.attemptNumber}`)
  relaunch.json?.resumed === false ? ok('not resumed (prior attempt was completed)') : bad('unexpectedly resumed')
  relaunch.json?.attemptToken !== token1 ? ok('new attempt token (attempt 1 history intact)') : bad('reused old token — history lost')
  const token2 = relaunch.json?.attemptToken

  // relaunching again while open should RESUME (no attempt #3)
  const resume = await jpost('/api/forage/launch', { programId: PROG_A }, userHeaders())
  resume.json?.resumed === true && resume.json?.attemptToken === token2 ? ok('open attempt resumes (no duplicate)') : bad('did not resume open attempt')

  // ── 3. Failed / interrupted ───────────────────────────────────────────────
  head('3) Interrupted — abandon')
  const aband = await jpost('/api/forage/track', { attemptToken: token2, event: 'abandoned', progressPct: 40 }, userHeaders())
  aband.json?.attempt?.status === 'abandoned' ? ok('status → abandoned (progress retained)') : bad(`abandon failed ${JSON.stringify(aband.json)}`)

  // ── 4. Webhook (valid + tampered) ─────────────────────────────────────────
  head('4) Webhook — HMAC valid vs tampered')
  const payload = JSON.stringify({ userId: USER, programId: PROG_B, status: 'completed', progressPct: 100, score: 88, timeSpentSeconds: 5400 })
  const good = await fetch(`${BASE}/api/forage/webhook`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-forage-signature': signWebhook(payload) }, body: payload })
  good.status === 200 ? ok('valid signature → 200') : bad(`valid signature rejected (${good.status})`)

  const tampered = await fetch(`${BASE}/api/forage/webhook`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-forage-signature': 't=' + Date.now() + ',v1=deadbeef' }, body: payload })
  tampered.status === 401 ? ok('tampered signature → 401') : bad(`tampered signature NOT rejected (${tampered.status})`)

  // ── 5. Admin live view ────────────────────────────────────────────────────
  head('5) Admin view — filtered fetch')
  const admin = await jget(`/api/forage/admin?user=${USER}`, { 'x-forage-test-admin': 'true' })
  if (admin.status === 401) {
    bad('admin fetch 401 — start server with FORAGE_ALLOW_TEST_AUTH=true to exercise this path')
  } else {
    const rows = admin.json?.attempts ?? []
    rows.length >= 2 ? ok(`admin sees ${rows.length} attempts for the user`) : bad(`admin saw ${rows.length} attempts`)
    admin.json?.analytics ? ok(`analytics snapshot present (completed=${admin.json.analytics.completed})`) : bad('no analytics snapshot')
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log(`\n\x1b[1mResult:\x1b[0m \x1b[32m${pass} passed\x1b[0m, ${fail ? `\x1b[31m${fail} failed\x1b[0m` : '0 failed'}`)
  process.exit(fail ? 1 : 0)
}

main().catch(e => { console.error('\x1b[31mFatal:\x1b[0m', e); process.exit(1) })
