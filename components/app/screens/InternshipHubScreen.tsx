'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, Search, Bookmark, BookmarkCheck, CheckCircle2,
  MapPin, Calendar, DollarSign, Briefcase, X,
  Package, ClipboardList, BookOpen,
} from 'lucide-react'
import { useApp } from '@/lib/store'

// ── Animation variants ────────────────────────────────────────────────────────

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

const up = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
}

// ── Types ─────────────────────────────────────────────────────────────────────

type InternshipTab = 'discover' | 'applications' | 'saved'
type AppStatus = 'applied' | 'reviewing' | 'interview' | 'offer' | 'rejected'
type FilterCategory = 'All' | 'Tech' | 'Marketing' | 'Finance' | 'Operations' | 'Consulting'

interface Internship {
  id: number
  initials: string
  color: string
  company: string
  title: string
  location: string
  salaryMin: number
  salaryMax: number
  match: number
  skills: string[]
  deadline: string
  category: FilterCategory
}

interface MockApplication {
  id: number
  company: string
  initials: string
  color: string
  role: string
  appliedDate: string
  status: AppStatus
}

const INTERNSHIPS: Internship[] = [
  {
    id: 1, initials: 'VF', color: '#E60000',
    company: 'Vodafone Egypt', title: 'Data Analytics Intern',
    location: 'Cairo', salaryMin: 2500, salaryMax: 4000, match: 94,
    skills: ['Python', 'SQL', 'Power BI'], deadline: 'Jun 30', category: 'Tech',
  },
  {
    id: 2, initials: 'OT', color: '#FF6B35',
    company: 'Orange Telecom', title: 'Software Engineering Intern',
    location: 'Cairo', salaryMin: 3000, salaryMax: 5000, match: 89,
    skills: ['React', 'Node.js', 'REST APIs'], deadline: 'Jul 15', category: 'Tech',
  },
  {
    id: 3, initials: 'BM', color: '#0066CC',
    company: 'Bank Misr', title: 'Financial Analyst Intern',
    location: 'Cairo', salaryMin: 2000, salaryMax: 3500, match: 82,
    skills: ['Excel', 'Financial Modeling', 'Bloomberg'], deadline: 'Jul 1', category: 'Finance',
  },
  {
    id: 4, initials: 'OC', color: '#00B140',
    company: 'OceanBlue Consulting', title: 'Strategy & Operations Intern',
    location: 'Giza', salaryMin: 2500, salaryMax: 4000, match: 78,
    skills: ['PowerPoint', 'Market Research', 'Data Analysis'], deadline: 'Jun 25', category: 'Consulting',
  },
  {
    id: 5, initials: 'AM', color: '#9B59B6',
    company: 'Aman Financial', title: 'Digital Marketing Intern',
    location: 'Cairo', salaryMin: 1800, salaryMax: 3000, match: 75,
    skills: ['Google Ads', 'Social Media', 'SEO'], deadline: 'Jul 20', category: 'Marketing',
  },
  {
    id: 6, initials: 'SS', color: '#E74C3C',
    company: 'Souq.com (Amazon)', title: 'Operations & Logistics Intern',
    location: 'Cairo', salaryMin: 2200, salaryMax: 3800, match: 71,
    skills: ['Supply Chain', 'Excel', 'ERP'], deadline: 'Jul 10', category: 'Operations',
  },
  {
    id: 7, initials: 'EG', color: '#1ABC9C',
    company: 'EGBank', title: 'Retail Banking Intern',
    location: 'Alexandria', salaryMin: 1500, salaryMax: 2800, match: 68,
    skills: ['Customer Service', 'Banking Operations', 'Finance'], deadline: 'Aug 1', category: 'Finance',
  },
  {
    id: 8, initials: 'WP', color: '#F39C12',
    company: 'WideBot (AI)', title: 'ML Engineering Intern',
    location: 'Remote', salaryMin: 3500, salaryMax: 6000, match: 88,
    skills: ['Python', 'TensorFlow', 'NLP'], deadline: 'Jun 28', category: 'Tech',
  },
  {
    id: 9, initials: 'MK', color: '#2ECC71',
    company: 'Mashreq Bank', title: 'Risk Management Intern',
    location: 'Cairo', salaryMin: 2000, salaryMax: 3500, match: 65,
    skills: ['Risk Analysis', 'Excel', 'Compliance'], deadline: 'Jul 5', category: 'Finance',
  },
  {
    id: 10, initials: 'CM', color: '#E91E8C',
    company: 'Careem', title: 'Product Management Intern',
    location: 'Cairo', salaryMin: 4000, salaryMax: 6500, match: 91,
    skills: ['Product Strategy', 'SQL', 'User Research'], deadline: 'Jun 22', category: 'Tech',
  },
]

