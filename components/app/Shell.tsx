'use client'

import { useState, lazy, Suspense } from 'react'
import { AppProvider, useApp } from '@/lib/store'
import { AnimatePresence, motion } from 'framer-motion'
import { BottomNav } from './BottomNav'
import { NotificationBell, NotificationPanel } from './NotificationPanel'

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

function ScreenFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-neutral-50">
      <div className="w-6 h-6 rounded-full border-2 border-brand-200 border-t-brand-600 animate-spin" />
    </div>
  )
}

const NAV_SCREENS = ['home', 'leaderboard', 'sim', 'ai', 'profile'] as const

// Screens only accessible to company/admin roles
const COMPANY_SCREENS = new Set([
  'hrDashboard', 'talentMarketplace', 'candidateIntelligence',
  'recruitmentPipeline', 'companyOnboarding', 'simulationUploadHub',
  'companyPortal', 'integrationPortal', 'devPortal',
])

const pageVariants = {
  enter:  { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0, transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] } },
  exit:   { opacity: 0, x: -20, transition: { duration: 0.2 } },
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
  }

  const unreadCount = state.notifications.filter(n => !n.read).length

  return (
    <div
      className="flex flex-col h-full w-full bg-neutral-50 overflow-hidden"
      dir={state.lang === 'ar' ? 'rtl' : 'ltr'}
    >
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

        {/* Floating notification bell — only on main nav screens for students */}
        {showNav && !isCompanyOrAdmin && (
          <div className={`absolute top-3 z-30 ${state.lang === 'ar' ? 'left-3' : 'right-3'}`}>
            <NotificationBell onClick={() => setNotifOpen(o => !o)} unreadCount={unreadCount} />
          </div>
        )}

        {/* Notification panel (renders inside the relative container for correct positioning) */}
        {showNav && !isCompanyOrAdmin && (
          <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
        )}
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
