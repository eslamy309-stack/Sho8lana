'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, Building2, Plus, Users, Briefcase,
  CheckCircle2, Clock, XCircle, Star, TrendingUp, Eye, FileText,
  Send, BarChart2, FlaskConical, ChevronDown, Trash2, X,
  GraduationCap, MapPin,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import type { AppStatus } from '@/lib/types'

const up = {
  hidden:  { opacity: 0, y: 14 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] } }),
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface Posting {
  id: string; title: string; type: 'internship' | 'full-time' | 'part-time'
  location: string; applicants: number; views: number; deadline: string
  status: 'active' | 'closed'
}

interface Applicant {
  id: string; name: string; university: string; major: string; gpa: string
  jobTitle: string; jobId: string; status: AppStatus; appliedAt: string
  docs: string[]; skills: string[]; kpiScore: number
}

// ── Static seed data ───────────────────────────────────────────────────────────

const SEED_POSTINGS: Posting[] = [
  { id: 'p1', title: 'Marketing Intern',         type: 'internship', location: 'Smart Village',  applicants: 5, views: 142, deadline: '2026-06-30', status: 'active' },
  { id: 'p2', title: 'Software Engineer Intern',  type: 'internship', location: 'New Cairo',      applicants: 3, views: 98,  deadline: '2026-07-15', status: 'active' },
  { id: 'p3', title: 'Data Analyst',              type: 'full-time',  location: 'Maadi',          applicants: 0, views: 31,  deadline: '2026-06-20', status: 'closed' },
]

const SEED_APPLICANTS: Applicant[] = [
  { id: 'a1', name: 'Nour El-Sayed',    university: 'Cairo University',  major: 'Business',           gpa: '3.8', jobTitle: 'Marketing Intern',        jobId: 'p1', status: 'applied',     appliedAt: '2026-05-28', docs: ['CV', 'Transcript', 'Photo'], skills: ['Excel', 'PowerPoint', 'Canva'], kpiScore: 82 },
  { id: 'a2', name: 'Ahmed Khalil',     university: 'AUC',               major: 'Marketing',          gpa: '3.6', jobTitle: 'Marketing Intern',        jobId: 'p1', status: 'reviewing',   appliedAt: '2026-05-26', docs: ['CV', 'Transcript'], skills: ['Excel', 'Google Ads', 'Analytics'], kpiScore: 76 },
  { id: 'a3', name: 'Sara Mahmoud',     university: 'GUC',               major: 'Computer Science',   gpa: '3.9', jobTitle: 'Software Engineer Intern', jobId: 'p2', status: 'shortlisted', appliedAt: '2026-05-24', docs: ['CV', 'Transcript', 'ID'], skills: ['React', 'TypeScript', 'Python'], kpiScore: 91 },
  { id: 'a4', name: 'Omar Hassan',      university: 'Ain Shams',         major: 'Computer Science',   gpa: '3.5', jobTitle: 'Software Engineer Intern', jobId: 'p2', status: 'interview',   appliedAt: '2026-05-22', docs: ['CV', 'Transcript'], skills: ['Node.js', 'PostgreSQL', 'Docker'], kpiScore: 79 },
  { id: 'a5', name: 'Layla Ibrahim',    university: 'Cairo University',  major: 'Statistics',         gpa: '3.7', jobTitle: 'Marketing Intern',        jobId: 'p1', status: 'applied',     appliedAt: '2026-05-30', docs: ['CV', 'Transcript', 'Photo', 'Certificates'], skills: ['SPSS', 'Excel', 'R'], kpiScore: 85 },
  { id: 'a6', name: 'Karim Adel',       university: 'BUE',               major: 'Business Analytics', gpa: '3.4', jobTitle: 'Marketing Intern',        jobId: 'p1', status: 'rejected',    appliedAt: '2026-05-20', docs: ['CV'], skills: ['Excel', 'Word'], kpiScore: 61 },
  { id: 'a7', name: 'Hana Fawzy',       university: 'Helwan University', major: 'Information Systems',gpa: '3.6', jobTitle: 'Software Engineer Intern', jobId: 'p2', status: 'accepted',    appliedAt: '2026-05-18', docs: ['CV', 'Transcript', 'ID', 'Photo'], skills: ['Java', 'Spring Boot', 'MySQL'], kpiScore: 88 },
  { id: 'a8', name: 'Youssef Gamal',    university: 'GUC',               major: 'Media Engineering',  gpa: '3.3', jobTitle: 'Marketing Intern',        jobId: 'p1', status: 'reviewing',   appliedAt: '2026-05-25', docs: ['CV', 'Transcript'], skills: ['Adobe Premiere', 'After Effects'], kpiScore: 73 },
]

