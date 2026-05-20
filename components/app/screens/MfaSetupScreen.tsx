'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, ShieldCheck, Copy, Check, Loader2,
  AlertCircle, ChevronRight, KeyRound, Smartphone,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { sbMfaEnroll, sbMfaChallengeAndVerify, sbMfaUnenroll } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const up = {
  hidden:  { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: i * 0.07 },
  }),
}

// ── 6-digit OTP input ─────────────────────────────────────────────────────────

function OtpInput({ value, onChange, disabled }: {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([])

  function handleKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !value[i] && i > 0) refs.current[i - 1]?.focus()
  }

  function handleChange(i: number, raw: string) {
    const digit = raw.replace(/\D/g, '').slice(-1)
    const arr = value.split('').slice(0, 6)
    arr[i] = digit
    const next = arr.join('').slice(0, 6)
    onChange(next)
    if (digit && i < 5) setTimeout(() => refs.current[i + 1]?.focus(), 10)
  }

  function handlePaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text) { onChange(text); setTimeout(() => refs.current[Math.min(text.length, 5)]?.focus(), 10) }
    e.preventDefault()
  }

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ''}
          disabled={disabled}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          onFocus={e => e.target.select()}
          className={cn(
            'w-11 h-13 text-center text-xl font-bold rounded-xl border-2',
            'bg-neutral-50 text-neutral-900 outline-none',
            'transition-all duration-150',
            value[i]
              ? 'border-brand-500 bg-brand-50'
              : 'border-neutral-200 focus:border-brand-400',
            disabled && 'opacity-40 cursor-not-allowed',
          )}
          style={{ height: '52px' }}
        />
      ))}
    </div>
  )
}

// ── Recovery codes ────────────────────────────────────────────────────────────

function generateRecoveryCodes(): string[] {
  return Array.from({ length: 8 }, () => {
    const part = () => Math.random().toString(36).slice(2, 7).toUpperCase()
    return `${part()}-${part()}`
  })
}

// ── Main screen ───────────────────────────────────────────────────────────────

type Step = 'intro' | 'qr' | 'verify' | 'recovery' | 'done'

