'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, LogIn, Zap, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react'
import { useApp } from '@/lib/store'
import { sbSignIn, supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const up = {
  hidden:  { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 },
  }),
}

// ── Social provider button ────────────────────────────────────────────────────

function SocialButton({
  icon, label, onClick, loading,
}: { icon: React.ReactNode; label: string; onClick: () => void; loading?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                 bg-white/8 border border-white/10 text-white text-xs font-semibold
                 hover:bg-white/14 active:scale-95 transition-all duration-150
                 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {label}
    </button>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────

export function LoginScreen() {
  const { state, dispatch } = useApp()
  const ar = state.lang === 'ar'

  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [loading, setLoading]     = useState(false)
  const [oauthLoading, setOAuth]  = useState<string | null>(null)
  const [error, setError]         = useState('')

  // ── Email / Password sign-in ──────────────────────────────────────────────

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError(ar ? 'يرجى ملء جميع الحقول' : 'Please fill in all fields')
      return
    }
    setLoading(true); setError('')
    try {
      await sbSignIn(email.trim(), password)
      // onAuthStateChange in store handles profile load + navigation
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      if (msg.toLowerCase().includes('invalid login') || msg.toLowerCase().includes('invalid credentials')) {
        setError(ar ? 'بريد إلكتروني أو كلمة مرور غير صحيحة' : 'Incorrect email or password')
      } else if (msg.toLowerCase().includes('email not confirmed')) {
        setError(ar ? 'يرجى تأكيد بريدك الإلكتروني أولاً' : 'Please verify your email first')
      } else {
        setError(ar ? 'حدث خطأ. حاول مرة أخرى.' : 'Something went wrong. Try again.')
      }
    } finally { setLoading(false) }
  }

  // ── OAuth sign-in ─────────────────────────────────────────────────────────

  async function handleOAuth(provider: 'google' | 'github') {
    setOAuth(provider); setError('')
    try {
      const { error: e } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin },
      })
      if (e) setError(e.message)
    } catch {
      setError(ar ? 'تعذر الاتصال' : 'Connection failed')
    } finally { setOAuth(null) }
  }

  return (
    <div className="min-h-dvh flex flex-col justify-center px-7 py-10
                    bg-gradient-to-br from-neutral-950 via-[#0D4F4A] to-brand-900 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 right-[-30px] w-52 h-52 rounded-full bg-brand-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-[-20px] w-40 h-40 rounded-full bg-brand-400/8 blur-3xl pointer-events-none" />

      <motion.div
        className="relative z-10 flex flex-col gap-5"
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
      >
        {/* Logo */}
        <motion.div variants={up} custom={0} className="flex items-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-2xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-serif text-xl text-white">Sho8lana</span>
        </motion.div>

        {/* Heading */}
        <motion.div variants={up} custom={1}>
          <h1 className="text-2xl font-bold text-white">
            {ar ? 'مرحباً بعودتك' : 'Welcome back'}
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            {ar ? 'سجّل دخولك للمتابعة' : 'Sign in to continue your journey'}
          </p>
        </motion.div>

        {/* Social OAuth */}
        <motion.div variants={up} custom={2} className="flex gap-2">
          <SocialButton
            icon={
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            }
            label="Google"
            onClick={() => handleOAuth('google')}
            loading={oauthLoading === 'google'}
          />
          <SocialButton
            icon={
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            }
            label="GitHub"
            onClick={() => handleOAuth('github')}
            loading={oauthLoading === 'github'}
          />
        </motion.div>

        {/* Divider */}
        <motion.div variants={up} custom={3} className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-2xs text-neutral-500 font-semibold uppercase tracking-wider">
            {ar ? 'أو بالبريد الإلكتروني' : 'or with email'}
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </motion.div>

        {/* Form */}
        <motion.div variants={up} custom={4} className="flex flex-col gap-3">
          {/* Email */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
              {ar ? 'البريد الإلكتروني' : 'Email'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <Input
                type="email"
                placeholder={ar ? 'بريدك الإلكتروني' : 'your@email.com'}
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                className={cn('pl-9 bg-white/5 border-white/10 text-white placeholder:text-neutral-500', error && 'border-red-500/60')}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                dir="ltr"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-neutral-300">
                {ar ? 'كلمة المرور' : 'Password'}
              </label>
              <button
                type="button"
                onClick={() => dispatch({ type: 'GO', screen: 'forgotPassword' })}
                className="text-2xs text-brand-400 font-semibold hover:text-brand-300 transition-colors"
              >
                {ar ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <Input
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                className={cn('pl-9 pr-9 bg-white/5 border-white/10 text-white placeholder:text-neutral-500', error && 'border-red-500/60')}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
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

        {/* Sign in button */}
        <motion.div variants={up} custom={5}>
          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-12 gap-2 text-base"
          >
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <LogIn className="w-4 h-4" />}
            {ar ? 'تسجيل الدخول' : 'Sign in'}
          </Button>
        </motion.div>

        {/* Footer links */}
        <motion.div variants={up} custom={6} className="flex flex-col gap-3 text-center">
          <p className="text-sm text-neutral-400">
            {ar ? 'ليس لديك حساب؟ ' : "Don't have an account? "}
            <button
              onClick={() => dispatch({ type: 'GO', screen: 'onboard' })}
              className="text-brand-400 font-semibold hover:text-brand-300 transition-colors"
            >
              {ar ? 'أنشئ حسابك مجاناً' : 'Sign up free'}
            </button>
          </p>
          <button
            onClick={() => dispatch({ type: 'GO', screen: 'welcome' })}
            className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            {ar ? '← العودة للرئيسية' : '← Back to welcome'}
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}
