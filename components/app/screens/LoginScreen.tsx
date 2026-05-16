'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, LogIn, Zap, AlertCircle, Loader2 } from 'lucide-react'
import { useApp } from '@/lib/store'
import { sbSignIn } from '@/lib/supabase'
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

export function LoginScreen() {
  const { state, dispatch } = useApp()
  const ar = state.lang === 'ar'

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError(ar ? 'يرجى ملء جميع الحقول' : 'Please fill in all fields')
      return
    }
    setLoading(true)
    setError('')
    try {
      await sbSignIn(email.trim(), password)
      // onAuthStateChange in store will handle profile load + navigation
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      if (msg.includes('Invalid login')) {
        setError(ar ? 'بريد إلكتروني أو كلمة مرور غير صحيحة' : 'Incorrect email or password')
      } else {
        setError(ar ? 'حدث خطأ. حاول مرة أخرى.' : 'Something went wrong. Try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col justify-center px-7 py-10
                    bg-gradient-to-br from-neutral-950 via-[#0D4F4A] to-brand-900 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-1/4 right-[-30px] w-44 h-44 rounded-full bg-brand-600/10 blur-3xl pointer-events-none" />

      <motion.div
        className="relative z-10 flex flex-col gap-5"
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
      >
        {/* Logo */}
        <motion.div variants={up} custom={0} className="flex items-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-2xl bg-brand-600 flex items-center justify-center">
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
            {ar ? 'سجّل دخولك للمتابعة' : 'Sign in to continue'}
          </p>
        </motion.div>

        {/* Form */}
        <motion.div variants={up} custom={2} className="flex flex-col gap-3">
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
                className={cn('pl-9 bg-white/5 border-white/10 text-white placeholder:text-neutral-500', error && 'border-red-500')}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
              {ar ? 'كلمة المرور' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                className={cn('pl-9 bg-white/5 border-white/10 text-white placeholder:text-neutral-500', error && 'border-red-500')}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {error}
            </div>
          )}
        </motion.div>

        {/* Sign in button */}
        <motion.div variants={up} custom={3}>
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

        {/* Divider + back to signup */}
        <motion.div variants={up} custom={4} className="flex flex-col gap-3 text-center">
          <p className="text-sm text-neutral-400">
            {ar ? 'ليس لديك حساب؟ ' : "Don't have an account? "}
            <button
              onClick={() => dispatch({ type: 'GO', screen: 'onboard' })}
              className="text-brand-400 font-semibold hover:text-brand-300 transition-colors"
            >
              {ar ? 'أنشئ حسابك' : 'Sign up free'}
            </button>
          </p>
          <button
            onClick={() => dispatch({ type: 'GO', screen: 'welcome' })}
            className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            {ar ? '← العودة' : '← Back'}
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}
