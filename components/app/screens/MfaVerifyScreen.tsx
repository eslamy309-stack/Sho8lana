'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, AlertCircle, Loader2, KeyRound } from 'lucide-react'
import { useApp } from '@/lib/store'
import { sbMfaListFactors, sbMfaChallenge, sbMfaVerify } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const up = {
  hidden:  { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: i * 0.07 },
  }),
}

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
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
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
          onFocus={e => e.target.select()}
          className={cn(
            'w-11 h-13 text-center text-xl font-mono font-semibold rounded-xl border-2 bg-white',
            'focus:outline-none focus:border-neutral-900 transition-colors',
            value[i] ? 'border-neutral-900' : 'border-neutral-200',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
        />
      ))}
    </div>
  )
}

export function MfaVerifyScreen() {
  const { state, dispatch } = useApp()
  const [code, setCode]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [factorId, setFactorId] = useState<string | null>(state.mfaFactorId ?? null)
  const [challengeId, setChallengeId] = useState<string | null>(null)
  const [initing, setIniting]   = useState(true)

  useEffect(() => {
    async function init() {
      try {
        // Resolve factorId if not already in state
        let fid = factorId
        if (!fid) {
          const factors = await sbMfaListFactors()
          fid = factors[0]?.id ?? null
          setFactorId(fid)
        }
        if (fid) {
          const ch = await sbMfaChallenge(fid)
          setChallengeId(ch.id)
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to start verification')
      } finally {
        setIniting(false)
      }
    }
    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleVerify() {
    if (code.length < 6 || !factorId || !challengeId) return
    setLoading(true)
    setError('')
    try {
      await sbMfaVerify(factorId, challengeId, code)
      // MFA verified — proceed to app
      dispatch({ type: 'GO', screen: state.user?.onboardingCompleted ? 'home' : 'onboard' })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Invalid code. Please try again.')
      setCode('')
      // Refresh challenge after failed attempt
      if (factorId) {
        sbMfaChallenge(factorId).then(ch => setChallengeId(ch.id)).catch(() => null)
      }
    } finally {
      setLoading(false)
    }
  }

  if (initing) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-neutral-50">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">

        {/* Icon */}
        <motion.div
          variants={up} initial="hidden" animate="visible" custom={0}
          className="w-16 h-16 rounded-2xl bg-neutral-900 flex items-center justify-center mb-6"
        >
          <ShieldCheck className="w-8 h-8 text-white" />
        </motion.div>

        {/* Heading */}
        <motion.h1
          variants={up} initial="hidden" animate="visible" custom={1}
          className="text-2xl font-bold text-neutral-900 text-center mb-2"
        >
          Two-Factor Authentication
        </motion.h1>
        <motion.p
          variants={up} initial="hidden" animate="visible" custom={2}
          className="text-neutral-500 text-center text-sm mb-8 max-w-xs"
        >
          Open your authenticator app and enter the 6-digit code to continue.
        </motion.p>

        {/* OTP input */}
        <motion.div
          variants={up} initial="hidden" animate="visible" custom={3}
          className="w-full max-w-xs mb-6"
        >
          <OtpInput value={code} onChange={setCode} disabled={loading} />
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 text-red-600 text-sm mb-4 bg-red-50 rounded-xl px-4 py-3 max-w-xs w-full"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Verify button */}
        <motion.div
          variants={up} initial="hidden" animate="visible" custom={4}
          className="w-full max-w-xs"
        >
          <Button
            className="w-full h-12 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold"
            onClick={handleVerify}
            disabled={code.length < 6 || loading || !challengeId}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
          </Button>
        </motion.div>

        {/* Recovery code link */}
        <motion.button
          variants={up} initial="hidden" animate="visible" custom={5}
          onClick={() => dispatch({ type: 'GO', screen: 'login' })}
          className="mt-6 flex items-center gap-1.5 text-neutral-400 hover:text-neutral-600 text-xs transition-colors"
        >
          <KeyRound className="w-3.5 h-3.5" />
          Use a recovery code instead
        </motion.button>

      </div>
    </div>
  )
}
