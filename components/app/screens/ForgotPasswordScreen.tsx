'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Zap, AlertCircle, Loader2, ChevronLeft, CheckCircle2 } from 'lucide-react'
import { useApp } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const up = {
  hidden:  { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: i * 0.07 },
  }),
}

export function ForgotPasswordScreen() {
  const { state, dispatch } = useApp()
  const ar = state.lang === 'ar'

  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  async function handleSend() {
    if (!email.trim()) {
      setError(ar ? 'يرجى إدخال بريدك الإلكتروني' : 'Please enter your email')
      return
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError(ar ? 'بريد إلكتروني غير صالح' : 'Invalid email address')
      return
    }
    setLoading(true); setError('')
    try {
      const { error: e } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}?reset=1`,
      })
      if (e) throw e
      setSent(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : (ar ? 'حدث خطأ. حاول مرة أخرى.' : 'Something went wrong.'))
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-dvh flex flex-col justify-center px-7 py-10
                    bg-gradient-to-br from-neutral-950 via-[#0D4F4A] to-brand-900 relative overflow-hidden">
      <div className="absolute top-1/3 right-[-20px] w-44 h-44 rounded-full bg-brand-600/10 blur-3xl pointer-events-none" />

      <motion.div
        className="relative z-10 flex flex-col gap-6"
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
      >
        {/* Back button */}
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

        {!sent ? (
          <>
            <motion.div variants={up} custom={2}>
              <h1 className="text-2xl font-bold text-white">
                {ar ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
              </h1>
              <p className="text-sm text-neutral-400 mt-1">
                {ar
                  ? 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين.'
                  : "Enter your email and we'll send you a reset link."}
              </p>
            </motion.div>

            <motion.div variants={up} custom={3} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                  {ar ? 'البريد الإلكتروني' : 'Email address'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <Input
                    type="email"
                    placeholder={ar ? 'بريدك الإلكتروني' : 'your@email.com'}
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError('') }}
                    className={cn('pl-9 bg-white/5 border-white/10 text-white placeholder:text-neutral-500', error && 'border-red-500/60')}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    dir="ltr"
                    autoComplete="email"
                  />
                </div>
              </div>

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
            </motion.div>

            <motion.div variants={up} custom={4}>
              <Button
                onClick={handleSend}
                disabled={loading}
                className="w-full h-12 gap-2 text-base"
              >
                {loading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Mail className="w-4 h-4" />}
                {ar ? 'إرسال رابط الاسترداد' : 'Send reset link'}
              </Button>
            </motion.div>

            <motion.div variants={up} custom={5} className="text-center">
              <p className="text-sm text-neutral-400">
                {ar ? 'تذكرت كلمة المرور؟ ' : 'Remember your password? '}
                <button
                  onClick={() => dispatch({ type: 'GO', screen: 'login' })}
                  className="text-brand-400 font-semibold hover:text-brand-300 transition-colors"
                >
                  {ar ? 'تسجيل الدخول' : 'Sign in'}
                </button>
              </p>
            </motion.div>
          </>
        ) : (
          /* ── Success state ── */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-5 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                {ar ? 'تم الإرسال!' : 'Check your email!'}
              </h2>
              <p className="text-sm text-neutral-400">
                {ar
                  ? `أرسلنا رابط إعادة التعيين إلى ${email}`
                  : `We sent a reset link to ${email}`}
              </p>
              <p className="text-xs text-neutral-500 mt-2">
                {ar ? 'تحقق من مجلد الرسائل غير المرغوب فيها إذا لم تجده.' : "Check your spam folder if you don't see it."}
              </p>
            </div>
            <button
              onClick={() => dispatch({ type: 'GO', screen: 'login' })}
              className="mt-2 text-brand-400 font-semibold hover:text-brand-300 text-sm transition-colors"
            >
              {ar ? '← العودة لتسجيل الدخول' : '← Back to sign in'}
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
