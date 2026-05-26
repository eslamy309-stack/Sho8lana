import { NextRequest, NextResponse } from 'next/server'

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
        subject: `Welcome to Sho8lana, ${p.name ?? 'there'}!`,
        html: `${brand}<h2 style="color:#0f172a;margin:0 0 12px">You're in, ${p.name ?? 'there'}! 🎉</h2>
          <p style="color:#64748b;line-height:1.6">Start competing in real business simulations, build your KPI profile, and get discovered by Egypt's top employers.</p>
          <a href="https://sho8lana.vercel.app" style="display:inline-block;margin-top:20px;background:#10b981;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Open Sho8lana →</a>
          ${close}`,
      }
    case 'welcome_company':
      return {
        subject: `Welcome to Sho8lana for Companies`,
        html: `${brand}<h2 style="color:#0f172a;margin:0 0 12px">Welcome, ${p.company ?? 'your company'}! 🏢</h2>
          <p style="color:#64748b;line-height:1.6">Your HR dashboard is ready. Start discovering simulation-verified talent from 50,000+ students across Egypt.</p>
          <a href="https://sho8lana.vercel.app" style="display:inline-block;margin-top:20px;background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Open HR Dashboard →</a>
          ${close}`,
      }
    case 'application_received':
      return {
        subject: `Application received — ${p.jobTitle}`,
        html: `${brand}<h2 style="color:#0f172a;margin:0 0 12px">Application received ✅</h2>
          <p style="color:#64748b;line-height:1.6">Hi ${p.name ?? 'there'}, your application for <strong>${p.jobTitle}</strong> at <strong>${p.company}</strong> has been received. We'll notify you when there's an update.</p>
          ${close}`,
      }
    case 'application_update':
      return {
        subject: `Update on your application — ${p.jobTitle}`,
        html: `${brand}<h2 style="color:#0f172a;margin:0 0 12px">Application update 📬</h2>
          <p style="color:#64748b;line-height:1.6">Hi ${p.name ?? 'there'}, your application for <strong>${p.jobTitle}</strong> at <strong>${p.company}</strong> has been updated to: <strong style="color:#6366f1">${p.status}</strong>.</p>
          ${close}`,
      }
    case 'interview_invite':
      return {
        subject: `Interview invitation — ${p.company}`,
        html: `${brand}<h2 style="color:#0f172a;margin:0 0 12px">You got an interview! 🎯</h2>
          <p style="color:#64748b;line-height:1.6">Congratulations ${p.name ?? 'there'}! <strong>${p.company}</strong> has invited you to interview for <strong>${p.jobTitle}</strong>.</p>
          ${p.interviewDate ? `<p style="color:#64748b"><strong>Date:</strong> ${p.interviewDate}</p>` : ''}
          ${p.interviewLink ? `<a href="${p.interviewLink}" style="display:inline-block;margin-top:16px;background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Join Interview →</a>` : ''}
          ${close}`,
      }
  }
}

export async function POST(req: NextRequest) {
  try {
    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    const payload: EmailPayload = await req.json()
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
