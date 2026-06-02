'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Building2, Zap, Users, Briefcase, CheckCircle2, ArrowRight,
  Eye, FileText, Send, BarChart2, Star, TrendingUp, Plus,
  Globe, Mail, Lock, LogIn, LogOut, AlertCircle, Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'

const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] } }),
}
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }

const BENEFITS = [
  { icon: Users,      color: '#0D9488', title: 'Access 214,000+ graduates',         body: "Egypt's largest pool of motivated, pre-screened fresh graduates from GUC, AUC, BUE, and 200+ universities." },
  { icon: FileText,   color: '#7C3AED', title: 'Verified portfolios included',       body: 'Every applicant sends their CV, transcript, national ID, photo, and certificates in one tap. No chasing documents.' },
  { icon: BarChart2,  color: '#F59E0B', title: 'AI candidate matching',              body: 'Our AI scores each applicant against your job requirements and ranks them automatically — saving your HR team hours.' },
  { icon: TrendingUp, color: '#EC4899', title: 'Build your employer brand',          body: 'Company profile with reviews, culture insights, and salary benchmarks. Be known as a great employer before students graduate.' },
  { icon: Zap,        color: '#06B6D4', title: 'Post, hire, onboard — fast',        body: 'Publish a job in under 5 minutes. Shortlist candidates in your dashboard. One-click invite to interview.' },
  { icon: Star,       color: '#10B981', title: 'Simulation-tested candidates',      body: "Hire students who've already completed real business simulations in their role — no training from scratch." },
]

const STEPS = [
  { num: '01', title: 'Create your company profile', body: 'Set up in 10 minutes. Add your logo, description, culture, and contact details.' },
  { num: '02', title: 'Post your jobs & internships',  body: 'Standardized forms ensure every posting reaches the right students in both Arabic and English.' },
  { num: '03', title: 'Review verified applicants',    body: 'All documents are pre-collected. AI ranks candidates by match score. Filter by GPA, university, or skills.' },
  { num: '04', title: 'Invite, offer, hire',           body: 'Send interview invites and job offers directly through Sho8lana. Zero email chains.' },
]

type AuthMode = 'landing' | 'login' | 'register' | 'verify'

interface CompanyData {
  id: string
  name: string
  industry: string | null
}

interface JobRow {
  id: string
  title: string
  type: string | null
  location: string | null
  created_at: string
  applicants: number
}

interface AppRow {
  id: string
  job_title: string | null
  status: string
  applied_at: string
}

// ─── Post-Job form state ──────────────────────────────────────────────────────

interface JobForm {
  title: string
  location: string
  type: string
  description: string
  skills: string
}

