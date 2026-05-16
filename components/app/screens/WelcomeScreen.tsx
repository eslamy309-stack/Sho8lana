'use client'

import { motion } from 'framer-motion'
import { Rocket, ArrowRight, Globe, Zap } from 'lucide-react'
import { useApp } from '@/lib/store'
import { Button } from '@/components/ui/button'

const t = {
  en: { tagline: 'Your first career step starts here.', sub: 'Find internships across Egypt. Practice real business tasks. Apply with one tap.', start: 'Get started', browse: 'Browse first', stats: [{ v: '214K+', l: 'Graduates/yr' }, { v: '500+', l: 'Companies' }, { v: '1-Tap', l: 'Apply' }] },
  ar: { tagline: 'خطوتك المهنية الأولى تبدأ هنا.', sub: 'اعثر على تدريبات في مصر. تدرّب على مهام حقيقية. قدّم بضغطة واحدة.', start: 'ابدأ الآن', browse: 'تصفّح أولاً', stats: [{ v: '214K+', l: 'خريج/سنة' }, { v: '500+', l: 'شركة' }, { v: '1-Tap', l: 'تقديم' }] },
}

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }
const up = {
  hidden:  { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 } }),
}

export function WelcomeScreen() {
  const { state, dispatch } = useApp()
  const lang = state.lang ?? 'en'
  const tx = t[lang]

  return (
    <div className="min-h-dvh flex flex-col justify-center px-7 py-10
                    bg-gradient-to-br from-neutral-950 via-[#0D4F4A] to-brand-900 relative overflow-hidden">
      {/* Glow blob */}
      <div className="absolute top-1/4 right-[-30px] w-44 h-44 rounded-full bg-brand-600/10 blur-3xl pointer-events-none" />

      <motion.div variants={stagger} initial="hidden" animate="visible" className="relative z-10 flex flex-col gap-5">
        {/* Logo row */}
        <motion.div variants={up} custom={0} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif text-2xl text-white">Sho8lana</span>
          </div>
          <button
            onClick={() => dispatch({ type: 'GO', screen: 'lang' })}
            className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 transition-colors"
          >
            <Globe className="w-4 h-4" />
          </button>
        </motion.div>

        <motion.h1 variants={up} custom={1}
          className={`text-white leading-tight ${lang === 'ar' ? 'font-arabic text-3xl' : 'font-serif text-4xl'}`}>
          {tx.tagline}
        </motion.h1>

        <motion.p variants={up} custom={2} className="text-neutral-300/80 text-sm leading-relaxed">
          {tx.sub}
        </motion.p>

        <motion.div variants={up} custom={3} className="flex flex-col gap-3">
          <Button variant="white" size="lg" onClick={() => dispatch({ type: 'GO', screen: 'onboard' })} className="gap-2">
            <Rocket className="w-4 h-4" /> {tx.start}
          </Button>
          <Button variant="ghost-dark" size="lg" onClick={() => dispatch({ type: 'GO', screen: 'home' })} className="gap-2">
            {tx.browse} <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>

        <motion.div variants={stagger} className="flex gap-8 pt-2">
          {tx.stats.map(s => (
            <motion.div key={s.l} variants={up} className="text-center">
              <p className="text-xl font-bold text-white">{s.v}</p>
              <p className="text-xs text-neutral-400 mt-0.5">{s.l}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
