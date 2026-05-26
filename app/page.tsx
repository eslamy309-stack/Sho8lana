'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  X, Loader2, ArrowRight, Zap, Building2, Users, BarChart3, Brain,
  Shield, Cpu, TrendingUp, Award, Target, Briefcase,
  Check, ChevronRight, Code2, Monitor, Globe,
  GitBranch, Search,
} from 'lucide-react'
import { AppShell } from '@/components/app/Shell'

/* ── Counter animation hook ── */
function useCountUp(target: number, duration = 2000, active = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!active) return
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, active])
  return count
}

/* ── Motion variants ── */
const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const, delay: i * 0.1 } }),
}
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }

/* ── Animated gradient mesh background ── */
function GradientBg() {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, background: '#020817' }}>
      <div className="absolute inset-0" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)',
        backgroundSize: '64px 64px',
      }} />
      <motion.div animate={{ scale:[1,1.1,1], opacity:[0.15,0.22,0.15] }} transition={{ duration:8, repeat:Infinity, ease:'easeInOut' }}
        className="absolute" style={{ top:'-8%', left:'22%', width:640, height:640, borderRadius:'50%', background:'radial-gradient(circle,rgba(99,102,241,0.28) 0%,transparent 70%)', filter:'blur(60px)' }} />
      <motion.div animate={{ scale:[1,1.12,1], opacity:[0.1,0.18,0.1] }} transition={{ duration:10, repeat:Infinity, ease:'easeInOut', delay:2 }}
        className="absolute" style={{ bottom:'5%', right:'12%', width:520, height:520, borderRadius:'50%', background:'radial-gradient(circle,rgba(16,185,129,0.22) 0%,transparent 70%)', filter:'blur(60px)' }} />
      <motion.div animate={{ scale:[1,1.07,1], opacity:[0.07,0.12,0.07] }} transition={{ duration:14, repeat:Infinity, ease:'easeInOut', delay:5 }}
        className="absolute" style={{ top:'45%', left:'-4%', width:380, height:380, borderRadius:'50%', background:'radial-gradient(circle,rgba(139,92,246,0.2) 0%,transparent 70%)', filter:'blur(60px)' }} />
    </div>
  )
}

