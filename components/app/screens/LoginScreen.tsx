'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap, Loader2, AlertCircle, Eye, EyeOff,
  Mail, Lock, User, GraduationCap, Building2, ChevronLeft,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

type Provider  = 'google' | 'github'
type Mode      = 'signin' | 'signup'
type RoleMode  = 'student' | 'company'

// ─────────────────────────────────────────────────────────────
// OAuth provider icons
// ─────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────
// Animation
// ─────────────────────────────────────────────────────────────
const up = {
  hidden:  { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const, delay: i * 0.07 },
  }),
}

// ─────────────────────────────────────────────────────────────
// Input field component
// ─────────────────────────────────────────────────────────────
interface FieldProps {
  id: string
  label: string
  icon: React.ReactNode
  type?: string
  value: string
  onChange: (v: string) => void
  autoComplete?: string
  suffix?: React.ReactNode
  disabled?: boolean
}

function Field({ id, label, icon, type = 'text', value, onChange, autoComplete, suffix, disabled }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-semibold text-neutral-600 px-0.5">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
          {icon}
        </span>
        <input
          id={id}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          autoComplete={autoComplete}
          disabled={disabled}
          className={cn(
            'w-full h-11 pl-10 rounded-xl border text-sm text-neutral-900 placeholder-neutral-400',
            'bg-white border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
            'transition disabled:opacity-50',
            suffix ? 'pr-11' : 'pr-4',
          )}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// LoginScreen
// ─────────────────────────────────────────────────────────────
export function LoginScreen() {
  const { state, dispatch } = useApp()
  const ar = state.lang === 'ar'

  const [roleMode, setRoleMode] = useState<RoleMode>('student')
  const [mode,     setMode]     = useState<Mode>('signin')
  const [busy,     setBusy]     = useState<Provider | 'email' | null>(null)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')
  const [showPass, setShowPass] = useState(false)

  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')

  function resetForm() {
    setError('')
    setSuccess('')
    setName('')
    setPassword('')
  }

  function handleRoleSwitch(r: RoleMode) {
    setRoleMode(r)
    resetForm()
  }

  function handleModeSwitch(m: Mode) {
    setMode(m)
    setError('')
    setSuccess('')
  }

  function routeAfterLogin() {
    if (roleMode === 'company') {
      dispatch({ type: 'SET_USER', user: { role: 'company_recruiter' } })
      dispatch({ type: 'GO', screen: 'hrDashboard' })
    } else {
      dispatch({ type: 'SET_USER', user: { role: 'student' } })
      dispatch({ type: 'GO', screen: 'home' })
    }
  }

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
    if (!email || !password)              { setError('Please fill in all fields.'); return }
    if (mode === 'signup' && !name)       { setError('Please enter your name.');    return }
    if (password.length < 6)             { setError('Password must be at least 6 characters.'); return }

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
        routeAfterLogin()
      } else {
        const role = roleMode === 'company' ? 'company_recruiter' : 'student'
        const { error: e } = await supabase.auth.signUp({
          email, password,
          options: {
            data: { full_name: name, role },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
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

  const emailBusy  = busy === 'email'
  const anyBusy    = busy !== null
  const isCo       = roleMode === 'company'
  const accentRing = isCo ? 'focus:ring-violet-500' : 'focus:ring-brand-500'
  const ctaBg      = isCo ? 'bg-violet-600 hover:bg-violet-700 shadow-violet-600/25' : 'bg-brand-600 hover:bg-brand-700 shadow-brand-600/25'

  return (
    <div
      className="min-h-dvh flex flex-col bg-neutral-50"
      dir={ar ? 'rtl' : 'ltr'}
    >
      {/* Back button */}
      <div className="px-5 pt-safe">
        <button
          onClick={() => dispatch({ type: 'GO', screen: 'welcome' })}
          aria-label="Back to welcome"
          className="mt-3 w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-neutral-100 transition-colors shadow-xs active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      <motion.div
        className="flex-1 flex flex-col items-center justify-center px-6 py-8"
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
      >
        <div className="w-full max-w-sm">

          {/* ── Logo ── */}
          <motion.div variants={up} custom={0} className="flex flex-col items-center mb-6">
            <div className={cn(
              'w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg mb-3 transition-colors duration-300',
              isCo ? 'bg-violet-600 shadow-violet-600/30' : 'bg-brand-600 shadow-brand-600/30',
            )}>
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              {ar ? 'تسجيل الدخول' : 'Welcome back'}
            </h1>
            <p className="text-sm text-neutral-500 mt-1 text-center">
              {ar ? 'اختر نوع حسابك للمتابعة' : 'Select your account type to continue'}
            </p>
          </motion.div>

          {/* ── Role switcher (Student / Company) ── */}
          <motion.div variants={up} custom={1} className="mb-5">
            <div className="flex bg-neutral-100 rounded-xl p-1 gap-1">
              {([
                { id: 'student' as RoleMode, icon: GraduationCap, label: ar ? 'طالب' : 'Student' },
                { id: 'company' as RoleMode, icon: Building2,     label: ar ? 'شركة'  : 'Company' },
              ]).map(({ id, icon: Icon, label }) => {
                const active = roleMode === id
                const activeStyle = id === 'student'
                  ? 'bg-white text-brand-600 shadow-sm border border-brand-100'
                  : 'bg-white text-violet-600 shadow-sm border border-violet-100'
                return (
                  <button
                    key={id}
                    onClick={() => handleRoleSwitch(id)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all duration-200',
                      active ? activeStyle : 'text-neutral-400 hover:text-neutral-600',
                    )}
                  >
                    <Icon className="w-4 h-4" strokeWidth={2} />
                    {label}
                  </button>
                )
              })}
            </div>
          </motion.div>

          {/* ── OAuth buttons ── */}
          <motion.div variants={up} custom={2} className="flex flex-col gap-2.5 mb-5">
            {([
              { provider: 'google' as Provider, icon: <GoogleIcon />, label: 'Google' },
              { provider: 'github' as Provider, icon: <GitHubIcon />, label: 'GitHub' },
            ]).map(({ provider, icon, label }) => {
              const loading  = busy === provider
              return (
                <motion.button
                  key={provider}
                  onClick={() => handleOAuth(provider)}
                  disabled={anyBusy}
                  whileHover={anyBusy ? {} : { scale: 1.015 }}
                  whileTap={anyBusy  ? {} : { scale: 0.985 }}
                  className="w-full flex items-center gap-3 px-5 h-11 rounded-xl bg-white border border-neutral-200 text-neutral-800 font-semibold text-sm shadow-xs hover:bg-neutral-50 hover:border-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="flex items-center justify-center w-5">
                    {loading
                      ? <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                      : icon}
                  </span>
                  <span className="flex-1 text-left">
                    {loading ? 'Connecting…' : `Continue with ${label}`}
                  </span>
                  {!loading && (
                    <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </motion.button>
              )
            })}
          </motion.div>

          {/* ── Divider ── */}
          <motion.div variants={up} custom={3} className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-neutral-200" />
            <span className="text-xs text-neutral-400 font-medium">
              {ar ? 'أو باستخدام البريد' : 'or continue with email'}
            </span>
            <div className="flex-1 h-px bg-neutral-200" />
          </motion.div>

          {/* ── Sign in / Sign up tabs ── */}
          <motion.div variants={up} custom={4} className="flex bg-neutral-100 rounded-xl p-1 mb-5">
            {(['signin', 'signup'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => handleModeSwitch(m)}
                className={cn(
                  'flex-1 py-2 rounded-lg text-sm font-semibold transition-colors',
                  mode === m
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700',
                )}
              >
                {m === 'signin'
                  ? (ar ? 'تسجيل الدخول' : 'Sign In')
                  : (ar ? 'إنشاء حساب'   : 'Create Account')}
              </button>
            ))}
          </motion.div>

          {/* ── Email form ── */}
          <motion.form variants={up} custom={5} onSubmit={handleEmail} className="flex flex-col gap-3" noValidate>

            <AnimatePresence>
              {mode === 'signup' && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Field
                    id="login-name"
                    label={ar ? 'الاسم الكامل' : 'Full name'}
                    icon={<User className="w-4 h-4" />}
                    value={name}
                    onChange={setName}
                    autoComplete="name"
                    disabled={anyBusy}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <Field
              id="login-email"
              label={ar ? 'البريد الإلكتروني' : 'Email address'}
              icon={<Mail className="w-4 h-4" />}
              type="email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              disabled={anyBusy}
            />

            <Field
              id="login-password"
              label={ar ? 'كلمة المرور' : 'Password'}
              icon={<Lock className="w-4 h-4" />}
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={setPassword}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              disabled={anyBusy}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors p-1"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            {mode === 'signin' && (
              <button
                type="button"
                onClick={() => dispatch({ type: 'GO', screen: 'forgotPassword' })}
                className={cn(
                  'text-xs font-semibold hover:underline self-end -mt-0.5 transition-colors',
                  isCo ? 'text-violet-600' : 'text-brand-600',
                )}
              >
                {ar ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
              </button>
            )}

            {/* ── Error / Success (aria-live) ── */}
            <div aria-live="polite" aria-atomic="true">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    role="alert"
                    className="flex items-start gap-2.5 text-danger-600 text-xs bg-danger-50 border border-danger-200 rounded-xl px-4 py-3"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{error}</span>
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    role="status"
                    className="text-success-700 text-xs bg-success-50 border border-success-100 rounded-xl px-4 py-3"
                  >
                    ✓ {success}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Submit ── */}
            <motion.button
              type="submit"
              disabled={anyBusy}
              whileHover={emailBusy ? {} : { scale: 1.015 }}
              whileTap={emailBusy   ? {} : { scale: 0.985 }}
              className={cn(
                'w-full flex items-center justify-center gap-2 h-12 rounded-xl',
                'text-white font-semibold text-sm shadow-sm',
                'disabled:opacity-60 disabled:cursor-not-allowed transition-all',
                ctaBg,
              )}
            >
              {emailBusy
                ? <><Loader2 className="w-4 h-4 animate-spin" />{ar ? 'جارٍ التحقق…' : 'Please wait…'}</>
                : mode === 'signin'
                  ? (ar ? 'تسجيل الدخول' : 'Sign In')
                  : (ar ? 'إنشاء حساب'   : 'Create Account')}
            </motion.button>
          </motion.form>

          {/* ── Footer ── */}
          <motion.p variants={up} custom={6} className="text-xs text-neutral-400 text-center mt-5 leading-relaxed px-2">
            {ar
              ? 'بالمتابعة، أنت توافق على شروط الاستخدام وسياسة الخصوصية'
              : 'By continuing you agree to our Terms of Service and Privacy Policy'}
          </motion.p>
        </div>
      </motion.div>
    </div>
  )
}
