'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, Trash2, Bot } from 'lucide-react'
import { useApp, callGemini } from '@/lib/store'
import { useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

const SUGGESTIONS_EN = [
  'How do I write a standout CV?',
  'What are the best internships in Egypt?',
  'Tips for my first job interview',
  'How to negotiate salary as a student?',
  'Best skills for business graduates',
  'How to build a LinkedIn profile?',
]

const SUGGESTIONS_AR = [
  'كيف أكتب سيرة ذاتية مميزة؟',
  'ما أفضل التدريبات في مصر؟',
  'نصائح لأول مقابلة عمل',
  'كيف أتفاوض على الراتب؟',
  'أهم المهارات لخريجي إدارة الأعمال',
  'كيف أبني ملف LinkedIn؟',
]

export function AIScreen() {
  const { state, dispatch } = useApp()
  const ar = state.lang === 'ar'
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [state.chat, state.aiLoading])

  async function send(text: string) {
    if (!text.trim() || state.aiLoading) return
    dispatch({ type: 'SET_AI_INPUT', input: '' })
    dispatch({ type: 'ADD_CHAT', msg: { role: 'user', text } })
    dispatch({ type: 'SET_AI_LOADING', loading: true })

    const context = state.user.name
      ? `Student: ${state.user.name}, studying ${state.user.major || 'Business'} at ${state.user.university || 'an Egyptian university'}, GPA: ${state.user.gpa || '3.0'}, located in ${state.user.location}.`
      : 'An Egyptian college student.'

    const res = await callGemini(
      `${context}\n\nStudent asks: ${text}`,
      `You are a friendly and knowledgeable career advisor for Egyptian college students. Give practical, encouraging, specific advice. Keep responses concise (3-5 sentences). ${ar ? 'Respond in Arabic.' : 'Respond in English.'}`
    )
    dispatch({ type: 'ADD_CHAT', msg: { role: 'assistant', text: res } })
    dispatch({ type: 'SET_AI_LOADING', loading: false })
  }

  const suggestions = ar ? SUGGESTIONS_AR : SUGGESTIONS_EN

  return (
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="sticky top-0 z-20 bg-white border-b border-neutral-100 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-neutral-900">{ar ? 'مساعد المسيرة المهنية' : 'Career Assistant'}</h2>
            <p className="text-2xs text-violet-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {ar ? 'مدعوم بـ Groq AI · متصل' : 'Powered by Groq AI · Online'}
            </p>
          </div>
        </div>
        {state.chat.length > 0 && (
          <button
            onClick={() => dispatch({ type: 'CLEAR_CHAT' })}
            aria-label={ar ? 'مسح المحادثة' : 'Clear chat'}
            className="w-11 h-11 flex items-center justify-center text-neutral-400 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {state.chat.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
            className="flex flex-col items-center justify-center py-8 gap-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-violet-500" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-neutral-800 mb-1">
                {ar ? 'مرحباً! كيف يمكنني مساعدتك؟' : 'Hi! How can I help you?'}
              </h3>
              <p className="text-xs text-neutral-400">
                {ar ? 'اسألني عن التدريبات، السيرة الذاتية، أو نصائح المقابلات' : 'Ask me about internships, CVs, or interview tips'}
              </p>
            </div>

            {/* Suggestion chips */}
            <div className="w-full flex flex-wrap gap-2 justify-center mt-2">
              {suggestions.map((s, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1, transition: { delay: 0.1 + i * 0.05 } }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => send(s)}
                  className="text-xs font-medium text-violet-700 bg-violet-50 border border-violet-200 px-3 py-1.5 rounded-full hover:bg-violet-100 transition-colors"
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <>
            <AnimatePresence>
              {state.chat.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.3 } }}
                  className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <Bot className="w-3.5 h-3.5 text-violet-600" />
                    </div>
                  )}
                  <div className={cn(
                    'max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-brand-600 text-white rounded-br-sm'
                      : 'bg-white border border-neutral-100 text-neutral-800 shadow-card rounded-bl-sm'
                  )}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {state.aiLoading && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3.5 h-3.5 text-violet-600" />
                </div>
                <div className="bg-white border border-neutral-100 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                  {[0, 1, 2].map(d => (
                    <motion.div key={d} className="w-1.5 h-1.5 rounded-full bg-violet-400"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: d * 0.15 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 border-t border-neutral-100 bg-white px-4 py-3 pb-safe">
        {/* Quick-reply chips when there's already a conversation */}
        {state.chat.length > 0 && state.chat.length < 4 && !state.aiLoading && (
          <div className="flex gap-2 overflow-x-auto scroll-hide mb-2 pb-0.5">
            {(ar ? ['شكراً، ممتاز!', 'أخبرني أكثر', 'كيف أبدأ؟'] : ['Tell me more', 'Give me an example', 'What should I do first?']).map(q => (
              <button
                key={q}
                onClick={() => send(q)}
                className="shrink-0 text-[11px] font-medium text-violet-700 bg-violet-50 border border-violet-200 px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-violet-100 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2 items-end">
          <input
            className="flex-1 min-h-[44px] px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
            placeholder={ar ? 'اسأل عن مسيرتك المهنية...' : 'Ask about your career...'}
            value={state.aiInput}
            onChange={e => dispatch({ type: 'SET_AI_INPUT', input: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && send(state.aiInput)}
          />
          <motion.button
            whileTap={{ scale: 0.92 }}
            disabled={!state.aiInput.trim() || state.aiLoading}
            onClick={() => send(state.aiInput)}
            aria-label={ar ? 'إرسال' : 'Send message'}
            className={cn(
              'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all',
              state.aiInput.trim() && !state.aiLoading
                ? 'bg-violet-600 text-white hover:bg-violet-700 shadow-sm'
                : 'bg-neutral-100 text-neutral-400'
            )}
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
