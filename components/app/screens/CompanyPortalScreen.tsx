'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, Building2, Plus, Users, Briefcase,
  CheckCircle2, Clock, XCircle, Star, TrendingUp, Eye, FileText,
  Send, BarChart2,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { AppStatus } from '@/lib/types'

const up = {
  hidden:  { opacity: 0, y: 14 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] } }),
}

// Sample data for the portal demo
const SAMPLE_POSTINGS = [
  { id: 'p1', title: 'Marketing Intern',       applicants: 47, views: 312, deadline: '2026-06-30', status: 'active',  type: 'internship' },
  { id: 'p2', title: 'Financial Analyst Intern', applicants: 32, views: 218, deadline: '2026-06-15', status: 'active',  type: 'internship' },
  { id: 'p3', title: 'Junior Software Engineer', applicants: 89, views: 544, deadline: '2026-05-31', status: 'active',  type: 'full-time'  },
  { id: 'p4', title: 'Data Analyst',             applicants: 55, views: 190, deadline: '2026-05-20', status: 'closed',  type: 'full-time'  },
]

const SAMPLE_APPLICANTS = [
  { id: 'a1', name: 'Sara Ahmed',      university: 'GUC', major: 'Marketing', gpa: '3.8', jobTitle: 'Marketing Intern',    status: 'reviewing' as AppStatus, appliedAt: '2d ago', docs: ['CV', 'Transcript', 'National ID'] },
  { id: 'a2', name: 'Omar Hassan',     university: 'AUC', major: 'Finance',   gpa: '3.6', jobTitle: 'Financial Analyst Intern', status: 'applied' as AppStatus,  appliedAt: '1d ago', docs: ['CV', 'Transcript', 'National ID', 'Cover Letter'] },
  { id: 'a3', name: 'Nour Khalil',     university: 'BUE', major: 'CS',        gpa: '3.9', jobTitle: 'Junior Software Engineer', status: 'interview' as AppStatus, appliedAt: '3d ago', docs: ['CV', 'Transcript', 'National ID', 'Portfolio'] },
  { id: 'a4', name: 'Amr El-Sayed',   university: 'Cairo', major: 'Business', gpa: '3.4', jobTitle: 'Marketing Intern',   status: 'applied' as AppStatus,   appliedAt: '5h ago', docs: ['CV', 'Transcript', 'National ID'] },
  { id: 'a5', name: 'Mona Ibrahim',   university: 'GUC', major: 'Finance',    gpa: '3.7', jobTitle: 'Financial Analyst Intern', status: 'offer' as AppStatus,  appliedAt: '4d ago', docs: ['CV', 'Transcript', 'National ID', 'Certificates'] },
]

