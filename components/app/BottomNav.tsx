'use client'

import { motion } from 'framer-motion'
import { Home, FileText, PlayCircle, MessageCircle, User } from 'lucide-react'
import { useApp } from '@/lib/store'
import { cn } from '@/lib/utils'
import type { Screen } from '@/lib/types'

const TABS: { id: Screen; icon: React.ElementType; labelEn: string; labelAr: string }[] = [
  { id: 'home',    icon: Home,          labelEn: 'Home',    labelAr: 'الرئيسية' },
  { id: 'tracker', icon: FileText,       labelEn: 'Applied', labelAr: 'الطلبات'  },
  { id: 'sim',     icon: PlayCircle,     labelEn: 'Practice',labelAr: 'تدريب'    },
  { id: 'ai',      icon: MessageCircle,  labelEn: 'AI',      labelAr: 'ذكاء'     },
  { id: 'profile', icon: User,           labelEn: 'Profile', labelAr: 'الملف'    },
]

export function BottomNav() {
  const { state, dispatch } = useApp()
  const ar = state.lang === 'ar'
  const cur = state.currentTab

  return (
    <nav className="flex-shrink-0 bg-white border-t border-neutral-200 pb-safe">
      <div className="flex">
        {TABS.map(tab => {
          const active = cur === tab.id
          const Icon = tab.icon
          const badge =
            tab.id === 'tracker' ? state.applications.length :
            tab.id === 'sim'     ? state.simBadges.length     : 0

          return (
            <button
              key={tab.id}
              onClick={() => dispatch({ type: 'NAV_TO', tab: tab.id })}
              className="relative flex-1 flex flex-col items-center gap-1 py-2 transition-colors duration-150"
            >
              <div className="relative">
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
                    className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-danger-500 flex items-center justify-center text-white font-bold"
                    style={{ fontSize: '8px' }}
                  >
                    {badge}
                  </motion.span>
                )}
              </div>
              <span
                className={cn(
                  'font-semibold transition-colors duration-200',
                  active ? 'text-brand-600' : 'text-neutral-400',
                  ar ? 'text-2xs' : 'text-2xs'
                )}
              >
                {ar ? tab.labelAr : tab.labelEn}
              </span>
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-brand-600 rounded-full"
                />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
