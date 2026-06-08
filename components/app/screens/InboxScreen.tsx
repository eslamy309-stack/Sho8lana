'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, ChevronRight, ChevronLeft, Building2, RefreshCw } from 'lucide-react'
import { useApp } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import type { Conversation } from '@/lib/types'

const up = {
  hidden:  { opacity: 0, y: 10 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.28, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] } }),
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export function InboxScreen() {
  const { state, dispatch } = useApp()
  const ar   = state.lang === 'ar'
  const uid  = state.user.supabaseId

  const [convs,   setConvs]   = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  const load = async () => {
    if (!uid) { setLoading(false); return }
    setLoading(true)
    setError('')
    const { data, error: err } = await supabase
      .from('conversations')
      .select('*')
      .or(`student_id.eq.${uid},company_id.eq.${uid}`)
      .order('last_at', { ascending: false })
      .limit(50)

    if (err) setError(err.message)
    else     setConvs((data ?? []) as Conversation[])
    setLoading(false)
  }

  useEffect(() => { load() }, [uid]) // eslint-disable-line react-hooks/exhaustive-deps

  // Realtime subscription — update list when a new message arrives
  useEffect(() => {
    if (!uid) return
    const channel = supabase
      .channel(`inbox-${uid}`)
      .on('postgres_changes', {
        event:  '*',
        schema: 'public',
        table:  'conversations',
        filter: `student_id=eq.${uid}`,
      }, () => load())
      .on('postgres_changes', {
        event:  '*',
        schema: 'public',
        table:  'conversations',
        filter: `company_id=eq.${uid}`,
      }, () => load())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [uid]) // eslint-disable-line react-hooks/exhaustive-deps

  const isCompany = (state.user.role ?? 'student') === 'company_recruiter'
    || (state.user.role ?? '') === 'company_admin'

  const unreadFor = (c: Conversation) =>
    isCompany ? c.unread_company : c.unread_student

  const getOtherName = (c: Conversation) =>
    isCompany ? (c.student_name ?? 'Student') : (c.company_name ?? 'Company')

  return (
    <div className="flex flex-col h-full bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-100 px-4 pt-10 md:pt-4 pb-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-brand-600" />
          <h1 className="text-base font-bold text-neutral-900">
            {ar ? 'الرسائل' : 'Messages'}
          </h1>
          {convs.reduce((sum, c) => sum + unreadFor(c), 0) > 0 && (
            <span className="text-[10px] font-bold bg-brand-600 text-white px-1.5 py-0.5 rounded-full">
              {convs.reduce((sum, c) => sum + unreadFor(c), 0)}
            </span>
          )}
        </div>
        <button
          onClick={load}
          aria-label="Refresh"
          className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {!uid ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center">
              <MessageCircle className="w-7 h-7 text-brand-600" />
            </div>
            <p className="text-sm font-semibold text-neutral-700">
              {ar ? 'سجّل الدخول للوصول للرسائل' : 'Sign in to access messages'}
            </p>
            <button
              onClick={() => dispatch({ type: 'GO', screen: 'login' })}
              className="px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-semibold"
            >
              {ar ? 'تسجيل الدخول' : 'Sign In'}
            </button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-16 px-4">
            <p className="text-sm text-red-500 mb-3">{error}</p>
            <button onClick={load} className="text-xs font-semibold text-brand-600">Retry</button>
          </div>
        ) : convs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-neutral-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-700">
                {ar ? 'لا توجد محادثات بعد' : 'No conversations yet'}
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                {ar
                  ? 'تقدّم لوظيفة وستبدأ المحادثات مع الشركات'
                  : 'Apply to a job and companies will reach out to you'}
              </p>
            </div>
            <button
              onClick={() => dispatch({ type: 'GO', screen: 'home' })}
              className="px-4 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-semibold"
            >
              {ar ? 'استكشف الوظائف' : 'Browse Jobs'}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {convs.map((c, i) => {
              const unread = unreadFor(c)
              return (
                <motion.button
                  key={c.id}
                  variants={up}
                  initial="hidden"
                  animate="visible"
                  custom={i}
                  onClick={() => {
                    // Store selected conversation in sessionStorage for ChatScreen
                    sessionStorage.setItem('sho8_chat_conv', JSON.stringify(c))
                    dispatch({ type: 'GO', screen: 'chat' })
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 bg-white hover:bg-neutral-50 transition-colors text-left"
                >
                  {/* Avatar */}
                  <div className={cn(
                    'w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-white text-xs font-bold',
                    unread > 0 ? 'bg-brand-600' : 'bg-neutral-200',
                  )}>
                    {unread > 0
                      ? <Building2 className="w-5 h-5" />
                      : <Building2 className="w-5 h-5 text-neutral-500" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className={cn('text-sm font-semibold truncate', unread > 0 ? 'text-neutral-900' : 'text-neutral-700')}>
                        {getOtherName(c)}
                      </p>
                      <span className="text-[10px] text-neutral-400 flex-shrink-0 ml-2">
                        {timeAgo(c.last_at)}
                      </span>
                    </div>
                    {c.job_title && (
                      <p className="text-[10px] text-brand-600 font-medium mb-0.5 truncate">
                        {c.job_title}
                      </p>
                    )}
                    <p className={cn('text-xs truncate', unread > 0 ? 'text-neutral-700 font-medium' : 'text-neutral-400')}>
                      {c.last_message ?? (ar ? 'ابدأ المحادثة' : 'Start the conversation')}
                    </p>
                  </div>

                  {/* Unread badge + chevron */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {unread > 0 && (
                      <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-[9px] font-bold flex items-center justify-center">
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                    {ar
                      ? <ChevronLeft className="w-4 h-4 text-neutral-300" />
                      : <ChevronRight className="w-4 h-4 text-neutral-300" />}
                  </div>
                </motion.button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
