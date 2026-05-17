'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, LogIn, Zap, AlertCircle, Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useApp } from '@/lib/store'
import { sbSignIn, supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const up = {
  hidden:  { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: i * 0.07 },
  }),
}

// ── Provider icons ────────────────────────────────────────────────────────────

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

const MicrosoftIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
    <path d="M11.4 2H2v9.4h9.4V2z" fill="#F25022"/>
    <path d="M22 2h-9.4v9.4H22V2z" fill="#7FBA00"/>
    <path d="M11.4 12.6H2V22h9.4v-9.4z" fill="#00A4EF"/>
    <path d="M22 12.6h-9.4V22H22v-9.4z" fill="#FFB900"/>
  </svg>
)

const LinkedInIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="#0A66C2">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

// ── Social button ─────────────────────────────────────────────────────────────

type Provider = 'google' | 'apple' | 'github' | 'azure' | 'linkedin_oidc'

interface SocialBtnProps {
  icon: React.ReactNode
  label: string
  provider: Provider
  active: Provider | null
  onPress: (p: Provider) => void
  wide?: boolean
}

function SocialBtn({ icon, label, provider, active, onPress, wide }: SocialBtnProps) {
  const loading = active === provider
  const disabled = active !== null

  return (
    <button
      onClick={() => onPress(provider)}
      disabled={disabled}
      className={cn(
        'flex items-center justify-center gap-2 py-3 rounded-2xl border font-semibold text-sm',
        'transition-all duration-200 active:scale-[0.97]',
        wide ? 'flex-1' : 'flex-1',
        disabled
          ? 'opacity-40 cursor-not-allowed'
          : 'hover:bg-white/10 hover:border-white/20',
        loading
          ? 'bg-white/10 border-white/20'
          : 'bg-white/5 border-white/10 text-white',
      )}
    >
      {loading
        ? <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
        : icon}
      <span className="text-xs font-semibold">{label}</span>
    </button>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────

export function LoginScreen() {
  const { state, dispatch } = useApp()
  const ar = state.lang === 'ar'

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [oauthBusy, setOAuth]   = useState<Provider | null>(null)
  const [error, setError]       = useState('')

  // ── Email / password sign-in ──────────────────────────────────────────────

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError(ar ? 'يرجى ملء جميع الحقول' : 'Please fill in all fields')
      return
    }
    setLoading(true); setError('')
    try {
      await sbSignIn(email.trim(), password)
    } catch (e: unknown) {
      const msg = (e instanceof Error ? e.message : String(e)).toLowerCase()
      if (msg.includes('invalid login') || msg.includes('invalid credentials')) {
        setError(ar ? 'بريد إلكتروني أو كلمة مرور غير صحيحة' : 'Incorrect email or password')
      } else if (msg.includes('email not confirmed')) {
        setError(ar ? 'يرجى تأكيد بريدك الإلكتروني أولاً' : 'Please verify your email first')
      } else {
        setError(ar ? 'حدث خطأ. حاول مرة أخرى.' : 'Something went wrong. Try again.')
      }
    } finally { setLoading(false) }
  }

  // ── OAuth sign-in ─────────────────────────────────────────────────────────

  async function handleOAuth(provider: Provider) {
    setOAuth(provider); setError('')
    try {
      const { error: e } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}?auth=1`,
          queryParams: provider === 'azure'
            ? { prompt: 'select_account' }
            : undefined,
        },
      })
      if (e) {
        setError(
          e.message.toLowerCase().includes('not enabled')
            ? (ar ? 'هذا المزود غير مفعّل بعد' : 'This provider is not enabled yet')
            : e.message
        )
        setOAuth(null)
      }
      // On success Supabase redirects the page — setOAuth(null) not needed
    } catch {
      setError(ar ? 'تعذر الاتصال' : 'Connection failed')
      setOAuth(null)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col justify-center px-6 py-10
                    bg-gradient-to-br from-[#080e1a] via-[#0a2a27] to-[#0e1f1c] relative overflow-hidden">

      {/* Background glows */}
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-brand-600/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-brand-400/8 blur-[60px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-brand-900/20 blur-[100px] pointer-events-none" />

      <motion.div
        className="relative z-10 flex flex-col"
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
      >
        {/* Back button */}
        <motion.button
          variants={up} custom={0}
          onClick={() => dispatch({ type: 'GO', screen: 'welcome' })}
          className="flex items-center gap-1.5 text-neutral-500 hover:text-neutral-300 transition-colors text-sm mb-8 w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          {ar ? 'العودة' : 'Back'}
        </motion.button>

        {/* Logo */}
        <motion.div variants={up} custom={1} className="flex items-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/40">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-serif text-xl text-white tracking-tight">Sho8lana</span>
        </motion.div>

        {/* Heading */}
        <motion.div variants={up} custom={2} className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {ar ? 'مرحباً بعودتك' : 'Welcome back'}
          </h1>
          <p className="text-sm text-neutral-400 mt-2">
            {ar ? 'سجّل دخولك للمتابعة من حيث توقفت' : 'Sign in to continue your journey'}
          </p>
        </motion.div>

        {/* ── Social providers ── */}
        <motion.div variants={up} custom={3} className="flex flex-col gap-2.5 mb-6">
          {/* Row 1 — main providers */}
          <div className="flex gap-2">
            <SocialBtn icon={<GoogleIcon />}    label="Google"    provider="google"        active={oauthBusy} onPress={handleOAuth} />
            <SocialBtn icon={<AppleIcon />}     label="Apple"     provider="apple"         active={oauthBusy} onPress={handleOAuth} />
            <SocialBtn icon={<GitHubIcon />}    label="GitHub"    provider="github"        active={oauthBusy} onPress={handleOAuth} />
          </div>
          {/* Row 2 — optional providers */}
          <div className="flex gap-2">
            <SocialBtn icon={<MicrosoftIcon />} label="Microsoft" provider="azure"         active={oauthBusy} onPress={handleOAuth} wide />
            <SocialBtn icon={<LinkedInIcon />}  label="LinkedIn"  provider="linkedin_oidc" active={oauthBusy} onPress={handleOAuth} wide />
          </div>
        </motion.div>

        {/* Divider */}
        <motion.div variants={up} custom={4} className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-white/8" />
          <span className="text-[11px] text-neutral-600 font-semibold uppercase tracking-widest">
            {ar ? 'أو بالبريد الإلكتروني' : 'or continue with email'}
          </span>
          <div className="flex-1 h-px bg-white/8" />
        </motion.div>

        {/* ── Email / Password form ── */}
        <motion.div variants={up} custom={5} className="flex flex-col gap-3 mb-4">

          {/* Email */}
          <div>
            <label className="text-xs font-semibold text-neutral-400 block mb-1.5">
              {ar ? 'البريد الإلكتروني' : 'Email address'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
              <Input
                type="email"
                placeholder={ar ? 'بريدك الإلكتروني' : 'you@example.com'}
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className={cn(
                  'pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-neutral-600',
                  'focus:border-brand-500/60 focus:ring-brand-500/20 rounded-xl',
                  error && 'border-red-500/50'
                )}
                dir="ltr"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-neutral-400">
                {ar ? 'كلمة المرور' : 'Password'}
              </label>
              <button
                type="button"
                onClick={() => dispatch({ type: 'GO', screen: 'forgotPassword' })}
                className="text-[11px] text-brand-400 font-semibold hover:text-brand-300 transition-colors"
              >
                {ar ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
              <Input
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className={cn(
                  'pl-10 pr-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-neutral-600',
                  'focus:border-brand-500/60 focus:ring-brand-500/20 rounded-xl',
                  error && 'border-red-500/50'
                )}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(s => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-300 transition-colors"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3.5 py-2.5"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </motion.div>
          )}
        </motion.div>

        {/* Sign in button */}
        <motion.div variants={up} custom={6} className="mb-6">
          <Button
            onClick={handleLogin}
            disabled={loading || oauthBusy !== null}
            className="w-full h-12 gap-2 text-sm font-semibold rounded-xl"
          >
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <LogIn className="w-4 h-4" />}
            {loading ? (ar ? 'جاري الدخول…' : 'Signing in…') : (ar ? 'تسجيل الدخول' : 'Sign in')}
          </Button>
        </motion.div>

        {/* Footer */}
        <motion.div variants={up} custom={7} className="text-center">
          <p className="text-sm text-neutral-500">
            {ar ? 'ليس لديك حساب؟ ' : "Don't have an account? "}
            <button
              onClick={() => dispatch({ type: 'GO', screen: 'onboard' })}
              className="text-brand-400 font-semibold hover:text-brand-300 transition-colors"
            >
              {ar ? 'أنشئ حسابك مجاناً' : 'Create free account'}
            </button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
