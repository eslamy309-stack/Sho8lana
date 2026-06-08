'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    // Check for error params from Supabase/OAuth provider
    const params = new URLSearchParams(window.location.search)
    const hash   = new URLSearchParams(window.location.hash.slice(1))

    const oauthError = params.get('error') || hash.get('error')
    if (oauthError) {
      setErrorMsg(params.get('error_description') || hash.get('error_description') || oauthError)
      setStatus('error')
      setTimeout(() => router.replace('/'), 3000)
      return
    }

    // Supabase client automatically exchanges the ?code= for a session.
    // We listen for the result via onAuthStateChange.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Code exchanged successfully — open the app overlay
        router.replace('/?auth=1')
      }
    })

    // Also try exchanging manually in case the listener fires before we attach
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace('/?auth=1')
    })

    // Timeout fallback: if nothing happens in 8s, go back home
    const timeout = setTimeout(() => {
      router.replace('/?auth=1')
    }, 8000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [router])

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-neutral-950 px-6">
      {status === 'loading' ? (
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-white/60" />
          </div>
          <div>
            <p className="text-white font-semibold text-lg">Signing you in…</p>
            <p className="text-neutral-500 text-sm mt-1">Verifying your account, just a moment.</p>
          </div>
          <Loader2 className="w-5 h-5 animate-spin text-neutral-500" />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-red-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-lg">Sign-in failed</p>
            <p className="text-neutral-400 text-sm mt-1 max-w-xs">{errorMsg || 'Something went wrong. Redirecting you back…'}</p>
          </div>
        </div>
      )}
    </div>
  )
}
