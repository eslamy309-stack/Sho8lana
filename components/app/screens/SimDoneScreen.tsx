'use client'

import { motion } from 'framer-motion'
import { Trophy, Sparkles, Star, Home } from 'lucide-react'
import { useApp, callGemini } from '@/lib/store'
import { Button } from '@/components/ui/button'

const up = (delay = 0) => ({
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1], delay } },
})

export function SimDoneScreen() {
  const { state, dispatch } = useApp()
  const ar = state.lang === 'ar'
  const task = state.simTask
  const track = state.simTrack

  if (!task || !track) { dispatch({ type: 'GO', screen: 'sim' }); return null }

  const alreadyDone = state.simFeedback !== null
  const xpEarned = task.xp
  const badge = ar ? task.badgeAr : task.badge

  async function getFeedback() {
    if (!task) return
    dispatch({ type: 'SET_SIM_FEEDBACK_LOADING', loading: true })
    const answersText = Object.entries(state.simAnswers)
      .map(([i, ans]) => {
        const step = task!.steps[Number(i)]
        return `Q${Number(i)+1}: ${step ? (ar ? step.titleAr : step.title) : ''}\nA: ${Array.isArray(ans) ? ans.join(', ') : ans}`
      })
      .join('\n\n')

    const res = await callGemini(
      `A student completed a business simulation task: "${ar ? task.titleAr : task.title}". Here are their answers:\n\n${answersText}\n\nProvide short encouraging feedback (3-4 sentences) on their business thinking. ${ar ? 'Respond in Arabic.' : 'Respond in English.'}`,
      'You are a mentor giving encouraging, constructive feedback to Egyptian college students on business simulations. Be specific and positive.'
    )
    dispatch({ type: 'SET_SIM_FEEDBACK', feedback: res })
    dispatch({ type: 'SET_SIM_FEEDBACK_LOADING', loading: false })
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-12 bg-neutral-50">
      {/* Celebration animation */}
      <motion.div variants={up(0)} initial="hidden" animate="visible" className="mb-6 relative">
        <motion.div
          animate={{ rotate: [0, -8, 8, -4, 4, 0], scale: [1, 1.1, 1.1, 1.05, 1.05, 1] }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-24 h-24 rounded-3xl flex items-center justify-center text-white shadow-glow"
          style={{ background: `linear-gradient(135deg, ${track.color}, ${track.color}99)` }}
        >
          <Trophy className="w-12 h-12" />
        </motion.div>
        {/* Stars burst */}
        {[0, 60, 120, 180, 240, 300].map((deg, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ top: '50%', left: '50%' }}
            initial={{ opacity: 0, x: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0], x: Math.cos(deg * Math.PI / 180) * 52, y: Math.sin(deg * Math.PI / 180) * 52 }}
            transition={{ duration: 0.7, delay: 0.4 + i * 0.05 }}
          >
            <Star className="w-3 h-3 fill-warning-400 text-warning-400" />
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={up(0.15)} initial="hidden" animate="visible" className="text-center mb-8">
        <h2 className="text-2xl font-extrabold text-neutral-900 mb-1">
          {ar ? '🎉 أحسنت!' : '🎉 Well Done!'}
        </h2>
        <p className="text-sm text-neutral-500">{ar ? 'أكملت المهمة بنجاح' : 'You completed the task'}</p>
      </motion.div>

      {/* XP & Badge earned */}
      <motion.div variants={up(0.25)} initial="hidden" animate="visible" className="w-full flex gap-3 mb-6">
        <div className="flex-1 rounded-2xl p-4 text-center border-2"
             style={{ borderColor: `${track.color}30`, background: `${track.color}08` }}>
          <p className="text-2xl font-extrabold" style={{ color: track.color }}>+{xpEarned}</p>
          <p className="text-xs text-neutral-500 mt-0.5">XP {ar ? 'مكتسبة' : 'Earned'}</p>
        </div>
        <div className="flex-1 rounded-2xl p-4 text-center border-2"
             style={{ borderColor: `${track.color}30`, background: `${track.color}08` }}>
          <Trophy className="w-6 h-6 mx-auto mb-1" style={{ color: track.color }} />
          <p className="text-xs font-semibold text-neutral-700 leading-tight">{badge}</p>
        </div>
      </motion.div>

      {/* Total XP */}
      <motion.div variants={up(0.32)} initial="hidden" animate="visible"
        className="w-full rounded-2xl p-4 bg-white border border-neutral-200 text-center mb-4">
        <p className="text-xs text-neutral-400 mb-0.5">{ar ? 'مجموع نقاطك' : 'Your total XP'}</p>
        <p className="text-3xl font-extrabold text-neutral-900">{state.simXP}</p>
        <p className="text-xs text-neutral-400">{ar ? `${state.simBadges.length} شارة مكتسبة` : `${state.simBadges.length} badges earned`}</p>
      </motion.div>

      {/* AI Feedback */}
      <motion.div variants={up(0.4)} initial="hidden" animate="visible" className="w-full mb-4">
        <div className="rounded-2xl p-4 border border-violet-200 bg-violet-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-violet-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> {ar ? 'تقييم الذكاء الاصطناعي' : 'AI Feedback'}
            </span>
            {!state.simFeedback && !state.simFeedbackLoading && (
              <button onClick={getFeedback}
                className="text-xs font-semibold text-violet-600 bg-violet-600/10 px-3 py-1.5 rounded-lg hover:bg-violet-600/20 transition-colors">
                {ar ? 'احصل على تقييم' : 'Get Feedback'}
              </button>
            )}
            {state.simFeedbackLoading && (
              <div className="w-4 h-4 border-2 border-violet-600/30 border-t-violet-600 rounded-full animate-spin" />
            )}
          </div>
          {state.simFeedback && (
            <motion.p
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="text-sm text-violet-700 leading-relaxed">
              {state.simFeedback}
            </motion.p>
          )}
          {!state.simFeedback && !state.simFeedbackLoading && (
            <p className="text-xs text-violet-500">{ar ? 'احصل على تقييم شخصي لإجاباتك' : 'Get personalized feedback on your answers'}</p>
          )}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div variants={up(0.48)} initial="hidden" animate="visible" className="w-full flex flex-col gap-3">
        <Button className="w-full gap-2" onClick={() => dispatch({ type: 'GO', screen: 'simTasks' })}
          style={{ background: track.color }}>
          {ar ? 'المهمة التالية' : 'Next Task'}
        </Button>
        <Button variant="secondary" className="w-full gap-2"
          onClick={() => dispatch({ type: 'NAV_TO', tab: 'sim' })}>
          <Home className="w-4 h-4" /> {ar ? 'العودة للرئيسية' : 'Back to Hub'}
        </Button>
      </motion.div>
    </div>
  )
}
