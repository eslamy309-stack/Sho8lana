'use client'

import { Suspense, lazy } from 'react'
import { cn } from '@/lib/utils'

const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
  scene: string
  className?: string
}

function SceneFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-brand-600/30 border-t-brand-600 animate-spin" />
        <p className="text-xs text-neutral-500 font-sans">Loading 3D scene…</p>
      </div>
    </div>
  )
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <Suspense fallback={<SceneFallback />}>
      <Spline scene={scene} className={cn('w-full h-full', className)} />
    </Suspense>
  )
}