const STATUS_CONFIG: Record<AppStatus, { label: string; labelAr: string; color: string; bg: string; icon: React.ElementType }> = {
  applied:   { label: 'Applied',    labelAr: 'تقدّم',          color: '#6B7280', bg: '#F3F4F6', icon: FileText   },
  reviewing: { label: 'Reviewing',  labelAr: 'قيد المراجعة',   color: '#2563EB', bg: '#EFF6FF', icon: Eye        },
  interview: { label: 'Interview',  labelAr: 'مقابلة',         color: '#7C3AED', bg: '#EDE9FE', icon: Clock      },
  offer:     { label: 'Offer Sent', labelAr: 'عرض مُرسَل',     color: '#059669', bg: '#ECFDF5', icon: CheckCircle2},
  rejected:  { label: 'Rejected',  labelAr: 'مرفوض',           color: '#DC2626', bg: '#FEF2F2', icon: XCircle    },
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

export function CompanyPortalScreen() {
  const { state, dispatch } = useApp()
  const ar = state.lang === 'ar'
  const [tab, setTab] = useState<Tab>('dashboard')
  const [newJob, setNewJob] = useState<NewJob>(EMPTY_JOB)
  const [posted, setPosted] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<AppStatus | 'all'>('all')
  const [companyName] = useState('Your Company')

  function handlePost() {
    if (!newJob.title || !newJob.location || !newJob.description) return
    setPosted(true)
    setTimeout(() => { setPosted(false); setNewJob(EMPTY_JOB); setTab('postings') }, 2000)
  }

  const filteredApplicants = selectedStatus === 'all'
    ? SAMPLE_APPLICANTS
    : SAMPLE_APPLICANTS.filter(a => a.status === selectedStatus)

  const totalApplicants = SAMPLE_POSTINGS.reduce((s, p) => s + p.applicants, 0)
  const activePostings  = SAMPLE_POSTINGS.filter(p => p.status === 'active').length

  return (
    <div className="flex flex-col h-full bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-100 px-4 pt-4 pb-0 sticky top-0 z-20">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => dispatch({ type: 'GO_BACK' })}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral-500 hover:bg-neutral-100 transition-colors"
          >
            {ar ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-900">{companyName}</p>
              <p className="text-xs text-brand-600 font-medium">{ar ? 'بوابة الشركة' : 'Employer Portal'}</p>
            </div>
          </div>
          <Button size="sm" onClick={() => setTab('post-job')} className="h-8 text-xs gap-1">
            <Plus className="w-3.5 h-3.5" />
            {ar ? 'وظيفة جديدة' : 'Post Job'}
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 -mx-1">
          {(['dashboard', 'postings', 'applicants', 'post-job'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2',
                tab === t
                  ? 'text-brand-600 border-brand-600 bg-brand-50'
                  : 'text-neutral-500 border-transparent hover:text-neutral-700',
              )}
            >
              {t === 'dashboard'  ? (ar ? 'الرئيسية'   : 'Dashboard')
               : t === 'postings'  ? (ar ? 'الوظائف'    : 'Postings')
               : t === 'applicants'? (ar ? 'المتقدمون' : 'Applicants')
               :                     (ar ? 'أضف وظيفة'  : 'Post Job')}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* ── Dashboard ── */}
        {tab === 'dashboard' && (
          <div className="p-4 space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: ar ? 'متقدمون' : 'Total Applicants',  value: totalApplicants, icon: Users,       color: '#0D9488' },
                { label: ar ? 'وظائف نشطة' : 'Active Postings', value: activePostings,  icon: Briefcase,   color: '#7C3AED' },
                { label: ar ? 'مشاهدات' : 'Profile Views',     value: '1,240',          icon: TrendingUp,  color: '#F59E0B' },
                { label: ar ? 'عروض مُرسَلة' : 'Offers Sent',  value: 1,               icon: Star,        color: '#10B981' },
              ].map(({ label, value, icon: Icon, color }) => (
                <motion.div
                  key={label}
                  variants={up} initial="hidden" animate="visible"
                  className="bg-white rounded-2xl p-3 border border-neutral-100"
                >
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

            {/* Why join Sho8lana banner */}
            <div className="rounded-2xl p-4 bg-gradient-to-br from-brand-600 to-brand-700 text-white">
              <p className="text-sm font-bold mb-1">{ar ? 'لماذا Sho8lana؟' : 'Why Sho8lana for hiring?'}</p>
              <div className="space-y-1.5">
                {[
                  ar ? 'وصول لـ 214,000+ خريج سنوياً' : '214,000+ graduates/yr in Egypt',
                  ar ? 'محافظ موثّقة جاهزة للمراجعة' : 'Verified portfolios ready to review',
                  ar ? 'تطبيق بلمسة واحدة مع جميع الوثائق' : 'One-tap apply — all documents included',
                  ar ? 'محرك AI للمطابقة مع متطلباتك' : 'AI matching engine scores candidates',
                ].map(text => (
                  <div key={text} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-brand-200 flex-shrink-0" />
                    <p className="text-xs text-brand-100">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent applicants */}
            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                {ar ? 'آخر المتقدمين' : 'Recent applicants'}
              </p>
              {SAMPLE_APPLICANTS.slice(0, 3).map((a, i) => {
                const cfg = STATUS_CONFIG[a.status]
                const Icon = cfg.icon
                return (
                  <motion.div
                    key={a.id}
                    variants={up} custom={i} initial="hidden" animate="visible"
                    className="flex items-center gap-3 bg-white rounded-xl p-3 mb-2 border border-neutral-100"
                  >
                    <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-sm font-bold text-brand-600 flex-shrink-0">
                      {a.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-neutral-900 truncate">{a.name}</p>
                      <p className="text-xs text-neutral-500 truncate">{a.university} · {a.major} · GPA {a.gpa}</p>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: cfg.bg, color: cfg.color }}>
                      <Icon className="w-3 h-3" />
                      {cfg.label}
                    </div>
                  </motion.div>
                )
              })}
              <button
                onClick={() => setTab('applicants')}
                className="text-xs text-brand-600 font-semibold hover:underline"
              >
                {ar ? 'عرض الكل' : 'View all applicants →'}
              </button>
            </div>
          </div>
        )}

        {/* ── Postings ── */}
        {tab === 'postings' && (
          <div className="p-4 space-y-3">
            {SAMPLE_POSTINGS.map((p, i) => (
              <motion.div
                key={p.id}
                variants={up} custom={i} initial="hidden" animate="visible"
                className="bg-white rounded-2xl p-4 border border-neutral-100"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="text-sm font-bold text-neutral-900">{p.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn(
                        'text-xs font-medium px-2 py-0.5 rounded-full',
                        p.type === 'internship' ? 'bg-brand-50 text-brand-700' : 'bg-violet-50 text-violet-700',
                      )}>
                        {p.type === 'internship' ? (ar ? 'تدريب' : 'Internship') : (ar ? 'دوام كامل' : 'Full-time')}
                      </span>
                      <span className={cn(
                        'text-xs font-medium px-2 py-0.5 rounded-full',
                        p.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-neutral-100 text-neutral-500',
                      )}>
                        {p.status === 'active' ? (ar ? 'نشط' : 'Active') : (ar ? 'مغلق' : 'Closed')}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-400">{ar ? 'آخر تقديم' : 'Deadline'} {p.deadline}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: ar ? 'متقدمون' : 'Applicants', value: p.applicants, icon: Users },
                    { label: ar ? 'مشاهدات'  : 'Views',       value: p.views,      icon: Eye   },
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
              </motion.div>
            ))}
          </div>
        )}

        {/* ── Applicants ── */}
        {tab === 'applicants' && (
          <div className="p-4 space-y-3">
            {/* Status filters */}
            <div className="flex gap-1.5 overflow-x-auto scroll-hide pb-1">
              {(['all', 'applied', 'reviewing', 'interview', 'offer', 'rejected'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedStatus(s)}
                  className={cn(
                    'flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-colors',
                    selectedStatus === s
                      ? 'bg-brand-600 text-white'
                      : 'bg-white border border-neutral-200 text-neutral-600 hover:border-brand-300',
                  )}
                >
                  {s === 'all' ? (ar ? 'الكل' : 'All') : STATUS_CONFIG[s as AppStatus].label}
                </button>
              ))}
            </div>

            {filteredApplicants.map((a, i) => {
              const cfg = STATUS_CONFIG[a.status]
              const Icon = cfg.icon
              return (
                <motion.div
                  key={a.id}
                  variants={up} custom={i} initial="hidden" animate="visible"
                  className="bg-white rounded-2xl p-4 border border-neutral-100"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-brand-50 flex items-center justify-center text-base font-bold text-brand-600 flex-shrink-0">
                      {a.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-neutral-900">{a.name}</p>
                      <p className="text-xs text-neutral-500">{a.university} · {a.major} · GPA {a.gpa}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">{ar ? 'تقدّم لـ:' : 'Applied for:'} {a.jobTitle}</p>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: cfg.bg, color: cfg.color }}>
                      <Icon className="w-3 h-3" />
                      {cfg.label}
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="flex gap-1.5 flex-wrap mb-3">
                    {a.docs.map(doc => (
                      <span key={doc} className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-medium">
                        {doc}
                      </span>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 rounded-xl bg-brand-50 text-brand-600 text-xs font-semibold hover:bg-brand-100 transition-colors flex items-center justify-center gap-1">
                      <Eye className="w-3 h-3" />
                      {ar ? 'عرض الملف' : 'View Profile'}
                    </button>
                    {a.status !== 'offer' && a.status !== 'rejected' && (
                      <button className="flex-1 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors flex items-center justify-center gap-1">
                        <Send className="w-3 h-3" />
                        {a.status === 'applied' ? (ar ? 'بدء المراجعة' : 'Start Review')
                          : a.status === 'reviewing' ? (ar ? 'دعوة للمقابلة' : 'Invite to Interview')
                          : (ar ? 'إرسال عرض' : 'Send Offer')}
                      </button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* ── Post Job ── */}
        {tab === 'post-job' && (
          <div className="p-4">
            <AnimatePresence mode="wait">
              {posted ? (
                <motion.div
                  key="success"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center justify-center py-16 gap-4"
                >
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-lg font-bold text-neutral-900">{ar ? 'تم نشر الوظيفة!' : 'Job Posted!'}</p>
                  <p className="text-sm text-neutral-500 text-center">{ar ? 'سيتمكن الطلاب من رؤيتها والتقدم لها فوراً' : 'Students can now see and apply immediately'}</p>
                </motion.div>
              ) : (
                <motion.div key="form" className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">{ar ? 'تفاصيل الوظيفة' : 'Job Details'}</p>

                    <div className="space-y-3">
                      {/* Title */}
                      <div>
                        <label className="text-xs font-medium text-neutral-600 block mb-1">{ar ? 'المسمى الوظيفي (إنجليزي) *' : 'Job Title (English) *'}</label>
                        <input
                          className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                          placeholder="e.g. Marketing Intern"
                          value={newJob.title}
                          onChange={e => setNewJob(j => ({ ...j, title: e.target.value }))}
                        />
                      </div>

                      {/* Title AR */}
                      <div>
                        <label className="text-xs font-medium text-neutral-600 block mb-1">{ar ? 'المسمى الوظيفي (عربي)' : 'Job Title (Arabic)'}</label>
                        <input
                          dir="rtl"
                          className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-right"
                          placeholder="مثال: متدرب تسويق"
                          value={newJob.titleAr}
                          onChange={e => setNewJob(j => ({ ...j, titleAr: e.target.value }))}
                        />
                      </div>

                      {/* Location + Type row */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-neutral-600 block mb-1">{ar ? 'الموقع *' : 'Location *'}</label>
                          <select
                            className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                            value={newJob.location}
                            onChange={e => setNewJob(j => ({ ...j, location: e.target.value }))}
                          >
                            <option value="">{ar ? 'اختر' : 'Select'}</option>
                            {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-neutral-600 block mb-1">{ar ? 'نوع العمل *' : 'Job Type *'}</label>
                          <select
                            className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                            value={newJob.type}
                            onChange={e => setNewJob(j => ({ ...j, type: e.target.value }))}
                          >
                            <option value="internship">{ar ? 'تدريب' : 'Internship'}</option>
                            <option value="full-time">{ar ? 'دوام كامل' : 'Full-time'}</option>
                            <option value="part-time">{ar ? 'دوام جزئي' : 'Part-time'}</option>
                          </select>
                        </div>
                      </div>

                      {/* Industry + Salary row */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-neutral-600 block mb-1">{ar ? 'القطاع' : 'Industry'}</label>
                          <select
                            className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                            value={newJob.industry}
                            onChange={e => setNewJob(j => ({ ...j, industry: e.target.value }))}
                          >
                            <option value="">{ar ? 'اختر' : 'Select'}</option>
                            {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-neutral-600 block mb-1">{ar ? 'الراتب (اختياري)' : 'Salary (optional)'}</label>
                          <input
                            className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                            placeholder="EGP 5,000/mo"
                            value={newJob.salary}
                            onChange={e => setNewJob(j => ({ ...j, salary: e.target.value }))}
                          />
                        </div>
                      </div>

                      {/* Deadline */}
                      <div>
                        <label className="text-xs font-medium text-neutral-600 block mb-1">{ar ? 'آخر موعد للتقديم' : 'Application Deadline'}</label>
                        <input
                          type="date"
                          className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                          value={newJob.deadline}
                          onChange={e => setNewJob(j => ({ ...j, deadline: e.target.value }))}
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="text-xs font-medium text-neutral-600 block mb-1">{ar ? 'وصف الوظيفة *' : 'Job Description *'}</label>
                        <textarea
                          rows={4}
                          className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                          placeholder={ar ? 'صف الوظيفة والمهام الرئيسية...' : "Describe the role and key responsibilities..."}
                          value={newJob.description}
                          onChange={e => setNewJob(j => ({ ...j, description: e.target.value }))}
                        />
                      </div>

                      {/* Requirements */}
                      <div>
                        <label className="text-xs font-medium text-neutral-600 block mb-1">{ar ? 'المتطلبات (سطر لكل متطلب)' : 'Requirements (one per line)'}</label>
                        <textarea
                          rows={3}
                          className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                          placeholder={ar ? 'طالب تسويق أو أعمال\nإنجليزي قوي\n...' : 'Marketing or Business student\nStrong English\n...'}
                          value={newJob.requirements}
                          onChange={e => setNewJob(j => ({ ...j, requirements: e.target.value }))}
                        />
                      </div>

                      {/* Skills */}
                      <div>
                        <label className="text-xs font-medium text-neutral-600 block mb-1">{ar ? 'المهارات المطلوبة (مفصولة بفاصلة)' : 'Required Skills (comma-separated)'}</label>
                        <input
                          className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                          placeholder="Excel, PowerPoint, Analytics"
                          value={newJob.skills}
                          onChange={e => setNewJob(j => ({ ...j, skills: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* What students send */}
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

                  <Button
                    onClick={handlePost}
                    disabled={!newJob.title || !newJob.location || !newJob.description}
                    className="w-full h-12 text-sm gap-2"
                  >
                    <BarChart2 className="w-4 h-4" />
                    {ar ? 'نشر الوظيفة على Sho8lana' : 'Publish Job on Sho8lana'}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
