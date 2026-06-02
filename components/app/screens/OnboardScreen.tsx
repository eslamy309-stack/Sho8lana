'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, CheckCircle2, FileText,
  Upload, AlertCircle, Loader2, X, Lock, ShieldCheck,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { useDocumentUpload } from '@/lib/useDocumentUpload'
import { sbSignUp, sbSaveProfile, supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DOCUMENTS, GOVERNORATES } from '@/lib/data'
import { cn } from '@/lib/utils'

// ── Social provider icons ─────────────────────────────────────────────────────

const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

const AppleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.38.07 2.34.74 3.15.8.85-.19 1.66-.74 3.05-.84 1.47-.11 2.78.44 3.77 1.48-3.38 2-2.69 6.2.49 7.43-.57 1.38-1.33 2.73-2.46 4.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
  </svg>
)

const GitHubIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
)

type OAuthProvider = 'google' | 'apple' | 'github'

function OAuthButton({
  icon, label, provider, busy, onPress,
}: { icon: React.ReactNode; label: string; provider: OAuthProvider; busy: OAuthProvider | null; onPress: (p: OAuthProvider) => void }) {
  const loading = busy === provider
  return (
    <button
      onClick={() => onPress(provider)}
      disabled={busy !== null}
      className={cn(
        'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-semibold',
        'transition-all duration-200 active:scale-[0.97]',
        busy !== null ? 'opacity-40 cursor-not-allowed' : 'hover:bg-neutral-50',
        'bg-white border-neutral-200 text-neutral-700',
      )}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin text-brand-600" /> : icon}
      {label}
    </button>
  )
}

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

  // OAuth users already have name+email from provider metadata
  const isOAuthUser = !!user.authProvider && user.authProvider !== 'email'

  // ── Step 0 state ────────────────────────────────────────────────────────────
  const [password, setPassword]       = useState('')
  const [step0Errors, setStep0Errors] = useState<Record<string, string>>({})
  const [authLoading, setAuthLoading] = useState(false)
  const [oauthBusy, setOAuthBusy]     = useState<OAuthProvider | null>(null)
  const [oauthError, setOAuthError]   = useState('')

  async function handleOAuth(provider: OAuthProvider) {
    setOAuthBusy(provider); setOAuthError('')
    try {
      const { error: e } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}?auth=1` },
      })
      if (e) {
        setOAuthError(
          e.message.toLowerCase().includes('not enabled')
            ? (ar ? 'هذا المزود غير مفعّل بعد' : 'This provider is not enabled yet')
            : e.message
        )
        setOAuthBusy(null)
      }
    } catch {
      setOAuthError(ar ? 'تعذر الاتصال' : 'Connection failed')
      setOAuthBusy(null)
    }
  }

  function validateStep0() {
    const errs: Record<string, string> = {}
    if (!user.name.trim())  errs.name  = ar ? 'الاسم مطلوب' : 'Name is required'
    if (!user.email.trim()) errs.email = ar ? 'البريد الإلكتروني مطلوب' : 'Email is required'
    if (user.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email))
      errs.email = ar ? 'بريد إلكتروني غير صالح' : 'Invalid email address'
    if (!password || password.length < 6)
      errs.password = ar ? 'كلمة المرور 6 أحرف على الأقل' : 'Password must be at least 6 characters'
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
  async function goNext() {
    if (onboardStep === 0) {
      if (isOAuthUser) {
        // OAuth users skip signup — just validate academic fields
        const errs: Record<string, string> = {}
        if (!user.university.trim()) errs.university = ar ? 'الجامعة مطلوبة' : 'University is required'
        if (!user.major.trim())      errs.major      = ar ? 'التخصص مطلوب'  : 'Major is required'
        if (Object.keys(errs).length) { setStep0Errors(errs); return }

        // Save academic info to Supabase
        if (user.supabaseId) {
          setAuthLoading(true)
          try {
            await sbSaveProfile(user.supabaseId, user)
          } catch (e: unknown) {
            setStep0Errors({ email: e instanceof Error ? e.message : 'Database error saving profile — please try again' })
            setAuthLoading(false)
            return
          }
          setAuthLoading(false)
        }
        dispatch({ type: 'SET_ONBOARD_STEP', step: 1 })
        return
      }

      if (!validateStep0()) return
      setAuthLoading(true)
      try {
        const sbUser = await sbSignUp(user.email.trim(), password, user.name.trim())
        if (sbUser) dispatch({ type: 'SET_USER', user: { supabaseId: sbUser.id } })
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('email')) {
          setStep0Errors(prev => ({
            ...prev,
            email: ar ? 'هذا البريد مسجّل بالفعل — سجّل دخولك' : 'Email already registered — sign in instead',
          }))
          setAuthLoading(false)
          return
        }
      } finally {
        setAuthLoading(false)
      }
      dispatch({ type: 'SET_ONBOARD_STEP', step: 1 })
    } else {
      if (!allRequiredOk) return
      // Mark onboarding complete
      if (user.supabaseId) {
        try {
          await sbSaveProfile(user.supabaseId, { ...user, onboardingCompleted: true })
        } catch (e: unknown) {
          setStep0Errors({ email: e instanceof Error ? e.message : 'Database error saving profile — please try again' })
          return
        }
      }
      dispatch({ type: 'SET_USER', user: { onboardingCompleted: true } })
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
              {isOAuthUser && user.avatarUrl ? (
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-12 h-12 rounded-full border-2 border-brand-200"
                  />
                  <div>
                    <p className="font-bold text-neutral-900">{user.name}</p>
                    <p className="text-xs text-neutral-500">{user.email}</p>
                  </div>
                </div>
              ) : null}
              <h2 className="text-2xl font-bold text-neutral-900">
                {ar ? 'أكمل ملفك الشخصي' : isOAuthUser ? 'Complete your profile' : 'Create your account'}
              </h2>
              <p className="text-sm text-neutral-500 mt-1">
                {ar
                  ? 'أضف معلوماتك الأكاديمية للبدء'
                  : isOAuthUser
                  ? 'Just your academic details — everything else is already set'
                  : 'Join free and start your career journey'}
              </p>
            </motion.div>

            {/* Social sign-up (email users only) */}
            {!isOAuthUser && (
              <>
                <motion.div variants={up} custom={1} initial="hidden" animate="visible" className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <OAuthButton icon={<GoogleIcon />} label="Google" provider="google" busy={oauthBusy} onPress={handleOAuth} />
                    <OAuthButton icon={<GitHubIcon />} label="GitHub" provider="github" busy={oauthBusy} onPress={handleOAuth} />
                  </div>
                  {oauthError && (
                    <p className="flex items-center gap-1.5 text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {oauthError}
                    </p>
                  )}
                </motion.div>
                <motion.div variants={up} custom={2} initial="hidden" animate="visible" className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-neutral-200" />
                  <span className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider">
                    {ar ? 'أو بالبريد الإلكتروني' : 'or sign up with email'}
                  </span>
                  <div className="flex-1 h-px bg-neutral-200" />
                </motion.div>
              </>
            )}

            {/* For OAuth users: only show academic fields */}
            {isOAuthUser ? (
              <>
                {[
                  { label: ar ? 'الجامعة *' : 'University *', key: 'university', ph: ar ? 'مثال: الجامعة الألمانية' : 'e.g. German International University' },
                  { label: ar ? 'التخصص *' : 'Major *', key: 'major', ph: ar ? 'مثال: إدارة الأعمال' : 'e.g. Business Administration' },
                  { label: ar ? 'رقم الهاتف' : 'Phone', key: 'phone', ph: '+20 1XX XXX XXXX' },
                ].map((f, i) => (
                  <motion.div key={f.key} variants={up} custom={i + 1} initial="hidden" animate="visible">
                    <label className="text-xs font-semibold text-neutral-500 block mb-1.5">{f.label}</label>
                    <Input
                      placeholder={f.ph}
                      value={(user as unknown as Record<string, string>)[f.key] || ''}
                      onChange={e => setField(f.key, e.target.value)}
                      className={step0Errors[f.key] ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}
                    />
                    {step0Errors[f.key] && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />{step0Errors[f.key]}
                      </p>
                    )}
                  </motion.div>
                ))}
              </>
            ) : null}

            {/* Full form for email users */}
            {!isOAuthUser && [
              { label: ar ? 'الاسم الكامل' : 'Full Name *', key: 'name', ph: ar ? 'مثال: أحمد علي' : 'e.g. Ahmed Ali' },
              { label: ar ? 'البريد الإلكتروني *' : 'Email *', key: 'email', ph: 'you@university.edu.eg', type: 'email' },
              { label: ar ? 'رقم الهاتف' : 'Phone', key: 'phone', ph: '+20 1XX XXX XXXX' },
              { label: ar ? 'الجامعة' : 'University', key: 'university', ph: ar ? 'مثال: الجامعة الألمانية' : 'e.g. German International University' },
              { label: ar ? 'التخصص' : 'Major', key: 'major', ph: ar ? 'مثال: إدارة الأعمال' : 'e.g. Business Administration' },
            ].map((f, i) => (
              <motion.div key={f.key} variants={up} custom={i + 3} initial="hidden" animate="visible">
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

            {/* Password — email users only */}
            {!isOAuthUser && (
              <motion.div variants={up} custom={6} initial="hidden" animate="visible">
                <label className="text-xs font-semibold text-neutral-500 block mb-1.5">
                  {ar ? 'كلمة المرور *' : 'Password *'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value)
                      if (step0Errors.password) setStep0Errors(prev => { const n = { ...prev }; delete n.password; return n })
                    }}
                    className={cn('pl-9', step0Errors.password ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : '')}
                  />
                </div>
                {step0Errors.password && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {step0Errors.password}
                  </p>
                )}
                <p className="text-xs text-neutral-400 mt-1">
                  {ar ? 'ستستخدمه لتسجيل الدخول لاحقاً' : "You'll use this to sign in next time"}
                </p>
              </motion.div>
            )}

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
            <Button size="lg" className="flex-1 gap-2" onClick={goNext} disabled={authLoading}>
              {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
              {authLoading ? (ar ? 'جاري الإنشاء...' : 'Creating account…') : (ar ? 'متابعة' : 'Continue')}
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
