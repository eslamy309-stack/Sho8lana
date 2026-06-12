'use client'

import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react'
import type {
  Lang, Screen, UserProfile, Application, AppStatus, ChatMessage, Badge,
  MatchScore, SimTrack, SimTask, LiveJob, DocumentFile, AppNotification,
} from './types'
import { supabase, sbSaveProfile, sbLoadProfile, sbLoadDocuments, sbGetDocumentUrl, sbMfaGetAAL, sbMfaListFactors, sbSaveSavedJobs, sbLoadSavedJobs, sbLoadJobDbIds, sbLoadNotifications, sbMarkNotificationRead, sbMarkAllNotificationsRead } from './supabase'

interface AppState {
  lang: Lang
  screen: Screen
  history: Screen[]
  currentTab: Screen
  user: UserProfile
  applications: Application[]
  simDone: string[]
  forageDone: string[]
  simXP: number
  simBadges: Badge[]
  chat: ChatMessage[]
  aiLoading: boolean
  aiInput: string
  cvLoading: boolean
  cvText: string
  matchScore: MatchScore | null
  matchLoading: boolean
  simTrack: SimTrack | null
  simTask: SimTask | null
  simStep: number
  simAnswers: Record<number, string | string[]>
  simMulti: Record<number, string[]>
  simFeedback: string | null
  simFeedbackLoading: boolean
  showHint: boolean
  selectedJob: number | null
  onboardStep: number
  searchQuery: string
  locationFilter: string
  jobTypeFilter: 'all' | 'internship' | 'full-time'
  industryFilter: string
  showTutorial: boolean
  liveJobs: LiveJob[]
  liveJobsLoading: boolean
  savedJobs: number[]
  documentFiles: Record<string, DocumentFile>
  mfaFactorId: string | null
  notifications: AppNotification[]
  jobDbIds: Record<number, string>
}

type Action =
  | { type: 'SET_LANG'; lang: Lang }
  | { type: 'GO'; screen: Screen }
  | { type: 'GO_BACK' }
  | { type: 'NAV_TO'; tab: Screen }
  | { type: 'SET_USER'; user: Partial<UserProfile> }
  | { type: 'TOGGLE_DOC'; key: string }
  | { type: 'ADD_APPLICATION'; app: Application }
  | { type: 'SET_APPLICATIONS'; apps: Application[] }
  | { type: 'WITHDRAW_APPLICATION'; id: string | number }
  | { type: 'UPDATE_APPLICATION_STATUS'; id: string | number; status: AppStatus }
  | { type: 'SET_SEARCH'; query: string }
  | { type: 'SET_LOCATION_FILTER'; location: string }
  | { type: 'SET_JOB_TYPE_FILTER'; filter: 'all' | 'internship' | 'full-time' }
  | { type: 'SET_INDUSTRY_FILTER'; industry: string }
  | { type: 'SELECT_JOB'; id: number | null }
  | { type: 'SET_MATCH_SCORE'; score: MatchScore | null }
  | { type: 'SET_MATCH_LOADING'; loading: boolean }
  | { type: 'SET_CV_TEXT'; text: string }
  | { type: 'SET_CV_LOADING'; loading: boolean }
  | { type: 'SET_ONBOARD_STEP'; step: number }
  | { type: 'OPEN_TRACK'; track: SimTrack }
  | { type: 'START_TASK'; track: SimTrack; task: SimTask }
  | { type: 'NEXT_STEP' }
  | { type: 'SET_ANSWER'; step: number; answer: string | string[] }
  | { type: 'TOGGLE_MULTI'; step: number; option: string }
  | { type: 'COMPLETE_TASK' }
  | { type: 'AWARD_FORAGE'; programId: string; xp: number; badgeLabel: string; trackId: string }
  | { type: 'SET_SIM_FEEDBACK'; feedback: string | null }
  | { type: 'SET_SIM_FEEDBACK_LOADING'; loading: boolean }
  | { type: 'TOGGLE_HINT' }
  | { type: 'TOGGLE_TUTORIAL' }
  | { type: 'ADD_CHAT'; msg: ChatMessage }
  | { type: 'SET_AI_LOADING'; loading: boolean }
  | { type: 'SET_AI_INPUT'; input: string }
  | { type: 'CLEAR_CHAT' }
  | { type: 'SET_LIVE_JOBS'; jobs: LiveJob[] }
  | { type: 'SET_LIVE_JOBS_LOADING'; loading: boolean }
  | { type: 'TOGGLE_SAVE_JOB'; id: number }
  | { type: 'SET_SAVED_JOBS'; ids: number[] }
  | { type: 'SET_JOB_DB_IDS'; map: Record<number, string> }
  | { type: 'SET_DOCUMENT_FILE'; file: DocumentFile }
  | { type: 'REMOVE_DOCUMENT_FILE'; key: string }
  | { type: 'SET_DOC_URL'; key: string; url: string }
  | { type: 'SET_MFA_FACTOR'; factorId: string | null }
  | { type: 'ADD_NOTIFICATION'; notification: AppNotification }
  | { type: 'MARK_NOTIFICATION_READ'; id: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'DISMISS_NOTIFICATION'; id: string }

