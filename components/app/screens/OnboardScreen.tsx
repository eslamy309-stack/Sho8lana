'use client'

import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Upload, CheckCircle2, FileText } from 'lucide-react'
import { useApp } from '@/lib/store'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DOCUMENTS, GOVERNORATES } from '@/lib/data'
import { cn } from '@/lib/utils'

const up = {
  hidden:  { opacity: 0, y: 16 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: i * 0.07 } }),
}

export function OnboardScreen() {
  const { state, dispatch } = useApp()
  const { lang, user, onboardStep } = state
  const ar = lang === 'ar'

  function next() {
    if (onboardStep < 1) dispatch({ type: 'SET_ONBOARD_STEP', step: 1 })
    else { dispatch({ type: 'SET_ONBOARD_STEP', step: 0 }); dispatch({ type: 'GO', screen: 'home' }) }
  }

  function setField(k: string, v: string) {
    dispatch({ type: 'SET_USER', user: { [k]: v } })
  }

  return (
    <div className="min-h-dvh bg-white flex flex-col pb-24">
      {/* Topbar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
        <button onClick={() => dispatch({ type: 'GO_BACK' })} className="p-1 text-neutral-500 hover:text-neutral-800 transition-colors">
          {ar ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
        <span className="text-sm font-semibold text-neutral-900">
          {ar ? 'إنشاء الملف' : 'Create Profile'}
        </span>
        <span className="text-sm font-semibold text-brand-600">{onboardStep + 1}/2</span>
      </div>

      {/* Progress */}
      <div className="flex gap-1 px-5 py-3">
        {[0, 1].map(i => (
          <div key={i} className={cn('flex-1 h-1 rounded-full transition-colors duration-300', i <= onboardStep ? 'bg-brand-600' : 'bg-neutral-200')} />
        ))}
      </div>

      <motion.div key={onboardStep} initial="hidden" animate="visible" className="flex flex-col gap-4 px-5 py-4">
        {onboardStep === 0 ? (
          <>
            <motion.div variants={up} custom={0}>
              <h2 className="text-2xl font-bold text-neutral-900">{ar ? 'معلوماتك الشخصية' : 'Personal Info'}</h2>
              <p className="text-sm text-neutral-500 mt-1">{ar ? 'لنبدأ بالأساسيات' : "Let's start with the basics"}</p>
            </motion.div>

            {[
              { label: ar ? 'الاسم الكامل' : 'Full Name', key: 'name', ph: ar ? 'مثال: أحمد علي' : 'e.g. Ahmed Ali' },
              { label: ar ? 'البريد الإلكتروني' : 'Email', key: 'email', ph: 'you@university.edu.eg', type: 'email' },
              { label: ar ? 'رقم الهاتف' : 'Phone', key: 'phone', ph: '+20 1XX XXX XXXX' },
              { label: ar ? 'الجامعة' : 'University', key: 'university', ph: ar ? 'مثال: الجامعة الألمانية' : 'e.g. German International University' },
              { label: ar ? 'التخصص' : 'Major', key: 'major', ph: ar ? 'مثال: إدارة الأعمال' : 'e.g. Business Administration' },
            ].map((f, i) => (
              <motion.div key={f.key} variants={up} custom={i + 1}>
                <label className="text-xs font-semibold text-neutral-500 block mb-1.5">{f.label}</label>
                <Input
                  type={f.type || 'text'}
                  placeholder={f.ph}
                  value={(user as unknown as Record<string, string>)[f.key] || ''}
                  onChange={e => setField(f.key, e.target.value)}
                />
              </motion.div>
            ))}

            <motion.div variants={up} custom={6} className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-semibold text-neutral-500 block mb-1.5">GPA</label>
                <Input placeholder="3.5" value={user.gpa} onChange={e => setField('gpa', e.target.value)} />
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-neutral-500 block mb-1.5">
                  {ar ? 'سنة التخرج' : 'Grad Year'}
                </label>
                <select
                  className="flex h-10 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
                  value={user.graduationYear}
                  onChange={e => setField('graduationYear', e.target.value)}
                >
                  {['2025','2026','2027','2028'].map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
            </motion.div>

            <motion.div variants={up} custom={7}>
              <label className="text-xs font-semibold text-neutral-500 block mb-1.5">
                {ar ? 'المحافظة' : 'City / Governorate'}
              </label>
              <select
                className="flex h-10 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
                value={user.location}
                onChange={e => setField('location', e.target.value)}
              >
                {GOVERNORATES.map(g => <option key={g}>{g}</option>)}
              </select>
            </motion.div>

            <motion.div variants={up} custom={8}
              className="flex gap-3 items-start bg-brand-50 rounded-xl p-4">
              <div className="w-5 h-5 rounded-full bg-brand-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-brand-600 text-xs">✦</span>
              </div>
              <p className="text-xs text-brand-700 leading-relaxed">
                {ar ? 'لا تحتاج خبرة سابقة! مصممة للطلاب.' : 'No experience needed! Designed for students.'}
              </p>
            </motion.div>
          </>
        ) : (
          <>
            <motion.div variants={up} custom={0}>
              <h2 className="text-2xl font-bold text-neutral-900">{ar ? 'خزنة المستندات' : 'Document Vault'}</h2>
              <p className="text-sm text-neutral-500 mt-1">
                {ar ? 'ارفع مرة واحدة — قدّم في كل مكان' : 'Upload once — apply everywhere'}
              </p>
            </motion.div>

            <motion.div variants={up} custom={1}
              className="flex gap-3 items-start bg-warning-50 rounded-xl p-4">
              <span className="text-warning-500 mt-0.5 text-base">⚡</span>
              <p className="text-xs text-warning-700 leading-relaxed">
                {ar ? 'المستندات ترفع مرة واحدة وتُرفق تلقائياً مع كل طلب تقدمه.' : 'Documents are uploaded once and auto-attached to every application.'}
              </p>
            </motion.div>

            {DOCUMENTS.map((doc, i) => {
              const uploaded = !!user.documents[doc.key]
              return (
                <motion.button
                  key={doc.key}
                  variants={up}
                  custom={i + 2}
                  onClick={() => dispatch({ type: 'TOGGLE_DOC', key: doc.key })}
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-xl border-[1.5px] text-left transition-all duration-200',
                    uploaded
                      ? 'border-success-500 bg-success-50'
                      : 'border-neutral-200 bg-white hover:border-brand-300'
                  )}
                >
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                    uploaded ? 'bg-success-100' : 'bg-neutral-100')}>
                    {uploaded
                      ? <CheckCircle2 className="w-5 h-5 text-success-600" />
                      : <FileText className="w-5 h-5 text-neutral-400" />
                    }
                  </div>
                  <div className="flex-1">
                    <p className={cn('text-sm font-semibold flex items-center gap-1', uploaded ? 'text-success-700' : 'text-neutral-900')}>
                      {ar ? doc.labelAr : doc.label}
                      {doc.required && <span className="text-danger-500 text-xs">*</span>}
                    </p>
                    <p className={cn('text-xs mt-0.5', uploaded ? 'text-success-600' : 'text-neutral-400')}>
                      {uploaded ? (ar ? 'تم الرفع ✓' : 'Uploaded ✓') : doc.description}
                    </p>
                  </div>
                  {!uploaded && <Upload className="w-4 h-4 text-neutral-400 flex-shrink-0" />}
                </motion.button>
              )
            })}
            <p className="text-xs text-neutral-400">* {ar ? 'مطلوب' : 'Required'}</p>
          </>
        )}
      </motion.div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app px-5 py-4 bg-white border-t border-neutral-100 pb-safe">
        <div className="flex gap-3">
          {onboardStep > 0 && (
            <Button variant="secondary" size="md" className="w-auto px-5"
              onClick={() => dispatch({ type: 'SET_ONBOARD_STEP', step: 0 })}>
              {ar ? 'رجوع' : 'Back'}
            </Button>
          )}
          <Button size="lg" className="flex-1 gap-2" onClick={next}>
            {onboardStep < 1
              ? (ar ? 'متابعة' : 'Continue')
              : (ar ? 'ابدأ' : 'Start')
            }
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
