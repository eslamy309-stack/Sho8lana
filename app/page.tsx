'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Loader2, ArrowRight, Zap,
  Building2, Users, BarChart3, Brain, Shield,
  Cpu, TrendingUp, Star, Search, GitBranch,
  Award, Target, MessageSquare, Briefcase,
} from 'lucide-react'
import { AppShell } from '@/components/app/Shell'

/* ── Motion helpers ── */
const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 },
  }),
}

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08 } },
}

/* ── Employer Dashboard Mockup ── */
function EmployerMockup() {
  const bars = [82, 67, 91, 74, 88, 55]
  return (
    <div className="relative w-full h-full flex items-center justify-center select-none pointer-events-none">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-80 h-80 rounded-full bg-indigo-600/10 blur-3xl" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        className="relative rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
        style={{ background: '#0F1117', width: 280, minHeight: 320 }}
      >
        {/* Header */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>HR Dashboard</span>
            <span style={{ fontSize: 8, fontWeight: 600, color: '#818CF8', background: 'rgba(99,102,241,0.15)', padding: '2px 8px', borderRadius: 20 }}>Live</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { label: 'Pipeline', value: '247', color: '#818CF8' },
              { label: 'Hired', value: '18', color: '#34D399' },
              { label: 'Avg Score', value: '84', color: '#F59E0B' },
            ].map(s => (
              <div key={s.label} style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '6px 8px' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Talent KPI chart */}
        <div style={{ padding: '10px 16px' }}>
          <div style={{ fontSize: 8, fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Top Candidates · KPI Score</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 48 }}>
            {bars.map((h, i) => (
              <motion.div key={i}
                initial={{ height: 0 }} animate={{ height: `${h}%` }}
                transition={{ delay: 0.5 + i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{ flex: 1, borderRadius: 3, background: i === 2 ? '#818CF8' : 'rgba(99,102,241,0.3)', alignSelf: 'flex-end' }}
              />
            ))}
          </div>
        </div>

        {/* Pipeline stages */}
        <div style={{ padding: '8px 16px 14px' }}>
          <div style={{ fontSize: 8, fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Pipeline Stages</div>
          {[
            { stage: 'Screening',  count: 48, color: '#60A5FA', w: 80 },
            { stage: 'Interview',  count: 31, color: '#F59E0B', w: 55 },
            { stage: 'Offer',      count: 12, color: '#34D399', w: 28 },
          ].map(p => (
            <div key={p.stage} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)', width: 50, flexShrink: 0 }}>{p.stage}</span>
              <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${p.w}%` }}
                  transition={{ delay: 0.9, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  style={{ height: '100%', borderRadius: 3, background: p.color }}
                />
              </div>
              <span style={{ fontSize: 8, color: p.color, fontWeight: 700, width: 20, textAlign: 'right' }}>{p.count}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Floating: AI Insight */}
      <motion.div
        style={{ position: 'absolute', top: '8%', right: '2%' }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
        transition={{ opacity: { delay: 1.1, duration: 0.4 }, scale: { delay: 1.1, duration: 0.4 }, y: { delay: 1.5, duration: 2.8, repeat: Infinity, ease: 'easeInOut' } }}
      >
        <div style={{ background: 'rgba(15,17,23,0.9)', backdropFilter: 'blur(12px)', borderRadius: 12, padding: '8px 12px', border: '1px solid rgba(99,102,241,0.3)' }}>
          <div style={{ fontSize: 8, color: '#818CF8', fontWeight: 600 }}>✦ AI Match</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'white', lineHeight: 1.1 }}>94%</div>
          <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>Gold Tier</div>
        </div>
      </motion.div>

      {/* Floating: New applicant */}
      <motion.div
        style={{ position: 'absolute', bottom: '10%', left: '0%' }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.3, duration: 0.5 }}
      >
        <div style={{ background: 'rgba(15,17,23,0.9)', backdropFilter: 'blur(12px)', borderRadius: 12, padding: '8px 12px', border: '1px solid rgba(52,211,153,0.3)' }}>
          <div style={{ fontSize: 7, color: '#34D399', fontWeight: 600 }}>● New Application</div>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'white', marginTop: 2 }}>Omar H. — AUC</div>
          <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)' }}>KPI 91 · Platinum</div>
        </div>
      </motion.div>
    </div>
  )
}

/* ── Student App Mockup ── */
function StudentMockup() {
  return (
    <div className="relative w-full h-full flex items-center justify-center select-none pointer-events-none">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-72 h-72 rounded-full bg-emerald-600/10 blur-3xl" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        className="relative rounded-[28px] border border-white/10 overflow-hidden shadow-2xl"
        style={{ background: '#F8FAFC', width: 200, height: 380 }}
      >
        {/* Status bar */}
        <div style={{ height: 18, background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px' }}>
          <span style={{ fontSize: 7, color: '#64748B' }}>9:41</span>
          <div style={{ width: 36, height: 6, borderRadius: 3, background: '#1E293B' }} />
          <span style={{ fontSize: 7, color: '#64748B' }}>●●●</span>
        </div>

        {/* Profile strip */}
        <div style={{ background: 'linear-gradient(135deg, #0F172A, #064E3B)', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 9, background: 'rgba(52,211,153,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>👤</div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'white' }}>Sara M.</div>
            <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.5)' }}>Gold · 1,840 XP</div>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 7, fontWeight: 700, color: '#34D399', background: 'rgba(52,211,153,0.15)', padding: '2px 7px', borderRadius: 8 }}>#12</div>
        </div>

        {/* KPI bars */}
        <div style={{ padding: '8px 12px' }}>
          <div style={{ fontSize: 7, fontWeight: 600, color: '#94A3B8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>KPI Profile</div>
          {[
            { label: 'Leadership',   val: 88, color: '#6366F1' },
            { label: 'Analytical',   val: 74, color: '#F59E0B' },
            { label: 'Comm.',        val: 92, color: '#34D399' },
          ].map(k => (
            <div key={k.label} style={{ marginBottom: 5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontSize: 7, color: '#64748B' }}>{k.label}</span>
                <span style={{ fontSize: 7, fontWeight: 700, color: k.color }}>{k.val}</span>
              </div>
              <div style={{ height: 4, background: '#F1F5F9', borderRadius: 2 }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${k.val}%` }}
                  transition={{ delay: 0.7, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  style={{ height: '100%', borderRadius: 2, background: k.color }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Job card */}
        <div style={{ padding: '0 12px 8px' }}>
          <div style={{ background: 'white', borderRadius: 10, padding: '8px 10px', border: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 24, height: 24, borderRadius: 7, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>💼</div>
              <div>
                <div style={{ fontSize: 8, fontWeight: 700, color: '#0F172A' }}>Marketing Intern</div>
                <div style={{ fontSize: 7, color: '#94A3B8' }}>Vodafone Egypt</div>
              </div>
              <div style={{ marginLeft: 'auto', fontSize: 7, fontWeight: 600, color: '#059669', background: '#ECFDF5', padding: '2px 6px', borderRadius: 5 }}>Match 91%</div>
            </div>
          </div>
        </div>

        {/* Sim badge */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          style={{ margin: '0 12px', borderRadius: 10, padding: '7px 10px', background: 'linear-gradient(135deg, #0F172A, #065F46)', display: 'flex', alignItems: 'center', gap: 7 }}
        >
          <span style={{ fontSize: 14 }}>🏆</span>
          <div>
            <div style={{ fontSize: 8, fontWeight: 700, color: 'white' }}>Sim Completed</div>
            <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.5)' }}>+120 XP earned</div>
          </div>
        </motion.div>

        {/* Bottom nav */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'white', borderTop: '1px solid #F1F5F9', padding: '5px 0 8px', display: 'flex', justifyContent: 'space-around' }}>
          {['🏠', '📋', '🎯', '🤖', '👤'].map((icon, i) => (
            <span key={i} style={{ fontSize: 13, opacity: i === 0 ? 1 : 0.22 }}>{icon}</span>
          ))}
        </div>
      </motion.div>

      {/* Floating badge */}
      <motion.div
        style={{ position: 'absolute', top: '12%', right: '0%' }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
        transition={{ opacity: { delay: 1.2, duration: 0.4 }, scale: { delay: 1.2, duration: 0.4 }, y: { delay: 1.5, duration: 2.6, repeat: Infinity, ease: 'easeInOut' } }}
      >
        <div style={{ background: 'rgba(15,17,23,0.9)', backdropFilter: 'blur(12px)', borderRadius: 12, padding: '8px 12px', border: '1px solid rgba(52,211,153,0.3)' }}>
          <div style={{ fontSize: 8, color: '#34D399', fontWeight: 600 }}>Leaderboard</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'white', lineHeight: 1.1 }}>#12</div>
        </div>
      </motion.div>
    </div>
  )
}

/* ── Company Feature Card ── */
function CompanyFeature({ icon: Icon, title, body, color }: {
  icon: React.ElementType; title: string; body: string; color: string
}) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
      className="p-5 rounded-2xl border transition-colors duration-200 group"
      style={{ background: 'rgba(99,102,241,0.04)', borderColor: 'rgba(99,102,241,0.12)' }}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
           style={{ background: `${color}18` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <h3 className="text-sm font-semibold text-white mb-1.5">{title}</h3>
      <p className="text-xs text-neutral-500 leading-relaxed">{body}</p>
    </motion.div>
  )
}

/* ── Student Feature Card ── */
function StudentFeature({ icon: Icon, title, body, color }: {
  icon: React.ElementType; title: string; body: string; color: string
}) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
      className="p-5 rounded-2xl border transition-colors duration-200"
      style={{ background: 'rgba(52,211,153,0.04)', borderColor: 'rgba(52,211,153,0.12)' }}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
           style={{ background: `${color}18` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <h3 className="text-sm font-semibold text-white mb-1.5">{title}</h3>
      <p className="text-xs text-neutral-500 leading-relaxed">{body}</p>
    </motion.div>
  )
}

/* ── Role Card ── */
function RoleCard({
  role, icon: Icon, accent, label, sublabel, features, cta, onClick, loading,
}: {
  role: string; icon: React.ElementType; accent: string; label: string
  sublabel: string; features: string[]; cta: string; onClick: () => void; loading: boolean
}) {
  return (
    <motion.button
      variants={fadeUp}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={loading}
      className="relative flex flex-col items-start text-left w-full rounded-3xl p-7 border overflow-hidden transition-all duration-200 group"
      style={{ background: `${accent}08`, borderColor: `${accent}25` }}
    >
      {/* Glow bg */}
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-opacity duration-300 group-hover:opacity-100 opacity-60"
           style={{ background: `${accent}20` }} />

      <div className="relative z-10 w-full">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
             style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}>
          {loading
            ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: accent }} />
            : <Icon className="w-5 h-5" style={{ color: accent }} />}
        </div>

        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: accent }}>{role}</p>
        <h3 className="text-xl font-bold text-white mb-2">{label}</h3>
        <p className="text-sm text-neutral-400 mb-5 leading-relaxed">{sublabel}</p>

        <ul className="space-y-2 mb-6">
          {features.map(f => (
            <li key={f} className="flex items-center gap-2.5 text-xs text-neutral-300">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: accent }} />
              {f}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: accent }}>
          {cta} <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
        </div>
      </div>
    </motion.button>
  )
}

