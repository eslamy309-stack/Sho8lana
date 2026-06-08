'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Send, Loader2, Building2 } from 'lucide-react'
import { useApp } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import type { Conversation, DirectMessage } from '@/lib/types'

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
function formatDay(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) return 'Today'
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString()
}

export function ChatScreen() {
  const { state, dispatch } = useApp()
  const ar  = state.lang === 'ar'
  const uid = state.user.supabaseId

  // Read conversation from sessionStorage (set by InboxScreen)
  const [conv, setConv] = useState<Conversation | null>(null)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('sho8_chat_conv')
      if (raw) setConv(JSON.parse(raw))
    } catch { /* ignore */ }
  }, [])

  const [messages,    setMessages]    = useState<DirectMessage[]>([])
  const [loading,     setLoading]     = useState(true)
  const [input,       setInput]       = useState('')
  const [sending,     setSending]     = useState(false)
  const bottomRef   = useRef<HTMLDivElement>(null)
  const inputRef    = useRef<HTMLTextAreaElement>(null)

  // Determine "other" user's name
  const isCompany   = uid === conv?.company_id
  const otherName   = isCompany ? (conv?.student_name ?? 'Student') : (conv?.company_name ?? 'Company')
  const jobTitle    = conv?.job_title

  // ── Load messages ─────────────────────────────────────────────────────────
  const loadMessages = useCallback(async () => {
    if (!conv?.id || !uid) return
    setLoading(true)

    const { data } = await supabase
      .from('messages')
      .select('id, sender_id, content, read, created_at')
      .eq('conversation_id', conv.id)
      .order('created_at', { ascending: true })
      .limit(200)

    setMessages((data ?? []) as DirectMessage[])
    setLoading(false)

    // Mark as read
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conv.id)
      .neq('sender_id', uid)

    await supabase
      .from('conversations')
      .update(isCompany ? { unread_company: 0 } : { unread_student: 0 })
      .eq('id', conv.id)
  }, [conv?.id, uid, isCompany])

  useEffect(() => { loadMessages() }, [loadMessages])

  // Scroll to bottom when messages load/update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Realtime subscription ─────────────────────────────────────────────────
  useEffect(() => {
    if (!conv?.id) return
    const channel = supabase
      .channel(`chat-${conv.id}`)
      .on('postgres_changes', {
        event:  'INSERT',
        schema: 'public',
        table:  'messages',
        filter: `conversation_id=eq.${conv.id}`,
      }, (payload) => {
        const msg = payload.new as DirectMessage
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(m => m.id === msg.id)) return prev
          return [...prev, msg]
        })
        // Mark read if we're the receiver
        if (msg.sender_id !== uid) {
          supabase.from('messages').update({ read: true }).eq('id', msg.id)
          supabase.from('conversations').update(
            isCompany ? { unread_company: 0 } : { unread_student: 0 }
          ).eq('id', conv.id)
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [conv?.id, uid, isCompany])

  // ── Send message ─────────────────────────────────────────────────────────
  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || !uid || !conv?.id || sending) return

    setSending(true)
    setInput('')

    // Optimistic update
    const tempId = `temp-${Date.now()}`
    const optimistic: DirectMessage = {
      id: tempId, sender_id: uid, content: text, read: false,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimistic])

    const { data: newMsg } = await supabase
      .from('messages')
      .insert({ conversation_id: conv.id, sender_id: uid, content: text })
      .select('id, sender_id, content, read, created_at')
      .single()

    // Replace optimistic message with real one
    if (newMsg) {
      setMessages(prev => prev.map(m => m.id === tempId ? newMsg as DirectMessage : m))
    }

    // Update conversation last_message
    await supabase.from('conversations').update({
      last_message: text.slice(0, 120),
      last_at:      new Date().toISOString(),
      ...(isCompany
        ? { unread_student: messages.filter(m => m.sender_id !== uid).length + 1 }
        : { unread_company: messages.filter(m => m.sender_id !== uid).length + 1 }),
    }).eq('id', conv.id)

    setSending(false)
    inputRef.current?.focus()
  }, [input, uid, conv?.id, sending, isCompany, messages])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  // ── Group messages by day ─────────────────────────────────────────────────
  const grouped: { day: string; msgs: DirectMessage[] }[] = []
  for (const msg of messages) {
    const day = formatDay(msg.created_at)
    const last = grouped[grouped.length - 1]
    if (last?.day === day) last.msgs.push(msg)
    else grouped.push({ day, msgs: [msg] })
  }

  if (!conv) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <p className="text-sm text-neutral-500">No conversation selected</p>
        <button onClick={() => dispatch({ type: 'GO', screen: 'inbox' })} className="mt-3 text-brand-600 text-sm font-semibold">
          ← Back to Inbox
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-10 md:pt-4 pb-3 bg-white border-b border-neutral-100 flex-shrink-0">
        <button
          onClick={() => dispatch({ type: 'GO', screen: 'inbox' })}
          className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0"
          aria-label="Back"
        >
          {ar
            ? <ChevronRight className="w-4 h-4 text-neutral-700" />
            : <ChevronLeft  className="w-4 h-4 text-neutral-700" />}
        </button>
        <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center flex-shrink-0">
          <Building2 className="w-4 h-4 text-brand-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-neutral-900 truncate">{otherName}</p>
          {jobTitle && (
            <p className="text-xs text-brand-600 truncate">{jobTitle}</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-5 h-5 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-16">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center">
              <Send className="w-5 h-5 text-brand-600" />
            </div>
            <p className="text-sm font-semibold text-neutral-700">
              {ar ? 'ابدأ المحادثة' : 'Start the conversation'}
            </p>
            {jobTitle && (
              <p className="text-xs text-neutral-400 text-center px-8">
                {ar ? `بخصوص: ${jobTitle}` : `Regarding: ${jobTitle}`}
              </p>
            )}
          </div>
        ) : (
          grouped.map(({ day, msgs }) => (
            <div key={day}>
              {/* Day separator */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-neutral-100" />
                <span className="text-[10px] text-neutral-400 font-medium">{day}</span>
                <div className="flex-1 h-px bg-neutral-100" />
              </div>

              {msgs.map((msg) => {
                const mine = msg.id.startsWith('temp-')
                  ? true
                  : msg.sender_id === uid
                return (
                  <AnimatePresence key={msg.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className={cn('flex mb-1', mine ? 'justify-end' : 'justify-start')}
                    >
                      <div className={cn(
                        'max-w-[78%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed',
                        mine
                          ? 'bg-brand-600 text-white rounded-br-sm'
                          : 'bg-neutral-100 text-neutral-900 rounded-bl-sm',
                      )}>
                        <p>{msg.content}</p>
                        <p className={cn('text-[9px] mt-1', mine ? 'text-white/60 text-right' : 'text-neutral-400')}>
                          {formatTime(msg.created_at)}
                          {mine && msg.read && ' ✓✓'}
                          {mine && !msg.read && ' ✓'}
                        </p>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                )
              })}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="flex items-end gap-2 px-4 py-3 border-t border-neutral-100 bg-white flex-shrink-0">
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={ar ? 'اكتب رسالة…' : 'Type a message…'}
          rows={1}
          className="flex-1 resize-none rounded-2xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/15 transition-all max-h-32 overflow-y-auto"
          style={{ lineHeight: '1.4' }}
          dir={ar ? 'rtl' : 'ltr'}
        />
        <button
          onClick={send}
          disabled={!input.trim() || sending}
          aria-label="Send"
          className="w-10 h-10 rounded-2xl bg-brand-600 flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-opacity hover:bg-brand-700 active:scale-95"
        >
          {sending
            ? <Loader2 className="w-4 h-4 text-white animate-spin" />
            : <Send className="w-4 h-4 text-white" />}
        </button>
      </div>
    </div>
  )
}