const NEXT_STATUS: Partial<Record<AppStatus, AppStatus>> = {
  applied: 'reviewing', reviewing: 'shortlisted', shortlisted: 'interview', interview: 'accepted',
}

const ADVANCE_LABEL: Partial<Record<AppStatus, { en: string; ar: string }>> = {
  applied:     { en: 'Start Review',          ar: 'بدء المراجعة' },
  reviewing:   { en: 'Shortlist',             ar: 'إضافة للقائمة' },
  shortlisted: { en: 'Schedule Interview',    ar: 'دعوة للمقابلة' },
  interview:   { en: 'Accept',                ar: 'قبول الطلب' },
}

const STATUS_CONFIG: Record<AppStatus, { label: string; labelAr: string; color: string; bg: string; icon: React.ElementType }> = {
  applied:     { label: 'Applied',     labelAr: 'تقدّم',         color: '#6B7280', bg: '#F3F4F6', icon: FileText     },
  reviewing:   { label: 'Reviewing',   labelAr: 'قيد المراجعة',  color: '#2563EB', bg: '#EFF6FF', icon: Eye          },
  shortlisted: { label: 'Shortlisted', labelAr: 'قائمة قصيرة',   color: '#7C3AED', bg: '#EDE9FE', icon: Star         },
  interview:   { label: 'Interview',   labelAr: 'مقابلة',        color: '#D97706', bg: '#FFFBEB', icon: Clock        },
  accepted:    { label: 'Accepted',    labelAr: 'مقبول',         color: '#059669', bg: '#ECFDF5', icon: CheckCircle2 },
  rejected:    { label: 'Rejected',    labelAr: 'مرفوض',         color: '#DC2626', bg: '#FEF2F2', icon: XCircle      },
}

type Tab = 'dashboard' | 'postings' | 'applicants' | 'post-job'

const INDUSTRIES = ['Technology', 'Banking', 'FMCG', 'Consulting', 'Fintech', 'Healthcare', 'E-Commerce', 'Telecom', 'Media', 'Automotive', 'Retail']
const LOCATIONS  = ['Smart Village', 'New Cairo', 'Maadi', '6th October', 'Heliopolis', 'Nasr City', 'Downtown Cairo', 'New Capital', 'Giza', 'Alexandria']

interface NewJob {
  title: string; titleAr: string; location: string; industry: string
  type: string; salary: string; deadline: string; description: string
  requirements: string; skills: string
}
const EMPTY_JOB: NewJob = { title: '', titleAr: '', location: '', industry: '', type: 'internship', salary: '', deadline: '', description: '', requirements: '', skills: '' }

// ── Reject confirmation modal ──────────────────────────────────────────────────