/* ── Main page ── */
export default function LandingPage() {
  const [appOpen, setAppOpen]     = useState(false)
  const [launching, setLaunching] = useState<string | null>(null)
  const launchTimer               = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const search = window.location.search
    const hash   = window.location.hash
    const isOAuthCallback =
      search.includes('auth=1') ||
      search.includes('code=')  ||
      hash.includes('access_token=') ||
      hash.includes('error=')

    if (isOAuthCallback) {
      window.history.replaceState({}, document.title, window.location.pathname)
      setAppOpen(true)
    }
  }, [])

  const openApp = useCallback((role: 'employer' | 'student') => {
    if (appOpen || launching) return
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('sho8_role_hint', role)
    }
    setLaunching(role)
    launchTimer.current = setTimeout(() => {
      setLaunching(null)
      setAppOpen(true)
    }, 400)
  }, [appOpen, launching])

  function closeApp() { setAppOpen(false) }

  return (
    <>
      {/* ─── BG ─── */}
      <div className="fixed inset-0 bg-[#080810] pointer-events-none" aria-hidden>
        <div className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[120px]"
             style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />
      </div>

      {/* ─── NAV ─── */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 pt-7 max-w-[1280px] mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-white text-base tracking-tight">Sho8lana</span>
          <span className="text-neutral-600 text-sm hidden sm:block">شغلانة</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => openApp('student')}
            disabled={!!launching || appOpen}
            className="text-sm text-neutral-400 hover:text-white transition-colors duration-150 px-3 py-1.5"
          >
            Sign in
          </button>
          <button
            onClick={() => openApp('employer')}
            disabled={!!launching || appOpen}
            className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition-colors duration-150 flex items-center gap-2"
          >
            {launching === 'employer'
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Opening…</>
              : <>For Companies <ArrowRight className="w-3.5 h-3.5" /></>}
          </button>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative z-10 pt-20 pb-16 px-6 md:px-12 max-w-[1280px] mx-auto">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="text-center max-w-3xl mx-auto"
        >
          <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 mb-6">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest bg-indigo-600/10 border border-indigo-600/20 px-3 py-1.5 rounded-full flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Egypt&apos;s HR Intelligence Platform
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp} custom={1}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.08] tracking-tight text-balance mb-6"
          >
            Where top talent{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-300">
              meets great companies
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp} custom={2}
            className="text-lg text-neutral-400 leading-relaxed max-w-2xl mx-auto mb-10"
          >
            Sho8lana connects Egyptian companies to simulation-verified, KPI-scored graduates —
            and gives students the tools to prove their real-world readiness.
          </motion.p>

          {/* Role cards */}
          <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <RoleCard
              role="Companies"
              icon={Building2}
              accent="#6366F1"
              label="Hire smarter, faster"
              sublabel="Access a verified talent pool ranked by real KPI performance — not just CVs."
              features={[
                'AI-powered candidate matching',
                'Simulation performance data',
                'Recruitment pipeline management',
                'Behavioral intelligence reports',
              ]}
              cta="Open HR Dashboard"
              onClick={() => openApp('employer')}
              loading={launching === 'employer'}
            />
            <RoleCard
              role="Students"
              icon={Users}
              accent="#34D399"
              label="Launch your career"
              sublabel="Build a KPI profile through real simulations and get discovered by top employers."
              features={[
                'Real business simulations',
                'Live national leaderboard',
                'AI career coaching',
                '1-tap job applications',
              ]}
              cta="Start for free"
              onClick={() => openApp('student')}
              loading={launching === 'student'}
            />
          </motion.div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="flex justify-center gap-12 mt-16 pt-12 border-t border-white/5"
        >
          {[
            { v: '500+',   l: 'Partner companies' },
            { v: '50K+',   l: 'Active students' },
            { v: '214K+',  l: 'Graduates / year' },
            { v: '4.9★',   l: 'Student rating' },
          ].map(s => (
            <motion.div key={s.l} variants={fadeUp} className="text-center">
              <p className="text-2xl font-bold text-white">{s.v}</p>
              <p className="text-xs text-neutral-500 mt-1">{s.l}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── COMPANY SECTION ─── */}
      <section className="relative z-10 py-24 px-6 md:px-12">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
            {/* Text */}
            <motion.div
              initial="hidden" whileInView="visible"
              viewport={{ once: true, amount: 0.3 }} variants={stagger}
            >
              <motion.p variants={fadeUp} className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">
                For Companies &amp; Employers
              </motion.p>
              <motion.h2 variants={fadeUp} className="text-4xl font-bold text-white leading-tight mb-5 text-balance">
                Enterprise-grade HR Intelligence
              </motion.h2>
              <motion.p variants={fadeUp} className="text-neutral-400 leading-relaxed mb-8">
                Go beyond CVs. Every candidate on Sho8lana has completed real business simulations
                and carries a verified KPI score — so you interview people who can actually do the work.
              </motion.p>
              <motion.button
                variants={fadeUp}
                onClick={() => openApp('employer')}
                disabled={!!launching || appOpen}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-colors duration-150"
              >
                {launching === 'employer'
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Opening…</>
                  : <>Open HR Dashboard <ArrowRight className="w-4 h-4" /></>}
              </motion.button>
            </motion.div>

            {/* Mockup */}
            <div className="relative h-80 lg:h-96">
              <EmployerMockup />
            </div>
          </div>

          {/* Feature grid */}
          <motion.div
            initial="hidden" whileInView="visible"
            viewport={{ once: true, amount: 0.2 }} variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
          >
            <CompanyFeature icon={Search}    color="#818CF8" title="Talent Discovery"         body="Filter 50,000+ students by KPI tier, simulation track, university, GPA, and more. Build shortlists in seconds." />
            <CompanyFeature icon={BarChart3}  color="#6366F1" title="Performance Intelligence" body="See each candidate's KPI breakdown across leadership, analytical, communication, and cognitive dimensions." />
            <CompanyFeature icon={GitBranch}  color="#A5B4FC" title="Recruitment Pipeline"    body="Manage candidates through sourcing → screening → assessment → interview → offer → hired in a unified view." />
            <CompanyFeature icon={Brain}      color="#818CF8" title="AI Candidate Insights"   body="AI-generated summaries, readiness scores, and behavioral profiles for each candidate — no manual work." />
            <CompanyFeature icon={Cpu}        color="#6366F1" title="Simulation Integration"  body="Launch custom simulations tailored to your open roles. Candidates complete them before the first interview." />
            <CompanyFeature icon={Shield}     color="#A5B4FC" title="Verified Data Only"      body="Every KPI score is earned through completed simulations — not self-reported skills or keyword stuffing." />
          </motion.div>
        </div>
      </section>

      {/* ─── DIVIDER ─── */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-6 md:px-12">
        <div className="h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      </div>

      {/* ─── STUDENT SECTION ─── */}
      <section className="relative z-10 py-24 px-6 md:px-12">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
            {/* Mockup first on mobile, right on desktop */}
            <div className="relative h-72 lg:h-[360px] order-2 lg:order-1">
              <StudentMockup />
            </div>

            {/* Text */}
            <motion.div
              initial="hidden" whileInView="visible"
              viewport={{ once: true, amount: 0.3 }} variants={stagger}
              className="order-1 lg:order-2"
            >
              <motion.p variants={fadeUp} className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-3">
                For Students &amp; Graduates
              </motion.p>
              <motion.h2 variants={fadeUp} className="text-4xl font-bold text-white leading-tight mb-5 text-balance">
                Prove your skills, get hired
              </motion.h2>
              <motion.p variants={fadeUp} className="text-neutral-400 leading-relaxed mb-8">
                Complete real business simulations, earn XP, climb the national leaderboard, and build
                a KPI profile that employers can see. Apply to Egypt&apos;s top internships with one tap.
              </motion.p>
              <motion.button
                variants={fadeUp}
                onClick={() => openApp('student')}
                disabled={!!launching || appOpen}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-colors duration-150"
              >
                {launching === 'student'
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Opening…</>
                  : <>Start for free <ArrowRight className="w-4 h-4" /></>}
              </motion.button>
            </motion.div>
          </div>

          {/* Feature grid */}
          <motion.div
            initial="hidden" whileInView="visible"
            viewport={{ once: true, amount: 0.2 }} variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
          >
            <StudentFeature icon={Target}       color="#34D399" title="Real Simulations"   body="Work through marketing campaigns, finance cases, and operations tasks used by real Egyptian companies." />
            <StudentFeature icon={TrendingUp}   color="#10B981" title="National Leaderboard" body="Compete with 50,000+ students across Egypt. Your rank is visible to hiring managers on every company portal." />
            <StudentFeature icon={BarChart3}    color="#34D399" title="KPI Profile"         body="Every simulation you complete adds data to your KPI profile — leadership, analytical, communication, cognitive." />
            <StudentFeature icon={Award}        color="#10B981" title="XP &amp; Badges"    body="Earn XP for every task, unlock badges for track mastery, and advance from Bronze to Platinum tier." />
            <StudentFeature icon={Brain}        color="#34D399" title="AI Career Coach"     body="Ask anything about Egyptian companies, interview prep, CV writing, or career paths. Full Arabic support." />
            <StudentFeature icon={Briefcase}    color="#10B981" title="1-Tap Applications"  body="Set up your profile once — upload documents, build your KPI profile — then apply to any internship instantly." />
          </motion.div>
        </div>
      </section>

      {/* ─── INTEGRATIONS ─── */}
      <section className="relative z-10 py-20 px-6 md:px-12 border-t border-white/5">
        <motion.div
          className="max-w-[1280px] mx-auto text-center"
          initial="hidden" whileInView="visible"
          viewport={{ once: true, amount: 0.3 }} variants={stagger}
        >
          <motion.p variants={fadeUp} className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-3">
            Integrations
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-3xl font-bold text-white mb-3">
            Works with your existing HR stack
          </motion.h2>
          <motion.p variants={fadeUp} className="text-neutral-500 text-sm mb-10">
            Sync candidates and pipeline data with the tools your HR team already uses.
          </motion.p>

          <motion.div variants={stagger} className="flex flex-wrap justify-center gap-3 mb-12">
            {['Workday', 'Greenhouse', 'LinkedIn', 'SAP HCM', 'BambooHR', 'Lever', 'Custom API'].map(name => (
              <motion.span
                key={name}
                variants={fadeUp}
                className="px-4 py-2 rounded-full border border-white/10 text-sm text-neutral-400 bg-white/3 hover:border-white/20 hover:text-white transition-colors duration-150 cursor-default"
              >
                {name}
              </motion.span>
            ))}
          </motion.div>

          {/* API snippet */}
          <motion.div variants={fadeUp} className="max-w-lg mx-auto text-left">
            <div className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: '#0D0F18' }}>
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/6">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                <span className="text-neutral-600 text-xs ml-2 font-mono">sho8lana-api</span>
              </div>
              <pre className="text-xs font-mono px-5 py-4 text-neutral-400 leading-relaxed overflow-x-auto">
{`GET /api/v1/candidates?tier=gold&kpi_min=80

{
  "candidates": [
    {
      "id": "usr_abc123",
      "name": "Omar Hassan",
      "university": "AUC",
      "kpi_score": 91,
      "tier": "gold",
      "top_track": "Business Analysis"
    }
  ],
  "total": 1204
}`}
              </pre>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── DUAL CTA ─── */}
      <section className="relative z-10 py-24 px-6 md:px-12 border-t border-white/5">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Employer CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-3xl p-8 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0.05) 100%)', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl pointer-events-none"
                 style={{ background: 'rgba(99,102,241,0.12)' }} />
            <div className="relative z-10">
              <div className="w-11 h-11 rounded-2xl bg-indigo-600/20 border border-indigo-600/30 flex items-center justify-center mb-5">
                <Building2 className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Hire with confidence</h3>
              <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                Access 50,000+ simulation-verified candidates. Your next great hire has already proven their skills.
              </p>
              <button
                onClick={() => openApp('employer')}
                disabled={!!launching || appOpen}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-colors duration-150"
              >
                {launching === 'employer'
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Opening…</>
                  : <>Open HR Dashboard <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </motion.div>

          {/* Student CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="relative rounded-3xl p-8 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(52,211,153,0.12) 0%, rgba(52,211,153,0.04) 100%)', border: '1px solid rgba(52,211,153,0.2)' }}
          >
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl pointer-events-none"
                 style={{ background: 'rgba(52,211,153,0.1)' }} />
            <div className="relative z-10">
              <div className="w-11 h-11 rounded-2xl bg-emerald-600/20 border border-emerald-600/30 flex items-center justify-center mb-5">
                <Star className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Stand out to employers</h3>
              <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                Build your KPI profile through real simulations. Get discovered. Land your first great role.
              </p>
              <button
                onClick={() => openApp('student')}
                disabled={!!launching || appOpen}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-colors duration-150"
              >
                {launching === 'student'
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Opening…</>
                  : <>Start for free <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }} transition={{ delay: 0.3 }}
          className="text-center text-xs text-neutral-600 mt-10"
        >
          Free for students · Enterprise plans for companies · Trusted by 500+ Egyptian employers
        </motion.p>
      </section>

      {/* ─── APP OVERLAY ─── */}
      <AnimatePresence>
        {appOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
              onClick={closeApp}
            />
            <motion.div
              className="relative z-10 w-full max-w-app h-dvh md:h-[min(900px,90vh)] md:rounded-3xl overflow-hidden shadow-2xl"
              initial={{ scale: 0.94, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 16 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <button
                onClick={closeApp}
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm
                           flex items-center justify-center text-white/70 hover:text-white
                           hover:bg-black/70 transition-colors duration-150"
              >
                <X className="w-4 h-4" />
              </button>
              <AppShell />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
