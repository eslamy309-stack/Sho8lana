'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  X, Loader2, ArrowRight, Zap, Building2, Users,
  BarChart3, Brain, Shield, TrendingUp, Award,
  Briefcase, Check, ChevronRight, Search,
  Eye, Star, Target, Rocket, GitBranch,
} from 'lucide-react'
import { AppShell } from '@/components/app/Shell'

/* ── Counter hook ── */
function useCountUp(target: number, duration = 1800, active = false) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!active) return
    let t0: number | null = null
    const tick = (ts: number) => {
      if (!t0) t0 = ts
      const p = Math.min((ts - t0) / duration, 1)
      setN(Math.floor((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration, active])
  return n
}

/* ── Variants ── */
const up = {
  hidden:  { opacity: 0, y: 18 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const, delay: i * 0.09 } }),
}
const stag = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }

/* ── Animated background ── */
function Bg() {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, background: '#020817' }}>
      <div className="absolute inset-0" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.022) 1px,transparent 1px)',
        backgroundSize: '60px 60px',
      }} />
      <motion.div animate={{ scale:[1,1.1,1], opacity:[0.14,0.22,0.14] }} transition={{ duration:9, repeat:Infinity, ease:'easeInOut' }}
        className="absolute" style={{ top:'-10%', left:'25%', width:700, height:700, borderRadius:'50%', background:'radial-gradient(circle,rgba(99,102,241,0.25) 0%,transparent 70%)', filter:'blur(70px)' }} />
      <motion.div animate={{ scale:[1,1.12,1], opacity:[0.09,0.17,0.09] }} transition={{ duration:11, repeat:Infinity, ease:'easeInOut', delay:3 }}
        className="absolute" style={{ bottom:'5%', right:'10%', width:550, height:550, borderRadius:'50%', background:'radial-gradient(circle,rgba(16,185,129,0.2) 0%,transparent 70%)', filter:'blur(70px)' }} />
    </div>
  )
}

/* ── Talent Score ring (hero visual element) ── */
function TalentScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const color = score >= 90 ? '#10B981' : score >= 75 ? '#6366F1' : score >= 60 ? '#F59E0B' : '#EF4444'
  const r = (size / 2) - 6
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
        <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
          strokeDasharray={circ} initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, ease: [0.16,1,0.3,1], delay: 0.5 }}
          strokeLinecap="round" />
      </svg>
      <div className="relative z-10 text-center">
        <p className="font-bold leading-none" style={{ fontSize: size * 0.28, color }}>{score}</p>
        <p style={{ fontSize: size * 0.11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>TALENT</p>
      </div>
    </div>
  )
}

