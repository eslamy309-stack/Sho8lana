'use client'

import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react'
import type {
  Lang, Screen, UserProfile, Application, ChatMessage, Badge,
  MatchScore, SimTrack, SimTask, LiveJob, DocumentFile,
} from './types'
import { supabase, sbSaveProfile, sbLoadProfile, sbLoadDocuments, sbGetDocumentUrl, sbMfaGetAAL, sbMfaListFactors } from './supabase'

interface AppState {
  lang: Lang
  screen: Screen
  history: Screen[]
  currentTab: Screen
  user: UserProfile
  applications: Application[]
  simDone: string[]
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
}

type Action =
  | { type: 'SET_LANG'; lang: Lang }
  | { type: 'GO'; screen: Screen }
  | { type: 'GO_BACK' }
  | { type: 'NAV_TO'; tab: Screen }
  | { type: 'SET_USER'; user: Partial<UserProfile> }
  | { type: 'TOGGLE_DOC'; key: string }
  | { type: 'ADD_APPLICATION'; app: Application }
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
  | { type: 'SET_DOCUMENT_FILE'; file: DocumentFile }
  | { type: 'REMOVE_DOCUMENT_FILE'; key: string }
  | { type: 'SET_DOC_URL'; key: string; url: string }
  | { type: 'SET_MFA_FACTOR'; factorId: string | null }

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
  return {
    lang: 'en',
    screen: 'lang',
    history: [],
    currentTab: 'home',
    user: loadFromStorage('sho8_user', defaultUser),
    applications: loadFromStorage('sho8_apps', []),
    simDone: loadFromStorage('sho8_sim_done', []),
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
      return {
        ...state,
        simDone: [...state.simDone, tid],
        simXP: state.simXP + state.simTask.xp,
        simBadges: [...state.simBadges, {
          id: tid,
          label: state.lang === 'ar' ? state.simTask.badgeAr : state.simTask.badge,
          trackId: state.simTrack?.id || '',
        }],
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

    default:
      return state
  }
}

const Ctx = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState)
  const profileSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Persist to localStorage ───────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('sho8_user', JSON.stringify(state.user))
    localStorage.setItem('sho8_apps', JSON.stringify(state.applications))
    localStorage.setItem('sho8_sim_done', JSON.stringify(state.simDone))
    localStorage.setItem('sho8_xp', JSON.stringify(state.simXP))
    localStorage.setItem('sho8_badges', JSON.stringify(state.simBadges))
    localStorage.setItem('sho8_saved', JSON.stringify(state.savedJobs))
    // Strip session-only Object URLs before persisting — Supabase signed URLs are also session-only
    const docMeta = Object.fromEntries(
      Object.entries(state.documentFiles).map(([k, v]) => [k, { ...v, url: undefined }])
    )
    localStorage.setItem('sho8_doc_meta', JSON.stringify(docMeta))
  }, [state.user, state.applications, state.simDone, state.simXP, state.simBadges, state.savedJobs, state.documentFiles])

  // ── Sync profile to Supabase (debounced) ──────────────────────────────────
  useEffect(() => {
    if (!state.user.supabaseId) return
    if (profileSaveTimer.current) clearTimeout(profileSaveTimer.current)
    profileSaveTimer.current = setTimeout(() => {
      sbSaveProfile(state.user.supabaseId!, state.user)
    }, 1500)
    return () => { if (profileSaveTimer.current) clearTimeout(profileSaveTimer.current) }
  }, [state.user])

  // ── Restore Supabase session on mount ────────────────────────────────────
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const uid   = session.user.id
        const email = session.user.email ?? ''

        // Load profile from Supabase
        const profile = await sbLoadProfile(uid)
        dispatch({ type: 'SET_USER', user: { supabaseId: uid, email, ...(profile ?? {}) } })

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
          await sbSaveProfile(uid, oauthProfile)
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
        dispatch({ type: 'SET_USER', user: { supabaseId: undefined } })
        dispatch({ type: 'GO', screen: 'login' })
      }
    })
    return () => subscription.unsubscribe()
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
