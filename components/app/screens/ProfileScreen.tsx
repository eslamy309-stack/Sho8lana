'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy, FileText, CheckCircle2, Edit3, Flame, Star,
  GraduationCap, MapPin, Upload, RefreshCw, X, AlertCircle,
  Loader2, Lock, ShieldCheck, ChevronRight,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { useDocumentUpload } from '@/lib/useDocumentUpload'
import { DOCUMENTS } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { DocumentFile } from '@/lib/types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatAge(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  if (h < 24) return `${h}h ago`
  return `${d}d ago`
}

function getMimeLabel(mime: string): string {
  const map: Record<string, string> = {
    'application/pdf': 'PDF',
    'application/msword': 'DOC',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
    'image/jpeg': 'JPG',
    'image/png': 'PNG',
    'image/webp': 'WEBP',
    'application/zip': 'ZIP',
  }
  return map[mime] ?? mime.split('/').pop()?.toUpperCase() ?? 'FILE'
}

// ── Stagger animations ────────────────────────────────────────────────────────

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }
const up = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] } },
}

// ── Document card ─────────────────────────────────────────────────────────────

interface DocCardProps {
  docKey: string
  label: string
  labelAr: string
  description: string
  descriptionAr: string
  required: boolean
  acceptedTypes: string
  mimeTypes: string[]
  maxSizeMB: number
  docFile?: DocumentFile
  isUploading: boolean
  error?: string
  ar: boolean
  inputRef: (el: HTMLInputElement | null) => void
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemove: () => void
  onRetry: () => void
}