const MOCK_APPLICATIONS: MockApplication[] = [
  { id: 1, initials: 'VF', color: '#E60000', company: 'Vodafone Egypt',       role: 'Data Analytics Intern',         appliedDate: 'Jun 2',  status: 'reviewing'  },
  { id: 2, initials: 'CM', color: '#E91E8C', company: 'Careem',               role: 'Product Management Intern',     appliedDate: 'Jun 5',  status: 'interview'  },
  { id: 3, initials: 'BM', color: '#0066CC', company: 'Bank Misr',            role: 'Financial Analyst Intern',      appliedDate: 'May 28', status: 'applied'    },
  { id: 4, initials: 'WP', color: '#F39C12', company: 'WideBot (AI)',         role: 'ML Engineering Intern',         appliedDate: 'May 20', status: 'rejected'   },
]

const PIPELINE_STAGES: AppStatus[] = ['applied', 'reviewing', 'interview', 'offer']

const STATUS_META: Record<AppStatus, { label: string; color: string; bg: string }> = {
  applied:   { label: 'Applied',    color: '#3B82F6', bg: 'rgba(59,130,246,0.15)'   },
  reviewing: { label: 'Reviewing',  color: '#F59E0B', bg: 'rgba(245,158,11,0.15)'   },
  interview: { label: 'Interview',  color: '#6366F1', bg: 'rgba(99,102,241,0.15)'   },
  offer:     { label: 'Offer!',     color: '#10B981', bg: 'rgba(16,185,129,0.15)'   },
  rejected:  { label: 'Rejected',   color: '#EF4444', bg: 'rgba(239,68,68,0.15)'    },
}

const FILTER_CATEGORIES: FilterCategory[] = ['All', 'Tech', 'Marketing', 'Finance', 'Operations', 'Consulting']

function matchColor(match: number): string {
  if (match >= 88) return '#10B981'
  if (match >= 78) return '#6366F1'
  return '#F59E0B'
}

// ── Job Card ──────────────────────────────────────────────────────────────────

