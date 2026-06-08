'use client'

import { useState, lazy, Suspense } from 'react'
import { AppProvider, useApp } from '@/lib/store'
import { AnimatePresence, motion } from 'framer-motion'
import { BottomNav } from './BottomNav'
import { NotificationBell, NotificationPanel } from './NotificationPanel'
import { cn } from '@/lib/utils'
import {
  Home, Trophy, PlayCircle, MessageCircle, User, Zap,
} from 'lucide-react'
import type { Screen } from '@/lib/types'

// ── Core screens: loaded eagerly (on critical path) ──────────────────────────
import { LangScreen }    from './screens/LangScreen'
import { WelcomeScreen } from './screens/WelcomeScreen'
import { OnboardScreen } from './screens/OnboardScreen'
import { LoginScreen }   from './screens/LoginScreen'
import { HomeScreen }    from './screens/HomeScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { AIScreen }      from './screens/AIScreen'
import { SimHubScreen }  from './screens/SimHubScreen'
import { TrackerScreen } from './screens/TrackerScreen'

// ── Heavy screens: lazy-loaded on first access ───────────────────────────────
const ForgotPasswordScreen      = lazy(() => import('./screens/ForgotPasswordScreen').then(m => ({ default: m.ForgotPasswordScreen })))
const OTPVerifyScreen           = lazy(() => import('./screens/OTPVerifyScreen').then(m => ({ default: m.OTPVerifyScreen })))
const LeaderboardScreen         = lazy(() => import('./screens/LeaderboardScreen').then(m => ({ default: m.LeaderboardScreen })))
const PerformanceScreen         = lazy(() => import('./screens/PerformanceScreen').then(m => ({ default: m.PerformanceScreen })))
const JobDetailScreen           = lazy(() => import('./screens/JobDetailScreen').then(m => ({ default: m.JobDetailScreen })))
const SimTasksScreen            = lazy(() => import('./screens/SimTasksScreen').then(m => ({ default: m.SimTasksScreen })))
const SimTaskScreen             = lazy(() => import('./screens/SimTaskScreen').then(m => ({ default: m.SimTaskScreen })))
const SimDoneScreen             = lazy(() => import('./screens/SimDoneScreen').then(m => ({ default: m.SimDoneScreen })))
const FeedsScreen               = lazy(() => import('./screens/FeedsScreen').then(m => ({ default: m.FeedsScreen })))
const MapScreen                 = lazy(() => import('./screens/MapScreen').then(m => ({ default: m.MapScreen })))
const CompanyPortalScreen       = lazy(() => import('./screens/CompanyPortalScreen').then(m => ({ default: m.CompanyPortalScreen })))
const IntegrationPortalScreen   = lazy(() => import('./screens/IntegrationPortalScreen').then(m => ({ default: m.IntegrationPortalScreen })))
const SimulationRuntimeScreen   = lazy(() => import('./screens/SimulationRuntimeScreen').then(m => ({ default: m.SimulationRuntimeScreen })))
const DevPortalScreen           = lazy(() => import('./screens/DevPortalScreen').then(m => ({ default: m.DevPortalScreen })))
const MfaSetupScreen            = lazy(() => import('./screens/MfaSetupScreen').then(m => ({ default: m.MfaSetupScreen })))
const MfaVerifyScreen           = lazy(() => import('./screens/MfaVerifyScreen').then(m => ({ default: m.MfaVerifyScreen })))
const HRDashboardScreen         = lazy(() => import('./screens/HRDashboardScreen').then(m => ({ default: m.HRDashboardScreen })))
const TalentMarketplaceScreen   = lazy(() => import('./screens/TalentMarketplaceScreen').then(m => ({ default: m.TalentMarketplaceScreen })))
const CandidateIntelligenceScreen = lazy(() => import('./screens/CandidateIntelligenceScreen').then(m => ({ default: m.CandidateIntelligenceScreen })))
const RecruitmentPipelineScreen = lazy(() => import('./screens/RecruitmentPipelineScreen').then(m => ({ default: m.RecruitmentPipelineScreen })))
const CompanyOnboardingScreen   = lazy(() => import('./screens/CompanyOnboardingScreen').then(m => ({ default: m.CompanyOnboardingScreen })))
const TalentProfileScreen       = lazy(() => import('./screens/TalentProfileScreen').then(m => ({ default: m.TalentProfileScreen })))
const InternshipHubScreen       = lazy(() => import('./screens/InternshipHubScreen').then(m => ({ default: m.InternshipHubScreen })))
const CareerAnalyticsScreen     = lazy(() => import('./screens/CareerAnalyticsScreen').then(m => ({ default: m.CareerAnalyticsScreen })))
const SimulationUploadHubScreen = lazy(() => import('./screens/SimulationUploadHubScreen').then(m => ({ default: m.SimulationUploadHubScreen })))
const ForageHubScreen           = lazy(() => import('./screens/ForageHubScreen').then(m => ({ default: m.ForageHubScreen })))
const InboxScreen               = lazy(() => import('./screens/InboxScreen').then(m => ({ default: m.InboxScreen })))
const ChatScreen                = lazy(() => import('./screens/ChatScreen').then(m => ({ default: m.ChatScreen })))

