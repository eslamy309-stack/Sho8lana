'use client'

import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Clock, Trophy, CheckCircle2, Lock } from 'lucide-react'
import { useApp } from '@/lib/store'

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }
const up = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } } }

export function SimTasksScreen() {
  const { state, dispatch } = useApp()
  const ar = state.lang === 'ar'
  const track = state.simTrack

  if (!track) { dispatch({ type: 'GO', screen: 'sim' }); return null }

  const completedCount = track.tasks.filter(t => state.simDone.includes(t.id)).length

  return (
    <div className="min-h-dvh bg-neutral-50">
      {/* Topbar */}
      <div className="sticky top-0 z-20 bg-white border-b border-neutral-100 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => dispatch({ type: 'GO_BACK' })}
          aria-label={ar ? 'رجوع' : 'Go back'}
          className="w-11 h-11 flex items-center justify-center rounded-xl text-neutral-500 hover:bg-neutral-100 transition-colors -ml-1"
        >
          {ar ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
        <span className="text-sm font-semibold text-neutral-900 flex-1">{ar ? track.labelAr : track.label}</span>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: `${track.color}15`, color: track.color }}>
          {completedCount}/{track.tasks.length}
        </span>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="visible" className="px-4 py-4 flex flex-col gap-4">
        {/* Track header card */}
        <motion.div variants={up}
          className="rounded-2xl p-5 text-white"
          style={{ background: `linear-gradient(135deg, ${track.color}dd, ${track.color}99)` }}>
          <p className="text-sm font-medium text-white/80">{ar ? track.descriptionAr : track.description}</p>
          {completedCount > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-white/70 mb-1.5">
                <span>{ar ? 'التقدم' : 'Progress'}</span>
                <span>{Math.round((completedCount / track.tasks.length) * 100)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-white"
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedCount / track.tasks.length) * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                />
              </div>
            </div>
          )}
        </motion.div>

        <h3 className="text-sm font-bold text-neutral-700">{ar ? 'المهام' : 'Tasks'}</h3>

        {track.tasks.map((task, i) => {
          const done = state.simDone.includes(task.id)
          const locked = i > 0 && !state.simDone.includes(track.tasks[i - 1].id)

          return (
            <motion.button
              key={task.id}
              variants={up}
              custom={i}
              whileHover={!locked ? { y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.09)' } : {}}
              whileTap={!locked ? { scale: 0.99 } : {}}
              disabled={locked}
              onClick={() => {
                if (!locked) {
                  dispatch({ type: 'START_TASK', track, task })
                  dispatch({ type: 'GO', screen: 'simTask' })
                }
              }}
              className="w-full rounded-2xl p-4 border-2 text-left transition-all duration-200 disabled:opacity-50"
              style={{
                background: done
                  ? `linear-gradient(145deg, ${track.color}10, ${track.color}05)`
                  : locked ? '#f9fafb' : 'white',
                borderColor: done ? `${track.color}40` : locked ? '#e5e7eb' : '#e5e7eb',
              }}
            >
              <div className="flex items-start gap-3">
                {/* Status icon */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                     style={{ background: done ? `${track.color}18` : locked ? '#f3f4f6' : `${track.color}10` }}>
                  {done
                    ? <CheckCircle2 className="w-5 h-5" style={{ color: track.color }} />
                    : locked
                      ? <Lock className="w-4 h-4 text-neutral-300" />
                      : <span className="text-sm font-extrabold" style={{ color: track.color }}>{i + 1}</span>
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-neutral-900">{ar ? task.titleAr : task.title}</p>
                  <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">{ar ? task.scenarioAr : task.scenario}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="inline-flex items-center gap-1 text-2xs text-neutral-400">
                      <Clock className="w-3 h-3" /> {task.time}
                    </span>
                    <span className="inline-flex items-center gap-1 text-2xs font-semibold"
                          style={{ color: track.color }}>
                      <Trophy className="w-3 h-3" /> +{task.xp} XP
                    </span>
                    {done && (
                      <span className="text-2xs font-semibold text-success-600 bg-success-50 px-1.5 py-0.5 rounded-md">
                        {ar ? 'مكتملة ✓' : 'Done ✓'}
                      </span>
                    )}
                  </div>
                </div>

                {!locked && (
                  <div className="flex-shrink-0 mt-1">
                    {ar ? <ChevronLeft className="w-4 h-4 text-neutral-300" /> : <ChevronRight className="w-4 h-4 text-neutral-300" />}
                  </div>
                )}
              </div>
            </motion.button>
          )
        })}
      </motion.div>
    </div>
  )
}
