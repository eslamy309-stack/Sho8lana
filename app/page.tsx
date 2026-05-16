'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Rocket, ChevronDown, Zap, Brain, BarChart2, ArrowRight, X } from 'lucide-react'

import { Spotlight, SvgSpotlight } from '@/components/ui/spotlight'
import { ActionSearchBar } from '@/components/ui/action-search-bar'
import SectionWithMockup from '@/components/blocks/section-with-mockup'
import { Button } from '@/components/ui/button'
import { AppShell } from '@/components/app/Shell'

/* ── Motion helpers ── */
const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.12 },
  }),
}

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1 } },
}

/* ── Hero phone mockup ── */
function HeroPhone() {
  const jobs = [
    { logo: '🔴', company: 'Vodafone Egypt', title: 'Marketing Intern',  salary: 'EGP 5K',  color: '#E60000' },
    { logo: '📊', company: 'McKinsey Cairo',  title: 'Business Analyst', salary: 'EGP 10K', color: '#00205B' },
    { logo: '💻', company: 'Microsoft Egypt', title: 'Software Intern',  salary: 'EGP 8K',  color: '#00A4EF' },
  ]

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none pointer-events-none">
      {/* Glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-72 h-72 rounded-full bg-brand-600/15 blur-3xl" />
      </div>

      {/* Phone frame */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
        className="relative rounded-[32px] border border-white/10 overflow-hidden shadow-2xl"
        style={{ background: '#F8FAFC', width: 220, height: 440 }}
      >
        {/* Status bar */}
        <div style={{ height: 20, background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
          <span style={{ fontSize: 8, color: '#64748B' }}>9:41</span>
          <div style={{ width: 48, height: 8, borderRadius: 4, background: '#1E293B' }} />
          <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <div style={{ width: 8, height: 6, borderRadius: 2, background: '#334155' }} />
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#334155' }} />
          </div>
        </div>

        {/* App header */}
        <div style={{ background: 'white', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 20, height: 20, borderRadius: 6, background: '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 10, color: 'white' }}>⚡</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#0F172A' }}>Sho8lana</span>
          </div>
          <span style={{ fontSize: 8, fontWeight: 600, color: '#0D9488', background: '#F0FDFA', padding: '2px 6px', borderRadius: 8 }}>Live</span>
        </div>

        {/* Search bar */}
        <div style={{ padding: '8px 12px 4px' }}>
          <div style={{ height: 26, background: 'white', border: '1px solid #E2E8F0', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#CBD5E1' }} />
            <div style={{ height: 5, flex: 1, borderRadius: 4, background: '#F1F5F9' }} />
          </div>
        </div>

        {/* Job cards */}
        <div style={{ padding: '4px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {jobs.map((job, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.14, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ background: 'white', borderRadius: 10, padding: '7px 9px', border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 7 }}
            >
              <div style={{ width: 26, height: 26, borderRadius: 7, background: `${job.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>
                {job.logo}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#0F172A' }}>{job.title}</div>
                <div style={{ fontSize: 8, color: '#94A3B8', marginTop: 1 }}>{job.company}</div>
              </div>
              <div style={{ fontSize: 8, fontWeight: 600, color: '#B45309', background: '#FFFBEB', padding: '2px 5px', borderRadius: 5, flexShrink: 0 }}>{job.salary}</div>
            </motion.div>
          ))}
        </div>

        {/* XP Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          style={{ margin: '6px 12px 0', borderRadius: 10, padding: '8px 10px', background: 'linear-gradient(135deg, #0F172A, #0F766E)', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <div style={{ width: 24, height: 24, borderRadius: 7, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>🏆</div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'white' }}>Campaign Strategist</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)', marginTop: 1 }}>+120 XP earned</div>
          </div>
        </motion.div>

        {/* Bottom nav bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'white', borderTop: '1px solid #F1F5F9', padding: '6px 0 10px', display: 'flex', justifyContent: 'space-around' }}>
          {['🏠', '📋', '🎯', '🤖', '👤'].map((icon, i) => (
            <span key={i} style={{ fontSize: 14, opacity: i === 0 ? 1 : 0.25 }}>{icon}</span>
          ))}
        </div>
      </motion.div>

      {/* Floating: AI Match */}
      <motion.div
        style={{ position: 'absolute', top: '10%', right: '4%' }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
        transition={{ opacity: { delay: 1.0, duration: 0.5 }, scale: { delay: 1.0, duration: 0.5 }, y: { delay: 1.5, duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
      >
        <div style={{ background: 'white', borderRadius: 12, padding: '8px 12px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', border: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: 9, color: '#7C3AED', fontWeight: 600 }}>✦ AI Match</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#7C3AED', lineHeight: 1.1 }}>87%</div>
        </div>
      </motion.div>

      {/* Floating: Applications */}
      <motion.div
        style={{ position: 'absolute', bottom: '20%', left: '2%' }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1, y: [0, 8, 0] }}
        transition={{ opacity: { delay: 1.2, duration: 0.5 }, scale: { delay: 1.2, duration: 0.5 }, y: { delay: 1.5, duration: 2.8, repeat: Infinity, ease: 'easeInOut' } }}
      >
        <div style={{ background: 'white', borderRadius: 12, padding: '8px 12px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', border: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: 9, color: '#64748B' }}>Applications</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0D9488', lineHeight: 1.2 }}>2,400+</div>
        </div>
      </motion.div>
    </div>
  )
}

/* ── Stat pill ── */
function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <motion.div variants={fadeUp} className="text-center">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-neutral-400 mt-0.5">{label}</p>
    </motion.div>
  )
}

/* ── Feature card ── */
function FeatureCard({ icon: Icon, title, body, color }: {
  icon: React.ElementType; title: string; body: string; color: string
}) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors duration-200"
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
           style={{ background: `${color}20` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-neutral-400 leading-relaxed">{body}</p>
    </motion.div>
  )
}

/* ── Main page ── */
export default function LandingPage() {
  const [appOpen, setAppOpen] = useState(false)

  function scrollToFeatures() {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      {/* ════════════════ HERO ════════════════ */}
      <section className="relative min-h-dvh bg-neutral-950 overflow-hidden flex flex-col">
        <SvgSpotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />

        {/* Nav */}
        <nav className="relative z-20 flex items-center justify-between px-6 md:px-10 pt-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-serif text-lg text-white">Sho8lana</span>
            <span className="font-arabic text-sm text-neutral-400 hidden sm:block">شغلانة</span>
          </div>
          <Button variant="ghost-dark" size="sm" onClick={() => setAppOpen(true)}>
            Open App
          </Button>
        </nav>

        {/* Hero content + Phone mockup */}
        <div className="relative z-10 flex flex-1 flex-col md:flex-row items-center px-6 md:px-10 py-12 gap-8 max-w-[1220px] mx-auto w-full">
          {/* Left: text */}
          <motion.div
            className="flex-1 flex flex-col gap-6 max-w-[560px]"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeUp} custom={0}>
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-brand-400 uppercase tracking-widest
                               bg-brand-600/10 border border-brand-600/20 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                Egypt&apos;s #1 Student Career Platform
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp} custom={1}
              className="font-serif text-5xl md:text-6xl text-white leading-tight text-balance"
            >
              Your first career step{' '}
              <span className="gradient-text bg-gradient-to-r from-brand-400 to-brand-200">
                starts here.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp} custom={2}
              className="text-base text-neutral-400 leading-relaxed max-w-[480px]"
            >
              Find internships at Egypt&apos;s top companies, practice real business tasks,
              and get AI-powered career coaching — all in one place.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => setAppOpen(true)} size="lg" className="gap-2">
                <Rocket className="w-4 h-4" /> Get Started
              </Button>
              <Button variant="ghost-dark" size="lg" onClick={scrollToFeatures} className="gap-2">
                Browse internships <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>

            <motion.div variants={stagger} className="flex gap-8 pt-2">
              <StatPill value="214K+" label="Graduates/yr" />
              <StatPill value="500+"  label="Companies" />
              <StatPill value="1-Tap" label="Apply" />
            </motion.div>
          </motion.div>

          {/* Right: Phone mockup */}
          <motion.div
            className="flex-1 relative w-full h-[420px] md:h-[520px]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          >
            <Spotlight size={300} className="from-brand-400/20 via-brand-300/10" />
            <HeroPhone />
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="relative z-10 flex justify-center pb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <motion.button
            onClick={scrollToFeatures}
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            <ChevronDown className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </section>

      {/* ════════════════ ACTION SEARCH ════════════════ */}
      <section className="bg-neutral-950 py-16 px-6">
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={stagger}
        >
          <motion.p variants={fadeUp} className="text-2xs text-brand-400 font-semibold uppercase tracking-widest mb-3">
            Search Internships
          </motion.p>
          <motion.h2 variants={fadeUp} className="font-serif text-3xl text-white mb-4 text-balance">
            Find your perfect match in seconds
          </motion.h2>
          <motion.p variants={fadeUp} className="text-sm text-neutral-400 mb-8">
            Search by role, company, skill, or location across Egypt&apos;s top employers.
          </motion.p>
          <motion.div variants={fadeUp}>
            <ActionSearchBar
              onSelect={() => setAppOpen(true)}
              placeholder="Try: Marketing Intern, Python, McKinsey…"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════════ FEATURES GRID ════════════════ */}
      <section id="features" className="bg-neutral-950 py-16 px-6">
        <motion.div
          className="max-w-[1220px] mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="text-center mb-12">
            <p className="text-2xs text-brand-400 font-semibold uppercase tracking-widest mb-3">
              Everything you need
            </p>
            <h2 className="font-serif text-4xl text-white text-balance">
              Built for the Egyptian job market
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <FeatureCard icon={Zap}      color="#0D9488" title="1-Tap Applications"    body="Upload your documents once and apply to any internship with a single tap. Your CV is auto-attached." />
            <FeatureCard icon={Brain}    color="#8B5CF6" title="AI Career Coaching"    body="Get personalized interview prep, CV tips, and career advice from your Gemini-powered career assistant." />
            <FeatureCard icon={BarChart2} color="#F59E0B" title="Business Simulations" body="Practice real tasks — marketing campaigns, budget analysis, operations — and earn XP and badges." />
          </div>
        </motion.div>
      </section>

      {/* ════════════════ SECTION WITH MOCKUP — Feature 1 ════════════════ */}
      <SectionWithMockup
        eyebrow="Internship Discovery"
        title={<>Find internships at<br />Egypt&apos;s best companies</>}
        description="Browse real, verified internships at Vodafone, CIB, P&G, Microsoft Egypt, McKinsey, and more. Filter by location, industry, and salary. Apply in one tap once your profile is set up."
        primaryImageSrc="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=1000&fit=crop"
        secondaryImageSrc="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=1000&fit=crop"
        accentColor="#0D9488"
      />

      {/* ════════════════ SECTION WITH MOCKUP — Feature 2 (reversed) ════════════════ */}
      <SectionWithMockup
        eyebrow="Business Simulations"
        title={<>Practice real tasks<br />before your first day</>}
        description="Work through marketing campaigns, budget variance analysis, warehouse optimization, and partnership proposals. Get AI feedback on your answers and build the skills employers actually want."
        primaryImageSrc="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=1000&fit=crop"
        secondaryImageSrc="https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=800&h=1000&fit=crop"
        reverseLayout
        accentColor="#8B5CF6"
      />

      {/* ════════════════ SECTION WITH MOCKUP — Feature 3 ════════════════ */}
      <SectionWithMockup
        eyebrow="AI Career Assistant"
        title={<>Your personal career<br />advisor, always on</>}
        description="Ask anything — how to prep for CIB interviews, what skills McKinsey looks for, how to write a cover letter for P&G. Powered by Gemini AI with full Arabic support."
        primaryImageSrc="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&h=1000&fit=crop"
        secondaryImageSrc="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=1000&fit=crop"
        accentColor="#F59E0B"
      />

      {/* ════════════════ CTA FOOTER ════════════════ */}
      <section className="bg-neutral-950 py-24 px-6 text-center border-t border-white/5">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={stagger}
          className="max-w-xl mx-auto"
        >
          <motion.h2 variants={fadeUp} className="font-serif text-4xl text-white mb-4">
            Start your career journey today.
          </motion.h2>
          <motion.p variants={fadeUp} className="text-neutral-400 mb-8">
            Free for all Egyptian university students. No experience required.
          </motion.p>
          <motion.div variants={fadeUp}>
            <Button size="xl" onClick={() => setAppOpen(true)} className="gap-2 mx-auto">
              <Rocket className="w-5 h-5" /> Launch Sho8lana
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════════ APP OVERLAY ════════════════ */}
      <AnimatePresence>
        {appOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setAppOpen(false)}
            />
            <motion.div
              className="relative z-10 w-full max-w-app h-dvh md:h-[min(900px,90vh)] md:rounded-3xl
                         overflow-hidden shadow-2xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <button
                onClick={() => setAppOpen(false)}
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm
                           flex items-center justify-center text-white/70 hover:text-white
                           hover:bg-black/60 transition-colors duration-150"
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
