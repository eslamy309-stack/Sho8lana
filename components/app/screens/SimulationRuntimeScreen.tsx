'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Star, Trophy, Zap, AlertTriangle, Loader2 } from 'lucide-react'
import { useApp } from '@/lib/store'
import { cn } from '@/lib/utils'
import type {
  PostMessage,
  SimProgressPayload,
  SimCompletedPayload,
  PostMessageType,
} from '@/lib/integration-types'

// ── Animation variants ────────────────────────────────────────────────────────

const headerVariants = {
  hidden:  { y: -64, opacity: 0 },
  visible: { y: 0,   opacity: 1, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
}

const overlayVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35 } },
  exit:    { opacity: 0, transition: { duration: 0.25 } },
}

const scoreBadgeVariants = {
  hidden:  { opacity: 0, scale: 0.7, y: -10 },
  visible: { opacity: 1, scale: 1,   y: 0,   transition: { type: 'spring', stiffness: 400, damping: 22 } },
  exit:    { opacity: 0, scale: 0.8, y: -10,  transition: { duration: 0.3 } },
}

const celebrationVariants = {
  hidden:  { opacity: 0, scale: 0.85, y: 20 },
  visible: { opacity: 1, scale: 1,    y: 0,   transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
}

// ── Elapsed timer hook ────────────────────────────────────────────────────────

function useElapsedTimer(running: boolean) {
  const [seconds, setSeconds] = useState(0)
  const startRef = useRef<number | null>(null)
  const rafRef   = useRef<number | null>(null)

  useEffect(() => {
    if (!running) return
    startRef.current = Date.now() - seconds * 1000

    const tick = () => {
      if (startRef.current !== null) {
        setSeconds(Math.floor((Date.now() - startRef.current) / 1000))
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

// ── Skeleton loader ───────────────────────────────────────────────────────────

function SimSkeleton() {
  return (
    <div className="flex-1 bg-neutral-900 flex flex-col items-center justify-center gap-4">
      <motion.div
        className="w-16 h-16 rounded-2xl bg-neutral-700"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="flex flex-col items-center gap-2">
        <motion.div
          className="h-3 w-48 rounded-full bg-neutral-700"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
        />
        <motion.div
          className="h-2.5 w-32 rounded-full bg-neutral-800"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        />
      </div>
      <motion.div
        className="flex items-center gap-2 text-neutral-500 text-sm mt-2"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        Connecting to simulation server…
      </motion.div>
    </div>
  )
}

// ── Completion overlay ────────────────────────────────────────────────────────

interface CompletionOverlayProps {
  payload: SimCompletedPayload
  xpEarned: number
}

function CompletionOverlay({ payload, xpEarned }: CompletionOverlayProps) {
  const { result } = payload
  return (
    <motion.div
      variants={overlayVariants}
      initial="hidden" animate="visible" exit="exit"
      className="absolute inset-0 z-40 flex items-center justify-center
                 bg-gradient-to-br from-neutral-950/95 via-violet-950/90 to-neutral-950/95"
    >
      <motion.div
        variants={celebrationVariants}
        initial="hidden" animate="visible"
        className="flex flex-col items-center gap-6 px-8 text-center max-w-sm"
      >
        {/* Trophy */}
        <motion.div
          animate={{ rotate: [0, -8, 8, -4, 4, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500
                     flex items-center justify-center shadow-2xl shadow-amber-500/30"
        >
          <Trophy className="w-10 h-10 text-white" />
        </motion.div>

        {/* Title */}
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-black text-white tracking-tight">
            {payload.celebrationMessage ?? 'Simulation Complete!'}
          </h2>
          <p className="text-neutral-400 text-sm">
            You scored <span className="text-white font-bold">{result.finalScore}</span> / 100
          </p>
        </div>

        {/* Score breakdown */}
        <div className="w-full grid grid-cols-2 gap-2.5">
          {(
            [
              { label: 'Accuracy',  value: result.scores.accuracy },
              { label: 'Speed',     value: result.scores.speed    },
              { label: 'Decisions', value: result.scores.decision  },
              { label: 'Overall',   value: result.scores.overall   },
            ] as { label: string; value: number }[]
          ).map(({ label, value }) => (
            <div key={label}
              className="rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-left">
              <p className="text-2xs text-neutral-400 uppercase tracking-wider font-semibold">{label}</p>
              <p className="text-xl font-black text-white">{value}<span className="text-xs text-neutral-500 font-normal">/100</span></p>
            </div>
          ))}
        </div>

        {/* XP badge */}
        <div className="flex items-center gap-2 px-5 py-2.5 rounded-full
                        bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/30">
          <Zap className="w-4 h-4 text-amber-300" />
          <span className="text-white font-bold text-sm">+{xpEarned} XP Earned</span>
        </div>

        {/* Returning indicator */}
        <p className="text-neutral-500 text-xs animate-pulse">Returning to dashboard…</p>
      </motion.div>
    </motion.div>
  )
}

// ── Failure overlay ───────────────────────────────────────────────────────────

function FailureOverlay() {
  return (
    <motion.div
      variants={overlayVariants}
      initial="hidden" animate="visible" exit="exit"
      className="absolute inset-0 z-40 flex items-center justify-center
                 bg-gradient-to-br from-neutral-950/95 via-red-950/80 to-neutral-950/95"
    >
      <motion.div
        variants={celebrationVariants}
        initial="hidden" animate="visible"
        className="flex flex-col items-center gap-5 px-8 text-center"
      >
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-500 to-rose-600
                        flex items-center justify-center shadow-2xl shadow-red-500/30">
          <AlertTriangle className="w-10 h-10 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white">Simulation Failed</h2>
          <p className="text-neutral-400 text-sm mt-1">Don't worry — every attempt makes you stronger.</p>
        </div>
        <p className="text-neutral-500 text-xs animate-pulse">Returning to dashboard…</p>
      </motion.div>
    </motion.div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function SimulationRuntimeScreen() {
  const { state, dispatch } = useApp()
  const ar = state.lang === 'ar'
  const { simTask: task, simTrack: track, simXP, user } = state

  // ── Local state ───────────────────────────────────────────────────────────
  const [loading,           setLoading]           = useState(true)
  const [progress,          setProgress]          = useState(0)
  const [phaseLabel,        setPhaseLabel]        = useState('')
  const [showScore,         setShowScore]         = useState(false)
  const [liveScore,         setLiveScore]         = useState<number | null>(null)
  const [completionPayload, setCompletionPayload] = useState<SimCompletedPayload | null>(null)
  const [failed,            setFailed]            = useState(false)
  const [timerRunning,      setTimerRunning]      = useState(false)
  const [xp,                setXp]                = useState(simXP)

  const iframeRef    = useRef<HTMLIFrameElement>(null)
  const scoreTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const elapsed      = useElapsedTimer(timerRunning)

  // ── Derived ───────────────────────────────────────────────────────────────
  const externalUrl    = (task as (typeof task & { externalUrl?: string }) | null)?.externalUrl ?? ''
  const hasUrl         = externalUrl.trim().length > 0
  const simulationTitle = ar ? (task?.titleAr ?? task?.title ?? 'Simulation') : (task?.title ?? 'Simulation')

  // ── Send user data to iframe on mount ─────────────────────────────────────
  const postUserData = useCallback(() => {
    if (!iframeRef.current?.contentWindow || !task) return
    const msg: PostMessage = {
      source:    'sho8lana_platform',
      type:      'platform:user_data',
      version:   '1.0',
      sessionId: task.id,
      timestamp: Date.now(),
      data: {
        name:  user.name,
        email: user.email,
      },
    }
    iframeRef.current.contentWindow.postMessage(msg, '*')
  }, [task, user.name, user.email])

  // ── postMessage listener ──────────────────────────────────────────────────
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // Accept from any origin (sandbox); in production, check event.origin
      const msg = event.data as PostMessage
      if (!msg || typeof msg !== 'object' || msg.source !== 'sho8lana_sim') return

      const type: PostMessageType = msg.type

      switch (type) {
        case 'sim:ready': {
          setLoading(false)
          setTimerRunning(true)
          postUserData()
          break
        }

        case 'sim:progress': {
          const payload = msg.data as SimProgressPayload
          setProgress(payload.percentComplete)
          setPhaseLabel(payload.phaseLabel ?? payload.currentPhase ?? '')
          break
        }

        case 'sim:score_update': {
          const payload = msg.data as { score: number }
          setLiveScore(payload.score)
          setShowScore(true)
          if (scoreTimeout.current) clearTimeout(scoreTimeout.current)
          scoreTimeout.current = setTimeout(() => setShowScore(false), 3000)
          break
        }

        case 'sim:completed': {
          const payload = msg.data as SimCompletedPayload
          setTimerRunning(false)
          setProgress(100)
          setCompletionPayload(payload)
          const earned = payload.result.xpEarned ?? task?.xp ?? 0
          setXp(prev => prev + earned)
          // Dispatch after 3s
          setTimeout(() => {
            dispatch({ type: 'COMPLETE_TASK' })
            dispatch({ type: 'GO_BACK' })
          }, 3000)
          break
        }

        case 'sim:failed': {
          setTimerRunning(false)
          setFailed(true)
          setTimeout(() => {
            dispatch({ type: 'GO_BACK' })
          }, 3000)
          break
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [dispatch, postUserData, task])

  // ── Clean up score timeout ────────────────────────────────────────────────
  useEffect(() => () => { if (scoreTimeout.current) clearTimeout(scoreTimeout.current) }, [])

  // ── Guard: no task ────────────────────────────────────────────────────────
  if (!task) {
    dispatch({ type: 'GO_BACK' })
    return null
  }

  const xpEarned = completionPayload?.result.xpEarned ?? task.xp

  return (
    <div className="fixed inset-0 flex flex-col bg-neutral-900 overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <motion.header
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-30 flex-shrink-0 bg-neutral-900 border-b border-neutral-800
                   px-4 pt-safe-top pb-3 flex flex-col gap-2"
      >
        <div className="flex items-center gap-3">
          {/* Back */}
          <button
            onClick={() => dispatch({ type: 'GO_BACK' })}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800
                       transition-colors flex-shrink-0"
            aria-label="Go back"
          >
            {ar
              ? <ChevronRight className="w-5 h-5" />
              : <ChevronLeft  className="w-5 h-5" />
            }
          </button>

          {/* Company logo placeholder */}
          <div
            className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center
                       text-white text-xs font-black"
            style={{ background: track?.color ?? '#7C3AED' }}
          >
            {(track?.label?.[0] ?? 'S').toUpperCase()}
          </div>

          {/* Title */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-tight">{simulationTitle}</p>
            {phaseLabel && (
              <p className="text-2xs text-neutral-400 truncate">{phaseLabel}</p>
            )}
          </div>

          {/* Timer */}
          <div className="font-mono text-sm text-neutral-300 tabular-nums flex-shrink-0">
            {elapsed}
          </div>

          {/* XP counter */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-violet-600/20 flex-shrink-0">
            <Zap className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-xs font-bold text-violet-300 tabular-nums">{xp}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: track?.color ?? '#7C3AED' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </motion.header>

      {/* ── Iframe area ────────────────────────────────────────────────────── */}
      <div className="relative flex-1 overflow-hidden">

        {/* Loading skeleton */}
        <AnimatePresence>
          {loading && (
            <motion.div
              key="skeleton"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.4 } }}
              className="absolute inset-0 z-20 flex flex-col"
            >
              <SimSkeleton />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Iframe */}
        {hasUrl ? (
          <iframe
            ref={iframeRef}
            src={externalUrl}
            className={cn(
              'w-full h-full border-0 bg-white transition-opacity duration-500',
              loading ? 'opacity-0' : 'opacity-100',
            )}
            sandbox="allow-scripts allow-forms allow-same-origin"
            referrerPolicy="no-referrer"
            title={simulationTitle}
            onLoad={() => {
              // Fallback: if sim doesn't send sim:ready, reveal after 1.5s
              setTimeout(() => {
                setLoading(prev => {
                  if (prev) { setTimerRunning(true); postUserData() }
                  return false
                })
              }, 1500)
            }}
          />
        ) : (
          /* No URL fallback skeleton */
          <SimSkeleton />
        )}

        {/* Floating score badge */}
        <AnimatePresence>
          {showScore && liveScore !== null && (
            <motion.div
              key="score-badge"
              variants={scoreBadgeVariants}
              initial="hidden" animate="visible" exit="exit"
              className="absolute top-4 right-4 z-30 flex items-center gap-2
                         px-4 py-2.5 rounded-2xl shadow-2xl
                         bg-gradient-to-r from-amber-500 to-orange-500"
            >
              <Star className="w-4 h-4 text-white fill-white" />
              <span className="text-white font-black text-base tabular-nums">{liveScore}</span>
              <span className="text-amber-100 text-xs font-semibold">/100</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Completion overlay */}
        <AnimatePresence>
          {completionPayload && (
            <CompletionOverlay
              key="completion"
              payload={completionPayload}
              xpEarned={xpEarned}
            />
          )}
        </AnimatePresence>

        {/* Failure overlay */}
        <AnimatePresence>
          {failed && !completionPayload && (
            <FailureOverlay key="failure" />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