/* ── Student leaderboard mini-preview ── */
function StudentPreview() {
  const entries = [
    { name:'Sara M.', uni:'AUC', xp:'2,140', rank:1,  color:'#34D399' },
    { name:'Omar H.', uni:'GUC', xp:'1,980', rank:2,  color:'#34D399' },
    { name:'You',     uni:'—',   xp:'1,840', rank:12, color:'#F59E0B', isYou:true },
  ]
  return (
    <div style={{ background:'rgba(15,23,42,0.9)', borderRadius:14, padding:14, border:'1px solid rgba(255,255,255,0.07)', backdropFilter:'blur(16px)' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
        <span style={{ fontSize:10, fontWeight:700, color:'white' }}>Live Leaderboard</span>
        <span style={{ fontSize:8, color:'#34D399', background:'rgba(52,211,153,0.1)', padding:'2px 8px', borderRadius:20, fontWeight:600 }}>● Live</span>
      </div>
      {entries.map((e,i) => (
        <motion.div key={i} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.3+i*0.1 }}
          style={{ display:'flex', alignItems:'center', gap:7, marginBottom:7, padding:'5px 7px', borderRadius:8,
            background: e.isYou?'rgba(52,211,153,0.08)':'rgba(255,255,255,0.03)',
            border: e.isYou?'1px solid rgba(52,211,153,0.2)':'1px solid transparent' }}>
          <span style={{ fontSize:9, fontWeight:700, color:e.color, width:18, textAlign:'center' }}>#{e.rank}</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:9, fontWeight:700, color: e.isYou?'#34D399':'white' }}>{e.name}</div>
            <div style={{ fontSize:7, color:'rgba(255,255,255,0.3)' }}>{e.uni}</div>
          </div>
          <span style={{ fontSize:8, color:'rgba(255,255,255,0.4)', fontWeight:600 }}>{e.xp} XP</span>
        </motion.div>
      ))}
      <div style={{ marginTop:10 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
          <span style={{ fontSize:7, color:'rgba(255,255,255,0.35)' }}>Progress to Gold</span>
          <span style={{ fontSize:7, fontWeight:700, color:'#F59E0B' }}>1,840 / 2,000 XP</span>
        </div>
        <div style={{ height:4, background:'rgba(255,255,255,0.06)', borderRadius:2 }}>
          <motion.div initial={{ width:0 }} animate={{ width:'92%' }} transition={{ delay:0.8, duration:0.8, ease:[0.16,1,0.3,1] }}
            style={{ height:'100%', borderRadius:2, background:'linear-gradient(90deg,#F59E0B,#FBBF24)' }} />
        </div>
      </div>
    </div>
  )
}

/* ── Company HR mini-preview ── */
function CompanyPreview() {
  const stages = [
    { label:'Screening', count:48, color:'#60A5FA', w:75 },
    { label:'Interview',  count:31, color:'#F59E0B', w:52 },
    { label:'Offer',      count:12, color:'#34D399', w:25 },
  ]
  return (
    <div style={{ background:'rgba(15,17,35,0.9)', borderRadius:14, padding:14, border:'1px solid rgba(255,255,255,0.07)', backdropFilter:'blur(16px)' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
        <span style={{ fontSize:10, fontWeight:700, color:'white' }}>Talent Pipeline</span>
        <span style={{ fontSize:8, color:'#818CF8', background:'rgba(99,102,241,0.15)', padding:'2px 8px', borderRadius:20, fontWeight:600 }}>247 Active</span>
      </div>
      <div style={{ display:'flex', gap:5, marginBottom:10 }}>
        {[{v:'91',l:'Top KPI',c:'#818CF8'},{v:'18',l:'Hired',c:'#34D399'},{v:'4.2d',l:'Avg Time',c:'#F59E0B'}].map(s=>(
          <div key={s.l} style={{ flex:1, background:'rgba(255,255,255,0.04)', borderRadius:7, padding:'5px 6px', textAlign:'center' }}>
            <div style={{ fontSize:12, fontWeight:800, color:s.c }}>{s.v}</div>
            <div style={{ fontSize:7, color:'rgba(255,255,255,0.3)', marginTop:1 }}>{s.l}</div>
          </div>
        ))}
      </div>
      {stages.map((s,i)=>(
        <div key={s.label} style={{ marginBottom:7 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}>
            <span style={{ fontSize:8, color:'rgba(255,255,255,0.4)' }}>{s.label}</span>
            <span style={{ fontSize:8, fontWeight:700, color:s.color }}>{s.count}</span>
          </div>
          <div style={{ height:4, background:'rgba(255,255,255,0.05)', borderRadius:2 }}>
            <motion.div initial={{ width:0 }} animate={{ width:`${s.w}%` }} transition={{ delay:0.4+i*0.14, duration:0.7, ease:[0.16,1,0.3,1] }}
              style={{ height:'100%', borderRadius:2, background:s.color }} />
          </div>
        </div>
      ))}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.1 }}
        style={{ marginTop:9, padding:'7px 9px', borderRadius:9, background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.18)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
          <div style={{ width:22, height:22, borderRadius:7, background:'rgba(99,102,241,0.28)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:'#818CF8', fontWeight:800 }}>SH</div>
          <div>
            <div style={{ fontSize:9, fontWeight:700, color:'white' }}>Sara Hassan · AUC</div>
            <div style={{ fontSize:7, color:'rgba(255,255,255,0.35)' }}>KPI 94 · Platinum · Match 97%</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/* ── Stat counter with in-view trigger ── */
function StatCounter({ value, suffix, label }: { value:number; suffix:string; label:string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once:true })
  const count = useCountUp(value, 1800, inView)
  return (
    <div ref={ref} className="text-center">
      <p className="text-3xl md:text-4xl font-bold text-white">{count.toLocaleString()}{suffix}</p>
      <p className="text-sm text-neutral-500 mt-1">{label}</p>
    </div>
  )
}

/* ── Interactive role selection card ── */
function RoleCard({ role, icon:Icon, accent, headline, tagline, preview, cta, onClick, loading }: {
  role:string; icon:React.ElementType; accent:string; headline:string; tagline:string
  preview:React.ReactNode; cta:string; onClick:()=>void; loading:boolean
}) {
  return (
    <motion.div
      whileHover={{ scale:1.015, y:-4 }} whileTap={{ scale:0.99 }} transition={{ duration:0.18 }}
      onClick={loading ? undefined : onClick}
      className="relative flex flex-col rounded-3xl overflow-hidden cursor-pointer"
      style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${accent}28`, backdropFilter:'blur(16px)' }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ background:`radial-gradient(ellipse at top,${accent}10 0%,transparent 65%)` }} />
      <div className="relative z-10 p-6 pb-3">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background:`${accent}18`, border:`1px solid ${accent}28` }}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" style={{ color:accent }} />
                     : <Icon className="w-5 h-5" style={{ color:accent }} />}
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color:accent }}>{role}</p>
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-white mb-2 leading-tight">{headline}</h3>
        <p className="text-sm text-neutral-400 leading-relaxed">{tagline}</p>
      </div>
      <div className="relative z-10 px-6 py-3">{preview}</div>
      <div className="relative z-10 p-6 pt-3 mt-auto">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold" style={{ color:accent }}>{loading?'Opening…':cta}</span>
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background:`${accent}18`, border:`1px solid ${accent}28` }}>
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color:accent }} />
                     : <ArrowRight className="w-3.5 h-3.5" style={{ color:accent }} />}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Feature card ── */
function FeatureCard({ icon:Icon, color, title, body }: { icon:React.ElementType; color:string; title:string; body:string }) {
  return (
    <div className="p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-1"
         style={{ background:`${color}05`, borderColor:`${color}15` }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background:`${color}18` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <h3 className="text-sm font-semibold text-white mb-1.5">{title}</h3>
      <p className="text-xs text-neutral-500 leading-relaxed">{body}</p>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const [appOpen,  setAppOpen]  = useState(false)
  const [launching, setLaunching] = useState<string|null>(null)
  const [featureTab, setTab]    = useState<'company'|'student'>('company')
  const timer = useRef<ReturnType<typeof setTimeout>|null>(null)

  /* Auto-open after OAuth / Stripe redirect */
  useEffect(() => {
    const s = window.location.search, h = window.location.hash
    if (s.includes('auth=1') || s.includes('code=') || s.includes('stripe=') ||
        h.includes('access_token=') || h.includes('error=')) {
      window.history.replaceState({}, '', window.location.pathname)
      setAppOpen(true)
    }
  }, [])

  const openApp = useCallback((role:'employer'|'student') => {
    if (appOpen || launching) return
    sessionStorage.setItem('sho8_role_hint', role)
    setLaunching(role)
    timer.current = setTimeout(() => { setLaunching(null); setAppOpen(true) }, 380)
  }, [appOpen, launching])

  const closeApp = () => setAppOpen(false)

  /* ─── Feature data ─── */
  const companyFeatures = [
    { icon:Search,   color:'#818CF8', title:'Talent Discovery',         body:'Filter 50K+ students by KPI tier, simulation track, university, GPA, and availability in seconds.' },
    { icon:BarChart3, color:'#6366F1', title:'Performance Intelligence', body:'Deep KPI breakdown per candidate across leadership, analytical, communication, and cognitive dimensions.' },
    { icon:GitBranch, color:'#A5B4FC', title:'Recruitment Pipeline',     body:'Manage sourcing → screening → assessment → interview → offer → hired in a single unified view.' },
    { icon:Brain,     color:'#818CF8', title:'AI Match Insights',        body:'AI-generated summaries, readiness scores, and behavioral profiles for every candidate automatically.' },
    { icon:Cpu,       color:'#6366F1', title:'Simulation Integration',   body:'Connect existing simulations via API, webhook, iFrame, or SDK. Launch custom challenges in hours.' },
    { icon:Shield,    color:'#A5B4FC', title:'Verified Data Only',       body:'Every KPI score is earned through real task completion — not self-reported skills or keyword stuffing.' },
  ]
  const studentFeatures = [
    { icon:Target,      color:'#34D399', title:'Real Business Simulations',  body:'Complete tasks used by actual Egyptian companies — marketing campaigns, finance cases, operations challenges.' },
    { icon:TrendingUp,  color:'#10B981', title:'National Leaderboard',       body:'Compete with 50K+ students. Your rank is visible to every hiring manager using the platform.' },
    { icon:BarChart3,   color:'#34D399', title:'Verified KPI Profile',       body:'Every simulation builds your verified profile across leadership, analytical, communication, and cognitive skills.' },
    { icon:Award,       color:'#10B981', title:'XP, Tiers & Badges',        body:'Earn XP, unlock badges, advance from Bronze to Platinum. Your tier is displayed to all recruiters.' },
    { icon:Brain,       color:'#34D399', title:'AI Career Coach',            body:'Personalized interview prep, CV feedback, and career advice in English and Arabic — available 24/7.' },
    { icon:Briefcase,   color:'#10B981', title:'1-Tap Applications',        body:'Set up your profile once. Apply to Egypt\'s top internships instantly — your KPI score does the talking.' },
  ]
  const integrations = [
    { icon:Code2,   label:'REST API',     desc:'Full API access to push/pull candidate data and simulation results in real time.' },
    { icon:Globe,   label:'Webhooks',     desc:'Receive instant events when candidates complete simulations on your platform.' },
    { icon:Monitor, label:'iFrame Embed', desc:'Embed our simulation player directly inside your own website or ATS.' },
    { icon:Cpu,     label:'JS SDK',       desc:'Full programmatic control via our TypeScript SDK for deep custom integrations.' },
  ]

  return (
    <>
      <GradientBg />

      {/* ─── NAV ─── */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-14 pt-7 max-w-[1320px] mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-base tracking-tight">Sho8lana</span>
          <span className="text-neutral-700 text-sm hidden sm:block">شغلانة</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => openApp('student')} disabled={!!launching||appOpen}
            className="text-sm text-neutral-400 hover:text-white transition-colors px-3 py-2 hidden sm:block">
            Sign in
          </button>
          <button onClick={() => openApp('employer')} disabled={!!launching||appOpen}
            className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5">
            {launching==='employer' ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Opening…</>
              : <>For Companies <ChevronRight className="w-3.5 h-3.5" /></>}
          </button>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative z-10 pt-16 pb-20 px-6 md:px-14 max-w-[1320px] mx-auto">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="text-center mb-12">
          <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 mb-6">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest bg-indigo-600/10 border border-indigo-600/20 px-3 py-1.5 rounded-full flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              🇪🇬 Egypt&apos;s Simulation-Based Hiring Platform
            </span>
          </motion.div>

          <motion.h1 variants={fadeUp} custom={1}
            className="text-5xl md:text-6xl lg:text-[4.5rem] font-bold text-white leading-[1.06] tracking-tight text-balance mb-5">
            Where Talent Meets{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-emerald-400">
              Real Performance
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} custom={2}
            className="text-base md:text-lg text-neutral-400 leading-relaxed max-w-2xl mx-auto">
            Students compete through real business simulations and build verified KPI profiles.
            Companies discover performance-ranked talent — not just CVs.
          </motion.p>
        </motion.div>

        {/* Giant role cards */}
        <motion.div initial="hidden" animate="visible" variants={stagger}
          className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          <motion.div variants={fadeUp} custom={3}>
            <RoleCard role="For Students" icon={Users} accent="#10B981"
              headline="Compete. Prove yourself. Get hired."
              tagline="Join real business simulations, climb the national leaderboard, and get discovered by Egypt's top employers."
              preview={<StudentPreview />}
              cta="Start competing — it's free"
              onClick={() => openApp('student')} loading={launching==='student'} />
          </motion.div>
          <motion.div variants={fadeUp} custom={4}>
            <RoleCard role="For Companies" icon={Building2} accent="#6366F1"
              headline="Discover proven talent. Hire smarter."
              tagline="Access a verified, KPI-ranked talent pool. Integrate simulations. Find candidates who can actually do the work."
              preview={<CompanyPreview />}
              cta="Open HR Dashboard"
              onClick={() => openApp('employer')} loading={launching==='employer'} />
          </motion.div>
        </motion.div>
      </section>

      {/* ─── TRUSTED BY + STATS ─── */}
      <section className="relative z-10 py-16 px-6 md:px-14 border-t border-white/5">
        <div className="max-w-[1320px] mx-auto">
          <p className="text-center text-xs font-semibold text-neutral-600 uppercase tracking-widest mb-8">
            Trusted by Egypt&apos;s top employers
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-14 mb-14 opacity-40">
            {['Vodafone','CIB','P&G','McKinsey','Microsoft','Unilever','EFG'].map(n => (
              <span key={n} className="text-neutral-200 font-bold text-sm md:text-base tracking-wide">{n}</span>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCounter value={50000} suffix="+" label="Active students" />
            <StatCounter value={500}   suffix="+" label="Partner companies" />
            <StatCounter value={214}   suffix="K+" label="Graduates / year" />
            <StatCounter value={97}    suffix="%" label="Satisfaction rate" />
          </div>
        </div>
      </section>

      {/* ─── PLATFORM FEATURES ─── */}
      <section className="relative z-10 py-24 px-6 md:px-14 border-t border-white/5">
        <div className="max-w-[1320px] mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once:true, amount:0.3 }} variants={stagger}
            className="text-center mb-12">
            <motion.p variants={fadeUp} className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-3">Platform</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl font-bold text-white mb-4 text-balance">Built for both sides of hiring</motion.h2>
            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1 mt-2">
                {(['company','student'] as const).map(tab => (
                  <button key={tab} onClick={() => setTab(tab)}
                    className="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                    style={featureTab===tab ? { background: tab==='company'?'#6366F1':'#10B981', color:'white' } : { color:'#64748B' }}>
                    {tab==='company' ? '🏢 Companies' : '🎓 Students'}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div key={featureTab}
              initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
              transition={{ duration:0.22 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {(featureTab==='company' ? companyFeatures : studentFeatures).map(f => (
                <FeatureCard key={f.title} icon={f.icon} color={f.color} title={f.title} body={f.body} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="relative z-10 py-20 px-6 md:px-14 border-t border-white/5">
        <div className="max-w-[1320px] mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-4xl font-bold text-white text-balance">Up and running in minutes</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-14">
            {/* Company steps */}
            <div>
              <div className="flex items-center gap-2 mb-8">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-600/30 flex items-center justify-center">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <span className="text-sm font-semibold text-indigo-400">For Companies</span>
              </div>
              {[
                { n:'01', t:'Create your account',      d:'Sign up with Google or GitHub. Your company profile auto-creates in under 60 seconds.' },
                { n:'02', t:'Connect your simulations', d:'Upload directly or connect via API, webhook, iFrame, or SDK. Works with your existing tools.' },
                { n:'03', t:'Configure KPIs',           d:'Set custom KPI weights to match what your company actually values — not a generic template.' },
                { n:'04', t:'Hire top performers',      d:'Browse ranked candidates, manage your pipeline, and send interview invites from one dashboard.' },
              ].map((s,i) => (
                <motion.div key={s.n} initial={{ opacity:0, x:-16 }} whileInView={{ opacity:1, x:0 }}
                  viewport={{ once:true }} transition={{ delay:i*0.1, duration:0.5 }}
                  className="flex gap-4 mb-7">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-600/15 border border-indigo-600/25 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-indigo-400">{s.n}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white mb-1">{s.t}</p>
                    <p className="text-xs text-neutral-500 leading-relaxed">{s.d}</p>
                  </div>
                </motion.div>
              ))}
              <button onClick={() => openApp('employer')} disabled={!!launching||appOpen}
                className="text-sm font-semibold text-indigo-400 flex items-center gap-2 hover:text-indigo-300 transition-colors">
                Get started free <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Student steps */}
            <div>
              <div className="flex items-center gap-2 mb-8">
                <div className="w-7 h-7 rounded-lg bg-emerald-600/20 border border-emerald-600/30 flex items-center justify-center">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-sm font-semibold text-emerald-400">For Students</span>
              </div>
              {[
                { n:'01', t:'Sign up instantly',         d:'Login with Google or GitHub. Profile auto-created — no long forms, no friction.' },
                { n:'02', t:'Choose a simulation track', d:'Pick from Marketing, Finance, Operations, Tech, HR, and 10+ industry tracks.' },
                { n:'03', t:'Complete real tasks',       d:'Work through business scenarios. Get AI feedback. Earn XP and build your KPI score.' },
                { n:'04', t:'Get discovered',            d:'Your verified KPI profile surfaces to recruiters. Apply to top internships in one tap.' },
              ].map((s,i) => (
                <motion.div key={s.n} initial={{ opacity:0, x:16 }} whileInView={{ opacity:1, x:0 }}
                  viewport={{ once:true }} transition={{ delay:i*0.1, duration:0.5 }}
                  className="flex gap-4 mb-7">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-600/15 border border-emerald-600/25 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-emerald-400">{s.n}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white mb-1">{s.t}</p>
                    <p className="text-xs text-neutral-500 leading-relaxed">{s.d}</p>
                  </div>
                </motion.div>
              ))}
              <button onClick={() => openApp('student')} disabled={!!launching||appOpen}
                className="text-sm font-semibold text-emerald-400 flex items-center gap-2 hover:text-emerald-300 transition-colors">
                Start for free <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── INTEGRATION ─── */}
      <section className="relative z-10 py-20 px-6 md:px-14 border-t border-white/5">
        <div className="max-w-[1320px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once:true, amount:0.3 }} variants={stagger}>
              <motion.p variants={fadeUp} className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-3">Simulation Integration</motion.p>
              <motion.h2 variants={fadeUp} className="text-4xl font-bold text-white mb-5 text-balance leading-tight">
                Bring your simulations.<br />We handle the rest.
              </motion.h2>
              <motion.p variants={fadeUp} className="text-neutral-400 leading-relaxed mb-8">
                Already have assessment tools or simulations? Connect them in hours using any integration method.
                Students complete your content — we score, rank, and surface the top performers to you.
              </motion.p>
              <motion.div variants={stagger} className="grid grid-cols-2 gap-3">
                {integrations.map(m => (
                  <motion.div key={m.label} variants={fadeUp}
                    className="p-4 rounded-xl border border-white/8 bg-white/3 hover:border-white/14 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600/15 flex items-center justify-center mb-2">
                      <m.icon className="w-4 h-4 text-indigo-400" />
                    </div>
                    <p className="text-sm font-semibold text-white mb-1">{m.label}</p>
                    <p className="text-xs text-neutral-500 leading-relaxed">{m.desc}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Code block */}
            <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }} transition={{ duration:0.6 }}
              className="rounded-2xl border border-white/8 overflow-hidden" style={{ background:'#0D0F18' }}>
              <div className="flex items-center gap-2 px-5 py-3 border-b border-white/6">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                <span className="text-neutral-600 text-xs ml-2 font-mono">@sho8lana/sdk · Quick Start</span>
              </div>
              <pre className="text-xs font-mono px-6 py-5 text-neutral-300 leading-[1.9] overflow-x-auto">
{`// 1. Install
npm install @sho8lana/sdk

// 2. Initialize
import { Sho8lana } from '@sho8lana/sdk'
const client = new Sho8lana({
  apiKey: process.env.SHO8_KEY
})

// 3. Submit simulation result
await client.simulations.submit({
  candidateId: 'user_abc',
  simulationId: 'sim_marketing',
  score: 87,
  completedAt: new Date()
})

// 4. Get ranked candidates
const top = await client.talent.search({
  minKpi: 80,
  tier: 'gold',
  track: 'marketing'
})
// → [{ name, kpi: 94, uni: 'AUC' }]`}
              </pre>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section className="relative z-10 py-24 px-6 md:px-14 border-t border-white/5">
        <div className="max-w-[1320px] mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-4xl font-bold text-white mb-3">Simple, transparent pricing</h2>
            <p className="text-neutral-400">Free for students. Company plans scale with your hiring.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Student */}
            <div className="p-6 rounded-2xl border border-emerald-600/20 bg-emerald-600/5">
              <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-3">Students</p>
              <p className="text-4xl font-bold text-white mb-1">Free</p>
              <p className="text-xs text-neutral-500 mb-5">Forever. No credit card.</p>
              {['All simulations','National leaderboard','KPI profile','AI coaching','Job applications'].map(f=>(
                <div key={f} className="flex items-center gap-2 mb-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-xs text-neutral-400">{f}</span>
                </div>
              ))}
              <button onClick={() => openApp('student')} disabled={!!launching||appOpen}
                className="w-full mt-5 py-2.5 rounded-xl text-sm font-semibold text-emerald-400 border border-emerald-600/28 hover:bg-emerald-600/10 transition-colors">
                Get started
              </button>
            </div>

            {/* Company plans */}
            {[
              { plan:'starter',    name:'Starter',    price:'$99',   period:'/mo', color:'#818CF8', popular:false,
                features:['25 candidates/mo','Basic analytics','Pipeline management','Email support'] },
              { plan:'pro',        name:'Pro',         price:'$299',  period:'/mo', color:'#6366F1', popular:true,
                features:['Unlimited candidates','Full KPI analytics','API access','Custom simulations','Priority support'] },
              { plan:'enterprise', name:'Enterprise',  price:'Custom', period:'',  color:'#A5B4FC', popular:false,
                features:['Unlimited everything','Dedicated integrations','SLA guarantee','Account manager','SSO & compliance'] },
            ].map(p => (
              <div key={p.plan} className={`relative p-6 rounded-2xl border ${p.popular?'border-indigo-600/40 bg-indigo-600/8':'border-white/8 bg-white/3'}`}>
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="text-xs font-semibold bg-indigo-600 text-white px-3 py-1 rounded-full">Most Popular</span>
                  </div>
                )}
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color:p.color }}>{p.name}</p>
                <p className="text-3xl font-bold text-white mb-0.5">{p.price}</p>
                <p className="text-xs text-neutral-500 mb-5">{p.period || 'Contact us'}</p>
                {p.features.map(f => (
                  <div key={f} className="flex items-center gap-2 mb-2">
                    <Check className="w-3.5 h-3.5 shrink-0" style={{ color:p.color }} />
                    <span className="text-xs text-neutral-400">{f}</span>
                  </div>
                ))}
                <button onClick={() => openApp('employer')} disabled={!!launching||appOpen}
                  className="w-full mt-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  style={p.popular ? { background:'#6366F1', color:'white' } : { color:p.color, border:`1px solid ${p.color}28` }}>
                  {p.plan==='enterprise' ? 'Contact sales' : 'Start free trial'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="relative z-10 py-24 px-6 md:px-14 border-t border-white/5">
        <div className="max-w-[1320px] mx-auto">
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }} transition={{ duration:0.7 }}
            className="relative rounded-3xl overflow-hidden p-12 md:p-16 text-center"
            style={{ background:'linear-gradient(135deg,rgba(99,102,241,0.14) 0%,rgba(16,185,129,0.07) 100%)', border:'1px solid rgba(255,255,255,0.07)' }}>
            <div className="absolute inset-0 pointer-events-none"
                 style={{ background:'radial-gradient(ellipse at center,rgba(99,102,241,0.1) 0%,transparent 70%)' }} />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 text-balance leading-tight">
                The future of hiring<br />starts here.
              </h2>
              <p className="text-neutral-400 mb-10 max-w-xl mx-auto text-base">
                Join Egypt&apos;s largest simulation-based hiring platform.
                Free for students. Enterprise-grade for companies.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => openApp('employer')} disabled={!!launching||appOpen}
                  className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-7 py-4 rounded-xl transition-colors">
                  {launching==='employer' ? <><Loader2 className="w-4 h-4 animate-spin" />Opening…</>
                    : <>Open HR Dashboard <ArrowRight className="w-4 h-4" /></>}
                </button>
                <button onClick={() => openApp('student')} disabled={!!launching||appOpen}
                  className="inline-flex items-center justify-center gap-2 border border-emerald-600/30 text-emerald-400 hover:bg-emerald-600/10 text-sm font-semibold px-7 py-4 rounded-xl transition-colors">
                  {launching==='student' ? <><Loader2 className="w-4 h-4 animate-spin" />Opening…</>
                    : <>Start competing — free <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
              <p className="text-xs text-neutral-600 mt-6">Free for students · No setup fee · Cancel anytime</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── APP OVERLAY ─── */}
      <AnimatePresence>
        {appOpen && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
            <motion.div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={closeApp} />
            <motion.div
              className="relative z-10 w-full max-w-app h-dvh md:h-[min(900px,90vh)] md:rounded-3xl overflow-hidden shadow-2xl"
              initial={{ scale:0.94, opacity:0, y:20 }}
              animate={{ scale:1, opacity:1, y:0 }}
              exit={{ scale:0.94, opacity:0, y:20 }}
              transition={{ duration:0.32, ease:[0.16,1,0.3,1] }}>
              <button onClick={closeApp}
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/70 transition-colors">
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
