/**
 * /api/messages
 *
 * GET  ?userId=<uuid>              → list all conversations for a user
 * GET  ?conversationId=<uuid>      → list messages in a conversation
 * POST { conversationId?, studentId, companyId, jobId?, jobTitle?, companyName?, studentName?, content, senderId }
 *      → create/get conversation + insert message
 * PATCH { conversationId, userId } → mark all messages in conversation as read
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient }              from '@supabase/supabase-js'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL    ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY   ?? '',
  )
}

async function verifyUser(token: string): Promise<string | null> {
  if (!token) return null
  const anon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL      ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  )
  const { data: { user } } = await anon.auth.getUser(token)
  return user?.id ?? null
}

// ── GET ───────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const token = (req.headers.get('authorization') ?? '').replace('Bearer ', '')
  const uid   = await verifyUser(token)
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sp             = req.nextUrl.searchParams
  const conversationId = sp.get('conversationId')
  const userId         = sp.get('userId')

  const db = getAdmin()

  // ── Get messages for a specific conversation ──────────────────────────────
  if (conversationId) {
    const { data, error } = await db
      .from('messages')
      .select('id, sender_id, content, read, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(200)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Mark messages as read for this user
    await db
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', uid)
      .eq('read', false)

    // Reset unread counter for this user in conversation
    const { data: conv } = await db
      .from('conversations')
      .select('student_id, company_id')
      .eq('id', conversationId)
      .single()

    if (conv) {
      const isStudent = conv.student_id === uid
      await db
        .from('conversations')
        .update(isStudent ? { unread_student: 0 } : { unread_company: 0 })
        .eq('id', conversationId)
    }

    return NextResponse.json({ messages: data ?? [] })
  }

  // ── Get all conversations for a user ──────────────────────────────────────
  if (userId) {
    if (uid !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data, error } = await db
      .from('conversations')
      .select('id, student_id, company_id, job_id, job_title, company_name, student_name, last_message, last_at, unread_student, unread_company, created_at')
      .or(`student_id.eq.${userId},company_id.eq.${userId}`)
      .order('last_at', { ascending: false })
      .limit(50)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ conversations: data ?? [] })
  }

  return NextResponse.json({ error: 'Missing userId or conversationId' }, { status: 400 })
}

// ── POST ──────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const token = (req.headers.get('authorization') ?? '').replace('Bearer ', '')
  const uid   = await verifyUser(token)
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const {
    conversationId,
    studentId,
    companyId,
    jobId,
    jobTitle,
    companyName,
    studentName,
    content,
    senderId,
  } = await req.json()

  if (!content?.trim()) return NextResponse.json({ error: 'Content required' }, { status: 400 })
  if (uid !== senderId)  return NextResponse.json({ error: 'Forbidden'         }, { status: 403 })

  const db = getAdmin()
  let convId = conversationId

  // ── Find or create conversation ───────────────────────────────────────────
  if (!convId) {
    if (!studentId || !companyId) {
      return NextResponse.json({ error: 'studentId and companyId required to start conversation' }, { status: 400 })
    }

    // Check for existing
    const existing = await db
      .from('conversations')
      .select('id')
      .eq('student_id', studentId)
      .eq('company_id', companyId)
      .eq('job_id', jobId ?? null)
      .maybeSingle()

    if (existing.data) {
      convId = existing.data.id
    } else {
      const { data: newConv, error: convErr } = await db
        .from('conversations')
        .insert({
          student_id:   studentId,
          company_id:   companyId,
          job_id:       jobId     ?? null,
          job_title:    jobTitle  ?? null,
          company_name: companyName ?? null,
          student_name: studentName ?? null,
        })
        .select('id')
        .single()

      if (convErr) return NextResponse.json({ error: convErr.message }, { status: 500 })
      convId = newConv.id
    }
  }

  // ── Insert message ─────────────────────────────────────────────────────────
  const { data: msg, error: msgErr } = await db
    .from('messages')
    .insert({
      conversation_id: convId,
      sender_id:       uid,
      content:         content.trim(),
    })
    .select('id, sender_id, content, read, created_at')
    .single()

  if (msgErr) return NextResponse.json({ error: msgErr.message }, { status: 500 })

  // ── Update conversation last_message + unread counter ─────────────────────
  const { data: conv } = await db
    .from('conversations')
    .select('student_id, company_id')
    .eq('id', convId)
    .single()

  if (conv) {
    const isStudent = conv.student_id === uid
    await db.from('conversations').update({
      last_message:   content.trim().slice(0, 120),
      last_at:        new Date().toISOString(),
      ...(isStudent
        ? { unread_company: db.rpc('increment_unread_company' as never, { conv_id: convId }) }
        : { unread_student: db.rpc('increment_unread_student' as never, { conv_id: convId }) }),
    }).eq('id', convId)

    // Simpler increment approach
    await db.rpc('increment_conversation_unread', {
      p_conv_id:   convId,
      p_is_sender_student: isStudent,
    }).catch(() => {
      // RPC might not exist yet — do a manual update
    })
    // Fallback: direct SQL increment
    await db.from('conversations').update({
      last_message: content.trim().slice(0, 120),
      last_at:      new Date().toISOString(),
    }).eq('id', convId)
  }

  return NextResponse.json({ message: msg, conversationId: convId })
}

// ── PATCH — mark conversation as read ─────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  const token = (req.headers.get('authorization') ?? '').replace('Bearer ', '')
  const uid   = await verifyUser(token)
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { conversationId } = await req.json()
  if (!conversationId) return NextResponse.json({ error: 'conversationId required' }, { status: 400 })

  const db = getAdmin()

  await db
    .from('messages')
    .update({ read: true })
    .eq('conversation_id', conversationId)
    .neq('sender_id', uid)

  const { data: conv } = await db
    .from('conversations')
    .select('student_id, company_id')
    .eq('id', conversationId)
    .single()

  if (conv) {
    const isStudent = conv.student_id === uid
    await db.from('conversations').update(
      isStudent ? { unread_student: 0 } : { unread_company: 0 }
    ).eq('id', conversationId)
  }

  return NextResponse.json({ ok: true })
}