const defaultUser: UserProfile = {
  name: '', university: '', major: '', gpa: '',
  email: '', phone: '', location: 'Cairo',
  graduationYear: '2026', documents: {},
}

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch { return fallback }
}

function getInitialState(): AppState {
  // Role hint set by landing page to route employer vs student
  let startScreen: Screen = 'lang'
  if (typeof window !== 'undefined') {
    const hint = sessionStorage.getItem('sho8_role_hint')
    if (hint === 'employer') {
      // New employers go to onboarding wizard; returning ones go straight to dashboard
      const hasProfile = localStorage.getItem('sho8_company_profile')
      startScreen = hasProfile ? 'hrDashboard' : 'companyOnboarding'
      sessionStorage.removeItem('sho8_role_hint')
    }
    else if (hint === 'student') { startScreen = 'login'; sessionStorage.removeItem('sho8_role_hint') }
  }
  return {
    lang: 'en',
    screen: startScreen,
    history: [],
    currentTab: 'home',
    user: loadFromStorage('sho8_user', defaultUser),
    applications: loadFromStorage('sho8_apps', []),
    simDone: loadFromStorage('sho8_sim_done', []),
    forageDone: loadFromStorage<string[]>('sho8_forage_done', []),
    simXP: loadFromStorage('sho8_xp', 0),
    simBadges: loadFromStorage('sho8_badges', []),
    chat: [],
    aiLoading: false,
    aiInput: '',
    cvLoading: false,
    cvText: '',
    matchScore: null,
    matchLoading: false,
    simTrack: null,
    simTask: null,
    simStep: 0,
    simAnswers: {},
    simMulti: {},
    simFeedback: null,
    simFeedbackLoading: false,
    showHint: false,
    selectedJob: null,
    onboardStep: 0,
    searchQuery: '',
    locationFilter: 'All',
    jobTypeFilter: 'all',
    industryFilter: 'All',
    showTutorial: false,
    liveJobs: [],
    liveJobsLoading: false,
    savedJobs: loadFromStorage<number[]>('sho8_saved', []),
    documentFiles: loadFromStorage<Record<string, DocumentFile>>('sho8_doc_meta', {}),
    mfaFactorId: null,
    notifications: loadFromStorage<AppNotification[]>('sho8_notifications', []),
    jobDbIds: {},
  }
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_LANG':
      return { ...state, lang: action.lang }

    case 'GO': {
      const navTabs: Screen[] = ['home', 'tracker', 'sim', 'ai', 'profile']
      return {
        ...state,
        history: [...state.history, state.screen],
        screen: action.screen,
        currentTab: navTabs.includes(action.screen) ? action.screen : state.currentTab,
        matchScore: null, cvText: '',
      }
    }

    case 'GO_BACK': {
      if (state.history.length === 0) return { ...state, screen: 'home' }
      const prev = state.history[state.history.length - 1]
      return { ...state, history: state.history.slice(0, -1), screen: prev }
    }

    case 'NAV_TO':
      return { ...state, screen: action.tab, currentTab: action.tab, history: [] }

    case 'SET_USER':
      return { ...state, user: { ...state.user, ...action.user } }

    case 'TOGGLE_DOC': {
      const docs = { ...state.user.documents }
      if (docs[action.key]) delete docs[action.key]
      else docs[action.key] = true
      return { ...state, user: { ...state.user, documents: docs } }
    }

    case 'ADD_APPLICATION':
      return { ...state, applications: [...state.applications, action.app] }

    case 'SET_APPLICATIONS':
      return { ...state, applications: action.apps }

    case 'WITHDRAW_APPLICATION':
      return { ...state, applications: state.applications.filter(a => a.id !== action.id) }

    case 'UPDATE_APPLICATION_STATUS': {
      const target = state.applications.find(a => a.id === action.id)
      const statusLabels: Record<string, string> = {
        reviewing: 'Under Review', shortlisted: 'Shortlisted', interview: 'Interview Scheduled',
        accepted: 'Accepted 🎉', rejected: 'Not Selected',
      }
      const autoNotif: AppNotification | null = target ? {
        id: `notif_${Date.now()}`,
        type: 'status_change',
        title: statusLabels[action.status] ?? action.status,
        body: `Your application to ${target.company} for "${target.title}" has been updated.`,
        read: false,
        createdAt: new Date().toISOString(),
        actionScreen: 'tracker',
      } : null
      return {
        ...state,
        applications: state.applications.map(a =>
          a.id === action.id ? { ...a, status: action.status } : a
        ),
        notifications: autoNotif
          ? [autoNotif, ...state.notifications].slice(0, 50)
          : state.notifications,
      }
    }

    case 'SET_SEARCH':
      return { ...state, searchQuery: action.query }

    case 'SET_LOCATION_FILTER':
      return { ...state, locationFilter: action.location }

    case 'SET_JOB_TYPE_FILTER':
      return { ...state, jobTypeFilter: action.filter }

    case 'SET_INDUSTRY_FILTER':
      return { ...state, industryFilter: action.industry }

    case 'SELECT_JOB':
      return { ...state, selectedJob: action.id }

    case 'SET_MATCH_SCORE':
      return { ...state, matchScore: action.score }

    case 'SET_MATCH_LOADING':
      return { ...state, matchLoading: action.loading }

    case 'SET_CV_TEXT':
      return { ...state, cvText: action.text }

    case 'SET_CV_LOADING':
      return { ...state, cvLoading: action.loading }

    case 'SET_ONBOARD_STEP':
      return { ...state, onboardStep: action.step }

    case 'OPEN_TRACK':
      return { ...state, simTrack: action.track }

    case 'START_TASK':
      return {
        ...state,
        simTrack: action.track, simTask: action.task,
        simStep: 0, simAnswers: {}, simMulti: {},
        simFeedback: null, showHint: false, showTutorial: false,
      }

    case 'NEXT_STEP':
      return { ...state, simStep: state.simStep + 1, showHint: false, showTutorial: false }

    case 'SET_ANSWER':
      return { ...state, simAnswers: { ...state.simAnswers, [action.step]: action.answer } }

    case 'TOGGLE_MULTI': {
      const current = state.simMulti[action.step] || []
      const next = current.includes(action.option)
        ? current.filter(o => o !== action.option)
        : [...current, action.option]
      return {
        ...state,
        simMulti: { ...state.simMulti, [action.step]: next },
        simAnswers: { ...state.simAnswers, [action.step]: next },
      }
    }

    case 'COMPLETE_TASK': {
      if (!state.simTask) return state
      const tid = state.simTask.id
      if (state.simDone.includes(tid)) return state
      const badgeLabel = state.lang === 'ar' ? state.simTask.badgeAr : state.simTask.badge
      const simNotif: AppNotification = {
        id: `notif_sim_${Date.now()}`,
        type: 'sim_complete',
        title: `Badge Earned: ${badgeLabel}`,
        body: `You completed "${state.simTask.title}" and earned ${state.simTask.xp} XP!`,
        read: false,
        createdAt: new Date().toISOString(),
        actionScreen: 'leaderboard',
      }
      return {
        ...state,
        simDone: [...state.simDone, tid],
        simXP: state.simXP + state.simTask.xp,
        simBadges: [...state.simBadges, { id: tid, label: badgeLabel, trackId: state.simTrack?.id || '' }],
        notifications: [simNotif, ...state.notifications].slice(0, 50),
      }
    }

    case 'AWARD_FORAGE': {
      if (state.forageDone.includes(action.programId)) return state
      const badge: Badge = { id: `forage_${action.programId}`, label: action.badgeLabel, trackId: action.trackId }
      return {
        ...state,
        simXP: state.simXP + action.xp,
        simBadges: [...state.simBadges, badge],
        forageDone: [...state.forageDone, action.programId],
      }
    }

    case 'SET_SIM_FEEDBACK':
      return { ...state, simFeedback: action.feedback }

    case 'SET_SIM_FEEDBACK_LOADING':
      return { ...state, simFeedbackLoading: action.loading }

    case 'TOGGLE_HINT':
      return { ...state, showHint: !state.showHint }

    case 'TOGGLE_TUTORIAL':
      return { ...state, showTutorial: !state.showTutorial }

    case 'ADD_CHAT':
      return { ...state, chat: [...state.chat, action.msg] }

    case 'SET_AI_LOADING':
      return { ...state, aiLoading: action.loading }

    case 'SET_AI_INPUT':
      return { ...state, aiInput: action.input }

    case 'CLEAR_CHAT':
      return { ...state, chat: [] }

    case 'SET_LIVE_JOBS':
      return { ...state, liveJobs: action.jobs }

    case 'SET_LIVE_JOBS_LOADING':
      return { ...state, liveJobsLoading: action.loading }

    case 'TOGGLE_SAVE_JOB': {
      const saved = state.savedJobs.includes(action.id)
        ? state.savedJobs.filter(id => id !== action.id)
        : [...state.savedJobs, action.id]
      return { ...state, savedJobs: saved }
    }

    case 'SET_SAVED_JOBS':
      return { ...state, savedJobs: action.ids }

    case 'SET_JOB_DB_IDS':
      return { ...state, jobDbIds: action.map }

    case 'SET_DOCUMENT_FILE':
      return {
        ...state,
        documentFiles: { ...state.documentFiles, [action.file.key]: action.file },
      }

    case 'REMOVE_DOCUMENT_FILE': {
      const files = { ...state.documentFiles }
      delete files[action.key]
      return { ...state, documentFiles: files }
    }

    case 'SET_DOC_URL': {
      const existing = state.documentFiles[action.key]
      if (!existing) return state
      return {
        ...state,
        documentFiles: {
          ...state.documentFiles,
          [action.key]: { ...existing, url: action.url },
        },
      }
    }

    case 'SET_MFA_FACTOR':
      return { ...state, mfaFactorId: action.factorId }

    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.notification, ...state.notifications].slice(0, 50) }

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => n.id === action.id ? { ...n, read: true } : n),
      }

    case 'MARK_ALL_NOTIFICATIONS_READ':
      return { ...state, notifications: state.notifications.map(n => ({ ...n, read: true })) }

    case 'DISMISS_NOTIFICATION':
      return { ...state, notifications: state.notifications.filter(n => n.id !== action.id) }

    default:
      return state
  }
}