const EMPTY_JOB: JobForm = { title: '', location: 'New Cairo', type: 'internship', description: '', skills: '' }

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({ session, company, onSignOut }: { session: Session; company: CompanyData; onSignOut: () => void }) {
  const [tab, setTab] = useState<'overview' | 'post' | 'applicants'>('overview')
  const [jobs, setJobs] = useState<JobRow[]>([])
  const [apps, setApps] = useState<AppRow[]>([])
  const [loading, setLoading] = useState(true)
  const [jobForm, setJobForm] = useState<JobForm>(EMPTY_JOB)
  const [posting, setPosting] = useState(false)
  const [postDone, setPostDone] = useState(false)
  const [postError, setPostError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [{ data: jobRows }, { data: appRows }] = await Promise.all([
        supabase
          .from('jobs')
          .select('id, title, type, location, created_at, applicants')
          .eq('company_id', company.id)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('applications')
          .select('id, job_title, status, applied_at')
          .in(
            'job_id',
            // If no jobs yet, pass a placeholder that matches nothing
            (await supabase.from('jobs').select('id').eq('company_id', company.id)).data?.map(j => j.id) ?? ['00000000-0000-0000-0000-000000000000'],
          )
          .order('applied_at', { ascending: false })
          .limit(20),
      ])
      setJobs(jobRows ?? [])
      setApps(appRows ?? [])
      setLoading(false)
    }
    load()
  }, [company.id, postDone])

  async function handlePostJob() {
    if (!jobForm.title || !jobForm.description) return
    setPosting(true)
    setPostError('')
    const { error } = await supabase.from('jobs').insert({
      company_id:  company.id,
      title:       jobForm.title,
      location:    jobForm.location,
      type:        jobForm.type,
      description: jobForm.description,
      skills:      jobForm.skills ? jobForm.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
      source:      'company',
    })
    setPosting(false)
    if (error) { setPostError(error.message); return }
    setPostDone(true)
    setJobForm(EMPTY_JOB)
    setTimeout(() => { setPostDone(false); setTab('overview') }, 2500)
  }

  const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicants ?? 0), 0)

  return (
    <div className="min-h-dvh bg-neutral-50 font-sans">
      <nav className="bg-white border-b border-neutral-100 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-neutral-900 text-sm">Sho8lana</span>
          <span className="text-xs text-neutral-400 hidden sm:block">· Employer Portal</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-600 font-medium">{company.name}</span>
          <div className="w-8 h-8 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-sm">
            {company.name[0]}
          </div>
          <button onClick={onSignOut} className="text-neutral-400 hover:text-neutral-700 transition-colors" title="Sign out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Active Postings',  value: loading ? '—' : jobs.length,            icon: Briefcase,   color: '#7C3AED' },
            { label: 'Total Applicants', value: loading ? '—' : totalApplicants,         icon: Users,       color: '#0D9488' },
            { label: 'Applications',     value: loading ? '—' : apps.length,             icon: FileText,    color: '#F59E0B' },
            { label: 'Pending Review',   value: loading ? '—' : apps.filter(a => a.status === 'applied').length, icon: Eye, color: '#EC4899' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl p-4 border border-neutral-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-neutral-500">{label}</p>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
              </div>
              <p className="text-2xl font-bold text-neutral-900">{value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-4">
          {(['overview', 'post', 'applicants'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-semibold transition-colors',
                tab === t ? 'bg-brand-600 text-white' : 'bg-white text-neutral-600 border border-neutral-200 hover:border-brand-300',
              )}
            >
              {t === 'overview' ? 'Overview' : t === 'post' ? '+ Post Job' : 'Applicants'}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-neutral-100 shadow-sm">
              <p className="text-sm font-bold text-neutral-900 mb-3">Your Job Postings</p>
              {loading ? (
                <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-neutral-400" /></div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-neutral-400">No postings yet</p>
                  <button onClick={() => setTab('post')} className="text-xs text-brand-600 font-semibold mt-2 hover:underline">+ Post your first job →</button>
                </div>
              ) : (
                <div className="space-y-2">
                  {jobs.slice(0, 5).map(j => (
                    <div key={j.id} className="flex items-center justify-between text-sm py-1.5 border-b border-neutral-50 last:border-0">
                      <div>
                        <p className="font-medium text-neutral-800">{j.title}</p>
                        <p className="text-xs text-neutral-400">{j.location} · {j.type}</p>
                      </div>
                      <span className="text-xs font-semibold text-brand-600">{j.applicants} apps</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-4 border border-neutral-100 shadow-sm">
              <p className="text-sm font-bold text-neutral-900 mb-3">Recent Applications</p>
              {loading ? (
                <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-neutral-400" /></div>
              ) : apps.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-neutral-400">No applications yet</p>
                  <p className="text-xs text-neutral-400 mt-1">They appear here once students apply</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {apps.slice(0, 5).map(a => (
                    <div key={a.id} className="flex items-center justify-between text-sm py-1.5 border-b border-neutral-50 last:border-0">
                      <p className="font-medium text-neutral-800">{a.job_title ?? 'Job'}</p>
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full font-medium',
                        a.status === 'applied'    ? 'bg-blue-50 text-blue-600' :
                        a.status === 'reviewing'  ? 'bg-amber-50 text-amber-600' :
                        a.status === 'offer'      ? 'bg-emerald-50 text-emerald-600' :
                        'bg-neutral-100 text-neutral-500'
                      )}>{a.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Post Job */}
        {tab === 'post' && (
          <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm max-w-xl">
            <p className="text-base font-bold text-neutral-900 mb-4">Post a new position</p>
            {postDone ? (
              <div className="flex flex-col items-center py-8 gap-3">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
                <p className="text-lg font-bold text-neutral-900">Job Published!</p>
                <p className="text-sm text-neutral-500">Students will see this immediately.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-600 block mb-1">Job Title *</label>
                  <input
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="e.g. Marketing Intern"
                    value={jobForm.title}
                    onChange={e => setJobForm(f => ({ ...f, title: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-neutral-600 block mb-1">Location</label>
                    <select
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      value={jobForm.location}
                      onChange={e => setJobForm(f => ({ ...f, location: e.target.value }))}
                    >
                      <option>New Cairo</option>
                      <option>Smart Village</option>
                      <option>Maadi</option>
                      <option>6th October</option>
                      <option>Downtown Cairo</option>
                      <option>Heliopolis</option>
                      <option>Remote</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-600 block mb-1">Type</label>
                    <select
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      value={jobForm.type}
                      onChange={e => setJobForm(f => ({ ...f, type: e.target.value }))}
                    >
                      <option value="internship">Internship</option>
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-600 block mb-1">Description *</label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Describe the role and responsibilities..."
                    value={jobForm.description}
                    onChange={e => setJobForm(f => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-600 block mb-1">Required Skills <span className="font-normal text-neutral-400">(comma-separated)</span></label>
                  <input
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Excel, Communication, Marketing"
                    value={jobForm.skills}
                    onChange={e => setJobForm(f => ({ ...f, skills: e.target.value }))}
                  />
                </div>
                <div className="bg-brand-50 rounded-xl p-3 border border-brand-100">
                  <p className="text-xs font-bold text-brand-700 mb-2">Students auto-attach with every application:</p>
                  <div className="grid grid-cols-3 gap-1">
                    {['CV/Resume', 'Transcript', 'National ID', 'Photo', 'Certificates', 'Cover Letter'].map(d => (
                      <div key={d} className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-brand-600" />
                        <span className="text-xs text-brand-700">{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {postError && (
                  <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {postError}
                  </div>
                )}
                <Button
                  onClick={handlePostJob}
                  disabled={!jobForm.title || !jobForm.description || posting}
                  className="w-full h-11 gap-2"
                >
                  {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {posting ? 'Publishing...' : 'Publish Job'}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Applicants */}
        {tab === 'applicants' && (
          loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-neutral-400" /></div>
          ) : apps.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-neutral-100 shadow-sm text-center">
              <p className="text-sm font-semibold text-neutral-500">No applications yet</p>
              <p className="text-xs text-neutral-400 mt-1">Post a job to start receiving applications</p>
              <button onClick={() => setTab('post')} className="mt-3 px-4 py-2 bg-brand-600 text-white text-xs font-semibold rounded-lg hover:bg-brand-700 transition-colors">
                + Post a Job
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-100">
                <p className="text-sm font-bold text-neutral-900">{apps.length} applications</p>
              </div>
              <div className="divide-y divide-neutral-50">
                {apps.map(a => (
                  <div key={a.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-neutral-800">{a.job_title ?? 'Position'}</p>
                      <p className="text-xs text-neutral-400">{new Date(a.applied_at).toLocaleDateString()}</p>
                    </div>
                    <span className={cn(
                      'text-xs px-2.5 py-1 rounded-full font-medium',
                      a.status === 'applied'    ? 'bg-blue-50 text-blue-600' :
                      a.status === 'reviewing'  ? 'bg-amber-50 text-amber-600' :
                      a.status === 'interview'  ? 'bg-purple-50 text-purple-600' :
                      a.status === 'offer'      ? 'bg-emerald-50 text-emerald-600' :
                      a.status === 'rejected'   ? 'bg-red-50 text-red-500' :
                      'bg-neutral-100 text-neutral-500'
                    )}>{a.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CompanyPortalPage() {
  const [lang, setLang] = useState<'en' | 'ar'>('en')
  const ar = lang === 'ar'

  const [session, setSession]   = useState<Session | null>(null)
  const [company, setCompany]   = useState<CompanyData | null>(null)
  const [authMode, setAuthMode] = useState<AuthMode>('landing')
  const [checkingSession, setCheckingSession] = useState(true)

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [compName, setCompName] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  // ── Restore session on mount ─────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      if (s) {
        const co = await loadCompany(s.user.id)
        if (co) { setSession(s); setCompany(co) }
      }
      setCheckingSession(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_e, s) => {
      if (s) {
        const co = await loadCompany(s.user.id)
        if (co) { setSession(s); setCompany(co) }
      } else {
        setSession(null); setCompany(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function loadCompany(userId: string): Promise<CompanyData | null> {
    const { data } = await supabase
      .from('companies')
      .select('id, name, industry')
      .eq('owner_id', userId)
      .single()
    return data ?? null
  }

  // ── Register ─────────────────────────────────────────────────────────────
  async function handleRegister() {
    if (!compName || !email || !password) { setError('Please fill in all fields.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true); setError('')
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email, password,
        options: { data: { name: compName } },
      })
      if (signUpError) throw signUpError

      const user = data.user
      if (!user) {
        // Email confirmation required — session not yet available
        setAuthMode('verify')
        setLoading(false)
        return
      }

      // Create company row
      const { data: co, error: coError } = await supabase
        .from('companies')
        .insert({ name: compName, owner_id: user.id })
        .select('id, name, industry')
        .single()
      if (coError) throw coError

      // Set role to company_recruiter and link company_id
      await supabase
        .from('profiles')
        .update({ role: 'company_recruiter', company_id: co.id, name: compName })
        .eq('id', user.id)

      setCompany(co)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Login ─────────────────────────────────────────────────────────────────
  async function handleLogin() {
    if (!email || !password) { setError('Please enter your email and password.'); return }
    setLoading(true); setError('')
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) throw signInError

      const co = await loadCompany(data.user.id)
      if (!co) {
        await supabase.auth.signOut()
        throw new Error("No company account found for this email. Please register first.")
      }
      setSession(data.session)
      setCompany(co)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Sign in failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    setSession(null); setCompany(null); setAuthMode('landing')
  }

  // ── Loading state ─────────────────────────────────────────────────────────
  if (checkingSession) {
    return (
      <div className="min-h-dvh bg-neutral-950 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
      </div>
    )
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────
  if (session && company) {
    return <Dashboard session={session} company={company} onSignOut={handleSignOut} />
  }

  // ── Email verification screen ────────────────────────────────────────────
  if (authMode === 'verify') {
    return (
      <div className="min-h-dvh bg-neutral-950 flex items-center justify-center px-4 font-sans">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm bg-neutral-900 rounded-3xl p-6 border border-neutral-800 text-center"
        >
          <Mail className="w-12 h-12 text-brand-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
          <p className="text-sm text-neutral-400 mb-5">
            We sent a confirmation link to <strong className="text-white">{email}</strong>.<br />
            Click it to activate your account, then sign in.
          </p>
          <Button onClick={() => setAuthMode('login')} className="w-full h-11">Go to Sign In</Button>
        </motion.div>
      </div>
    )
  }

  // ── Auth screens ──────────────────────────────────────────────────────────
  if (authMode === 'login' || authMode === 'register') {
    return (
      <div className="min-h-dvh bg-neutral-950 flex items-center justify-center px-4 font-sans">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm bg-neutral-900 rounded-3xl p-6 border border-neutral-800"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">Sho8lana</span>
            <span className="text-xs text-brand-400">Employer Portal</span>
          </div>

          <h2 className="text-xl font-bold text-white mb-1">
            {authMode === 'login' ? 'Welcome back' : 'Join as an employer'}
          </h2>
          <p className="text-sm text-neutral-400 mb-5">
            {authMode === 'login' ? 'Sign in to your employer account' : "Start hiring Egypt's best graduates"}
          </p>

          <div className="space-y-3">
            {authMode === 'register' && (
              <div>
                <label className="text-xs text-neutral-400 font-medium block mb-1">Company Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Vodafone Egypt"
                    value={compName}
                    onChange={e => setCompName(e.target.value)}
                  />
                </div>
              </div>
            )}
            <div>
              <label className="text-xs text-neutral-400 font-medium block mb-1">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="email"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="hr@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (authMode === 'login' ? handleLogin() : handleRegister())}
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-neutral-400 font-medium block mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="password"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder={authMode === 'register' ? 'Min. 8 characters' : '••••••••'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (authMode === 'login' ? handleLogin() : handleRegister())}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mt-3">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}

          <Button
            onClick={authMode === 'login' ? handleLogin : handleRegister}
            disabled={loading}
            className="w-full h-11 mt-4 gap-2"
          >
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <LogIn className="w-4 h-4" />
            }
            {loading ? 'Please wait...' : authMode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>

          <p className="text-center text-xs text-neutral-500 mt-4">
            {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setError('') }}
              className="text-brand-400 font-semibold hover:underline"
            >
              {authMode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>

          <button
            onClick={() => { setAuthMode('landing'); setError('') }}
            className="w-full text-center text-xs text-neutral-600 mt-3 hover:text-neutral-400 transition-colors"
          >
            ← Back to overview
          </button>
        </motion.div>
      </div>
    )
  }

  // ── Landing page ──────────────────────────────────────────────────────────
  return (
    <div className={cn('min-h-dvh font-sans bg-neutral-950', ar && 'font-arabic')} dir={ar ? 'rtl' : 'ltr'}>
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-10 py-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white">Sho8lana</span>
          <span className="text-xs text-neutral-500 hidden sm:block">
            {ar ? 'بوابة الشركات' : 'for Employers'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLang(l => l === 'en' ? 'ar' : 'en')}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            {ar ? 'EN' : 'عر'}
          </button>
          <button
            onClick={() => setAuthMode('login')}
            className="text-sm text-neutral-400 hover:text-white transition-colors"
          >
            {ar ? 'تسجيل الدخول' : 'Sign in'}
          </button>
          <Button onClick={() => setAuthMode('register')} size="sm" className="gap-1.5">
            {ar ? 'انضم مجاناً' : 'Get started free'}
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-6 md:px-10 py-20 md:py-28 max-w-[1200px] mx-auto">
        <motion.div variants={stagger} initial="hidden" animate="visible" className="max-w-3xl">
          <motion.span variants={fadeUp} className="inline-flex items-center gap-2 text-xs font-semibold text-brand-400 uppercase tracking-widest bg-brand-600/10 border border-brand-600/20 px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
            {ar ? 'مجاناً للشركات في مصر' : 'Free for Egyptian companies — launch offer'}
          </motion.span>

          <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl font-serif text-white leading-tight mb-6">
            {ar ? (
              <>هنا تجد <span className="text-brand-400">أفضل</span> الخريجين<br />في مصر</>
            ) : (
              <>Hire Egypt&apos;s best graduates<br />
              <span className="text-brand-400">before everyone else does.</span></>
            )}
          </motion.h1>

          <motion.p variants={fadeUp} className="text-lg text-neutral-400 leading-relaxed mb-8 max-w-xl">
            {ar
              ? 'Sho8lana يربطك بـ 214,000 خريج سنوياً — كل منهم يحمل محفظة موثّقة وجاهز للتقديم بلمسة واحدة.'
              : "Sho8lana connects you to 214,000 Egyptian graduates per year — every one with a verified portfolio, simulation-tested skills, and one-tap applications."}
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => setAuthMode('register')} size="lg" className="gap-2">
              <Building2 className="w-4 h-4" />
              {ar ? 'أنشئ حساب شركتك' : 'Create company account'}
            </Button>
            <Button onClick={() => setAuthMode('login')} variant="ghost-dark" size="lg">
              {ar ? 'لديك حساب؟ سجّل دخولك' : 'Already have an account? Sign in'}
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Benefits grid */}
      <section className="px-6 md:px-10 py-16 max-w-[1200px] mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger} className="mb-10 text-center">
          <motion.p variants={fadeUp} className="text-brand-400 text-xs font-semibold uppercase tracking-widest mb-3">
            {ar ? 'لماذا Sho8lana' : 'Why Sho8lana'}
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-serif text-white">
            {ar ? 'ستغيّر طريقة توظيفك للأبد' : 'It changes how you hire forever'}
          </motion.h2>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BENEFITS.map(({ icon: Icon, color, title, body }, i) => (
            <motion.div
              key={title} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${color}20` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">{body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 md:px-10 py-16 bg-neutral-900/50 border-y border-white/5">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-10">
            <p className="text-brand-400 text-xs font-semibold uppercase tracking-widest mb-3">
              {ar ? 'كيف يعمل' : 'How it works'}
            </p>
            <h2 className="text-3xl font-serif text-white">
              {ar ? 'من التسجيل إلى التعيين في أيام' : 'From signup to hire in days'}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <motion.div key={s.num} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <div className="text-4xl font-bold text-brand-600/20 mb-3">{s.num}</div>
                <h3 className="text-sm font-bold text-white mb-2">{s.title}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-10 py-16 max-w-[1200px] mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-xl mx-auto">
          <h2 className="text-3xl font-serif text-white mb-4">
            {ar ? 'ابدأ مجاناً اليوم' : 'Start hiring for free today'}
          </h2>
          <p className="text-neutral-400 mb-6 text-sm">
            {ar ? 'لا رسوم للإعلان. لا عمولة على التعيين. فقط أفضل المواهب.' : 'No posting fees. No placement commissions. Just great talent.'}
          </p>
          <Button onClick={() => setAuthMode('register')} size="xl" className="gap-2 mx-auto">
            <Building2 className="w-5 h-5" />
            {ar ? 'أنشئ حساب شركتك مجاناً' : 'Create your company account — free'}
          </Button>
        </motion.div>
      </section>

      <footer className="border-t border-white/5 px-6 md:px-10 py-6 text-center">
        <p className="text-xs text-neutral-600">
          © 2026 Sho8lana · شغلانة · Built for Egyptian students and companies
        </p>
      </footer>
    </div>
  )
}
