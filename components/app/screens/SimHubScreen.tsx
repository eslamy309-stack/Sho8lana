'use client'

import { motion } from 'framer-motion'
import { ChevronRight, Flame, Trophy, Megaphone, CreditCard, Package, Users } from 'lucide-react'
import { useApp } from '@/lib/store'
import { SIM_TRACKS } from '@/lib/data'
import { cn } from '@/lib/utils'

const ICONS: Record<string, React.ElementType> = {
  megaphone: Megaphone, 'credit-card': CreditCard, package: Package, users: Users,
}

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }
const up = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } }

export function SimHubScreen() {
  const { state, dispatch } = useApp()
  const ar = state.lang === 'ar'

  return (
    <div className="min-h-dvh bg-neutral-50">
      <div className="sticky top-0 z-20 bg-white border-b border-neutral-100 px-4 py-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-neutral-900">{ar ? 'مركز التدريب' : 'Practice Hub'}</h2>
        {state.simXP > 0 && (
          <span className="text-xs font-semibold text-warning-700 bg-warning-50 px-2.5 py-1 rounded-full flex items-center gap-1">
            <Flame className="w-3 h-3" /> {state.simXP} XP
          </span>
        )}
      </div>

      <motion.div variants={stagger} initial="hidden" animate="visible" className="px-4 py-4 flex flex-col gap-4">
        {/* XP progress card */}
        {state.simXP > 0 && (
          <motion.div variants={up}
            className="rounded-2xl p-5 text-white"
            style={{ background: 'linear-gradient(135deg, #0F172A, #0F766E)' }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold">{ar ? 'تقدمك' : 'Your Progress'}</span>
              <span className="text-sm font-bold">{state.simXP} XP</span>
            </div>
            <div className="flex gap-6">
              <div><p className="text-2xl font-extrabold">{state.simDone.length}</p><p className="text-xs text-white/50">{ar ? 'مكتملة' : 'Completed'}</p></div>
              <div><p className="text-2xl font-extrabold">{state.simBadges.length}</p><p className="text-xs text-white/50">{ar ? 'شارات' : 'Badges'}</p></div>
            </div>
            {state.simBadges.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-4">
                {state.simBadges.map(b => (
                  <span key={b.id} className="text-2xs font-semibold bg-white/15 px-2 py-1 rounded-lg flex items-center gap-1">
                    <Trophy className="w-3 h-3" /> {b.label}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Intro */}
        <motion.div variants={up}
          className="rounded-2xl p-5 border border-violet-200 bg-violet-50">
          <h3 className="text-base font-bold text-violet-900 mb-1">{ar ? 'مركز التدريب' : 'Practice Hub'}</h3>
          <p className="text-sm text-violet-700 leading-relaxed">
            {ar ? 'تدرّب على مهام أعمال حقيقية. احصل على تقييم ذكي. اكسب شارات.' : 'Simulate real business tasks. Get AI feedback. Earn XP and badges.'}
          </p>
        </motion.div>

        <h3 className="text-sm font-bold text-neutral-700">{ar ? 'اختر مساراً' : 'Choose a track'}</h3>

        {SIM_TRACKS.map((track, i) => {
          const done = track.tasks.filter(t => state.simDone.includes(t.id)).length
          const Icon = ICONS[track.icon] || Megaphone
          return (
            <motion.button
              key={track.id}
              variants={up}
              custom={i}
              whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.09)' }}
              whileTap={{ scale: 0.99 }}
              onClick={() => { dispatch({ type: 'OPEN_TRACK', track }); dispatch({ type: 'GO', screen: 'simTasks' }) }}
              className="w-full rounded-2xl p-4 border-2 text-left transition-all duration-200"
              style={{ background: `linear-gradient(145deg, ${track.color}06, ${track.color}02)`, borderColor: `${track.color}22` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                     style={{ background: `${track.color}18`, color: track.color }}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-neutral-900">{ar ? track.labelAr : track.label}</h4>
                    {done > 0 && (
                      <span className="text-2xs font-semibold px-1.5 py-0.5 rounded-md"
                            style={{ background: `${track.color}15`, color: track.color }}>
                        {done}/{track.tasks.length}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">{ar ? track.descriptionAr : track.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: track.color }} />
              </div>
              {done > 0 && (
                <div className="mt-3 h-1 rounded-full bg-neutral-100 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: track.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(done / track.tasks.length) * 100}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
              )}
            </motion.button>
          )
        })}
      </motion.div>
    </div>
  )
}