const Ctx = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState)
  const profileSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const realtimeNotifRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  // ── Persist to localStorage ───────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('sho8_user', JSON.stringify(state.user))
    localStorage.setItem('sho8_apps', JSON.stringify(state.applications))
    localStorage.setItem('sho8_sim_done', JSON.stringify(state.simDone))
    localStorage.setItem('sho8_forage_done', JSON.stringify(state.forageDone))
    localStorage.setItem('sho8_xp', JSON.stringify(state.simXP))
    localStorage.setItem('sho8_badges', JSON.stringify(state.simBadges))
    localStorage.setItem('sho8_saved', JSON.stringify(state.savedJobs))
    localStorage.setItem('sho8_notifications', JSON.stringify(state.notifications))
    // Strip session-only Object URLs before persisting — Supabase signed URLs are also session-only
    const docMeta = Object.fromEntries(
      Object.entries(state.documentFiles).map(([k, v]) => [k, { ...v, url: undefined }])
    )
    localStorage.setItem('sho8_doc_meta', JSON.stringify(docMeta))
  }, [state.user, state.applications, state.simDone, state.forageDone, state.simXP, state.simBadges, state.savedJobs, state.documentFiles, state.notifications])

  // ── Load job local_id → UUID map on mount (public, no auth needed) ─────────
  useEffect(() => {
    sbLoadJobDbIds()
      .then(map => { if (Object.keys(map).length > 0) dispatch({ type: 'SET_JOB_DB_IDS', map }) })
      .catch(() => {/* silently ignore until seed.sql has been run */})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync profile to Supabase (debounced) ──────────────────────────────────
  useEffect(() => {
    if (!state.user.supabaseId) return
    if (profileSaveTimer.current) clearTimeout(profileSaveTimer.current)
    profileSaveTimer.current = setTimeout(() => {
      sbSaveProfile(state.user.supabaseId!, state.user).catch(
        (e: unknown) => console.error('Background profile save failed:', e instanceof Error ? e.message : e)
      )
    }, 1500)
    return () => { if (profileSaveTimer.current) clearTimeout(profileSaveTimer.current) }
  }, [state.user])

  // ── Sync notification read-state to Supabase (debounced) ─────────────────
  const notifReadTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (!state.user.supabaseId) return
    const uid = state.user.supabaseId
    const readIds = state.notifications.filter(n => n.read).map(n => n.id)
    if (readIds.length === 0) return
    if (notifReadTimer.current) clearTimeout(notifReadTimer.current)
    notifReadTimer.current = setTimeout(async () => {
      // If all are read, use bulk update; otherwise mark individually
      const unread = state.notifications.filter(n => !n.read)
      if (unread.length === 0) {
        sbMarkAllNotificationsRead(uid).catch(() => {/* ignore */})
      } else {
        for (const id of readIds) {
          sbMarkNotificationRead(uid, id).catch(() => {/* ignore */})
        }
      }
    }, 2000)
    return () => { if (notifReadTimer.current) clearTimeout(notifReadTimer.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.notifications, state.user.supabaseId])

  // ── Sync saved jobs to Supabase (debounced) ───────────────────────────────
  const savedJobsTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (!state.user.supabaseId) return
    if (savedJobsTimer.current) clearTimeout(savedJobsTimer.current)
    savedJobsTimer.current = setTimeout(() => {
      sbSaveSavedJobs(state.user.supabaseId!, state.savedJobs).catch(() => {/* silently ignore if column missing */})
    }, 1000)
    return () => { if (savedJobsTimer.current) clearTimeout(savedJobsTimer.current) }
  }, [state.savedJobs, state.user.supabaseId])

  // ── Restore Supabase session on mount ────────────────────────────────────
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const uid   = session.user.id
        const email = session.user.email ?? ''

        // Load profile from Supabase
        const profile = await sbLoadProfile(uid)
        dispatch({ type: 'SET_USER', user: { supabaseId: uid, email, ...(profile ?? {}) } })

        // Load applications from DB (source of truth)
        try {
          const appsRes = await fetch(`/api/applications?userId=${uid}`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
          })
          if (appsRes.ok) {
            const appsJson = await appsRes.json()
            const dbApps: Application[] = (appsJson.applications ?? []).map((r: Record<string, unknown>) => ({
              id: r.id as string,
              jobId: (r.job_id as string) ?? null,
              title: (r.job_title as string) ?? '',
              company: (r.company as string) ?? '',
              status: (r.status as AppStatus) ?? 'applied',
              date: new Date(r.applied_at as string).toLocaleDateString('en-GB'),
              logo: (r.company_logo as string) ?? '🏢',
              externalUrl: (r.external_url as string) ?? undefined,
              source: (r.source as string) ?? undefined,
            }))
            dispatch({ type: 'SET_APPLICATIONS', apps: dbApps })
          }
        } catch { /* keep localStorage fallback */ }

        // Load saved jobs from Supabase (overrides localStorage if column exists)
        try {
          const saved = await sbLoadSavedJobs(uid)
          if (saved.length > 0) dispatch({ type: 'SET_SAVED_JOBS', ids: saved as number[] })
        } catch { /* silently ignore if column missing */ }

        // Load notifications from Supabase (replaces localStorage snapshot)
        try {
          const dbNotifs = await sbLoadNotifications(uid)
          if (dbNotifs.length > 0) {
            for (const n of dbNotifs.slice().reverse()) dispatch({ type: 'ADD_NOTIFICATION', notification: n })
          }
        } catch { /* table may not exist yet */ }

        // Subscribe to realtime notifications for this user
        if (realtimeNotifRef.current) {
          supabase.removeChannel(realtimeNotifRef.current)
          realtimeNotifRef.current = null
        }
        realtimeNotifRef.current = supabase
          .channel(`notif:${uid}`)
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${uid}` },
            (payload) => {
              const row = payload.new as Record<string, unknown>
              dispatch({
                type: 'ADD_NOTIFICATION',
                notification: {
                  id: row.id as string,
                  type: (row.type as import('./types').NotificationType) ?? 'general',
                  title: row.title as string,
                  body: row.body as string,
                  read: row.read as boolean,
                  createdAt: row.created_at as string,
                  actionScreen: (row.action_screen as import('./types').Screen) ?? undefined,
                },
              })
            }
          )
          .subscribe()

        // Refresh document signed URLs
        const docs = await sbLoadDocuments(uid)
        for (const doc of docs) {
          const url = await sbGetDocumentUrl(uid, doc.key, doc.name)
          dispatch({ type: 'SET_DOCUMENT_FILE', file: { ...doc, url: url ?? undefined } })
        }

        // ── Auto-populate profile from OAuth metadata ────────────────────
        const meta     = session.user.user_metadata ?? {}
        const provider = (session.user.app_metadata?.provider as string) ?? 'email'
        const autoName   = (meta.full_name ?? meta.name ?? meta.user_name ?? '') as string
        const autoAvatar = (meta.avatar_url ?? meta.picture ?? '') as string
        const autoGithub = provider === 'github'
          ? ((meta.user_name ?? meta.preferred_username ?? '') as string)
          : ''

        // ── Check MFA assurance level ─────────────────────────────────────
        const aal = await sbMfaGetAAL().catch(() => null)
        const factors = await sbMfaListFactors().catch(() => [])
        const hasMfa  = factors.length > 0
        const needsMfaVerify = aal?.nextLevel === 'aal2' && aal?.currentLevel !== 'aal2'
        const mfaFactorId = hasMfa ? factors[0].id : null
        if (mfaFactorId) dispatch({ type: 'SET_MFA_FACTOR', factorId: mfaFactorId })

        if (event === 'SIGNED_IN' && !profile?.name && autoName) {
          // New OAuth user — write auto-profile immediately
          const oauthProfile = {
            name: autoName, email,
            avatarUrl: autoAvatar,
            githubUsername: autoGithub,
            authProvider: provider,
          }
          await sbSaveProfile(uid, oauthProfile).catch(
            (e: unknown) => console.error('OAuth profile save failed:', e instanceof Error ? e.message : e)
          )
          dispatch({ type: 'SET_USER', user: oauthProfile })
          // New user → set up MFA first, then onboard
          dispatch({ type: 'GO', screen: 'mfaSetup' })
        } else if (event === 'SIGNED_IN') {
          if (autoAvatar && !profile?.avatarUrl) {
            dispatch({ type: 'SET_USER', user: { avatarUrl: autoAvatar, authProvider: provider } })
          }
          if (needsMfaVerify) {
            // Has MFA enrolled but not yet verified this session
            dispatch({ type: 'GO', screen: 'mfaVerify' })
          } else if (!hasMfa) {
            // No MFA set up yet — prompt setup
            dispatch({ type: 'GO', screen: 'mfaSetup' })
          } else {
            // Fully authenticated
            dispatch({ type: 'GO', screen: profile?.onboardingCompleted ? 'home' : 'onboard' })
          }
        } else if (event === 'INITIAL_SESSION') {
          if (needsMfaVerify) {
            dispatch({ type: 'GO', screen: 'mfaVerify' })
          } else if (profile?.onboardingCompleted) {
            dispatch({ type: 'GO', screen: 'home' })
          }
        }
      } else if (event === 'SIGNED_OUT') {
        if (realtimeNotifRef.current) {
          supabase.removeChannel(realtimeNotifRef.current)
          realtimeNotifRef.current = null
        }
        dispatch({ type: 'SET_USER', user: { supabaseId: undefined } })
        dispatch({ type: 'GO', screen: 'login' })
      }
    })
    return () => {
      subscription.unsubscribe()
      if (realtimeNotifRef.current) {
        supabase.removeChannel(realtimeNotifRef.current)
        realtimeNotifRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>
}

export function useApp() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}

export async function callGemini(prompt: string, system?: string): Promise<string> {
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, system }),
    })
    const data = await res.json()
    if (!res.ok) {
      if (res.status === 429) return '⏳ Too many requests — please wait a moment and try again.'
      return `AI error ${res.status}: ${data.error ?? 'Unknown error'}`
    }
    return data.content || 'No response received. Please try again.'
  } catch (e: unknown) {
    return `🌐 Connection error: ${e instanceof Error ? e.message : 'Check your internet connection and try again.'}`
  }
}