// ── Nav tabs shared between mobile BottomNav and desktop TopNav ───────────────
const NAV_TABS: { id: Screen; icon: React.ElementType; labelEn: string; labelAr: string }[] = [
  { id: 'home',        icon: Home,          labelEn: 'Home',    labelAr: 'الرئيسية' },
  { id: 'leaderboard', icon: Trophy,        labelEn: 'Ranks',   labelAr: 'الترتيب'  },
  { id: 'sim',         icon: PlayCircle,    labelEn: 'Practice',labelAr: 'تدريب'    },
  { id: 'inbox',       icon: MessageCircle, labelEn: 'Messages',labelAr: 'الرسائل'  },
  { id: 'profile',     icon: User,          labelEn: 'Profile', labelAr: 'الملف'    },
]

// ── Desktop top navigation bar (hidden on mobile) ────────────────────────────
function DesktopTopNav({
  unreadCount,
  onNotifClick,
}: {
  unreadCount: number
  onNotifClick: () => void
}) {
  const { state, dispatch } = useApp()
  const ar = state.lang === 'ar'
  const cur = state.currentTab

  return (
    <header className="hidden md:flex items-center gap-3 px-5 py-2.5 bg-white border-b border-neutral-100 flex-shrink-0 z-20">
      {/* Brand */}
      <div className="flex items-center gap-2 mr-4">
        <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
          <Zap className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-sm font-bold text-neutral-900 tracking-tight">Sho8lana</span>
      </div>

      {/* Nav items */}
      <nav className="flex items-center gap-0.5 flex-1" aria-label="Main navigation">
        {NAV_TABS.map(tab => {
          const active = cur === tab.id
          const Icon = tab.icon
          const badge = tab.id === 'sim' ? state.simBadges.length : 0
          return (
            <button
              key={tab.id}
              onClick={() => dispatch({ type: 'NAV_TO', tab: tab.id })}
              aria-label={ar ? tab.labelAr : tab.labelEn}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors duration-150',
                active
                  ? 'bg-brand-50 text-brand-600'
                  : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700',
              )}
            >
              <Icon className="w-4 h-4" strokeWidth={active ? 2.5 : 1.8} />
              <span>{ar ? tab.labelAr : tab.labelEn}</span>
              {badge > 0 && (
                <span className="absolute -top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-danger-500 text-white flex items-center justify-center font-bold"
                  style={{ fontSize: '8px' }}>
                  {badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Right actions */}
      <div className="flex items-center gap-2 ml-4">
        <NotificationBell onClick={onNotifClick} unreadCount={unreadCount} />
      </div>
    </header>
  )
}

function ScreenFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-neutral-50">
      <div className="w-6 h-6 rounded-full border-2 border-brand-200 border-t-brand-600 animate-spin" />
    </div>
  )
}

const NAV_SCREENS = ['home', 'leaderboard', 'sim', 'inbox', 'profile'] as const

// Screens only accessible to company/admin roles
const COMPANY_SCREENS = new Set([
  'hrDashboard', 'talentMarketplace', 'candidateIntelligence',
  'recruitmentPipeline', 'companyOnboarding', 'simulationUploadHub',
  'companyPortal', 'integrationPortal', 'devPortal',
])

const pageVariants = {
  enter:  { opacity: 0, y: 8, scale: 0.995 },
  center: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } },
  exit:   { opacity: 0, y: -4, scale: 1,  transition: { duration: 0.12, ease: [0.4, 0, 1, 1] } },
}