function JobCard({
  job,
  isSaved,
  onSave,
}: {
  job: Internship
  isSaved: boolean
  onSave: () => void
}) {
  const [applied, setApplied] = useState(false)
  const color = matchColor(job.match)

  return (
    <motion.div
      variants={up}
      layout
      className="rounded-2xl p-4"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: job.color }}
          >
            {job.initials}
          </div>
          <div>
            <p className="text-sm font-bold leading-tight" style={{ color: '#F1F5F9' }}>{job.title}</p>
            <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{job.company}</p>
          </div>
        </div>

        {/* Match badge */}
        <div
          className="flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-bold"
          style={{ background: `${color}18`, color, border: `1px solid ${color}33` }}
        >
          {job.match}% match
        </div>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap gap-3 mt-3">
        <div className="flex items-center gap-1" style={{ color: '#64748B' }}>
          <MapPin className="w-3.5 h-3.5" />
          <span className="text-xs">{job.location}</span>
        </div>
        <div className="flex items-center gap-1" style={{ color: '#64748B' }}>
          <DollarSign className="w-3.5 h-3.5" />
          <span className="text-xs">EGP {job.salaryMin.toLocaleString()}–{job.salaryMax.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1" style={{ color: '#64748B' }}>
          <Calendar className="w-3.5 h-3.5" />
          <span className="text-xs">Deadline: {job.deadline}</span>
        </div>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {job.skills.map(skill => (
          <span
            key={skill}
            className="px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Action row */}
      <div className="flex items-center gap-2 mt-4">
        <motion.button
          onClick={() => !applied && setApplied(true)}
          whileTap={{ scale: 0.96 }}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-1.5"
          style={applied
            ? { background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }
            : { background: '#10B981', color: '#fff' }
          }
        >
          <AnimatePresence mode="wait">
            {applied ? (
              <motion.span
                key="done"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Applied ✓
              </motion.span>
            ) : (
              <motion.span key="apply" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Apply Now
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <motion.button
          onClick={onSave}
          whileTap={{ scale: 0.9 }}
          aria-label={isSaved ? 'Remove from saved' : 'Save internship'}
          aria-pressed={isSaved}
          className="w-11 h-11 rounded-xl flex items-center justify-center transition-colors"
          style={{
            background: isSaved ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)',
            border: isSaved ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.08)',
            color: isSaved ? '#6366F1' : '#64748B',
          }}
        >
          {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </motion.button>
      </div>
    </motion.div>
  )
}

// ── Application Card ──────────────────────────────────────────────────────────

function ApplicationCard({ app }: { app: MockApplication }) {
  const meta = STATUS_META[app.status]
  const stageIndex = PIPELINE_STAGES.indexOf(app.status as AppStatus)

  return (
    <motion.div
      variants={up}
      className="rounded-2xl p-4"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
          style={{ background: app.color }}
        >
          {app.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate" style={{ color: '#F1F5F9' }}>{app.role}</p>
          <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{app.company}</p>
          <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>Applied {app.appliedDate}</p>
        </div>
        <span
          className="px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0"
          style={{ background: meta.bg, color: meta.color }}
        >
          {meta.label}
        </span>
      </div>

      {/* Pipeline dots */}
      {app.status !== 'rejected' && (
        <div className="flex items-center gap-1 mt-3 px-1">
          {PIPELINE_STAGES.map((stage, i) => (
            <div key={stage} className="flex items-center flex-1">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-colors"
                style={{
                  background: i <= stageIndex ? STATUS_META[stage].color : 'rgba(255,255,255,0.1)',
                  boxShadow: i === stageIndex ? `0 0 6px ${STATUS_META[stage].color}` : 'none',
                }}
              />
              {i < PIPELINE_STAGES.length - 1 && (
                <div
                  className="flex-1 h-px mx-1"
                  style={{ background: i < stageIndex ? STATUS_META[stage].color : 'rgba(255,255,255,0.08)' }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function InternshipHubScreen() {
  const { state, dispatch } = useApp()
  const [tab, setTab] = useState<InternshipTab>('discover')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterCategory>('All')
  const [savedIds, setSavedIds] = useState<number[]>([2, 5])

  const filtered = INTERNSHIPS.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'All' || job.category === filter
    return matchesSearch && matchesFilter
  })

  const savedJobs = INTERNSHIPS.filter(j => savedIds.includes(j.id))

  function toggleSave(id: number) {
    setSavedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: '#0F1117', color: '#F1F5F9' }}
    >
      {/* ── Header ── */}
      <div
        className="sticky top-0 z-30 px-4 pt-3 pb-0"
        style={{ background: 'rgba(15,17,23,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => dispatch({ type: 'GO_BACK' })}
            className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: '#94A3B8' }}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" style={{ color: '#10B981' }} />
            <span className="text-sm font-bold" style={{ color: '#F1F5F9' }}>Internship Hub</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 pb-0">
          {(['discover', 'applications', 'saved'] as InternshipTab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="relative flex-1 py-2.5 text-xs font-semibold capitalize transition-colors"
              style={{ color: tab === t ? '#10B981' : '#64748B' }}
            >
              {t === 'applications' ? 'My Applications' : t.charAt(0).toUpperCase() + t.slice(1)}
              {tab === t && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: '#10B981' }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* ── DISCOVER tab ── */}
        <AnimatePresence mode="wait">
          {tab === 'discover' && (
            <motion.div
              key="discover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Search */}
              <div
                className="flex items-center gap-2 px-3 py-3 rounded-xl mb-3"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <Search className="w-4 h-4 flex-shrink-0" style={{ color: '#64748B' }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search jobs or companies..."
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: '#F1F5F9' }}
                />
                {search && (
                  <button onClick={() => setSearch('')}>
                    <X className="w-4 h-4" style={{ color: '#64748B' }} />
                  </button>
                )}
              </div>

              {/* Filter chips */}
              <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scroll-hide">
                {FILTER_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
                    style={filter === cat
                      ? { background: '#10B981', color: '#fff' }
                      : { background: 'rgba(255,255,255,0.06)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.08)' }
                    }
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Job cards */}
              <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-3">
                <AnimatePresence>
                  {filtered.map(job => (
                    <JobCard
                      key={job.id}
                      job={job}
                      isSaved={savedIds.includes(job.id)}
                      onSave={() => toggleSave(job.id)}
                    />
                  ))}
                </AnimatePresence>
                {filtered.length === 0 && (
                  <div className="text-center py-16 flex flex-col items-center" style={{ color: '#64748B' }}>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                      style={{ background: 'rgba(16,185,129,0.1)' }}>
                      <Briefcase className="w-6 h-6" style={{ color: '#10B981' }} />
                    </div>
                    <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>No internships match your search</p>
                    <p className="text-xs mt-1">Try a different search or filter</p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* ── MY APPLICATIONS tab ── */}
          {tab === 'applications' && (
            <motion.div
              key="applications"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-3">
                {MOCK_APPLICATIONS.map(app => (
                  <ApplicationCard key={app.id} app={app} />
                ))}
                {MOCK_APPLICATIONS.length === 0 && (
                  <div className="text-center py-16 flex flex-col items-center" style={{ color: '#64748B' }}>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                      style={{ background: 'rgba(99,102,241,0.1)' }}>
                      <ClipboardList className="w-6 h-6" style={{ color: '#6366F1' }} />
                    </div>
                    <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>No applications yet</p>
                    <p className="text-xs mt-1">Apply to internships to track them here</p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* ── SAVED tab ── */}
          {tab === 'saved' && (
            <motion.div
              key="saved"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {savedJobs.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center" style={{ color: '#64748B' }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                    style={{ background: 'rgba(99,102,241,0.1)' }}>
                    <BookOpen className="w-6 h-6" style={{ color: '#6366F1' }} />
                  </div>
                  <p className="text-sm font-medium">No saved internships yet</p>
                  <p className="text-xs mt-1">Tap the bookmark icon on any listing</p>
                </div>
              ) : (
                <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-3">
                  {savedJobs.map(job => (
                    <motion.div
                      key={job.id}
                      variants={up}
                      className="rounded-2xl p-4"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ background: job.color }}
                        >
                          {job.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate" style={{ color: '#F1F5F9' }}>{job.title}</p>
                          <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{job.company} · {job.location}</p>
                          <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>
                            EGP {job.salaryMin.toLocaleString()}–{job.salaryMax.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="flex-1 py-2 rounded-xl text-xs font-bold"
                          style={{ background: '#10B981', color: '#fff' }}
                        >
                          Apply Now
                        </button>
                        <button
                          onClick={() => toggleSave(job.id)}
                          className="px-4 py-2 rounded-xl text-xs font-semibold"
                          style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)' }}
                        >
                          Remove
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
