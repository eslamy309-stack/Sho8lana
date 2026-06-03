'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Unhandled error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mb-6">
        <span className="text-red-500 text-2xl">!</span>
      </div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-2">Something went wrong</h1>
      <p className="text-sm text-neutral-400 mb-8 max-w-xs">
        An unexpected error occurred. Our team has been notified.
        {error.digest && (
          <span className="block mt-1 text-xs font-mono text-neutral-300">
            ref: {error.digest}
          </span>
        )}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-6 py-3 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors"
        >
          Try again
        </button>
        <a
          href="/"
          className="px-6 py-3 bg-white border border-neutral-200 text-sm font-semibold text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors"
        >
          Go home
        </a>
      </div>
    </div>
  )
}