export function MfaSetupScreen() {
  const { state, dispatch } = useApp()
  const ar = state.lang === 'ar'

  const [step, setStep]       = useState<Step>('intro')
  const [enrollData, setEnroll] = useState<{
    id: string; qrCode: string; secret: string
  } | null>(null)
  const [code, setCode]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [copied, setCopied]   = useState(false)
  const [recoveryCodes]       = useState<string[]>(() => generateRecoveryCodes())
  const [recovCopied, setRecovCopied] = useState(false)

  const skipAllowed = !state.user.mfaEnabled

  // ── Enroll on reaching QR step ───────────────────────────────────────────

  const startEnroll = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const data = await sbMfaEnroll()
      setEnroll({ id: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret })
      setStep('qr')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Enrollment failed')
    } finally { setLoading(false) }
  }, [])

  // ── Verify OTP ───────────────────────────────────────────────────────────

  async function handleVerify() {
    if (code.length < 6 || !enrollData) return
    setLoading(true); setError('')
    try {
      await sbMfaChallengeAndVerify(enrollData.id, code)
      dispatch({ type: 'SET_MFA_FACTOR', factorId: enrollData.id })
      dispatch({ type: 'SET_USER', user: { mfaEnabled: true } })
      setStep('recovery')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Verification failed'
      setError(msg.toLowerCase().includes('invalid') ? 'Incorrect code — try again' : msg)
      setCode('')
    } finally { setLoading(false) }
  }

  // ── Copy helpers ─────────────────────────────────────────────────────────

  function copySecret() {
    navigator.clipboard.writeText(enrollData?.secret ?? '')
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  function copyRecovery() {
    navigator.clipboard.writeText(recoveryCodes.join('\n'))
    setRecovCopied(true); setTimeout(() => setRecovCopied(false), 2000)
  }

  // ── Skip (optional) ──────────────────────────────────────────────────────

  async function handleSkip() {
    // Unenroll in-progress factor if any
    if (enrollData?.id) await sbMfaUnenroll(enrollData.id).catch(() => null)
    goToNext()
  }

  function goToNext() {
    dispatch({ type: 'GO', screen: state.user.onboardingCompleted ? 'home' : 'onboard' })
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-dvh flex flex-col bg-white px-6 py-10">
      <motion.div
        className="flex-1 flex flex-col max-w-sm mx-auto w-full"
        initial="hidden" animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
      >
        <AnimatePresence mode="wait">

          {/* ── INTRO ─────────────────────────────────────────────────── */}
          {step === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col flex-1">
              <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center pb-8">
                <div className="w-20 h-20 rounded-3xl bg-brand-50 flex items-center justify-center">
                  <Shield className="w-10 h-10 text-brand-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-neutral-900">
                    {ar ? 'تأمين حسابك' : 'Secure your account'}
                  </h1>
                  <p className="text-sm text-neutral-500 mt-2 leading-relaxed">
                    {ar
                      ? 'أضف طبقة حماية إضافية باستخدام تطبيق المصادقة'
                      : 'Add an extra layer of protection with an authenticator app like Google Authenticator or Authy.'}
                  </p>
                </div>

                <div className="w-full flex flex-col gap-3 text-left">
                  {[
                    { icon: Smartphone, title: ar ? 'افتح تطبيق المصادقة' : 'Open your authenticator app', sub: ar ? 'Google Authenticator أو Authy' : 'Google Authenticator, Authy, or 1Password' },
                    { icon: KeyRound,   title: ar ? 'امسح رمز QR' : 'Scan the QR code', sub: ar ? 'أو أدخل المفتاح يدوياً' : 'Or enter the secret key manually' },
                    { icon: ShieldCheck, title: ar ? 'أدخل رمز التحقق' : 'Enter the 6-digit code', sub: ar ? 'للتأكيد والتفعيل' : 'To confirm and activate MFA' },
                  ].map(({ icon: Icon, title, sub }, i) => (
                    <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-50 border border-neutral-100">
                      <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-brand-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-800">{title}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button onClick={startEnroll} disabled={loading} className="w-full h-12 gap-2">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                  {loading ? (ar ? 'جاري التحضير…' : 'Preparing…') : (ar ? 'إعداد المصادقة الثنائية' : 'Set up 2-step verification')}
                </Button>
                {skipAllowed && (
                  <button onClick={handleSkip} className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors py-1">
                    {ar ? 'تخطي الآن (غير موصى به)' : 'Skip for now (not recommended)'}
                  </button>
                )}
                {error && <p className="text-xs text-red-500 text-center">{error}</p>}
              </div>
            </motion.div>
          )}

          {/* ── QR CODE ───────────────────────────────────────────────── */}
          {step === 'qr' && enrollData && (
            <motion.div key="qr" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="flex flex-col flex-1 gap-6">
              <div>
                <h2 className="text-xl font-bold text-neutral-900">
                  {ar ? 'امسح رمز QR' : 'Scan QR code'}
                </h2>
                <p className="text-sm text-neutral-500 mt-1">
                  {ar ? 'افتح تطبيق المصادقة واضغط على + لإضافة حساب جديد' : 'Open your authenticator app and tap + to add a new account'}
                </p>
              </div>

              {/* QR Code */}
              <div className="flex justify-center">
                <div className="p-4 bg-white border-2 border-neutral-200 rounded-2xl shadow-sm">
                  {/* Supabase returns an SVG data URI */}
                  <img
                    src={enrollData.qrCode}
                    alt="MFA QR Code"
                    width={180}
                    height={180}
                    className="block"
                  />
                </div>
              </div>

              {/* Manual secret */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-neutral-500 mb-2">
                  {ar ? 'أو أدخل هذا المفتاح يدوياً:' : 'Or enter this key manually:'}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-sm font-mono text-neutral-800 break-all leading-relaxed">
                    {enrollData.secret}
                  </code>
                  <button
                    onClick={copySecret}
                    className="shrink-0 p-1.5 rounded-lg text-neutral-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button onClick={() => { setCode(''); setStep('verify') }} className="w-full h-12 gap-2">
                {ar ? 'تم المسح — أدخل الرمز' : "I've scanned it — enter code"}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {/* ── VERIFY OTP ────────────────────────────────────────────── */}
          {step === 'verify' && (
            <motion.div key="verify" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="flex flex-col flex-1 gap-6">
              <div>
                <h2 className="text-xl font-bold text-neutral-900">
                  {ar ? 'أدخل رمز التحقق' : 'Enter verification code'}
                </h2>
                <p className="text-sm text-neutral-500 mt-1">
                  {ar ? 'أدخل الرمز المكون من 6 أرقام من تطبيق المصادقة' : 'Enter the 6-digit code from your authenticator app'}
                </p>
              </div>

              <OtpInput value={code} onChange={v => { setCode(v); setError('') }} disabled={loading} />

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </motion.div>
              )}

              <div className="flex flex-col gap-3 mt-auto">
                <Button
                  onClick={handleVerify}
                  disabled={code.length < 6 || loading}
                  className="w-full h-12 gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  {loading ? (ar ? 'جاري التحقق…' : 'Verifying…') : (ar ? 'تفعيل المصادقة الثنائية' : 'Activate 2-step verification')}
                </Button>
                <button onClick={() => setStep('qr')} className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors">
                  {ar ? '← العودة لرمز QR' : '← Back to QR code'}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── RECOVERY CODES ────────────────────────────────────────── */}
          {step === 'recovery' && (
            <motion.div key="recovery" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="flex flex-col flex-1 gap-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">
                    {ar ? 'رموز الاسترداد' : 'Save recovery codes'}
                  </h2>
                  <p className="text-xs text-neutral-500">
                    {ar ? 'احفظها في مكان آمن' : 'Store these somewhere safe'}
                  </p>
                </div>
              </div>

              <div className="bg-neutral-950 rounded-2xl p-4">
                <div className="grid grid-cols-2 gap-2">
                  {recoveryCodes.map((code, i) => (
                    <code key={i} className="text-xs font-mono text-emerald-400 bg-white/5 px-2 py-1.5 rounded-lg text-center">
                      {code}
                    </code>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
                <p className="text-xs text-amber-700 leading-relaxed">
                  {ar
                    ? '⚠️ لن تتمكن من رؤية هذه الرموز مرة أخرى. كل رمز يُستخدم مرة واحدة فقط.'
                    : '⚠️ You won\'t see these again. Each code can only be used once. If you lose access to your authenticator, use one of these to recover your account.'}
                </p>
              </div>

              <div className="flex flex-col gap-3 mt-auto">
                <button
                  onClick={copyRecovery}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-neutral-300 text-sm font-semibold text-neutral-600 hover:border-brand-400 hover:text-brand-600 transition-colors"
                >
                  {recovCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  {recovCopied ? (ar ? 'تم النسخ!' : 'Copied!') : (ar ? 'نسخ رموز الاسترداد' : 'Copy recovery codes')}
                </button>
                <Button onClick={() => setStep('done')} className="w-full h-12 gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  {ar ? 'حفظت الرموز، المتابعة' : "I've saved them — continue"}
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── DONE ──────────────────────────────────────────────────── */}
          {step === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col flex-1 items-center justify-center gap-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center"
              >
                <ShieldCheck className="w-12 h-12 text-emerald-600" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">
                  {ar ? 'تم التفعيل!' : 'MFA activated!'}
                </h2>
                <p className="text-sm text-neutral-500 mt-2">
                  {ar ? 'حسابك محمي الآن بطبقة أمان إضافية' : 'Your account is now protected with 2-step verification'}
                </p>
              </div>
              <Button onClick={goToNext} className="w-full max-w-xs h-12 gap-2">
                {ar ? 'المتابعة للمنصة' : 'Continue to platform'}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  )
}
