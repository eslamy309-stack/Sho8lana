import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function esc(s: string | undefined): string {
  if (!s) return ''
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

type EmailType = 'welcome_student' | 'welcome_company' | 'application_received' | 'application_update' | 'interview_invite'

interface EmailPayload {
  type: EmailType
  to: string
  name?: string
  company?: string
  jobTitle?: string
  status?: string
  interviewDate?: string
  interviewLink?: string
}

function buildEmail(p: EmailPayload): { subject: string; html: string } {
  const brand = `<div style="font-family:sans-serif;max-width:560px;margin:0 auto">
    <div style="background:#020817;padding:24px 32px;border-radius:12px 12px 0 0">
      <span style="color:white;font-size:18px;font-weight:700">⚡ Sho8lana</span>
    </div>
    <div style="background:#ffffff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">`
  const close = `</div></div>`

  switch (p.type) {
    case 'welcome_student':
      return {
        subject: `Welcome to Sho8lana, ${esc(p.name) || 'there'}!`,
        html: `${brand}<h2 style="color:#0f172a;margin:0 0 12px">You're in, ${esc(p.name) || 'there'}! 🎉</h2>
          <p style="color:#64748b;line-height:1.6">Start competing in real business simulations, build your KPI profile, and get discovered by Egypt's top employers.</p>
          <a href="https://sho8lana.vercel.app" style="display:inline-block;margin-top:20px;background:#10b981;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Open Sho8lana →</a>
          ${close}`,
      }
    case 'welcome_company':
      return {
        subject: `Welcome to Sho8lana for Companies`,
        html: `${brand}<h2 style="color:#0f172a;margin:0 0 12px">Welcome, ${esc(p.company) || 'your company'}! 🏢</h2>
          <p style="color:#64748b;line-height:1.6">Your HR dashboard is ready. Start discovering simulation-verified talent from 50,000+ students across Egypt.</p>
          <a href="https://sho8lana.vercel.app" style="display:inline-block;margin-top:20px;background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Open HR Dashboard →</a>
          ${close}`,
      }
    case 'application_received':
      return {
        subject: `Application received — ${esc(p.jobTitle)}`,
        html: `${brand}<h2 style="color:#0f172a;margin:0 0 12px">Application received ✅</h2>
          <p style="color:#64748b;line-height:1.6">Hi ${esc(p.name) || 'there'}, your application for <strong>${esc(p.jobTitle)}</strong> at <strong>${esc(p.company)}</strong> has been received. We'll notify you when there's an update.</p>
          ${close}`,
      }
    case 'application_update':
      return {
        subject: `Update on your application — ${esc(p.jobTitle)}`,
        html: `${brand}<h2 style="color:#0f172a;margin:0 0 12px">Application update 📬</h2>
          <p style="color:#64748b;line-height:1.6">Hi ${esc(p.name) || 'there'}, your application for <strong>${esc(p.jobTitle)}</strong> at <strong>${esc(p.company)}</strong> has been updated to: <strong style="color:#6366f1">${esc(p.status)}</strong>.</p>
          ${close}`,
      }
    case 'interview_invite':
      return {
        subject: `Interview invitation — ${esc(p.company)}`,
        html: `${brand}<h2 style="color:#0f172a;margin:0 0 12px">You got an interview! 🎯</h2>
          <p style="color:#64748b;line-height:1.6">Congratulations ${esc(p.name) || 'there'}! <strong>${esc(p.company)}</strong> has invited you to interview for <strong>${esc(p.jobTitle)}</strong>.</p>
          ${p.interviewDate ? `<p style="color:#64748b"><strong>Date:</strong> ${esc(p.interviewDate)}</p>` : ''}
          ${p.interviewLink && /^https?:\/\//.test(p.interviewLink) ? `<a href="${esc(p.interviewLink)}" style="display:inline-block;margin-top:16px;background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Join Interview →</a>` : ''}
          ${close}`,
      }
  }
}

export async function POST(req: NextRequest) {
  try {
    // Require a valid Supabase auth token — prevents unauthenticated email relay
    const authHeader = req.headers.get('authorization') ?? ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    )
    const { data: { user }, error: authErr } = await sb.auth.getUser(token)
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    const payload: EmailPayload = await req.json()

    // Only allow sending to the authenticated user's own email address
    if (payload.to && payload.to !== user.email) {
      return NextResponse.json({ error: 'Forbidden: cannot send to a different email address.' }, { status: 403 })
    }
    const { subject, html } = buildEmail(payload)

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendKey}` },
      body: JSON.stringify({
        from: 'Sho8lana <noreply@sho8lana.com>',
        to:   payload.to,
        subject,
        html,
      }),
    })

    const data = await res.json()
    if (!res.ok) return NextResponse.json({ error: data.message ?? 'Send failed' }, { status: 500 })
    return NextResponse.json({ sent: true, id: data.id })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
