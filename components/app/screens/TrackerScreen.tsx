'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, ExternalLink, Trash2, X, CheckCircle2, Clock } from 'lucide-react'
import { useApp } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { AppStatus } from '@/lib/types'

const STATUS: Record<AppStatus, { label: string; labelAr: string; bg: string; text: string; bar: string; icon: string }> = {
  applied:     { label: 'Applied',      labelAr: 'تم التقديم',    bg: 'bg-blue-50',    text: 'text-blue-600',    bar: 'bg-blue-400',    icon: '📩' },
  reviewing:   { label: 'Under Review', labelAr: 'قيد المراجعة',  bg: 'bg-amber-50',   text: 'text-amber-600',   bar: 'bg-amber-400',   icon: '👀' },
  shortlisted: { label: 'Shortlisted',  labelAr: 'قائمة قصيرة',   bg: 'bg-purple-50',  text: 'text-purple-600',  bar: 'bg-purple-400',  icon: '⭐' },
  interview:   { label: 'Interview',    labelAr: 'مقابلة',        bg: 'bg-brand-50',   text: 'text-brand-600',   bar: 'bg-brand-500',   icon: '🗓️' },
  accepted:    { label: 'Accepted!',    labelAr: 'مقبول!',        bg: 'bg-emerald-50', text: 'text-emerald-600', bar: 'bg-emerald-500', icon: '🎉' },
  rejected:    { label: 'Not Selected', labelAr: 'غير مختار',     bg: 'bg-red-50',     text: 'text-red-500',     bar: 'bg-red-400',     icon: '❌' },
}

const STEPS: AppStatus[] = ['applied', 'reviewing', 'shortlisted', 'interview', 'accepted']

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }
const up = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } } }

function ConfirmWithdraw({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <h3 className="text-base font-bold text-neutral-900">Withdraw Application?</h3>
        </div>
        <p className="text-sm text-neutral-500 mb-5 leading-relaxed">
          This will remove your application. You can re-apply later if the position is still open.
        </p>
        <div className="flex gap-2">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors">
            Keep Application
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors">
            Withdraw
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export function TrackerScreen() {
  const { state, dispatch } = useApp()
  const ar = state.lang === 'ar'
  const [confirmId, setConfirmId] = useState<string | number | null>(null)
  const [filter, setFilter] = useState<AppStatus | 'all'>('all')

  const filtered = filter === 'all'
    ? state.applications
    : state.applications.filter(a => a.status === filter)

  function withdraw(id: string | number) {
    dispatch({ type: 'WITHDRAW_APPLICATION', id })
    setConfirmId(null)
  }

  const statusCounts = Object.fromEntries(
    (Object.keys(STATUS) as AppStatus[]).map(s => [s, state.applications.filter(a => a.status === s).length])
  )

  return (
    <div className="min-h-dvh bg-neutral-50">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-neutral-100 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-neutral-900">{ar ? 'طلباتي' : 'My Applications'}</h2>
          <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
            {state.applications.length} {ar ? 'طلب' : 'total'}
          </span>
        </div>
        {/* Status filter pills */}
        {state.applications.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button onClick={() => setFilter('all')}
              className={cn('flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-colors',
                filter === 'all' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200')}>
              All ({state.applications.length})
            </button>
            {(Object.keys(STATUS) as AppStatus[]).map(s => {
              const count = statusCounts[s]
              if (!count) return null
              const cfg = STATUS[s]
              return (
                <button key={s} onClick={() => setFilter(s)}
                  className={cn('flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-colors',
                    filter === s ? `${cfg.bar.replace('bg-', 'bg-')} text-white` : `${cfg.bg} ${cfg.text}`)}>
                  {cfg.icon} {ar ? cfg.labelAr : cfg.label} ({count})
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="px-4 py-4">
        {state.applications.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center">
              <FileText className="w-8 h-8 text-neutral-300" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-semibold text-neutral-700 mb-1">
                {ar ? 'لا توجد طلبات بعد' : 'No applications yet'}
              </h3>
              <p className="text-sm text-neutral-400">
                {ar ? 'ابدأ بالتقديم على التدريبات' : 'Start applying to internships to track them here'}
              </p>
            </div>
            <Button size="md" onClick={() => dispatch({ type: 'NAV_TO', tab: 'home' })}>
              {ar ? 'ابحث عن تدريبات' : 'Browse internships'}
            </Button>
          </motion.div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-neutral-400">No applications with this status</p>
            <button onClick={() => setFilter('all')} className="text-xs text-brand-600 font-semibold mt-2 hover:underline">
              Show all
            </button>
          </div>
        ) : (
          <motion.div variants={stagger} initial="hidden" animate="visible" className="flex flex-col gap-3">
            {filtered.map((app) => {
              const st = STATUS[app.status] ?? STATUS.applied
              const stepIdx = STEPS.indexOf(app.status)
              const isTerminal = app.status === 'rejected' || app.status === 'accepted'

              return (
                <motion.div key={app.id} variants={up}
                  className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center text-xl flex-shrink-0">
                      {app.logo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-neutral-900 truncate">{app.title}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">{app.company}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={cn('text-2xs font-semibold px-2 py-0.5 rounded-full', st.bg, st.text)}>
                          {st.icon} {ar ? st.labelAr : st.label}
                        </span>
                        <span className="text-2xs text-neutral-400">{app.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress track */}
                  {!isTerminal && (
                    <div className="mt-3">
                      <div className="flex gap-1">
                        {STEPS.map((step, si) => (
                          <div key={step} className="flex-1 flex flex-col items-center gap-1">
                            <div className={cn('h-1.5 w-full rounded-full transition-colors duration-300',
                              stepIdx >= si ? st.bar : 'bg-neutral-100')} />
                            <span className={cn('text-[9px] font-medium hidden sm:block',
                              stepIdx >= si ? st.text : 'text-neutral-300')}>
                              {STATUS[step].label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {app.status === 'accepted' && (
                    <div className="mt-3 flex items-center gap-2 bg-emerald-50 rounded-xl px-3 py-2 border border-emerald-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <p className="text-xs font-semibold text-emerald-700">
                        Congratulations! Check your email for next steps.
                      </p>
                    </div>
                  )}

                  {app.status === 'interview' && (
                    <div className="mt-3 flex items-center gap-2 bg-brand-50 rounded-xl px-3 py-2 border border-brand-100">
                      <Clock className="w-4 h-4 text-brand-500 flex-shrink-0" />
                      <p className="text-xs font-semibold text-brand-700">
                        Interview scheduled — check your email for details.
                      </p>
                    </div>
                  )}

                  {/* Actions row */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-50">
                    {app.externalUrl && (
                      <a href={app.externalUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-semibold transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                        {ar ? 'عرض الوظيفة' : 'View posting'}
                      </a>
                    )}
                    <div className="ml-auto">
                      {app.status !== 'accepted' && app.status !== 'rejected' && (
                        <button
                          onClick={() => setConfirmId(app.id)}
                          className="flex items-center gap-1 text-2xs text-neutral-400 hover:text-red-500 transition-colors font-medium"
                        >
                          <X className="w-3 h-3" />
                          {ar ? 'سحب الطلب' : 'Withdraw'}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>

      {/* Withdraw confirmation modal */}
      <AnimatePresence>
        {confirmId !== null && (
          <ConfirmWithdraw
            onConfirm={() => withdraw(confirmId)}
            onCancel={() => setConfirmId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
