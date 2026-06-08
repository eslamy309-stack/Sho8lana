'use client'

import { motion } from 'framer-motion'
import { Home, Trophy, PlayCircle, MessageCircle, User } from 'lucide-react'
import { useApp } from '@/lib/store'
import { cn } from '@/lib/utils'
import type { Screen } from '@/lib/types'

const TABS: { id: Screen; icon: React.ElementType; labelEn: string; labelAr: string }[] = [
  { id: 'home',        icon: Home,          labelEn: 'Home',    labelAr: 'الرئيسية' },
  { id: 'leaderboard', icon: Trophy,        labelEn: 'Ranks',   labelAr: 'الترتيب'  },
  { id: 'sim',         icon: PlayCircle,    labelEn: 'Practice',labelAr: 'تدريب'    },
  { id: 'ai',          icon: MessageCircle, labelEn: 'AI',      labelAr: 'ذكاء'     },
  { id: 'profile',     icon: User,          labelEn: 'Profile', labelAr: 'الملف'    },
]

const pillSpring = { type: 'spring', stiffness: 400, damping: 32 }

export function BottomNav() {
  const { state, dispatch } = useApp()
  const ar = state.lang === 'ar'
  const cur = state.currentTab

  return (
    <nav className="flex-shrink-0 bg-white border-t border-neutral-100 pb-safe">
      <div className="flex">
        {TABS.map(tab => {
          const active = cur === tab.id
          const Icon = tab.icon
          const badge = tab.id === 'sim' ? state.simBadges.length : 0

          return (
            <button
              key={tab.id}
              onClick={() => dispatch({ type: 'NAV_TO', tab: tab.id })}
              aria-label={ar ? tab.labelAr : tab.labelEn}
              aria-current={active ? 'page' : undefined}
              className="relative flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] active:opacity-70 transition-opacity duration-100"
            >
              {/* floating pill behind active icon — spring physics */}
              {active && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-x-2 top-1.5 h-8 rounded-xl bg-brand-50"
                  transition={pillSpring}
                />
              )}

              {/* icon + badge */}
              <div className="relative z-10">
                <Icon
                  className={cn(
                    'w-5 h-5 transition-colors duration-200',
                    active ? 'text-brand-600' : 'text-neutral-400'
                  )}
                  strokeWidth={active ? 2.5 : 1.8}
                />
                {badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                    className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-danger-500 flex items-center justify-center text-white font-bold z-20"
                    style={{ fontSize: '8px' }}
                  >
                    {badge}
                  </motion.span>
                )}
              </div>

              {/* label */}
              <span
                className={cn(
                  'relative z-10 font-semibold transition-colors duration-200 text-2xs',
                  active ? 'text-brand-600' : 'text-neutral-400'
                )}
              >
                {ar ? tab.labelAr : tab.labelEn}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