/* ── Student preview card ── */
function StudentCard() {
  return (
    <div style={{ background:'rgba(15,23,42,0.92)', borderRadius:14, padding:14, border:'1px solid rgba(255,255,255,0.07)', backdropFilter:'blur(16px)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
        <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#065F46,#047857)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:800, color:'white' }}>S</div>
        <div style={{ flex:1 }}>
          <p style={{ fontSize:10, fontWeight:700, color:'white', margin:0 }}>Sara Mohamed</p>
          <p style={{ fontSize:8, color:'rgba(255,255,255,0.4)', margin:0 }}>AUC · Business Administration</p>
        </div>
        <TalentScoreRing score={87} size={44} />
      </div>
      {[{l:'Leadership',v:85,c:'#818CF8'},{l:'Analytical',v:91,c:'#34D399'},{l:'Communication',v:78,c:'#F59E0B'}].map(k=>(
        <div key={k.l} style={{ marginBottom:7 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}>
            <span style={{ fontSize:8, color:'rgba(255,255,255,0.4)' }}>{k.l}</span>
            <span style={{ fontSize:8, fontWeight:700, color:k.c }}>{k.v}</span>
          </div>
          <div style={{ height:3, background:'rgba(255,255,255,0.06)', borderRadius:2 }}>
            <motion.div initial={{ width:0 }} animate={{ width:`${k.v}%` }} transition={{ delay:0.6, duration:0.7, ease:[0.16,1,0.3,1] }}
              style={{ height:'100%', borderRadius:2, background:k.c }} />
          </div>
        </div>
      ))}
      <div style={{ marginTop:10, display:'flex', gap:4, flexWrap:'wrap' }}>
        {['Marketing','Finance','Strategy'].map(s=>(
          <span key={s} style={{ fontSize:7, fontWeight:600, color:'#34D399', background:'rgba(52,211,153,0.1)', padding:'2px 7px', borderRadius:20, border:'1px solid rgba(52,211,153,0.2)' }}>{s}</span>
        ))}
        <span style={{ fontSize:8, color:'rgba(255,255,255,0.3)', alignSelf:'center', marginLeft:'auto' }}>Visible to recruiters ●</span>
      </div>
    </div>
  )
}

/* ── Company preview card ── */
function CompanyCard() {
  const cands = [
    { name:'Sara M.', uni:'AUC', score:94, color:'#34D399' },
    { name:'Omar H.', uni:'GUC', score:88, color:'#818CF8' },
    { name:'Laila K.', uni:'Cairo', score:82, color:'#F59E0B' },
  ]
  return (
    <div style={{ background:'rgba(15,17,35,0.92)', borderRadius:14, padding:14, border:'1px solid rgba(255,255,255,0.07)', backdropFilter:'blur(16px)' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <span style={{ fontSize:10, fontWeight:700, color:'white' }}>Top Talent · Marketing Track</span>
        <span style={{ fontSize:8, color:'#818CF8', background:'rgba(99,102,241,0.12)', padding:'2px 8px', borderRadius:20 }}>Live</span>
      </div>
      {cands.map((c,i)=>(
        <motion.div key={i} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.3+i*0.12 }}
          style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, padding:'6px 8px', borderRadius:9, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ width:26, height:26, borderRadius:8, background:`${c.color}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:800, color:c.color }}>
            {c.name.split(' ').map(w=>w[0]).join('')}
          </div>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:9, fontWeight:700, color:'white', margin:0 }}>{c.name}</p>
            <p style={{ fontSize:7, color:'rgba(255,255,255,0.35)', margin:0 }}>{c.uni}</p>
          </div>
          <TalentScoreRing score={c.score} size={38} />
        </motion.div>
      ))}
      <div style={{ marginTop:10, padding:'7px 10px', borderRadius:9, background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.15)' }}>
        <p style={{ fontSize:8, color:'rgba(255,255,255,0.4)', margin:'0 0 4px 0' }}>AI Recommendation</p>
        <p style={{ fontSize:9, fontWeight:600, color:'white', margin:0 }}>Sara M. is 97% aligned with your Marketing role requirements.</p>
      </div>
    </div>
  )
}

/* ── Stat counter ── */
function Stat({ value, suffix, label }: { value:number; suffix:string; label:string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once:true })
  const n = useCountUp(value, 1800, inView)
  return (
    <div ref={ref} className="text-center">
      <p className="text-3xl md:text-4xl font-bold text-white">{n.toLocaleString()}{suffix}</p>
      <p className="text-sm text-neutral-500 mt-1">{label}</p>
    </div>
  )
}

/* ── Role card ── */
function RoleCard({ role, icon:Icon, accent, headline, tagline, bullets, cta, onClick, loading, preview }: {
  role:string; icon:React.ElementType; accent:string; headline:string; tagline:string
  bullets:string[]; cta:string; onClick:()=>void; loading:boolean; preview:React.ReactNode
}) {
  return (
    <motion.div whileHover={{ scale:1.015, y:-3 }} whileTap={{ scale:0.99 }} transition={{ duration:0.18 }}
      onClick={loading?undefined:onClick} className="relative flex flex-col rounded-3xl overflow-hidden cursor-pointer"
      style={{ background:'rgba(255,255,255,0.025)', border:`1px solid ${accent}25`, backdropFilter:'blur(16px)' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background:`radial-gradient(ellipse at top,${accent}0e 0%,transparent 65%)` }} />
      <div className="relative z-10 p-6 pb-3">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background:`${accent}16`, border:`1px solid ${accent}25` }}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" style={{ color:accent }} />
                     : <Icon className="w-5 h-5" style={{ color:accent }} />}
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color:accent }}>{role}</p>
        </div>
        <h3 className="text-xl font-bold text-white mb-2 leading-tight">{headline}</h3>
        <p className="text-sm text-neutral-400 leading-relaxed mb-4">{tagline}</p>
        <ul className="space-y-2 mb-4">
          {bullets.map(b => (
            <li key={b} className="flex items-center gap-2 text-xs text-neutral-300">
              <Check className="w-3.5 h-3.5 shrink-0" style={{ color:accent }} />{b}
            </li>
          ))}
        </ul>
      </div>
      <div className="relative z-10 px-6 pb-4">{preview}</div>
      <div className="relative z-10 p-6 pt-4 mt-auto border-t border-white/5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold" style={{ color:accent }}>{loading?'Opening…':cta}</span>
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background:`${accent}16`, border:`1px solid ${accent}22` }}>
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color:accent }} />
                     : <ArrowRight className="w-3.5 h-3.5" style={{ color:accent }} />}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ════════════ MAIN PAGE ════════════ */
export default function LandingPage() {
  const [appOpen,  setAppOpen]  = useState(false)
  const [launching, setLaunch]  = useState<string|null>(null)
  const [featureTab, setTab]    = useState<'company'|'student'>('company')
  const timer = useRef<ReturnType<typeof setTimeout>|null>(null)

  useEffect(() => {
    const s = window.location.search, h = window.location.hash
    if (s.includes('auth=1')||s.includes('code=')||s.includes('stripe=')||h.includes('access_token=')||h.includes('error=')) {
      window.history.replaceState({}, '', window.location.pathname)
      setAppOpen(true)
    }
  }, [])

  const openApp = useCallback((role:'employer'|'student') => {
    if (appOpen||launching) return
    sessionStorage.setItem('sho8_role_hint', role)
    setLaunch(role)
    timer.current = setTimeout(() => { setLaunch(null); setAppOpen(true) }, 380)
  }, [appOpen, launching])

  const companyFeatures = [
    { icon:Search,    color:'#818CF8', title:'Talent Discovery',          body:'Filter verified candidates by Talent Score, university, skills, industry, and more. Like LinkedIn Recruiter, but performance-based.' },
    { icon:Star,      color:'#6366F1', title:'Single Talent Score',       body:'One 0–100 score per candidate combining simulation performance, consistency, leadership, and behavioral indicators.' },
    { icon:GitBranch, color:'#A5B4FC', title:'Full ATS Pipeline',         body:'Move candidates through sourcing → screening → interview → hired. Leave notes, approve, reject — all in one place.' },
    { icon:Brain,     color:'#818CF8', title:'AI Candidate Insights',     body:'AI-generated profile summaries, role-fit recommendations, and behavioral analysis for every candidate automatically.' },
    { icon:Briefcase, color:'#6366F1', title:'Post Internships',          body:'Publish internship listings directly to 50,000+ active students. Applications arrive with verified Talent Scores attached.' },
    { icon:Shield,    color:'#A5B4FC', title:'Zero Guesswork',            body:'Every score is earned through real task completion — not self-reported skills, endorsements, or keyword stuffing.' },
  ]
  const studentFeatures = [
    { icon:Target,     color:'#34D399', title:'Your Talent Profile',       body:'A living resume built from real performance data — KPI scores, verified skills, simulations, badges, and portfolio links.' },
    { icon:Eye,        color:'#10B981', title:'Recruiter Visibility',       body:'Control who sees your profile. When you\'re ready, flip the switch and get discovered by Egypt\'s top employers.' },
    { icon:TrendingUp, color:'#34D399', title:'Performance Timeline',       body:'Track your growth over time. See exactly how your Talent Score, skills, and rankings have improved month by month.' },
    { icon:Award,      color:'#10B981', title:'Verified Skills & Badges',  body:'Skills earned through simulation completion — not self-claimed. Employers know exactly what you can actually do.' },
    { icon:Briefcase,  color:'#34D399', title:'Internship Hub',            body:'Browse real internships from verified companies. Apply in one tap. Track every application in one place.' },
    { icon:BarChart3,  color:'#10B981', title:'Career Analytics',          body:'Identify skill gaps, see your recruiter visibility score, and get AI-powered recommendations to accelerate your growth.' },
  ]

  return (
    <>
      <Bg />

      {/* NAV */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-14 pt-7 max-w-[1320px] mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-base tracking-tight">Sho8lana</span>
          <span className="hidden sm:block text-xs font-medium text-neutral-600 bg-white/5 border border-white/8 px-2 py-0.5 rounded-full ml-1">Talent Intelligence</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => openApp('student')} disabled={!!launching||appOpen}
            className="text-sm text-neutral-400 hover:text-white transition-colors px-3 py-2 hidden sm:block">Sign in</button>
          <button onClick={() => openApp('employer')} disabled={!!launching||appOpen}
            className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5">
            {launching==='employer' ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Opening…</>
              : <>For Companies <ChevronRight className="w-3.5 h-3.5" /></>}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 pt-16 pb-20 px-6 md:px-14 max-w-[1320px] mx-auto">
        <motion.div initial="hidden" animate="visible" variants={stag} className="text-center mb-12">
          <motion.div variants={up} custom={0} className="inline-flex items-center gap-2 mb-6">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest bg-indigo-600/10 border border-indigo-600/20 px-3 py-1.5 rounded-full flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              🇪🇬 Egypt&apos;s #1 Talent Intelligence Platform
            </span>
          </motion.div>

          <motion.h1 variants={up} custom={1}
            className="text-5xl md:text-6xl lg:text-[4.2rem] font-bold text-white leading-[1.07] tracking-tight text-balance mb-5">
            Discover Talent Through{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-emerald-400">
              Real Performance
            </span>
            <br />Not Just Resumes
          </motion.h1>

          <motion.p variants={up} custom={2}
            className="text-base md:text-lg text-neutral-400 leading-relaxed max-w-2xl mx-auto">
            Students prove their skills through simulations and build a verified Talent Profile.
            Companies identify and hire top performers using real data — not CVs.
          </motion.p>
        </motion.div>

        {/* Role cards */}
        <motion.div initial="hidden" animate="visible" variants={stag}
          className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          <motion.div variants={up} custom={3}>
            <RoleCard role="For Students" icon={Users} accent="#10B981"
              headline="Build your Talent Profile. Get discovered."
              tagline="Prove your skills through real simulations. Build a living resume that gets you hired."
              bullets={['Verified Talent Profile replacing your CV','Real business simulations across 10+ tracks','National leaderboard — visible to recruiters','Apply to internships in 1 tap','Career analytics & skill gap insights']}
              cta="Start Your Career Journey"
              preview={<StudentCard />}
              onClick={() => openApp('student')} loading={launching==='student'} />
          </motion.div>
          <motion.div variants={up} custom={4}>
            <RoleCard role="For Companies" icon={Building2} accent="#6366F1"
              headline="Hire smarter. Reduce hiring risk."
              tagline="Access 50,000+ performance-ranked candidates. Every profile backed by real simulation data."
              bullets={['Single Talent Score per candidate (0–100)','Filter by performance, skills, university','Full ATS pipeline management','Post internship listings instantly','AI-powered candidate recommendations']}
              cta="Start Hiring Smarter"
              preview={<CompanyCard />}
              onClick={() => openApp('employer')} loading={launching==='employer'} />
          </motion.div>
        </motion.div>
      </section>

      {/* TRUSTED BY + STATS */}
      <section className="relative z-10 py-16 px-6 md:px-14 border-t border-white/5">
        <div className="max-w-[1320px] mx-auto">
          <p className="text-center text-xs font-semibold text-neutral-600 uppercase tracking-widest mb-8">
            Trusted by Egypt&apos;s top employers
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-14 mb-14 opacity-35">
            {['Vodafone','CIB','P&G','McKinsey','Microsoft','Unilever','EFG Hermes'].map(n=>(
              <span key={n} className="text-neutral-200 font-bold text-sm md:text-base tracking-wide">{n}</span>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <Stat value={50000} suffix="+" label="Verified talent profiles" />
            <Stat value={500}   suffix="+" label="Partner companies" />
            <Stat value={214}   suffix="K+" label="Graduates / year" />
            <Stat value={4}     suffix=".2 days" label="Avg. time to hire" />
          </div>
        </div>
      </section>

      {/* TALENT SCORE SHOWCASE */}
      <section className="relative z-10 py-24 px-6 md:px-14 border-t border-white/5">
        <div className="max-w-[1320px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once:true, amount:0.3 }} variants={stag}>
              <motion.p variants={up} className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">The Talent Score</motion.p>
              <motion.h2 variants={up} className="text-4xl font-bold text-white mb-5 text-balance leading-tight">
                One number that tells the whole story
              </motion.h2>
              <motion.p variants={up} className="text-neutral-400 leading-relaxed mb-6">
                Instead of forcing recruiters to interpret 50 KPI metrics, every candidate gets a single
                <strong className="text-white"> Talent Score from 0–100</strong>. It&apos;s the first thing you see,
                and it&apos;s calculated from real performance data — not self-reported skills.
              </motion.p>
              <motion.div variants={stag} className="space-y-3">
                {[
                  { label:'Simulation Performance', pct:40, color:'#818CF8' },
                  { label:'Consistency & Growth',   pct:20, color:'#34D399' },
                  { label:'Leadership Indicators',  pct:15, color:'#F59E0B' },
                  { label:'Communication Score',    pct:15, color:'#60A5FA' },
                  { label:'Cognitive Ability',      pct:10, color:'#A78BFA' },
                ].map(f => (
                  <motion.div key={f.label} variants={up} className="flex items-center gap-3">
                    <div className="w-32 shrink-0">
                      <p className="text-xs text-neutral-400">{f.label}</p>
                    </div>
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div initial={{ width:0 }} whileInView={{ width:`${f.pct * 2.5}%` }}
                        viewport={{ once:true }} transition={{ duration:0.8, ease:[0.16,1,0.3,1] }}
                        style={{ height:'100%', borderRadius:999, background:f.color }} />
                    </div>
                    <span className="text-xs text-neutral-500 w-8 text-right">{f.pct}%</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Visual score showcase */}
            <motion.div initial={{ opacity:0, scale:0.95 }} whileInView={{ opacity:1, scale:1 }}
              viewport={{ once:true }} transition={{ duration:0.7 }}
              className="flex flex-col gap-4">
              {[
                { name:'Sara Mohamed', uni:'AUC', track:'Marketing', score:94, tier:'Platinum' },
                { name:'Omar Hassan',  uni:'GUC', track:'Finance',   score:87, tier:'Gold' },
                { name:'Laila Karim',  uni:'Cairo', track:'Tech',    score:71, tier:'Silver' },
              ].map((c,i) => (
                <div key={c.name} className="flex items-center gap-4 p-4 rounded-2xl border border-white/6 bg-white/3">
                  <TalentScoreRing score={c.score} size={56} />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{c.name}</p>
                    <p className="text-xs text-neutral-500">{c.uni} · {c.track}</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full border"
                    style={{ color: i===0?'#34D399':i===1?'#F59E0B':'#94A3B8', borderColor: i===0?'rgba(52,211,153,0.3)':i===1?'rgba(245,158,11,0.3)':'rgba(148,163,184,0.3)', background: i===0?'rgba(52,211,153,0.08)':i===1?'rgba(245,158,11,0.08)':'rgba(148,163,184,0.05)' }}>
                    {c.tier}
                  </span>
                </div>
              ))}
              <div className="p-4 rounded-2xl border border-indigo-600/20 bg-indigo-600/6 text-center">
                <p className="text-xs text-neutral-400 mb-1">Recruiter saved 3 hours of screening</p>
                <p className="text-sm font-semibold text-white">Shortlisted Sara for interview in 8 minutes.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative z-10 py-24 px-6 md:px-14 border-t border-white/5">
        <div className="max-w-[1320px] mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-3">Platform</p>
            <h2 className="text-4xl font-bold text-white mb-4 text-balance">Built for both sides of hiring</h2>
            <div className="inline-flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1 mt-2">
              {(['company','student'] as const).map(tab => (
                <button key={tab} onClick={() => setTab(tab)}
                  className="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                  style={featureTab===tab ? { background:tab==='company'?'#6366F1':'#10B981', color:'white' } : { color:'#64748B' }}>
                  {tab==='company' ? '🏢 Companies' : '🎓 Students'}
                </button>
              ))}
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={featureTab} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
              transition={{ duration:0.22 }} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {(featureTab==='company' ? companyFeatures : studentFeatures).map(f => (
                <div key={f.title} className="p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-1"
                     style={{ background:`${f.color}05`, borderColor:`${f.color}14` }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background:`${f.color}18` }}>
                    <f.icon className="w-4 h-4" style={{ color:f.color }} />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1.5">{f.title}</h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">{f.body}</p>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative z-10 py-20 px-6 md:px-14 border-t border-white/5">
        <div className="max-w-[1320px] mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-4xl font-bold text-white text-balance">Outcomes, not process</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-14">
            {/* Company outcomes */}
            <div>
              <div className="flex items-center gap-2 mb-8">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/18 border border-indigo-600/28 flex items-center justify-center">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <span className="text-sm font-semibold text-indigo-400">What companies get</span>
              </div>
              {[
                { n:'01', t:'Better hiring decisions',     d:'Every candidate comes with a verified Talent Score — no more guessing from CVs and cover letters.' },
                { n:'02', t:'Reduced hiring costs',        d:'Spend 80% less time screening. Shortlist in hours, not weeks. Interview only the best-fit candidates.' },
                { n:'03', t:'Faster candidate screening',  d:'Filter 50,000+ students by Talent Score, skills, and performance in seconds. AI ranks them for your role.' },
                { n:'04', t:'Less hiring risk',            d:'Hire people who have already proven they can handle real business tasks — not just interview well.' },
              ].map((s,i) => (
                <motion.div key={s.n} initial={{ opacity:0, x:-14 }} whileInView={{ opacity:1, x:0 }}
                  viewport={{ once:true }} transition={{ delay:i*0.1, duration:0.5 }}
                  className="flex gap-4 mb-7">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-600/12 border border-indigo-600/22 flex items-center justify-center">
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
                Start hiring smarter <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            {/* Student outcomes */}
            <div>
              <div className="flex items-center gap-2 mb-8">
                <div className="w-7 h-7 rounded-lg bg-emerald-600/18 border border-emerald-600/28 flex items-center justify-center">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-sm font-semibold text-emerald-400">What students get</span>
              </div>
              {[
                { n:'01', t:'Jobs at top companies',   d:'Apply to verified internships at Vodafone, CIB, P&G, McKinsey, and 500+ more — all in one place.' },
                { n:'02', t:'Visibility to recruiters', d:'Your Talent Profile gets surfaced to companies actively hiring in your track. They come to you.' },
                { n:'03', t:'Validated skills',         d:'Earn verified skill badges through real task completion. Employers trust them because they\'re performance-backed.' },
                { n:'04', t:'Career growth',            d:'Track your improvement, identify skill gaps, and follow AI recommendations to accelerate your career trajectory.' },
              ].map((s,i) => (
                <motion.div key={s.n} initial={{ opacity:0, x:14 }} whileInView={{ opacity:1, x:0 }}
                  viewport={{ once:true }} transition={{ delay:i*0.1, duration:0.5 }}
                  className="flex gap-4 mb-7">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-600/12 border border-emerald-600/22 flex items-center justify-center">
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
                Start your career journey <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="relative z-10 py-24 px-6 md:px-14 border-t border-white/5">
        <div className="max-w-[1320px] mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-4xl font-bold text-white mb-3">Simple, outcome-based pricing</h2>
            <p className="text-neutral-400">Students grow for free. Ambitious students go Pro. Companies hire smarter.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Student Free */}
            <div className="p-6 rounded-2xl border border-white/8 bg-white/3">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3">Student Free</p>
              <p className="text-4xl font-bold text-white mb-0.5">$0</p>
              <p className="text-xs text-neutral-500 mb-5">Forever free</p>
              {['Talent Profile','Basic KPI tracking','Practice simulations','Leaderboard access','5 applications/month'].map(f=>(
                <div key={f} className="flex items-center gap-2 mb-2">
                  <Check className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span className="text-xs text-neutral-400">{f}</span>
                </div>
              ))}
              <button onClick={() => openApp('student')} disabled={!!launching||appOpen}
                className="w-full mt-5 py-2.5 rounded-xl text-sm font-semibold text-neutral-300 border border-white/12 hover:bg-white/5 transition-colors">
                Get started
              </button>
            </div>
            {/* Student Pro */}
            <div className="p-6 rounded-2xl border border-emerald-600/30 bg-emerald-600/6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="text-xs font-semibold bg-emerald-600 text-white px-3 py-1 rounded-full">For ambitious students</span>
              </div>
              <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-3">Student Pro</p>
              <p className="text-4xl font-bold text-white mb-0.5">$10</p>
              <p className="text-xs text-neutral-500 mb-5">/month</p>
              {['Unlimited applications','Advanced career analytics','AI career coaching','Priority recruiter visibility','Skill verification reports','Premium badges'].map(f=>(
                <div key={f} className="flex items-center gap-2 mb-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-xs text-neutral-300">{f}</span>
                </div>
              ))}
              <button onClick={() => openApp('student')} disabled={!!launching||appOpen}
                className="w-full mt-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors">
                Go Pro
              </button>
            </div>
            {/* Company Pro */}
            <div className="p-6 rounded-2xl border border-indigo-600/35 bg-indigo-600/7 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="text-xs font-semibold bg-indigo-600 text-white px-3 py-1 rounded-full">Most Popular</span>
              </div>
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">Company Pro</p>
              <p className="text-3xl font-bold text-white mb-0.5">EGP 300</p>
              <p className="text-xs text-neutral-500 mb-5">/month</p>
              {['Unlimited candidate search','Full Talent Score analytics','ATS pipeline management','Internship listings','API access','Priority support'].map(f=>(
                <div key={f} className="flex items-center gap-2 mb-2">
                  <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="text-xs text-neutral-300">{f}</span>
                </div>
              ))}
              <button onClick={() => openApp('employer')} disabled={!!launching||appOpen}
                className="w-full mt-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">
                Start free trial
              </button>
            </div>
            {/* Enterprise */}
            <div className="p-6 rounded-2xl border border-white/8 bg-white/3">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3">Enterprise</p>
              <p className="text-3xl font-bold text-white mb-0.5">Custom</p>
              <p className="text-xs text-neutral-500 mb-5">EGP 1,000+/mo</p>
              {['Unlimited recruiters','Custom simulations','Dedicated integrations','SLA guarantee','Account manager','SSO & compliance'].map(f=>(
                <div key={f} className="flex items-center gap-2 mb-2">
                  <Check className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span className="text-xs text-neutral-400">{f}</span>
                </div>
              ))}
              <button onClick={() => openApp('employer')} disabled={!!launching||appOpen}
                className="w-full mt-5 py-2.5 rounded-xl text-sm font-semibold text-neutral-300 border border-white/12 hover:bg-white/5 transition-colors">
                Contact sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative z-10 py-24 px-6 md:px-14 border-t border-white/5">
        <div className="max-w-[1320px] mx-auto">
          <motion.div initial={{ opacity:0, y:18 }} whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }} transition={{ duration:0.7 }}
            className="relative rounded-3xl overflow-hidden p-12 md:p-16 text-center"
            style={{ background:'linear-gradient(135deg,rgba(99,102,241,0.13) 0%,rgba(16,185,129,0.06) 100%)', border:'1px solid rgba(255,255,255,0.07)' }}>
            <div className="absolute inset-0 pointer-events-none" style={{ background:'radial-gradient(ellipse at center,rgba(99,102,241,0.09) 0%,transparent 70%)' }} />
            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <Rocket className="w-10 h-10 text-indigo-400 opacity-80" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 text-balance leading-tight">
                The future of hiring<br />is performance-based.
              </h2>
              <p className="text-neutral-400 mb-10 max-w-xl mx-auto">
                Join Egypt&apos;s fastest-growing talent intelligence platform.
                Free for students. Built for companies that hire on merit.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => openApp('employer')} disabled={!!launching||appOpen}
                  className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-7 py-4 rounded-xl transition-colors">
                  {launching==='employer' ? <><Loader2 className="w-4 h-4 animate-spin" />Opening…</>
                    : <>Start Hiring Smarter <ArrowRight className="w-4 h-4" /></>}
                </button>
                <button onClick={() => openApp('student')} disabled={!!launching||appOpen}
                  className="inline-flex items-center justify-center gap-2 border border-emerald-600/28 text-emerald-400 hover:bg-emerald-600/10 text-sm font-semibold px-7 py-4 rounded-xl transition-colors">
                  {launching==='student' ? <><Loader2 className="w-4 h-4 animate-spin" />Opening…</>
                    : <>Start Your Career Journey <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
              <p className="text-xs text-neutral-600 mt-6">Free for students · No setup fee · Cancel anytime</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* APP OVERLAY */}
      <AnimatePresence>
        {appOpen && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
            <motion.div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setAppOpen(false)} />
            <motion.div className="relative z-10 w-full max-w-app h-dvh md:h-[min(900px,90vh)] md:rounded-3xl overflow-hidden shadow-2xl"
              initial={{ scale:0.94, opacity:0, y:20 }} animate={{ scale:1, opacity:1, y:0 }}
              exit={{ scale:0.94, opacity:0, y:20 }} transition={{ duration:0.32, ease:[0.16,1,0.3,1] }}>
              <button onClick={() => setAppOpen(false)}
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
