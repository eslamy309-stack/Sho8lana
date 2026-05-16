'use client'

import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'
import { useApp } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { AppStatus } from '@/lib/types'

const STATUS: Record<AppStatus, { label: string; labelAr: string; bg: string; text: string; bar: string }> = {
  applied:   { label: 'Applied',      labelAr: 'تم التقديم',    bg: 'bg-blue-50',    text: 'text-blue-600',    bar: 'bg-blue-500'   },
  reviewing: { label: 'Under Review', labelAr: 'قيد المراجعة',  bg: 'bg-warning-50', text: 'text-warning-600', bar: 'bg-warning-500' },
  interview: { label: 'Interview',    labelAr: 'مقابلة',        bg: 'bg-brand-50',   text: 'text-brand-600',   bar: 'bg-brand-500'  },
  offer:     { label: 'Offer!',       labelAr: 'عرض وظيفي',    bg: 'bg-success-50', text: 'text-success-600', bar: 'bg-success-500' },
  rejected:  { label: 'Not Selected', labelAr: 'مرفوض',         bg: 'bg-danger-50',  text: 'text-danger-500',  bar: 'bg-danger-400'  },
}
const STEPS: AppStatus[] = ['applied', 'reviewing', 'interview', 'offer']

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }
const up = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } } }

export function TrackerScreen() {
  const { state, dispatch } = useApp()
  const ar = state.lang === 'ar'

  return (
    <div className="min-h-dvh bg-neutral-50">
      <div className="sticky top-0 z-20 bg-white border-b border-neutral-100 px-4 py-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-neutral-900">{ar ? 'طلباتي' : 'My Applications'}</h2>
        <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
          {state.applications.length}
        </span>
      </div>

      <div className="px-4 py-4">
        {state.applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center">
              <FileText className="w-8 h-8 text-neutral-300" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-semibold text-neutral-700 mb-1">{ar ? 'لا توجد طلبات بعد' : 'No applications yet'}</h3>
              <p className="text-sm text-neutral-400">{ar ? 'ابدأ بالتقديم على التدريبات' : 'Start applying to internships'}</p>
            </div>
            <Button size="md" onClick={() => dispatch({ type: 'NAV_TO', tab: 'home' })}>
              {ar ? 'ابحث عن تدريبات' : 'Find internships'}
            </Button>
          </div>
        ) : (
          <motion.div variants={stagger} initial="hidden" animate="visible" className="flex flex-col gap-3">
            {state.applications.map((app, i) => {
              const st = STATUS[app.status] || STATUS.applied
              const stepIdx = STEPS.indexOf(app.status)
              return (
                <motion.div key={app.id} variants={up} custom={i}
                  className="bg-white rounded-xl border border-neutral-200 p-4 shadow-card">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center text-xl flex-shrink-0">
                      {app.logo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-neutral-900 truncate">{app.title}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">{app.company} · {app.date}</p>
                    </div>
                    <span className={cn('text-2xs font-semibold px-2 py-1 rounded-lg', st.bg, st.text)}>
                      {ar ? st.labelAr : st.label}
                    </span>
                  </div>
                  {/* Progress track */}
                  <div className="flex gap-1 mt-3">
                    {STEPS.map((step, si) => (
                      <div key={step} className={cn('flex-1 h-1 rounded-full transition-colors duration-300',
                        stepIdx >= si ? st.bar : 'bg-neutral-100')} />
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>
    </div>
  )
}
