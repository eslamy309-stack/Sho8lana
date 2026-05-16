'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, CheckCircle2, FileText,
  Upload, AlertCircle, Loader2, X, Lock, ShieldCheck,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { useDocumentUpload } from '@/lib/useDocumentUpload'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DOCUMENTS, GOVERNORATES } from '@/lib/data'
import { cn } from '@/lib/utils'

const up = {
  hidden:  { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 },
  }),
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatAge(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  return `${Math.floor(m / 60)}h ago`
}

export function OnboardScreen() {
  const { state, dispatch } = useApp()
  const { lang, user, onboardStep } = state
  const ar = lang === 'ar'

  // ── Step 0 validation ───────────────────────────────────────────────────────
  const [step0Errors, setStep0Errors] = useState<Record<string, string>>({})

  function validateStep0() {
    const errs: Record<string, string> = {}
    if (!user.name.trim())  errs.name  = ar ? 'الاسم مطلوب' : 'Name is required'
    if (!user.email.trim()) errs.email = ar ? 'البريد الإلكتروني مطلوب' : 'Email is required'
    if (user.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email))
      errs.email = ar ? 'بريد إلكتروني غير صالح' : 'Invalid email address'
    setStep0Errors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Step 1 upload ───────────────────────────────────────────────────────────
  const {
    uploading, errors: uploadErrors, inputRefs,
    documentFiles, allRequiredOk,
    handleFileSelect, handleRemove, triggerInput,
  } = useDocumentUpload()

  // ── Navigation ──────────────────────────────────────────────────────────────
  function goNext() {
    if (onboardStep === 0) {
      if (!validateStep0()) return
      dispatch({ type: 'SET_ONBOARD_STEP', step: 1 })
    } else {
      // Step 1 — only proceed if required docs are uploaded
      if (!allRequiredOk) return
      dispatch({ type: 'SET_ONBOARD_STEP', step: 0 })
      dispatch({ type: 'GO', screen: 'home' })
    }
  }

  function setField(k: string, v: string) {
    dispatch({ type: 'SET_USER', user: { [k]: v } })
    if (step0Errors[k]) setStep0Errors(prev => { const n = { ...prev }; delete n[k]; return n })
  }

  const requiredDocs = DOCUMENTS.filter(d => d.required)
  const uploadedRequired = requiredDocs.filter(
    d => documentFiles[d.key]?.status === 'uploaded'
  ).length

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-dvh bg-white flex flex-col pb-28">
      {/* Topbar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
        <button
          onClick={() => dispatch({ type: 'GO_BACK' })}
          className="p-1 text-neutral-500 hover:text-neutral-800 transition-colors"
        >
          {ar ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
        <span className="text-sm font-semibold text-neutral-900">
          {ar ? 'إنشاء الملف' : 'Create Profile'}
        </span>
        <span className="text-sm font-semibold text-brand-600">{onboardStep + 1}/2</span>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1 px-5 py-3">
        {[0, 1].map(i => (
          <div
            key={i}
            className={cn(
              'flex-1 h-1 rounded-full transition-all duration-500',
              i < onboardStep
                ? 'bg-brand-600'
                : i === onboardStep
                ? 'bg-brand-400'
                : 'bg-neutral-200'
            )}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {onboardStep === 0 ? (
          // ── STEP 0: Personal Info ─────────────────────────────────────────
          <motion.div
            key="step0"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
            exit={{ opacity: 0, x: -24, transition: { duration: 0.2 } }}
            className="flex flex-col gap-4 px-5 py-4"
          >
            <motion.div variants={up} custom={0} initial="hidden" animate="visible">
              <h2 className="text-2xl font-bold text-neutral-900">
                {ar ? 'معلوماتك الشخصية' : 'Personal Info'}
              </h2>
              <p className="text-sm text-neutral-500 mt-1">
                {ar ? 'لنبدأ بالأساسيات' : "Let's start with the basics"}
              </p>
            </motion.div>

            {[
              { label: ar ? 'الاسم الكامل' : 'Full Name *', key: 'name', ph: ar ? 'مثال: أحمد علي' : 'e.g. Ahmed Ali' },
              { label: ar ? 'البريد الإلكتروني *' : 'Email *', key: 'email', ph: 'you@university.edu.eg', type: 'email' },
              { label: ar ? 'رقم الهاتف' : 'Phone', key: 'phone', ph: '+20 1XX XXX XXXX' },
              { label: ar ? 'الجامعة' : 'University', key: 'university', ph: ar ? 'مثال: الجامعة الألمانية' : 'e.g. German International University' },
              { label: ar ? 'التخصص' : 'Major', key: 'major', ph: ar ? 'مثال: إدارة الأعمال' : 'e.g. Business Administration' },
            ].map((f, i) => (
              <motion.div key={f.key} variants={up} custom={i + 1} initial="hidden" animate="visible">
                <label className="text-xs font-semibold text-neutral-500 block mb-1.5">{f.label}</label>
                <Input
                  type={f.type || 'text'}
                  placeholder={f.ph}
                  value={(user as unknown as Record<string, string>)[f.key] || ''}
                  onChange={e => setField(f.key, e.target.value)}
                  className={step0Errors[f.key] ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}
                />
                {step0Errors[f.key] && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {step0Errors[f.key]}
                  </p>
                )}
              </motion.div>
            ))}

            <motion.div variants={up} custom={6} initial="hidden" animate="visible" className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-semibold text-neutral-500 block mb-1.5">GPA</label>
                <Input
                  placeholder="3.5"
                  value={user.gpa}
                  onChange={e => setField('gpa', e.target.value)}
                />
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

            <motion.div variants={up} custom={7} initial="hidden" animate="visible">
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

            <motion.div
              variants={up} custom={8} initial="hidden" animate="visible"
              className="flex gap-3 items-start bg-brand-50 rounded-xl p-4"
            >
              <span className="text-brand-600 mt-0.5">✦</span>
              <p className="text-xs text-brand-700 leading-relaxed">
                {ar
                  ? 'لا تحتاج خبرة سابقة! صُممت خصيصاً للطلاب والخريجين الجدد.'
                  : 'No prior experience needed — designed for students and fresh graduates.'}
              </p>
            </motion.div>
          </motion.div>
        ) : (
          // ── STEP 1: Document Upload ───────────────────────────────────────
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
            exit={{ opacity: 0, x: 24, transition: { duration: 0.2 } }}
            className="flex flex-col gap-4 px-5 py-4"
          >
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">
                {ar ? 'خزنة المستندات' : 'Document Vault'}
              </h2>
              <p className="text-sm text-neutral-500 mt-1">
                {ar ? 'ارفع مرة واحدة — قدّم في كل مكان' : 'Upload once — apply everywhere'}
              </p>
            </div>

            {/* Security notice */}
            <div className="flex items-center gap-2 px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
              <p className="text-xs text-neutral-500">
                {ar
                  ? 'ملفاتك محمية ومشفرة ولن تُرسل دون موافقتك.'
                  : 'Your files are encrypted and never shared without your consent.'}
              </p>
            </div>

            {/* Progress chip */}
            <div className="flex items-center gap-2">
              <span className={cn(
                'text-xs font-bold px-2.5 py-1 rounded-full',
                allRequiredOk
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              )}>
                {allRequiredOk
                  ? (ar ? '✓ جاهز للتقديم' : '✓ Ready to apply')
                  : (ar
                      ? `${uploadedRequired}/${requiredDocs.length} إلزامي`
                      : `${uploadedRequired}/${requiredDocs.length} required`)}
              </span>
            </div>

            {/* Required docs */}
            <div>
              <p className="text-2xs font-bold text-neutral-400 uppercase tracking-wide mb-2">
                {ar ? 'المستندات الإلزامية' : 'Required Documents'}
              </p>
              <div className="flex flex-col gap-2">
                {DOCUMENTS.filter(d => d.required).map(doc => (
                  <UploadCard
                    key={doc.key}
                    docKey={doc.key}
                    label={ar ? doc.labelAr : doc.label}
                    description={ar ? doc.descriptionAr : doc.description}
                    required
                    docFile={documentFiles[doc.key]}
                    isUploading={!!uploading[doc.key]}
                    error={uploadErrors[doc.key]}
                    ar={ar}
                    inputRef={el => { inputRefs.current[doc.key] = el }}
                    acceptedTypes={doc.acceptedTypes}
                    onFileChange={e => handleFileSelect(e, doc.key)}
                    onRemove={() => handleRemove(doc.key)}
                    onUpload={() => triggerInput(doc.key)}
                  />
                ))}
              </div>
            </div>

            {/* Optional docs */}
            <div>
              <p className="text-2xs font-bold text-neutral-400 uppercase tracking-wide mb-2">
                {ar ? 'مستندات اختيارية (تزيد من فرصك)' : 'Optional (boosts your chances)'}
              </p>
              <div className="flex flex-col gap-2">
                {DOCUMENTS.filter(d => !d.required).map(doc => (
                  <UploadCard
                    key={doc.key}
                    docKey={doc.key}
                    label={ar ? doc.labelAr : doc.label}
                    description={ar ? doc.descriptionAr : doc.description}
                    required={false}
                    docFile={documentFiles[doc.key]}
                    isUploading={!!uploading[doc.key]}
                    error={uploadErrors[doc.key]}
                    ar={ar}
                    inputRef={el => { inputRefs.current[doc.key] = el }}
                    acceptedTypes={doc.acceptedTypes}
                    onFileChange={e => handleFileSelect(e, doc.key)}
                    onRemove={() => handleRemove(doc.key)}
                    onUpload={() => triggerInput(doc.key)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app px-5 py-4 bg-white border-t border-neutral-100 pb-safe">
        <div className="flex gap-3">
          {onboardStep > 0 && (
            <Button
              variant="secondary"
              size="md"
              className="w-auto px-5"
              onClick={() => dispatch({ type: 'SET_ONBOARD_STEP', step: 0 })}
            >
              {ar ? 'رجوع' : 'Back'}
            </Button>
          )}

          {onboardStep === 0 ? (
            <Button size="lg" className="flex-1 gap-2" onClick={goNext}>
              {ar ? 'متابعة' : 'Continue'}
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              size="lg"
              className={cn(
                'flex-1 gap-2 transition-opacity',
                !allRequiredOk && 'opacity-50 cursor-not-allowed'
              )}
              disabled={!allRequiredOk}
              onClick={goNext}
            >
              {allRequiredOk ? (
                <>
                  {ar ? 'ابدأ رحلتك' : "Let's go"}
                  <ChevronRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  {ar
                    ? `ارفع ${requiredDocs.length - uploadedRequired} مستند إلزامي`
                    : `Upload ${requiredDocs.length - uploadedRequired} required doc${requiredDocs.length - uploadedRequired !== 1 ? 's' : ''}`}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Upload card component ───────────────────────────────────────────────────

interface UploadCardProps {
  docKey: string
  label: string
  description: string
  required: boolean
  docFile?: import('@/lib/types').DocumentFile
  isUploading: boolean
  error?: string
  ar: boolean
  inputRef: (el: HTMLInputElement | null) => void
  acceptedTypes: string
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemove: () => void
  onUpload: () => void
}

function UploadCard({
  docKey, label, description, required,
  docFile, isUploading, error,
  ar, inputRef, acceptedTypes,
  onFileChange, onRemove, onUpload,
}: UploadCardProps) {
  const uploaded = docFile?.status === 'uploaded'
  const failed   = !!error && !isUploading

  return (
    <div className={cn(
      'flex items-center gap-3 p-3.5 rounded-xl border-[1.5px] transition-colors',
      uploaded  && 'border-emerald-300 bg-emerald-50',
      isUploading && 'border-brand-300 bg-brand-50',
      failed    && 'border-red-300 bg-red-50',
      !uploaded && !isUploading && !failed && 'border-neutral-200 bg-white',
    )}>
      <input
        ref={inputRef}
        type="file"
        accept={acceptedTypes}
        className="hidden"
        onChange={onFileChange}
      />

      {/* Icon */}
      <div className={cn(
        'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
        uploaded    && 'bg-emerald-100',
        isUploading && 'bg-brand-100',
        failed      && 'bg-red-100',
        !uploaded && !isUploading && !failed && 'bg-neutral-100',
      )}>
        {uploaded    && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
        {isUploading && <Loader2 className="w-4 h-4 text-brand-600 animate-spin" />}
        {failed      && <AlertCircle className="w-4 h-4 text-red-500" />}
        {!uploaded && !isUploading && !failed && <FileText className="w-4 h-4 text-neutral-400" />}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-xs font-bold flex items-center gap-1',
          uploaded    && 'text-emerald-700',
          isUploading && 'text-brand-700',
          failed      && 'text-red-700',
          !uploaded && !isUploading && !failed && 'text-neutral-800',
        )}>
          {label}
          {required && <span className="text-red-500">*</span>}
        </p>

        {uploaded && docFile && (
          <p className="text-2xs text-neutral-500 mt-0.5 truncate">
            {docFile.name} · {formatBytes(docFile.size)} · {formatAge(docFile.uploadedAt)}
          </p>
        )}
        {isUploading && (
          <p className="text-2xs text-brand-600 mt-0.5">{ar ? 'جارٍ الرفع…' : 'Uploading…'}</p>
        )}
        {failed && (
          <p className="text-2xs text-red-600 mt-0.5 leading-relaxed">{error}</p>
        )}
        {!uploaded && !isUploading && !failed && (
          <p className="text-2xs text-neutral-400 mt-0.5">{description}</p>
        )}
      </div>

      {/* Action */}
      {uploaded ? (
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onUpload}
            className="text-2xs font-semibold text-neutral-500 hover:text-brand-600 bg-white border border-neutral-200 hover:border-brand-300 px-2 py-1 rounded-lg transition-colors"
          >
            {ar ? 'استبدال' : 'Replace'}
          </button>
          <button
            onClick={onRemove}
            className="w-6 h-6 flex items-center justify-center text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          onClick={onUpload}
          disabled={isUploading}
          className={cn(
            'flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-2xs font-bold transition-colors',
            failed
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : isUploading
              ? 'bg-brand-100 text-brand-400 cursor-not-allowed'
              : 'bg-brand-600 text-white hover:bg-brand-700',
          )}
        >
          {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
          {isUploading
            ? ''
            : failed
            ? (ar ? 'إعادة' : 'Retry')
            : (ar ? 'رفع' : 'Upload')}
        </button>
      )}
    </div>
  )
}
