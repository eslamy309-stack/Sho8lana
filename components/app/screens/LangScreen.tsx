'use client'

import { motion } from 'framer-motion'
import { Zap, Globe } from 'lucide-react'
import { useApp } from '@/lib/store'
import { Button } from '@/components/ui/button'

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1 } },
}
const up = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
}

export function LangScreen() {
  const { dispatch } = useApp()
  function choose(lang: 'en' | 'ar') {
    dispatch({ type: 'SET_LANG', lang })
    dispatch({ type: 'GO', screen: 'welcome' })
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-8 py-10
                    bg-gradient-to-br from-neutral-950 via-neutral-900 to-brand-950">
      <motion.div
        className="w-full max-w-[300px] flex flex-col items-center gap-6"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={up}
          className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center shadow-glow">
          <Zap className="w-7 h-7 text-white" />
        </motion.div>

        <motion.div variants={up} className="text-center">
          <h1 className="font-serif text-4xl text-white mb-1">Sho8lana</h1>
          <p className="font-arabic text-xl text-neutral-400">شغلانة</p>
        </motion.div>

        <motion.div variants={up} className="text-center">
          <p className="text-base font-semibold text-white mb-1">Choose your language</p>
          <p className="font-arabic text-sm text-neutral-400">اختر لغتك</p>
        </motion.div>

        <motion.div variants={up} className="flex flex-col gap-3 w-full">
          <Button variant="white" size="lg" onClick={() => choose('en')} className="gap-2">
            <Globe className="w-4 h-4" /> English
          </Button>
          <Button variant="ghost-dark" size="lg" onClick={() => choose('ar')}
            className="font-arabic gap-2">
            <Globe className="w-4 h-4" /> العربية
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