function ScreenRouter() {
  const { state, dispatch } = useApp()
  const [notifOpen, setNotifOpen] = useState(false)
  const showNav = (NAV_SCREENS as readonly string[]).includes(state.screen)

  const role = state.user.role ?? 'student'
  const isCompanyOrAdmin = role === 'company_recruiter' || role === 'company_admin' || role === 'super_admin'

  // Redirect students who land on company-only screens
  if (COMPANY_SCREENS.has(state.screen) && !isCompanyOrAdmin) {
    dispatch({ type: 'GO', screen: 'home' })
    return null
  }

  const screens: Record<string, React.ReactNode> = {
    lang:           <LangScreen />,
    welcome:        <WelcomeScreen />,
    onboard:        <OnboardScreen />,
    login:          <LoginScreen />,
    forgotPassword: <ForgotPasswordScreen />,
    otpVerify:      <OTPVerifyScreen />,
    home:          <HomeScreen />,
    detail:        <JobDetailScreen />,
    tracker:       <TrackerScreen />,
    leaderboard:   <LeaderboardScreen />,
    performance:   <PerformanceScreen />,
    sim:           <SimHubScreen />,
    simTasks:      <SimTasksScreen />,
    simTask:       <SimTaskScreen />,
    simDone:       <SimDoneScreen />,
    feeds:         <FeedsScreen />,
    ai:            <AIScreen />,
    profile:       <ProfileScreen />,
    map:           <MapScreen />,
    companyPortal:     <CompanyPortalScreen />,
    integrationPortal: <IntegrationPortalScreen />,
    simulationRuntime: <SimulationRuntimeScreen />,
    devPortal:         <DevPortalScreen />,
    mfaSetup:               <MfaSetupScreen />,
    mfaVerify:              <MfaVerifyScreen />,
    hrDashboard:            <HRDashboardScreen />,
    talentMarketplace:      <TalentMarketplaceScreen />,
    candidateIntelligence:  <CandidateIntelligenceScreen />,
    recruitmentPipeline:    <RecruitmentPipelineScreen />,
    companyOnboarding:      <CompanyOnboardingScreen />,
    talentProfile:          <TalentProfileScreen />,
    internshipHub:          <InternshipHubScreen />,
    careerAnalytics:        <CareerAnalyticsScreen />,
    simulationUploadHub:    <SimulationUploadHubScreen />,
    forageHub:              <ForageHubScreen />,
    inbox:                  <InboxScreen />,
    chat:                   <ChatScreen />,
  }

  const unreadCount = state.notifications.filter(n => !n.read).length

  return (
    <div
      className="flex flex-col h-full w-full bg-white overflow-hidden"
      dir={state.lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Desktop top nav — hidden on mobile, shown on md+ */}
      {showNav && !isCompanyOrAdmin && (
        <DesktopTopNav
          unreadCount={unreadCount}
          onNotifClick={() => setNotifOpen(o => !o)}
        />
      )}

      {/* Content area */}
      <div className="flex-1 overflow-hidden relative">
        <Suspense fallback={<ScreenFallback />}>
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
        </Suspense>

        {/* Floating notification bell — mobile only (desktop uses TopNav) */}
        {showNav && !isCompanyOrAdmin && (
          <div className={`absolute top-3 z-30 md:hidden ${state.lang === 'ar' ? 'left-3' : 'right-3'}`}>
            <NotificationBell onClick={() => setNotifOpen(o => !o)} unreadCount={unreadCount} />
          </div>
        )}

        {/* Notification panel */}
        {showNav && !isCompanyOrAdmin && (
          <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
        )}
      </div>

      {/* Mobile bottom nav — hidden on desktop */}
      {showNav && (
        <div className="md:hidden">
          <BottomNav />
        </div>
      )}
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
