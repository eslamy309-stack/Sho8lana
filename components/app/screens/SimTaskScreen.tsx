'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Lightbulb, Youtube, Play, ExternalLink, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { useApp } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Image from 'next/image'

const up = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } } }

function TutorialCard({ tutorial, ar }: { tutorial: { title: string; titleAr: string; channel: string; duration: string; url: string; thumbnail: string }; ar: boolean }) {
  return (
    <a href={tutorial.url} target="_blank" rel="noopener noreferrer"
       className="flex gap-3 p-3 rounded-xl bg-white border border-neutral-100 hover:border-brand-200 hover:shadow-sm transition-all duration-150 group">
      <div className="relative flex-shrink-0 w-20 h-[45px] rounded-lg overflow-hidden bg-neutral-100">
        <Image src={tutorial.thumbnail} alt={tutorial.title} fill className="object-cover" unoptimized />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <Play className="w-4 h-4 text-white fill-white" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-neutral-800 leading-snug line-clamp-2">
          {ar ? tutorial.titleAr : tutorial.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-2xs text-neutral-400">{tutorial.channel}</span>
          <span className="text-2xs text-neutral-300">·</span>
          <span className="text-2xs text-neutral-400">{tutorial.duration}</span>
        </div>
      </div>
      <ExternalLink className="w-3 h-3 text-neutral-300 group-hover:text-brand-500 flex-shrink-0 mt-0.5 transition-colors" />
    </a>
  )
}

export function SimTaskScreen() {
  const { state, dispatch } = useApp()
  const ar = state.lang === 'ar'
  const { simTrack: track, simTask: task, simStep: stepIdx } = state

  if (!track || !task) { dispatch({ type: 'GO', screen: 'sim' }); return null }

  const step = task.steps[stepIdx]
  const totalSteps = task.steps.length
  const isLast = stepIdx === totalSteps - 1
  const currentAnswer = state.simAnswers[stepIdx]
  const currentMulti = state.simMulti[stepIdx] || []
  const hasAnswer = step.type === 'multi' ? currentMulti.length > 0 : !!currentAnswer

  function handleNext() {
    if (isLast) {
      dispatch({ type: 'COMPLETE_TASK' })
      dispatch({ type: 'GO', screen: 'simDone' })
    } else {
      dispatch({ type: 'NEXT_STEP' })
    }
  }

  return (
    <div className="min-h-dvh bg-neutral-50 pb-28">
      {/* Topbar */}
      <div className="sticky top-0 z-20 bg-white border-b border-neutral-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => dispatch({ type: 'GO_BACK' })} className="p-1 text-neutral-500">
          {ar ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
        <span className="text-sm font-semibold text-neutral-900 flex-1 truncate">{ar ? task.titleAr : task.title}</span>
        <span className="text-xs font-semibold text-neutral-500">{stepIdx + 1}/{totalSteps}</span>
      </div>

      {/* Step progress bar */}
      <div className="flex gap-1 px-4 py-2 bg-white border-b border-neutral-50">
        {task.steps.map((_, i) => (
          <motion.div key={i}
            className="flex-1 h-1 rounded-full"
            style={{ background: i < stepIdx ? track.color : i === stepIdx ? track.color : '#e5e7eb' }}
            animate={{ opacity: i <= stepIdx ? 1 : 0.4 }}
          />
        ))}
      </div>

      <motion.div key={stepIdx} initial="hidden" animate="visible" variants={up} className="px-4 py-4 flex flex-col gap-4">
        {/* Scenario card (first step only) */}
        {stepIdx === 0 && (
          <div className="rounded-2xl p-4 border border-neutral-200 bg-white">
            <p className="text-2xs font-bold uppercase tracking-widest mb-1.5" style={{ color: track.color }}>
              {ar ? 'السيناريو' : 'Scenario'}
            </p>
            <p className="text-sm text-neutral-700 leading-relaxed">{ar ? task.scenarioAr : task.scenario}</p>
          </div>
        )}

        {/* Step question */}
        <div className="rounded-2xl p-4 border-2 bg-white" style={{ borderColor: `${track.color}30` }}>
          <p className="text-base font-bold text-neutral-900">{ar ? step.titleAr : step.title}</p>

          {/* Text input */}
          {step.type === 'text' && (
            <textarea
              className="mt-3 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 resize-none transition-all"
              rows={4}
              placeholder={ar ? step.placeholderAr : step.placeholder}
              value={(currentAnswer as string) || ''}
              onChange={e => dispatch({ type: 'SET_ANSWER', step: stepIdx, answer: e.target.value })}
            />
          )}

          {/* Multi-select */}
          {step.type === 'multi' && step.options && (
            <div className="mt-3 flex flex-col gap-2">
              {step.options.map(opt => {
                const selected = currentMulti.includes(opt)
                return (
                  <button
                    key={opt}
                    onClick={() => dispatch({ type: 'TOGGLE_MULTI', step: stepIdx, option: opt })}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all duration-150',
                      selected ? 'border-opacity-100 text-white' : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                    )}
                    style={selected ? { borderColor: track.color, background: track.color } : {}}
                  >
                    <div className={cn('w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all',
                      selected ? 'border-white bg-white/20' : 'border-neutral-300'
                    )}>
                      {selected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm font-medium">{opt}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Hint toggle */}
        <div className="rounded-xl overflow-hidden border border-warning-200">
          <button
            onClick={() => dispatch({ type: 'TOGGLE_HINT' })}
            className="w-full flex items-center gap-2 px-4 py-3 bg-warning-50 text-warning-700 text-sm font-semibold"
          >
            <Lightbulb className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 text-left">{ar ? 'تلميح' : 'Hint'}</span>
            {state.showHint ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <AnimatePresence>
            {state.showHint && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <p className="px-4 py-3 text-sm text-warning-700 bg-warning-50/50 border-t border-warning-100 leading-relaxed">
                  {ar ? step.hintAr : step.hint}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* YouTube Tutorials */}
        {step.tutorials && step.tutorials.length > 0 && (
          <div className="rounded-xl overflow-hidden border border-neutral-200">
            <button
              onClick={() => dispatch({ type: 'TOGGLE_TUTORIAL' })}
              className="w-full flex items-center gap-2 px-4 py-3 bg-white text-neutral-700 text-sm font-semibold border-b border-neutral-100"
            >
              <div className="w-5 h-5 rounded bg-red-500 flex items-center justify-center flex-shrink-0">
                <Youtube className="w-3 h-3 text-white fill-white" />
              </div>
              <span className="flex-1 text-left">{ar ? 'دروس تعليمية' : 'Learning Tutorials'}</span>
              <span className="text-2xs text-neutral-400 font-normal">{step.tutorials.length}</span>
              {state.showTutorial ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
            </button>
            <AnimatePresence>
              {state.showTutorial && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 bg-neutral-50 flex flex-col gap-2.5">
                    <p className="text-2xs text-neutral-400 font-medium px-1">
                      {ar ? 'تعلّم قبل أن تجيب 👇' : 'Learn before you answer 👇'}
                    </p>
                    {step.tutorials.map((tut, ti) => (
                      <TutorialCard key={ti} tutorial={tut} ar={ar} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app px-4 py-4 bg-white border-t border-neutral-100 pb-safe">
        <Button
          className="w-full gap-2"
          disabled={!hasAnswer}
          onClick={handleNext}
          style={hasAnswer ? { background: track.color } : {}}
        >
          {isLast ? (ar ? 'إنهاء المهمة' : 'Complete Task') : (ar ? 'التالي' : 'Next')}
          {ar ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  )
}
