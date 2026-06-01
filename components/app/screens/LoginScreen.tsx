'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Loader2, AlertCircle, Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import { useApp } from '@/lib/store'
import { supabase } from '@/lib/supabase'

type Provider = 'google' | 'github'
type Mode = 'signin' | 'signup'

const up = {
  hidden:  { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const, delay: i * 0.08 },
  }),
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  )
}

export function LoginScreen() {
  const { state, dispatch } = useApp()
  const ar = state.lang === 'ar'

  const [mode, setMode]         = useState<Mode>('signin')
  const [busy, setBusy]         = useState<Provider | 'email' | null>(null)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [showPass, setShowPass] = useState(false)

  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')

  async function handleOAuth(provider: Provider) {
    setBusy(provider); setError(''); setSuccess('')
    try {
      const { error: e } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (e) {
        setError(
          e.message.toLowerCase().includes('not enabled')
            ? `${provider === 'google' ? 'Google' : 'GitHub'} sign-in is not enabled. Try email instead.`
            : e.message
        )
        setBusy(null)
      }
    } catch {
      setError('Connection failed. Check your internet and try again.')
      setBusy(null)
    }
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) { setError('Please fill in all fields.'); return }
    if (mode === 'signup' && !name) { setError('Please enter your name.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }

    setBusy('email'); setError(''); setSuccess('')

    try {
      if (mode === 'signin') {
        const { error: e } = await supabase.auth.signInWithPassword({ email, password })
        if (e) {
          setError(e.message === 'Invalid login credentials'
            ? 'Incorrect email or password.'
            : e.message)
          setBusy(null)
          return
        }
        // Success → app will detect session and navigate
        dispatch({ type: 'GO', screen: 'home' })
      } else {
        const { error: e } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: name }, emailRedirectTo: `${window.location.origin}/auth/callback` },
        })
        if (e) { setError(e.message); setBusy(null); return }
        setSuccess('Check your email for a confirmation link, then sign in.')
        setMode('signin')
        setPassword('')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setBusy(null)
    }
  }

  const emailBusy = busy === 'email'

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-neutral-50 px-6 py-12">
      <motion.div
        className="w-full max-w-sm"
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
      >
        {/* Logo */}
        <motion.div variants={up} custom={0} className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/30 mb-4">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            {ar ? 'تسجيل الدخول' : 'Sign in to Sho8lana'}
          </h1>
          <p className="text-sm text-neutral-500 mt-1.5 text-center">
            {ar ? 'اختر طريقة تسجيل الدخول' : 'Your career journey starts here'}
          </p>
        </motion.div>

        {/* OAuth buttons */}
        <motion.div variants={up} custom={1} className="flex flex-col gap-2.5 mb-5">
          {([
            { provider: 'google' as Provider, icon: <GoogleIcon />, label: 'Google' },
            { provider: 'github' as Provider, icon: <GitHubIcon />, label: 'GitHub' },
          ]).map(({ provider, icon, label }) => {
            const loading  = busy === provider
            const disabled = busy !== null
            return (
              <motion.button
                key={provider}
                onClick={() => handleOAuth(provider)}
                disabled={disabled}
                whileHover={disabled ? {} : { scale: 1.015 }}
                whileTap={disabled ? {} : { scale: 0.985 }}
                className="w-full flex items-center gap-3 px-5 py-3 rounded-xl bg-white border border-neutral-200 text-neutral-800 font-semibold text-sm shadow-sm hover:bg-neutral-50 hover:border-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="flex items-center justify-center w-5">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin text-neutral-400" /> : icon}
                </span>
                <span className="flex-1 text-left">
                  {loading ? `Connecting…` : `Continue with ${label}`}
                </span>
                {!loading && (
                  <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </motion.button>
            )
          })}
        </motion.div>

        {/* Divider */}
        <motion.div variants={up} custom={2} className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-neutral-200" />
          <span className="text-xs text-neutral-400 font-medium">or use email</span>
          <div className="flex-1 h-px bg-neutral-200" />
        </motion.div>

        {/* Sign in / Sign up tabs */}
        <motion.div variants={up} custom={3} className="flex bg-neutral-100 rounded-xl p-1 mb-5">
          {(['signin', 'signup'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); setSuccess('') }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                mode === m
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              {m === 'signin'
                ? (ar ? 'تسجيل الدخول' : 'Sign In')
                : (ar ? 'إنشاء حساب' : 'Create Account')}
            </button>
          ))}
        </motion.div>

        {/* Email form */}
        <motion.form variants={up} custom={4} onSubmit={handleEmail} className="flex flex-col gap-3">
          <AnimatePresence>
            {mode === 'signup' && (
              <motion.div
                key="name-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder={ar ? 'الاسم الكامل' : 'Full name'}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="email"
              placeholder={ar ? 'البريد الإلكتروني' : 'Email address'}
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type={showPass ? 'text' : 'password'}
              placeholder={ar ? 'كلمة المرور' : 'Password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              className="w-full pl-10 pr-11 py-3 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            />
            <button
              type="button"
              onClick={() => setShowPass(v => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
              tabIndex={-1}
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {mode === 'signin' && (
            <button
              type="button"
              onClick={() => dispatch({ type: 'GO', screen: 'forgotPassword' })}
              className="text-xs text-brand-600 hover:underline text-right self-end -mt-1"
            >
              {ar ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
            </button>
          )}

          {/* Error / Success */}
          <AnimatePresence>
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-start gap-2.5 text-red-600 text-xs bg-red-50 border border-red-200 rounded-xl px-4 py-3"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}
            {success && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-emerald-700 text-xs bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3"
              >
                ✓ {success}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={emailBusy || busy !== null}
            whileHover={emailBusy ? {} : { scale: 1.015 }}
            whileTap={emailBusy ? {} : { scale: 0.985 }}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-sm shadow-brand-600/25 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {emailBusy
              ? <><Loader2 className="w-4 h-4 animate-spin" />{ar ? 'جارٍ التحقق…' : 'Please wait…'}</>
              : mode === 'signin'
                ? (ar ? 'تسجيل الدخول' : 'Sign In')
                : (ar ? 'إنشاء حساب' : 'Create Account')}
          </motion.button>
        </motion.form>

        {/* Footer */}
        <motion.p variants={up} custom={5} className="text-xs text-neutral-400 text-center mt-6 leading-relaxed">
          {ar
            ? 'بالمتابعة، أنت توافق على شروط الاستخدام وسياسة الخصوصية'
            : 'By continuing, you agree to our Terms of Service and Privacy Policy'}
        </motion.p>
      </motion.div>
    </div>
  )
}
