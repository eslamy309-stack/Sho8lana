'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Zap, AlertCircle, Loader2, ChevronLeft, CheckCircle2, RotateCcw } from 'lucide-react'
import { useApp } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const up = {
  hidden:  { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: i * 0.07 },
  }),
}

// ── OTP digit input ───────────────────────────────────────────────────────────

function OTPInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([])

  function handleKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !value[i] && i > 0) refs.current[i - 1]?.focus()
  }

  function handleChange(i: number, raw: string) {
    const digit = raw.replace(/\D/g, '').slice(-1)
    const next = [...value]
    next[i] = digit
    onChange(next)
    if (digit && i < 5) refs.current[i + 1]?.focus()
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('')
    const next = Array(6).fill('')
    digits.forEach((d, i) => { next[i] = d })
    onChange(next)
    const last = Math.min(digits.length, 5)
    refs.current[last]?.focus()
  }

  return (
    <div className="flex gap-2 justify-center">
      {value.map((digit, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el }}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={digit}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          className={cn(
            'w-11 h-14 text-center text-xl font-bold rounded-2xl border-2 transition-all duration-150 outline-none',
            'bg-white/5 text-white',
            digit
              ? 'border-brand-500 bg-brand-500/10'
              : 'border-white/15 focus:border-brand-400'
          )}
        />
      ))}
    </div>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────

export function OTPVerifyScreen() {
  const { state, dispatch } = useApp()
  const ar = state.lang === 'ar'

  const [digits, setDigits]   = useState<string[]>(Array(6).fill(''))
  const [loading, setLoading] = useState(false)
  const [resending, setRes]   = useState(false)
  const [verified, setVerified] = useState(false)
  const [error, setError]     = useState('')
  const [countdown, setCountdown] = useState(60)

  const email = state.user.email || ''

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const code = digits.join('')
  const complete = code.length === 6

  async function handleVerify() {
    if (!complete) return
    setLoading(true); setError('')
    try {
      const { error: e } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email',
      })
      if (e) throw e
      setVerified(true)
      setTimeout(() => dispatch({ type: 'GO', screen: 'home' }), 1600)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      if (msg.includes('expired') || msg.includes('invalid')) {
        setError(ar ? 'الرمز غير صحيح أو منتهي الصلاحية' : 'Invalid or expired code')
      } else {
        setError(ar ? 'حدث خطأ. حاول مرة أخرى.' : 'Something went wrong. Try again.')
      }
      setDigits(Array(6).fill(''))
    } finally { setLoading(false) }
  }

  async function handleResend() {
    if (countdown > 0 || !email) return
    setRes(true); setError('')
    try {
      await supabase.auth.resend({ email, type: 'signup' })
      setCountdown(60)
      setDigits(Array(6).fill(''))
    } catch {
      setError(ar ? 'تعذر إعادة الإرسال' : 'Could not resend code')
    } finally { setRes(false) }
  }

  return (
    <div className="min-h-dvh flex flex-col justify-center px-7 py-10
                    bg-gradient-to-br from-neutral-950 via-[#0D4F4A] to-brand-900 relative overflow-hidden">
      <div className="absolute top-1/4 left-[-20px] w-44 h-44 rounded-full bg-brand-600/10 blur-3xl pointer-events-none" />

      <motion.div
        className="relative z-10 flex flex-col gap-6"
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
      >
        {/* Back */}
        <motion.button
          variants={up} custom={0}
          onClick={() => dispatch({ type: 'GO', screen: 'login' })}
          className="flex items-center gap-1 text-neutral-400 hover:text-white text-sm transition-colors w-fit"
        >
          <ChevronLeft className="w-4 h-4" />
          {ar ? 'العودة' : 'Back'}
        </motion.button>

        {/* Logo */}
        <motion.div variants={up} custom={1} className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-serif text-xl text-white">Sho8lana</span>
        </motion.div>

        {!verified ? (
          <>
            <motion.div variants={up} custom={2}>
              <h1 className="text-2xl font-bold text-white">
                {ar ? 'أدخل رمز التحقق' : 'Enter verification code'}
              </h1>
              <p className="text-sm text-neutral-400 mt-1">
                {ar
                  ? `أرسلنا رمزاً مكوناً من 6 أرقام إلى ${email}`
                  : `We sent a 6-digit code to ${email}`}
              </p>
            </motion.div>

            <motion.div variants={up} custom={3}>
              <OTPInput value={digits} onChange={setDigits} />
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2"
              >
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <motion.div variants={up} custom={4}>
              <Button
                onClick={handleVerify}
                disabled={!complete || loading}
                className="w-full h-12 gap-2 text-base"
              >
                {loading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : null}
                {ar ? 'تحقق من الرمز' : 'Verify code'}
              </Button>
            </motion.div>

            <motion.div variants={up} custom={5} className="text-center">
              {countdown > 0 ? (
                <p className="text-sm text-neutral-500">
                  {ar ? `إعادة الإرسال في ${countdown}ث` : `Resend in ${countdown}s`}
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="flex items-center gap-1.5 mx-auto text-brand-400 hover:text-brand-300 text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {resending
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <RotateCcw className="w-3.5 h-3.5" />}
                  {ar ? 'إعادة إرسال الرمز' : 'Resend code'}
                </button>
              )}
            </motion.div>
          </>
        ) : (
          /* ── Verified ── */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-5 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center"
            >
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                {ar ? 'تم التحقق بنجاح!' : 'Verified!'}
              </h2>
              <p className="text-sm text-neutral-400">
                {ar ? 'جاري توجيهك…' : 'Redirecting you now…'}
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
