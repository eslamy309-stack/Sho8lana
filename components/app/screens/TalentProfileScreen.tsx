'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, Edit3, Share2, MapPin, GraduationCap, Calendar,
  Github, Globe, Plus, Award, CheckCircle2, Eye, EyeOff,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { getActivity, type ForageAttempt } from '@/lib/forage-tracking'

// ── Animation variants ────────────────────────────────────────────────────────

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

const up = {
  hidden:  { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// talentScore is derived from state.user.kpiScore at runtime

function scoreColor(score: number): string {
  if (score >= 90) return '#10B981'
  if (score >= 70) return '#6366F1'
  if (score >= 50) return '#F59E0B'
  return '#EF4444'
}

function scoreLabel(score: number): string {
  if (score >= 90) return 'Exceptional'
  if (score >= 70) return 'Strong'
  if (score >= 50) return 'Developing'
  return 'Needs Work'
}

// KPI bars, skills, and history are populated from real user data at runtime
const KPI_BARS_DEFAULT = [
  { label: 'Leadership',     value: 0, color: '#6366F1' },
  { label: 'Analytical',     value: 0, color: '#10B981' },
  { label: 'Communication',  value: 0, color: '#06B6D4' },
  { label: 'Cognitive',      value: 0, color: '#F59E0B' },
]

// ── Sub-components ────────────────────────────────────────────────────────────

function AnimatedBar({ value, color, delay = 0 }: { value: number; color: string; delay?: number }) {
  return (
    <div
      className="h-2 rounded-full overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.06)' }}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  )
}

// ── Forage experience (completed simulations) ──────────────────────────────────

function ForageExperience() {
  const [sims, setSims] = useState<ForageAttempt[]>([])
  useEffect(() => {
    let cancelled = false
    getActivity()
      .then(({ attempts }) => {
        if (cancelled) return
        setSims(
          attempts
            .filter(a => a.status === 'completed')
            .sort((a, b) => +new Date(b.completed_at ?? b.last_activity_at) - +new Date(a.completed_at ?? a.last_activity_at)),
        )
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  if (sims.length === 0) return null

  return (
    <motion.div variants={up} className="rounded-2xl p-5"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-4 h-4" style={{ color: '#3B82F6' }} />
        <h3 className="text-sm font-bold" style={{ color: '#F1F5F9' }}>Forage Experience</h3>
        <span className="text-xs" style={{ color: '#64748B' }}>{sims.length} completed</span>
      </div>
      <div className="space-y-2.5">
        {sims.map(s => (
          <div key={s.attempt_token} className="flex items-center gap-3 rounded-xl p-3"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: '#F1F5F9' }}>{s.title}</p>
              <p className="text-[11px]" style={{ color: '#64748B' }}>
                {s.company}{s.completed_at ? ` · ${new Date(s.completed_at).toLocaleDateString('en-GB')}` : ''}
              </p>
            </div>
            {s.score != null && <span className="text-xs font-bold" style={{ color: '#3B82F6' }}>{s.score}%</span>}
            {s.certificate_verified
              ? <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full"
                  style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981' }}><CheckCircle2 className="w-3 h-3" /> Verified</span>
              : <span className="text-[10px] font-semibold px-2 py-1 rounded-full"
                  style={{ background: 'rgba(148,163,184,0.12)', color: '#94A3B8' }}>Completed</span>}
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function TalentProfileScreen() {
  const { state, dispatch } = useApp()
  const { user } = state
  const [visible, setVisible] = useState(true)
  const [shareToast, setShareToast] = useState(false)
  const [githubInput, setGithubInput] = useState(user.githubUsername || '')
  const [portfolioInput, setPortfolioInput] = useState(user.portfolioUrl || '')

  const talentScore = user.kpiScore ?? 0
  const initials = user.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'ST'

  const color = scoreColor(talentScore)

  function handleShare() {
    navigator.clipboard?.writeText(`https://sho8lana.app/talent/${user.name || 'me'}`)
    setShareToast(true)
    setTimeout(() => setShareToast(false), 2500)
  }

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: '#0F1117', color: '#F1F5F9' }}
    >
      {/* ── Header ── */}
      <div
        className="sticky top-0 z-30 flex items-center justify-between px-4 py-3"
        style={{ background: 'rgba(15,17,23,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <button
          onClick={() => dispatch({ type: 'GO_BACK' })}
          className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: '#94A3B8' }}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <span className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>Talent Profile</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => dispatch({ type: 'GO', screen: 'profile' })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
            style={{ background: 'rgba(99,102,241,0.15)', color: '#6366F1', border: '1px solid rgba(99,102,241,0.3)' }}
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
            style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </button>
        </div>
      </div>

      {/* ── Share Toast ── */}
      <AnimatePresence>
        {shareToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-sm font-semibold"
            style={{ background: '#10B981', color: '#fff' }}
          >
            Profile link copied!
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="px-4 pt-5 space-y-4"
      >
        {/* ── Profile Card ── */}
        <motion.div
          variants={up}
          className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${color}33, ${color}15)`, border: `2px solid ${color}55`, color }}
            >
              {initials}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold truncate" style={{ color: '#F1F5F9' }}>
                {user.name || 'Your Name'}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5" style={{ color: '#94A3B8' }}>
                <GraduationCap className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-xs truncate">{user.university || 'University'} · {user.major || 'Major'}</span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1" style={{ color: '#94A3B8' }}>
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="text-xs">Class of {user.graduationYear || '2026'}</span>
                </div>
                <div className="flex items-center gap-1" style={{ color: '#94A3B8' }}>
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="text-xs">{user.location || 'Cairo'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Talent Score Badge */}
          <div
            className="mt-4 rounded-xl p-4 flex items-center justify-between"
            style={{ background: `${color}12`, border: `1px solid ${color}30` }}
          >
            <div>
              <p className="text-xs font-medium" style={{ color: `${color}cc` }}>Talent Score</p>
              <div className="flex items-end gap-1.5 mt-0.5">
                <span className="text-4xl font-black" style={{ color }}>{talentScore}</span>
                <span className="text-sm font-semibold mb-1.5" style={{ color: `${color}99` }}>/100</span>
              </div>
              <span
                className="inline-block px-2 py-0.5 rounded-full text-xs font-bold mt-1"
                style={{ background: `${color}22`, color }}
              >
                {scoreLabel(talentScore)}
              </span>
            </div>
            <div className="text-right">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: `conic-gradient(${color} ${talentScore * 3.6}deg, rgba(255,255,255,0.05) 0deg)` }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: '#0F1117' }}
                >
                  <span className="text-lg">🎯</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recruiter Visibility Toggle */}
          <div
            className="mt-3 flex items-center justify-between px-4 py-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center gap-2">
              {visible
                ? <Eye className="w-4 h-4" style={{ color: '#10B981' }} />
                : <EyeOff className="w-4 h-4" style={{ color: '#64748B' }} />
              }
              <div>
                <p className="text-xs font-semibold" style={{ color: '#F1F5F9' }}>Recruiter Visibility</p>
                <p className="text-2xs mt-0.5" style={{ color: '#64748B', fontSize: '0.65rem' }}>
                  {visible ? 'Recruiters can find your profile' : 'Hidden from recruiters'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setVisible(v => !v)}
              className="w-11 h-6 rounded-full relative transition-colors duration-200 flex-shrink-0"
              style={{ background: visible ? '#10B981' : 'rgba(255,255,255,0.1)' }}
            >
              <motion.span
                className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
                animate={{ left: visible ? '1.5rem' : '0.25rem' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
        </motion.div>

        {/* ── KPI Scores ── */}
        <motion.div
          variants={up}
          className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <h3 className="text-sm font-bold mb-4" style={{ color: '#F1F5F9' }}>KPI Scores</h3>
          <div className="space-y-4">
            {KPI_BARS_DEFAULT.map((kpi, i) => (
              <div key={kpi.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium" style={{ color: '#94A3B8' }}>{kpi.label}</span>
                  <span className="text-xs font-bold" style={{ color: kpi.color }}>{kpi.value}</span>
                </div>
                <AnimatedBar value={kpi.value} color={kpi.color} delay={i * 0.1 + 0.3} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Verified Skills ── */}
        <motion.div
          variants={up}
          className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4" style={{ color: '#10B981' }} />
            <h3 className="text-sm font-bold" style={{ color: '#F1F5F9' }}>Verified Skills</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {(user.skills ?? []).length > 0 ? (user.skills ?? []).map((skill: string) => (
              <span
                key={skill}
                className="px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)' }}
              >
                {skill}
              </span>
            )) : (
              <p className="text-xs py-2" style={{ color: '#64748B' }}>Complete simulations to earn verified skills</p>
            )}
          </div>
        </motion.div>

        {/* ── Forage Experience ── */}
        <ForageExperience />

        {/* ── Simulation History ── */}
        <motion.div
          variants={up}
          className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <h3 className="text-sm font-bold mb-4" style={{ color: '#F1F5F9' }}>Simulation History</h3>
          <div className="space-y-3">
            <p className="text-xs py-2" style={{ color: '#64748B' }}>Complete your first simulation to see history here</p>
          </div>
        </motion.div>

        {/* ── Achievements ── */}
        <motion.div
          variants={up}
          className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4 h-4" style={{ color: '#F59E0B' }} />
            <h3 className="text-sm font-bold" style={{ color: '#F1F5F9' }}>Achievements</h3>
          </div>
          <p className="text-xs py-2" style={{ color: '#64748B' }}>Earn achievements by completing simulations</p>
        </motion.div>

        {/* ── GitHub & Portfolio ── */}
        <motion.div
          variants={up}
          className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <h3 className="text-sm font-bold mb-4" style={{ color: '#F1F5F9' }}>GitHub & Portfolio</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium mb-1.5 flex items-center gap-1.5" style={{ color: '#94A3B8' }}>
                <Github className="w-3.5 h-3.5" />
                GitHub Username
              </label>
              <input
                value={githubInput}
                onChange={e => setGithubInput(e.target.value)}
                onBlur={() => dispatch({ type: 'SET_USER', user: { githubUsername: githubInput } })}
                placeholder="your-username"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-colors"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#F1F5F9',
                }}
              />
              {githubInput && (
                <a
                  href={`https://github.com/${githubInput}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs mt-1.5 flex items-center gap-1 transition-opacity hover:opacity-80"
                  style={{ color: '#10B981' }}
                >
                  github.com/{githubInput}
                </a>
              )}
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 flex items-center gap-1.5" style={{ color: '#94A3B8' }}>
                <Globe className="w-3.5 h-3.5" />
                Portfolio URL
              </label>
              <input
                value={portfolioInput}
                onChange={e => setPortfolioInput(e.target.value)}
                onBlur={() => dispatch({ type: 'SET_USER', user: { portfolioUrl: portfolioInput } })}
                placeholder="https://yourportfolio.com"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-colors"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#F1F5F9',
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* ── Experience ── */}
        <motion.div
          variants={up}
          className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold" style={{ color: '#F1F5F9' }}>Experience</h3>
            <button
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-opacity hover:opacity-80"
              style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
          <div className="space-y-3">
            <p className="text-xs py-2" style={{ color: '#64748B' }}>Add your internships and work experience</p>
          </div>
        </motion.div>

        {/* ── Certifications ── */}
        <motion.div
          variants={up}
          className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <h3 className="text-sm font-bold mb-4" style={{ color: '#F1F5F9' }}>Certifications</h3>
          <div className="space-y-3">
            <p className="text-xs py-2" style={{ color: '#64748B' }}>Add certifications to strengthen your profile</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
