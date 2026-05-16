'use client'

import { AppProvider, useApp } from '@/lib/store'
import { AnimatePresence, motion } from 'framer-motion'
import { BottomNav } from './BottomNav'
import { LangScreen }          from './screens/LangScreen'
import { WelcomeScreen }       from './screens/WelcomeScreen'
import { OnboardScreen }       from './screens/OnboardScreen'
import { HomeScreen }          from './screens/HomeScreen'
import { JobDetailScreen }     from './screens/JobDetailScreen'
import { TrackerScreen }       from './screens/TrackerScreen'
import { SimHubScreen }        from './screens/SimHubScreen'
import { SimTasksScreen }      from './screens/SimTasksScreen'
import { SimTaskScreen }       from './screens/SimTaskScreen'
import { SimDoneScreen }       from './screens/SimDoneScreen'
import { AIScreen }            from './screens/AIScreen'
import { ProfileScreen }       from './screens/ProfileScreen'
import { FeedsScreen }         from './screens/FeedsScreen'
import { MapScreen }           from './screens/MapScreen'
import { CompanyPortalScreen } from './screens/CompanyPortalScreen'

const NAV_SCREENS = ['home', 'tracker', 'sim', 'ai', 'profile'] as const

const pageVariants = {
  enter:  { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0, transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] } },
  exit:   { opacity: 0, x: -20, transition: { duration: 0.2 } },
}

function ScreenRouter() {
  const { state } = useApp()
  const showNav = (NAV_SCREENS as readonly string[]).includes(state.screen)

  const screens: Record<string, React.ReactNode> = {
    lang:          <LangScreen />,
    welcome:       <WelcomeScreen />,
    onboard:       <OnboardScreen />,
    home:          <HomeScreen />,
    detail:        <JobDetailScreen />,
    tracker:       <TrackerScreen />,
    sim:           <SimHubScreen />,
    simTasks:      <SimTasksScreen />,
    simTask:       <SimTaskScreen />,
    simDone:       <SimDoneScreen />,
    feeds:         <FeedsScreen />,
    ai:            <AIScreen />,
    profile:       <ProfileScreen />,
    map:           <MapScreen />,
    companyPortal: <CompanyPortalScreen />,
  }

  return (
    <div
      className="flex flex-col h-full w-full bg-neutral-50 overflow-hidden"
      dir={state.lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={state.screen}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 overflow-y-auto overflow-x-hidden"
          >
            {screens[state.screen] ?? <HomeScreen />}
          </motion.div>
        </AnimatePresence>
      </div>
      {showNav && <BottomNav />}
    </div>
  )
}

export function AppShell() {
  return (
    <AppProvider>
      <ScreenRouter />
    </AppProvider>
  )
}