function ConfirmReject({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <h3 className="text-base font-bold text-neutral-900">Reject {name}?</h3>
        </div>
        <p className="text-sm text-neutral-500 mb-5 leading-relaxed">
          This will move the application to Rejected. The candidate will not be notified automatically.
        </p>
        <div className="flex gap-2">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors">
            Reject
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ── KPI score color ────────────────────────────────────────────────────────────

function kpiColor(score: number) {
  if (score >= 80) return { text: 'text-emerald-600', bg: 'bg-emerald-50' }
  if (score >= 60) return { text: 'text-amber-600',   bg: 'bg-amber-50'   }
  return                  { text: 'text-red-600',     bg: 'bg-red-50'     }
}

// ── Main component ─────────────────────────────────────────────────────────────

export function CompanyPortalScreen() {
  const { state, dispatch } = useApp()
  const ar = state.lang === 'ar'

  const [tab, setTab]                 = useState<Tab>('dashboard')
  const [newJob, setNewJob]           = useState<NewJob>(EMPTY_JOB)
  const [posted, setPosted]           = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<AppStatus | 'all'>('all')
  const [applicants, setApplicants]   = useState<Applicant[]>(SEED_APPLICANTS)
  const [postings, setPostings]       = useState<Posting[]>(SEED_POSTINGS)
  const [confirmRejectId, setConfirmRejectId] = useState<string | null>(null)
  const [expandedId, setExpandedId]   = useState<string | null>(null)
  const [toast, setToast]             = useState<string | null>(null)
  const [companyId, setCompanyId]     = useState<string | null>(null)
  const [companyName, setCompanyName] = useState(state.user.name ? `${state.user.name}'s Company` : 'Your Company')

  // ── Load company data from Supabase ──────────────────────────────────────────
  useEffect(() => {
    const uid = state.user.supabaseId
    if (!uid) return

    const load = async () => {
      // Find the company this user belongs to
      const { data: co } = await supabase
        .from('companies')
        .select('id, name')
        .eq('owner_id', uid)
        .maybeSingle()

      const cid = co?.id ?? null
      if (co?.name) setCompanyName(co.name)
      setCompanyId(cid)
      if (!cid) return  // no company yet — seed data stays visible

      // Load company job postings
      const { data: jobs } = await supabase
        .from('jobs')
        .select('id, title, type, location, created_at')
        .eq('company_id', cid)
        .order('created_at', { ascending: false })

      if (jobs && jobs.length > 0) {
        const jobIds = jobs.map((j: Record<string, unknown>) => j.id as string)

        // Count applicants per job
        const { data: counts } = await supabase
          .from('applications')
          .select('job_id')
          .in('job_id', jobIds)

        const countMap: Record<string, number> = {}
        for (const row of (counts ?? [])) {
          countMap[row.job_id as string] = (countMap[row.job_id as string] ?? 0) + 1
        }

        setPostings(jobs.map((j: Record<string, unknown>) => ({
          id:         j.id as string,
          title:      j.title as string,
          type:       (j.type as Posting['type']) ?? 'internship',
          location:   (j.location as string) ?? 'Cairo',
          applicants: countMap[j.id as string] ?? 0,
          views:      0,
          deadline:   '',
          status:     'active' as const,
        })))

        // Load applications + applicant profiles
        const { data: apps } = await supabase
          .from('applications')
          .select('id, user_id, job_id, job_title, status, applied_at, cover_note, profiles(name, university, major)')
          .in('job_id', jobIds)
          .order('applied_at', { ascending: false })

        if (apps && apps.length > 0) {
          setApplicants(apps.map((a: Record<string, unknown>) => {
            const profile = a.profiles as Record<string, unknown> | null
            return {
              id:        a.id as string,
              name:      (profile?.name as string) ?? 'Applicant',
              university:(profile?.university as string) ?? '',
              major:     (profile?.major as string) ?? '',
              gpa:       '',
              jobTitle:  (a.job_title as string) ?? '',
              jobId:     (a.job_id as string) ?? '',
              status:    (a.status as AppStatus) ?? 'applied',
              appliedAt: (a.applied_at as string)?.slice(0, 10) ?? '',
              docs:      [],
              skills:    [],
              kpiScore:  0,
            }
          }))
        }
      }
    }

    load().catch(console.error)
  }, [state.user.supabaseId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  async function advance(id: string) {
    const a = applicants.find(x => x.id === id)
    if (!a) return
    const next = NEXT_STATUS[a.status]
    if (!next) return
    setApplicants(prev => prev.map(x => x.id === id ? { ...x, status: next } : x))
    showToast(`${a.name} moved to ${STATUS_CONFIG[next].label}`)
    // Persist if this is a real DB application (UUID, not 'a1'/'a2' seed IDs)
    if (!/^a\d+$/.test(id)) {
      await supabase.from('applications').update({ status: next }).eq('id', id)
    }
  }

  async function reject(id: string) {
    const a = applicants.find(x => x.id === id)
    setApplicants(prev => prev.map(x => x.id === id ? { ...x, status: 'rejected' } : x))
    setConfirmRejectId(null)
    if (a) showToast(`${a.name} has been rejected`)
    if (a && !/^a\d+$/.test(id)) {
      await supabase.from('applications').update({ status: 'rejected' }).eq('id', id)
    }
  }

  async function handlePost() {
    if (!newJob.title || !newJob.location || !newJob.description) return
    setPosted(true)
    if (companyId) {
      await supabase.from('jobs').insert({
        company_id:   companyId,
        title:        newJob.title,
        location:     newJob.location,
        type:         newJob.type,
        description:  newJob.description,
        salary:       newJob.salary || null,
        deadline:     newJob.deadline || null,
        industry:     newJob.industry || null,
      })
    }
    setTimeout(() => { setPosted(false); setNewJob(EMPTY_JOB); setTab('postings') }, 2000)
  }

  // ── Derived stats ─────────────────────────────────────────────────────────────

  const totalApplicants  = applicants.length
  const activePostings   = postings.filter(p => p.status === 'active').length
  const acceptedCount    = applicants.filter(a => a.status === 'accepted').length
  const shortlistedCount = applicants.filter(a => a.status === 'shortlisted' || a.status === 'interview').length

  const filteredApplicants = selectedStatus === 'all'
    ? applicants
    : applicants.filter(a => a.status === selectedStatus)

  const statusCounts = Object.fromEntries(
    (['applied', 'reviewing', 'shortlisted', 'interview', 'accepted', 'rejected'] as AppStatus[])
      .map(s => [s, applicants.filter(a => a.status === s).length])
  ) as Record<AppStatus, number>

  const confirmApplicant = confirmRejectId ? applicants.find(a => a.id === confirmRejectId) : null

  return (
    <div className="flex flex-col h-full bg-neutral-50">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-neutral-100 px-4 pt-4 pb-0 sticky top-0 z-20">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => dispatch({ type: 'GO_BACK' })}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral-500 hover:bg-neutral-100 transition-colors"
          >
            {ar ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-neutral-900 truncate">{companyName}</p>
              <p className="text-xs text-brand-600 font-medium">{ar ? 'بوابة التوظيف' : 'Employer Portal'}</p>
            </div>
          </div>
          <Button size="sm" onClick={() => setTab('post-job')} className="h-8 text-xs gap-1 flex-shrink-0">
            <Plus className="w-3.5 h-3.5" />
            {ar ? 'وظيفة' : 'Post Job'}
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 -mx-1">
          {(['dashboard', 'postings', 'applicants', 'post-job'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={cn(
                'flex-1 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2',
                tab === t ? 'text-brand-600 border-brand-600 bg-brand-50' : 'text-neutral-500 border-transparent hover:text-neutral-700',
              )}
            >
              {t === 'dashboard' ? (ar ? 'الرئيسية' : 'Dashboard')
               : t === 'postings' ? (ar ? 'الوظائف' : 'Postings')
               : t === 'applicants' ? (
                  <span className="flex items-center justify-center gap-1">
                    {ar ? 'المتقدمون' : 'Applicants'}
                    <span className="bg-brand-100 text-brand-700 rounded-full px-1.5 py-0.5 text-[10px] leading-none font-bold">
                      {totalApplicants}
                    </span>
                  </span>
                )
               : (ar ? 'أضف وظيفة' : 'Post Job')}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">

        {/* ── Dashboard ──────────────────────────────────────────────────────── */}
        {tab === 'dashboard' && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: ar ? 'متقدمون' : 'Total Applicants',  value: totalApplicants,  icon: Users,       color: '#0D9488' },
                { label: ar ? 'وظائف نشطة' : 'Active Postings', value: activePostings,   icon: Briefcase,   color: '#7C3AED' },
                { label: ar ? 'قائمة قصيرة' : 'Shortlisted',   value: shortlistedCount, icon: Star,        color: '#F59E0B' },
                { label: ar ? 'مقبولون' : 'Accepted',           value: acceptedCount,    icon: TrendingUp,  color: '#10B981' },
              ].map(({ label, value, icon: Icon, color }, i) => (
                <motion.div key={label} variants={up} custom={i} initial="hidden" animate="visible"
                  className="bg-white rounded-2xl p-3 border border-neutral-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-neutral-500 font-medium">{label}</p>
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
                      <Icon className="w-3.5 h-3.5" style={{ color }} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-neutral-900">{value}</p>
                </motion.div>
              ))}
            </div>

            {/* Pipeline snapshot */}
            <div className="bg-white rounded-2xl border border-neutral-100 p-4">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">{ar ? 'لمحة عن المرشحين' : 'Pipeline Snapshot'}</p>
              <div className="space-y-2">
                {(['applied', 'reviewing', 'shortlisted', 'interview', 'accepted', 'rejected'] as AppStatus[]).map(s => {
                  const count = statusCounts[s]
                  const cfg = STATUS_CONFIG[s]
                  const Icon = cfg.icon
                  const pct = totalApplicants > 0 ? (count / totalApplicants) * 100 : 0
                  return (
                    <button key={s} onClick={() => { setSelectedStatus(s); setTab('applicants') }}
                      className="w-full flex items-center gap-3 hover:bg-neutral-50 rounded-xl p-1.5 -mx-1.5 transition-colors text-left">
                      <div className="flex items-center gap-1.5 w-24 flex-shrink-0">
                        <Icon className="w-3 h-3 flex-shrink-0" style={{ color: cfg.color }} />
                        <span className="text-xs font-medium text-neutral-600 truncate">{cfg.label}</span>
                      </div>
                      <div className="flex-1 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: cfg.color }} />
                      </div>
                      <span className="text-xs font-bold text-neutral-900 w-4 text-right flex-shrink-0">{count}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Add Simulation CTA */}
            <motion.button variants={up} initial="hidden" animate="visible"
              onClick={() => dispatch({ type: 'GO', screen: 'simulationUploadHub' as never })}
              className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl border border-violet-100 hover:border-violet-300 hover:shadow-sm transition-all text-left group">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-600 transition-colors">
                <FlaskConical className="w-5 h-5 text-violet-600 group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-neutral-900">{ar ? 'أضف محاكاة' : 'Add a Simulation'}</p>
                <p className="text-xs text-neutral-500">{ar ? 'اختبر المرشحين بسيناريوهات حقيقية' : 'Test candidates with real-world scenarios'}</p>
              </div>
              <Plus className="w-4 h-4 text-violet-400 flex-shrink-0" />
            </motion.button>

            {/* Recent applicants */}
            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">{ar ? 'آخر المتقدمين' : 'Recent Applicants'}</p>
              {applicants.slice(0, 3).map((a, i) => {
                const cfg = STATUS_CONFIG[a.status]
                const Icon = cfg.icon
                const kpi = kpiColor(a.kpiScore)
                return (
                  <motion.div key={a.id} variants={up} custom={i} initial="hidden" animate="visible"
                    className="flex items-center gap-3 bg-white rounded-xl p-3 mb-2 border border-neutral-100">
                    <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-sm font-bold text-brand-600 flex-shrink-0">
                      {a.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-neutral-900 truncate">{a.name}</p>
                      <p className="text-xs text-neutral-500 truncate">{a.university} · GPA {a.gpa}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: cfg.bg, color: cfg.color }}>
                        <Icon className="w-3 h-3" />
                        {cfg.label}
                      </div>
                      <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full', kpi.bg, kpi.text)}>
                        KPI {a.kpiScore}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
              <button onClick={() => setTab('applicants')}
                className="text-xs text-brand-600 font-semibold hover:underline">
                {ar ? `عرض جميع المتقدمين (${totalApplicants}) ←` : `View all ${totalApplicants} applicants →`}
              </button>
            </div>
          </div>
        )}

        {/* ── Postings ───────────────────────────────────────────────────────── */}
        {tab === 'postings' && (
          <div className="p-4 space-y-3">
            {postings.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
                  <Briefcase className="w-7 h-7 text-brand-400" />
                </div>
                <p className="text-sm font-semibold text-neutral-700">{ar ? 'لا توجد وظائف بعد' : 'No job postings yet'}</p>
                <p className="text-xs text-neutral-400 mt-1">{ar ? 'انشر وظيفتك الأولى' : 'Post your first job to attract top talent'}</p>
                <button onClick={() => setTab('post-job')}
                  className="mt-4 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  {ar ? 'أضف وظيفة' : 'Post a Job'}
                </button>
              </div>
            )}
            {postings.map((p, i) => (
              <motion.div key={p.id} variants={up} custom={i} initial="hidden" animate="visible"
                className="bg-white rounded-2xl p-4 border border-neutral-100">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="text-sm font-bold text-neutral-900">{p.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full',
                        p.type === 'internship' ? 'bg-brand-50 text-brand-700' : 'bg-violet-50 text-violet-700')}>
                        {p.type === 'internship' ? (ar ? 'تدريب' : 'Internship') : (ar ? 'دوام كامل' : 'Full-time')}
                      </span>
                      <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full',
                        p.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-neutral-100 text-neutral-500')}>
                        {p.status === 'active' ? (ar ? 'نشط' : 'Active') : (ar ? 'مغلق' : 'Closed')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-neutral-400">{ar ? 'آخر موعد' : 'Deadline'}</p>
                    <p className="text-xs font-medium text-neutral-600">{p.deadline}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: ar ? 'متقدمون' : 'Applicants', value: p.applicants, icon: Users },
                    { label: ar ? 'مشاهدات' : 'Views',      value: p.views,      icon: Eye   },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="flex items-center gap-2 bg-neutral-50 rounded-xl p-2">
                      <Icon className="w-3.5 h-3.5 text-neutral-400" />
                      <div>
                        <p className="text-xs text-neutral-500">{label}</p>
                        <p className="text-sm font-bold text-neutral-900">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => { setSelectedStatus('all'); setTab('applicants') }}
                  className="mt-3 text-xs text-brand-600 font-semibold hover:underline flex items-center gap-1">
                  {ar ? 'عرض المتقدمين' : 'View applicants'} <ChevronRight className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── Applicants ──────────────────────────────────────────────────────── */}
        {tab === 'applicants' && (
          <div className="p-4 space-y-3">
            {/* Status filter pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button onClick={() => setSelectedStatus('all')}
                className={cn('flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-colors',
                  selectedStatus === 'all' ? 'bg-neutral-900 text-white' : 'bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-400')}>
                {ar ? 'الكل' : 'All'} ({totalApplicants})
              </button>
              {(['applied', 'reviewing', 'shortlisted', 'interview', 'accepted', 'rejected'] as AppStatus[]).map(s => {
                const count = statusCounts[s]
                if (!count) return null
                const cfg = STATUS_CONFIG[s]
                return (
                  <button key={s} onClick={() => setSelectedStatus(s)}
                    className={cn('flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-colors',
                      selectedStatus === s
                        ? 'text-white'
                        : 'bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-400'
                    )}
                    style={selectedStatus === s ? { background: cfg.color } : {}}
                  >
                    {ar ? cfg.labelAr : cfg.label} ({count})
                  </button>
                )
              })}
            </div>

            {filteredApplicants.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
                  <Users className="w-7 h-7 text-neutral-400" />
                </div>
                <p className="text-sm font-semibold text-neutral-700">{ar ? 'لا يوجد متقدمون بهذه الحالة' : 'No applicants with this status'}</p>
                <button onClick={() => setSelectedStatus('all')} className="text-xs text-brand-600 font-semibold mt-2 hover:underline">
                  {ar ? 'عرض الكل' : 'Show all'}
                </button>
              </div>
            )}

            <AnimatePresence>
              {filteredApplicants.map((a, i) => {
                const cfg = STATUS_CONFIG[a.status]
                const Icon = cfg.icon
                const kpi = kpiColor(a.kpiScore)
                const isExpanded = expandedId === a.id
                const canAdvance = !!NEXT_STATUS[a.status]
                const canReject  = a.status !== 'accepted' && a.status !== 'rejected'
                const advLabel   = ADVANCE_LABEL[a.status]

                return (
                  <motion.div key={a.id} variants={up} custom={i} initial="hidden" animate="visible"
                    layout
                    className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
                    {/* Card header */}
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-brand-50 flex items-center justify-center text-base font-bold text-brand-600 flex-shrink-0">
                          {a.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-bold text-neutral-900">{a.name}</p>
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0" style={{ background: cfg.bg, color: cfg.color }}>
                              <Icon className="w-3 h-3" />
                              {ar ? cfg.labelAr : cfg.label}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="flex items-center gap-1 text-xs text-neutral-500">
                              <GraduationCap className="w-3 h-3" />
                              {a.university}
                            </span>
                            <span className="text-neutral-300">·</span>
                            <span className="text-xs text-neutral-500">{a.major}</span>
                            <span className="text-neutral-300">·</span>
                            <span className="text-xs font-semibold text-neutral-700">GPA {a.gpa}</span>
                          </div>
                          <p className="text-xs text-neutral-400 mt-0.5">{ar ? 'لـ:' : 'For:'} {a.jobTitle}</p>
                        </div>
                      </div>

                      {/* KPI + docs row */}
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', kpi.bg, kpi.text)}>
                          KPI {a.kpiScore}/100
                        </span>
                        {a.docs.map(doc => (
                          <span key={doc} className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-medium">
                            {doc}
                          </span>
                        ))}
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : a.id)}
                          className="ml-auto text-xs text-neutral-400 hover:text-neutral-600 flex items-center gap-1 transition-colors"
                        >
                          {isExpanded ? (ar ? 'أقل' : 'Less') : (ar ? 'تفاصيل' : 'Details')}
                          <ChevronDown className={cn('w-3 h-3 transition-transform', isExpanded && 'rotate-180')} />
                        </button>
                      </div>
                    </div>

                    {/* Expandable skills section */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden">
                          <div className="px-4 pb-3 border-t border-neutral-50 pt-3">
                            <p className="text-xs font-semibold text-neutral-500 mb-2">{ar ? 'المهارات' : 'Skills'}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {a.skills.map(sk => (
                                <span key={sk} className="text-xs px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 font-medium">
                                  {sk}
                                </span>
                              ))}
                            </div>
                            <p className="text-xs text-neutral-400 mt-2">
                              {ar ? 'تاريخ التقديم:' : 'Applied:'} {a.appliedAt}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Action bar */}
                    <div className="px-4 pb-4 flex gap-2">
                      {/* View profile (placeholder) */}
                      <button className="flex items-center gap-1 px-3 py-2 rounded-xl bg-neutral-100 text-neutral-600 text-xs font-semibold hover:bg-neutral-200 transition-colors">
                        <Eye className="w-3 h-3" />
                        {ar ? 'الملف' : 'Profile'}
                      </button>

                      {/* Reject */}
                      {canReject && (
                        <button
                          onClick={() => setConfirmRejectId(a.id)}
                          className="flex items-center gap-1 px-3 py-2 rounded-xl border border-red-200 text-red-500 text-xs font-semibold hover:bg-red-50 transition-colors"
                        >
                          <X className="w-3 h-3" />
                          {ar ? 'رفض' : 'Reject'}
                        </button>
                      )}

                      {/* Advance */}
                      {canAdvance && advLabel && (
                        <button
                          onClick={() => advance(a.id)}
                          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 active:scale-95 transition-all"
                        >
                          <Send className="w-3 h-3" />
                          {ar ? advLabel.ar : advLabel.en}
                        </button>
                      )}

                      {/* Terminal states */}
                      {a.status === 'accepted' && (
                        <div className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {ar ? 'تم القبول' : 'Accepted'}
                        </div>
                      )}
                      {a.status === 'rejected' && (
                        <div className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-50 text-red-500 text-xs font-semibold">
                          <XCircle className="w-3.5 h-3.5" />
                          {ar ? 'مرفوض' : 'Rejected'}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}

        {/* ── Post Job ────────────────────────────────────────────────────────── */}
        {tab === 'post-job' && (
          <div className="p-4">
            <AnimatePresence mode="wait">
              {posted ? (
                <motion.div key="success"
                  initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center justify-center py-16 gap-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-lg font-bold text-neutral-900">{ar ? 'تم نشر الوظيفة!' : 'Job Posted!'}</p>
                  <p className="text-sm text-neutral-500 text-center">{ar ? 'سيتمكن الطلاب من رؤيتها والتقدم لها فوراً' : 'Students can now see and apply immediately'}</p>
                </motion.div>
              ) : (
                <motion.div key="form" className="space-y-4">
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">{ar ? 'تفاصيل الوظيفة' : 'Job Details'}</p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-neutral-600 block mb-1">{ar ? 'المسمى الوظيفي (إنجليزي) *' : 'Job Title (English) *'}</label>
                      <input className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                        placeholder="e.g. Marketing Intern" value={newJob.title}
                        onChange={e => setNewJob(j => ({ ...j, title: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-600 block mb-1">{ar ? 'المسمى الوظيفي (عربي)' : 'Job Title (Arabic)'}</label>
                      <input dir="rtl" className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-right"
                        placeholder="مثال: متدرب تسويق" value={newJob.titleAr}
                        onChange={e => setNewJob(j => ({ ...j, titleAr: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-neutral-600 block mb-1">{ar ? 'الموقع *' : 'Location *'}</label>
                        <select className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                          value={newJob.location} onChange={e => setNewJob(j => ({ ...j, location: e.target.value }))}>
                          <option value="">{ar ? 'اختر' : 'Select'}</option>
                          {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-neutral-600 block mb-1">{ar ? 'نوع العمل *' : 'Job Type *'}</label>
                        <select className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                          value={newJob.type} onChange={e => setNewJob(j => ({ ...j, type: e.target.value }))}>
                          <option value="internship">{ar ? 'تدريب' : 'Internship'}</option>
                          <option value="full-time">{ar ? 'دوام كامل' : 'Full-time'}</option>
                          <option value="part-time">{ar ? 'دوام جزئي' : 'Part-time'}</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-neutral-600 block mb-1">{ar ? 'القطاع' : 'Industry'}</label>
                        <select className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                          value={newJob.industry} onChange={e => setNewJob(j => ({ ...j, industry: e.target.value }))}>
                          <option value="">{ar ? 'اختر' : 'Select'}</option>
                          {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-neutral-600 block mb-1">{ar ? 'الراتب (اختياري)' : 'Salary (optional)'}</label>
                        <input className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                          placeholder="EGP 5,000/mo" value={newJob.salary}
                          onChange={e => setNewJob(j => ({ ...j, salary: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-600 block mb-1">{ar ? 'آخر موعد للتقديم' : 'Application Deadline'}</label>
                      <input type="date" className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                        value={newJob.deadline} onChange={e => setNewJob(j => ({ ...j, deadline: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-600 block mb-1">{ar ? 'وصف الوظيفة *' : 'Job Description *'}</label>
                      <textarea rows={4} className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                        placeholder={ar ? 'صف الوظيفة والمهام الرئيسية...' : 'Describe the role and key responsibilities...'}
                        value={newJob.description} onChange={e => setNewJob(j => ({ ...j, description: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-600 block mb-1">{ar ? 'المتطلبات (سطر لكل متطلب)' : 'Requirements (one per line)'}</label>
                      <textarea rows={3} className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                        placeholder={ar ? 'طالب تسويق أو أعمال\nإنجليزي قوي\n...' : 'Marketing or Business student\nStrong English\n...'}
                        value={newJob.requirements} onChange={e => setNewJob(j => ({ ...j, requirements: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-600 block mb-1">{ar ? 'المهارات المطلوبة (مفصولة بفاصلة)' : 'Required Skills (comma-separated)'}</label>
                      <input className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                        placeholder="Excel, PowerPoint, Analytics" value={newJob.skills}
                        onChange={e => setNewJob(j => ({ ...j, skills: e.target.value }))} />
                    </div>
                  </div>

                  <div className="bg-brand-50 rounded-2xl p-3 border border-brand-100">
                    <p className="text-xs font-semibold text-brand-700 mb-2">{ar ? 'سيُرسل الطلاب تلقائياً:' : 'Students auto-send with every application:'}</p>
                    <div className="grid grid-cols-2 gap-1">
                      {['CV / Resume', 'Academic Transcript', 'National ID', 'Personal Photo', 'Certificates', 'Cover Letter'].map(d => (
                        <div key={d} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-brand-600" />
                          <span className="text-xs text-brand-700">{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button onClick={handlePost} disabled={!newJob.title || !newJob.location || !newJob.description}
                    className="w-full h-12 text-sm gap-2">
                    <BarChart2 className="w-4 h-4" />
                    {ar ? 'نشر الوظيفة على Sho8lana' : 'Publish Job on Sho8lana'}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Reject confirmation modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {confirmRejectId && confirmApplicant && (
          <ConfirmReject
            name={confirmApplicant.name}
            onConfirm={() => reject(confirmRejectId)}
            onCancel={() => setConfirmRejectId(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Toast ────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl whitespace-nowrap"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