function DocCard({
  docKey, label, labelAr, description, descriptionAr,
  required, mimeTypes, maxSizeMB,
  docFile, isUploading, error,
  ar, inputRef, onFileChange, onRemove, onRetry,
}: DocCardProps) {
  const uploaded = docFile?.status === 'uploaded'
  const failed = !!error

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl border transition-colors duration-200 overflow-hidden',
        uploaded && 'border-emerald-200 bg-emerald-50',
        isUploading && 'border-brand-200 bg-brand-50',
        failed && 'border-red-200 bg-red-50',
        !uploaded && !isUploading && !failed && 'border-neutral-200 bg-white',
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={DOCUMENTS.find(d => d.key === docKey)?.acceptedTypes ?? '*'}
        className="hidden"
        onChange={onFileChange}
      />

      <div className="flex items-start gap-3 p-3.5">
        {/* Status icon */}
        <div className={cn(
          'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5',
          uploaded && 'bg-emerald-100',
          isUploading && 'bg-brand-100',
          failed && 'bg-red-100',
          !uploaded && !isUploading && !failed && 'bg-neutral-100',
        )}>
          {uploaded && <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />}
          {isUploading && <Loader2 className="w-4.5 h-4.5 text-brand-600 animate-spin" />}
          {failed && <AlertCircle className="w-4.5 h-4.5 text-red-500" />}
          {!uploaded && !isUploading && !failed && <FileText className="w-4.5 h-4.5 text-neutral-400" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className={cn(
              'text-xs font-bold',
              uploaded && 'text-emerald-700',
              isUploading && 'text-brand-700',
              failed && 'text-red-700',
              !uploaded && !isUploading && !failed && 'text-neutral-800',
            )}>
              {ar ? labelAr : label}
            </p>
            {required && (
              <span className="text-red-500 text-xs font-bold">*</span>
            )}
            {uploaded && docFile && (
              <span className="text-2xs font-semibold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">
                {getMimeLabel(docFile.mimeType)}
              </span>
            )}
          </div>

          {/* Uploaded info */}
          {uploaded && docFile && (
            <div className="mt-0.5">
              <p className="text-2xs text-neutral-600 font-medium truncate max-w-[180px]">
                {docFile.name}
              </p>
              <p className="text-2xs text-emerald-600 mt-0.5">
                {formatBytes(docFile.size)} · {formatAge(docFile.uploadedAt)}
                {docFile.storageType === 'firebase' && ' · ☁️'}
              </p>
            </div>
          )}

          {/* Uploading */}
          {isUploading && (
            <p className="text-2xs text-brand-600 mt-0.5">
              {ar ? 'جارٍ الرفع…' : 'Uploading…'}
            </p>
          )}

          {/* Error */}
          {failed && error && (
            <p className="text-2xs text-red-600 mt-0.5 leading-relaxed">{error}</p>
          )}

          {/* Idle description */}
          {!uploaded && !isUploading && !failed && (
            <p className="text-2xs text-neutral-400 mt-0.5">
              {ar ? descriptionAr : description}
            </p>
          )}
        </div>

        {/* Action button */}
        <div className="flex-shrink-0">
          {uploaded && (
            <div className="flex items-center gap-1">
              <button
                onClick={onRetry}
                title="Replace file"
                className="text-2xs font-semibold text-neutral-500 hover:text-brand-600 bg-white border border-neutral-200 hover:border-brand-300 px-2 py-1 rounded-lg transition-colors"
              >
                {ar ? 'استبدال' : 'Replace'}
              </button>
              <button
                onClick={onRemove}
                title="Remove"
                className="w-6 h-6 rounded-lg flex items-center justify-center text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          {isUploading && (
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-brand-100">
              <Loader2 className="w-3.5 h-3.5 text-brand-600 animate-spin" />
            </div>
          )}
          {!uploaded && !isUploading && (
            <button
              onClick={onRetry}
              className={cn(
                'flex items-center gap-1 text-2xs font-bold px-2.5 py-1.5 rounded-lg transition-colors',
                failed
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-brand-600 text-white hover:bg-brand-700',
              )}
            >
              <Upload className="w-3 h-3" />
              {failed
                ? (ar ? 'إعادة المحاولة' : 'Retry')
                : (ar ? 'رفع' : 'Upload')}
            </button>
          )}
        </div>
      </div>

      {/* Uploading progress bar */}
      {isUploading && (
        <div className="h-0.5 bg-brand-100">
          <motion.div
            className="h-full bg-brand-500 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: '90%' }}
            transition={{ duration: 2.5, ease: 'easeInOut' }}
          />
        </div>
      )}
    </motion.div>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────

export function ProfileScreen() {
  const { state, dispatch } = useApp()
  const ar = state.lang === 'ar'
  const { user, simXP, simBadges, simDone, applications } = state

  const {
    uploading, errors, inputRefs, documentFiles,
    allRequiredOk, handleFileSelect, handleRemove, triggerInput,
  } = useDocumentUpload()

  // ── Derived values ────────────────────────────────────────────────────────

  const requiredDocs = DOCUMENTS.filter(d => d.required)
  const optionalDocs = DOCUMENTS.filter(d => !d.required)

  const uploadedRequired = requiredDocs.filter(
    d => documentFiles[d.key]?.status === 'uploaded'
  ).length
  const allRequiredDone = uploadedRequired === requiredDocs.length

  const uploadedOptional = optionalDocs.filter(
    d => documentFiles[d.key]?.status === 'uploaded'
  ).length
  const totalUploaded = uploadedRequired + uploadedOptional

  const completionPct = Math.round(
    ([user.name, user.university, user.major, user.gpa, user.email, user.phone]
      .filter(Boolean).length / 6) * 40 +
    (totalUploaded / DOCUMENTS.length) * 60
  )

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-dvh bg-neutral-50">
      {/* Topbar */}
      <div className="sticky top-0 z-20 bg-white border-b border-neutral-100 px-4 py-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-neutral-900">
          {ar ? 'ملفي' : 'My Profile'}
        </h2>
        <button
          onClick={() => dispatch({ type: 'GO', screen: 'onboard' })}
          className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 bg-brand-50 px-3 py-1.5 rounded-full hover:bg-brand-100 transition-colors"
        >
          <Edit3 className="w-3 h-3" />
          {ar ? 'تعديل' : 'Edit'}
        </button>
      </div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="px-4 py-4 flex flex-col gap-4"
      >
        {/* Profile hero */}
        <motion.div
          variants={up}
          className="rounded-2xl p-5 text-white overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, #0F172A, #0F766E)' }}
        >
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center text-3xl mb-3">
              {user.name ? user.name[0].toUpperCase() : '👤'}
            </div>
            <h3 className="text-lg font-extrabold">
              {user.name || (ar ? 'طالب' : 'Student')}
            </h3>
            {user.major && (
              <p className="text-sm text-white/70 mt-0.5 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                {user.major}
                {user.university && ` · ${user.university}`}
              </p>
            )}
            {user.location && (
              <p className="text-xs text-white/50 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {user.location}
                {user.gpa && ` · GPA ${user.gpa}`}
              </p>
            )}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-white/60 mb-1.5">
                <span>{ar ? 'اكتمال الملف' : 'Profile completeness'}</span>
                <span>{completionPct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-white"
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div variants={up} className="grid grid-cols-3 gap-2">
          {[
            { label: ar ? 'طلبات' : 'Applications', value: applications.length, icon: <FileText className="w-4 h-4 text-brand-500" /> },
            { label: ar ? 'نقاط XP' : 'XP Points', value: simXP, icon: <Flame className="w-4 h-4 text-amber-500" /> },
            { label: ar ? 'شارات' : 'Badges', value: simBadges.length, icon: <Trophy className="w-4 h-4 text-violet-500" /> },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl p-3 border border-neutral-100 text-center">
              <div className="flex justify-center mb-1">{s.icon}</div>
              <p className="text-xl font-extrabold text-neutral-900">{s.value}</p>
              <p className="text-2xs text-neutral-400">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Badges */}
        {simBadges.length > 0 && (
          <motion.div variants={up}>
            <h3 className="text-sm font-bold text-neutral-700 mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              {ar ? 'الشارات المكتسبة' : 'Earned Badges'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {simBadges.map(b => (
                <motion.span
                  key={b.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-full"
                >
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {b.label}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Simulation progress */}
        {simDone.length > 0 && (
          <motion.div variants={up} className="bg-white rounded-xl border border-neutral-200 p-4">
            <h3 className="text-sm font-bold text-neutral-900 mb-1">
              {ar ? 'تقدم التدريب' : 'Simulation Progress'}
            </h3>
            <p className="text-xs text-neutral-400 mb-3">
              {ar
                ? `أكملت ${simDone.length} مهمة`
                : `${simDone.length} task${simDone.length !== 1 ? 's' : ''} completed`}
            </p>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <div className="flex-1 h-2 rounded-full bg-neutral-100 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-brand-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((simXP / 200) * 100, 100)}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                />
              </div>
              <span className="text-xs font-bold text-neutral-600">{simXP}/200</span>
            </div>
          </motion.div>
        )}

        {/* ── Document Vault ─────────────────────────────────────────────── */}
        <motion.div variants={up}>

          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-brand-500" />
            <h3 className="text-sm font-bold text-neutral-700 flex-1">
              {ar ? 'خزنة المستندات' : 'Document Vault'}
            </h3>
            <span className="text-2xs font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
              {totalUploaded}/{DOCUMENTS.length}
            </span>
          </div>

          {/* Security notice */}
          <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-neutral-100 rounded-xl">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
            <p className="text-2xs text-neutral-500">
              {ar
                ? 'ملفاتك محمية ومشفرة. لن تُرسل لأي شركة دون موافقتك.'
                : 'Your files are encrypted and never shared without your consent.'}
            </p>
          </div>

          {/* Required documents */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-2xs font-bold text-neutral-500 uppercase tracking-wide">
                {ar ? 'المستندات الإلزامية' : 'Required'}
              </p>
              <span className={cn(
                'text-2xs font-bold px-1.5 py-0.5 rounded-full',
                allRequiredDone
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-red-100 text-red-600',
              )}>
                {uploadedRequired}/{requiredDocs.length}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {requiredDocs.map(doc => (
                <DocCard
                  key={doc.key}
                  docKey={doc.key}
                  label={doc.label}
                  labelAr={doc.labelAr}
                  description={doc.description}
                  descriptionAr={doc.descriptionAr}
                  required={true}
                  acceptedTypes={doc.acceptedTypes}
                  mimeTypes={doc.mimeTypes}
                  maxSizeMB={doc.maxSizeMB}
                  docFile={documentFiles[doc.key]}
                  isUploading={!!uploading[doc.key]}
                  error={errors[doc.key]}
                  ar={ar}
                  inputRef={el => { inputRefs.current[doc.key] = el }}
                  onFileChange={e => handleFileSelect(e, doc.key)}
                  onRemove={() => handleRemove(doc.key)}
                  onRetry={() => triggerInput(doc.key)}
                />
              ))}
            </div>
          </div>

          {/* Optional documents */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-2xs font-bold text-neutral-500 uppercase tracking-wide">
                {ar ? 'المستندات الاختيارية' : 'Optional'}
              </p>
              <span className="text-2xs font-bold px-1.5 py-0.5 rounded-full bg-neutral-100 text-neutral-500">
                {uploadedOptional}/{optionalDocs.length}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {optionalDocs.map(doc => (
                <DocCard
                  key={doc.key}
                  docKey={doc.key}
                  label={doc.label}
                  labelAr={doc.labelAr}
                  description={doc.description}
                  descriptionAr={doc.descriptionAr}
                  required={false}
                  acceptedTypes={doc.acceptedTypes}
                  mimeTypes={doc.mimeTypes}
                  maxSizeMB={doc.maxSizeMB}
                  docFile={documentFiles[doc.key]}
                  isUploading={!!uploading[doc.key]}
                  error={errors[doc.key]}
                  ar={ar}
                  inputRef={el => { inputRefs.current[doc.key] = el }}
                  onFileChange={e => handleFileSelect(e, doc.key)}
                  onRemove={() => handleRemove(doc.key)}
                  onRetry={() => triggerInput(doc.key)}
                />
              ))}
            </div>
          </div>

          {/* CTA — disabled until required docs uploaded */}
          <AnimatePresence mode="wait">
            {allRequiredDone ? (
              <motion.div
                key="ready"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <p className="text-xs font-semibold text-emerald-700">
                    {ar
                      ? 'جميع المستندات الإلزامية مرفوعة! أنت جاهز للتقديم.'
                      : 'All required documents uploaded! You\'re ready to apply.'}
                  </p>
                </div>
                <Button
                  className="w-full h-11 text-sm font-bold"
                  onClick={() => dispatch({ type: 'GO', screen: 'home' })}
                >
                  {ar ? 'ابحث عن وظائف' : 'Browse Jobs'}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="locked"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                  <Lock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <p className="text-xs text-amber-700">
                    {ar
                      ? `ارفع ${requiredDocs.length - uploadedRequired} مستند${requiredDocs.length - uploadedRequired !== 1 ? 'ات' : ''} إلزامي${requiredDocs.length - uploadedRequired !== 1 ? 'ة' : ''} للمتابعة`
                      : `Upload ${requiredDocs.length - uploadedRequired} more required document${requiredDocs.length - uploadedRequired !== 1 ? 's' : ''} to continue`}
                  </p>
                </div>
                <Button
                  disabled
                  className="w-full h-11 text-sm font-bold opacity-50 cursor-not-allowed"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {ar ? 'البحث عن وظائف — مقفل' : 'Browse Jobs — Locked'}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Replace/re-upload tip */}
          <p className="text-center text-2xs text-neutral-400 mt-3">
            <RefreshCw className="w-3 h-3 inline mr-1" />
            {ar
              ? 'يمكنك استبدال أي ملف في أي وقت'
              : 'You can replace any file at any time'}
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
