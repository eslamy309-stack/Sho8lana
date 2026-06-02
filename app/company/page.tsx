'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2, Zap, Users, Briefcase, CheckCircle2, ArrowRight,
  Eye, FileText, Send, BarChart2, Star, TrendingUp, Plus,
  Globe, Mail, Lock, LogIn,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] } }),
}
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }

const BENEFITS = [
  { icon: Users,      color: '#0D9488', title: 'Access 214,000+ graduates',        titleAr: 'الوصول لـ 214,000+ خريج',        body: "Egypt's largest pool of motivated, pre-screened fresh graduates and students from GUC, AUC, BUE, and 200+ universities.", bodyAr: 'أكبر تجمع من الخريجين الجدد المتحمسين من GUC وAUC وBUE وأكثر من 200 جامعة.' },
  { icon: FileText,   color: '#7C3AED', title: 'Verified portfolios included',      titleAr: 'محافظ موثّقة شاملة',             body: 'Every applicant sends their CV, transcript, national ID, photo, and certificates in one tap. No chasing documents.', bodyAr: 'كل متقدم يرسل سيرته الذاتية وكشف الدرجات والبطاقة والشهادات بلمسة واحدة. لا تعقيدات.' },
  { icon: BarChart2,  color: '#F59E0B', title: 'AI candidate matching',             titleAr: 'مطابقة المرشحين بالذكاء الاصطناعي', body: 'Our AI scores each applicant against your job requirements and ranks them automatically — saving your HR team hours.', bodyAr: 'يسجّل ذكاؤنا الاصطناعي كل متقدم مقابل متطلباتك ويرتبهم تلقائياً — يوفر ساعات على فريق الموارد البشرية.' },
  { icon: TrendingUp, color: '#EC4899', title: 'Build your employer brand',        titleAr: 'ابنِ علامتك كصاحب عمل',           body: 'Company profile with reviews, culture insights, and salary benchmarks. Be known as a great employer before students graduate.', bodyAr: 'ملف شركة مع تقييمات ورؤى ثقافية ومعايير رواتب. كن معروفاً كصاحب عمل رائع قبل تخرج الطلاب.' },
  { icon: Zap,        color: '#06B6D4', title: 'Post, hire, onboard — fast',       titleAr: 'انشر، وظّف، هيّئ — بسرعة',       body: 'Publish a job in under 5 minutes. Shortlist candidates in your dashboard. One-click invite to interview. Offer sent in-platform.', bodyAr: 'انشر وظيفة في أقل من 5 دقائق. ضع المرشحين في القائمة القصيرة. دعوة بنقرة واحدة. أرسل العرض داخل المنصة.' },
  { icon: Star,       color: '#10B981', title: 'Simulation-tested candidates',     titleAr: 'مرشحون اختُبروا بالمحاكاة',       body: "Hire students who've already completed real business simulations in their role — no training from scratch.", bodyAr: 'وظّف طلاباً أتمّوا بالفعل محاكاة أعمال حقيقية في دورهم — لا تدريب من الصفر.' },
]

const STEPS = [
  { num: '01', title: 'Create your company profile', body: 'Set up in 10 minutes. Add your logo, description, culture, and contact details.' },
  { num: '02', title: 'Post your jobs & internships',  body: 'Standardized forms ensure every posting reaches the right students in both Arabic and English.' },
  { num: '03', title: 'Review verified applicants',    body: 'All documents are pre-collected. AI ranks candidates by match score. Filter by GPA, university, or skills.' },
  { num: '04', title: 'Invite, offer, hire',           body: 'Send interview invites and job offers directly through Sho8lana. Zero email chains.' },
]

const COMPANIES_LIST = [
  { name: 'Vodafone Egypt',  logo: '🔴', hires: 12 },
  { name: 'CIB Egypt',       logo: '🏦', hires: 8  },
  { name: 'P&G Egypt',       logo: '🧴', hires: 15 },
  { name: 'Microsoft Egypt', logo: '💻', hires: 6  },
  { name: 'McKinsey Cairo',  logo: '📊', hires: 4  },
  { name: 'Deloitte Egypt',  logo: '🟢', hires: 10 },
]

type AuthMode = 'landing' | 'login' | 'register' | 'dashboard'

interface LoginForm { email: string; password: string; company: string }

export default function CompanyPortalPage() {
  const [lang, setLang] = useState<'en' | 'ar'>('en')
  const ar = lang === 'ar'
  const [authMode, setAuthMode] = useState<AuthMode>('landing')
  const [form, setForm] = useState<LoginForm>({ email: '', password: '', company: '' })
  const [loggedIn, setLoggedIn] = useState(false)
  const [portalTab, setPortalTab] = useState<'dashboard' | 'post' | 'applicants'>('dashboard')
  const [jobPosted, setJobPosted] = useState(false)
  const [newJobTitle, setNewJobTitle] = useState('')

  function handleAuth() {
    if (!form.email || !form.password) return
    setLoggedIn(true)
    setAuthMode('dashboard')
  }

  function handlePostJob() {
    if (!newJobTitle) return
    setJobPosted(true)
    setTimeout(() => setJobPosted(false), 3000)
  }

  // ── Dashboard (logged in) ──────────────────────────────────────────
  if (loggedIn && authMode === 'dashboard') {
    return (
      <div className="min-h-dvh bg-neutral-50 font-sans">
        {/* Nav */}
        <nav className="bg-white border-b border-neutral-100 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-neutral-900 text-sm">Sho8lana</span>
            <span className="text-xs text-neutral-400 hidden sm:block">· Employer Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-600 font-medium">{form.company || 'Your Company'}</span>
            <div className="w-8 h-8 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-sm">
              {(form.company || 'C')[0]}
            </div>
          </div>
        </nav>

        <div className="max-w-5xl mx-auto px-4 py-6">
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Total Applicants', value: '223', icon: Users,       color: '#0D9488' },
              { label: 'Active Postings',  value: '4',   icon: Briefcase,   color: '#7C3AED' },
              { label: 'Profile Views',    value: '1.2K', icon: TrendingUp, color: '#F59E0B' },
              { label: 'Offers Sent',      value: '3',   icon: Star,        color: '#10B981' },
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

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            {(['dashboard', 'post', 'applicants'] as const).map(t => (
              <button
                key={t}
                onClick={() => setPortalTab(t)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-semibold transition-colors',
                  portalTab === t ? 'bg-brand-600 text-white' : 'bg-white text-neutral-600 border border-neutral-200 hover:border-brand-300',
                )}
              >
                {t === 'dashboard' ? 'Overview' : t === 'post' ? '+ Post Job' : 'Applicants'}
              </button>
            ))}
          </div>

          {/* Overview */}
          {portalTab === 'dashboard' && (
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Recent applicants */}
              <div className="bg-white rounded-2xl p-4 border border-neutral-100 shadow-sm">
                <p className="text-sm font-bold text-neutral-900 mb-3">Recent Applicants</p>
                <p className="text-sm text-neutral-400 text-center py-4">No applicants yet</p>
              </div>

              {/* Active postings */}
              <div className="bg-white rounded-2xl p-4 border border-neutral-100 shadow-sm">
                <p className="text-sm font-bold text-neutral-900 mb-3">Active Postings</p>
                <p className="text-sm text-neutral-400 text-center py-4">No active postings</p>
                <button onClick={() => setPortalTab('post')} className="text-xs text-brand-600 font-semibold mt-2 hover:underline">
                  + Post a new job →
                </button>
              </div>
            </div>
          )}

          {/* Post Job */}
          {portalTab === 'post' && (
            <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm max-w-xl">
              <p className="text-base font-bold text-neutral-900 mb-4">Post a new position</p>
              {jobPosted ? (
                <div className="flex flex-col items-center py-8 gap-3">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                  <p className="text-lg font-bold text-neutral-900">Job Posted!</p>
                  <p className="text-sm text-neutral-500">Students will see this immediately.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-neutral-600 block mb-1">Job Title *</label>
                    <input
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="e.g. Marketing Intern"
                      value={newJobTitle}
                      onChange={e => setNewJobTitle(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-neutral-600 block mb-1">Location</label>
                      <select className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                        <option>New Cairo</option><option>Smart Village</option><option>Maadi</option><option>6th October</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-600 block mb-1">Type</label>
                      <select className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                        <option>Internship</option><option>Full-time</option><option>Part-time</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-600 block mb-1">Description *</label>
                    <textarea rows={4} className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="Describe the role and responsibilities..." />
                  </div>
                  <div className="bg-brand-50 rounded-xl p-3 border border-brand-100">
                    <p className="text-xs font-bold text-brand-700 mb-2">Students auto-attach with every application:</p>
                    <div className="grid grid-cols-3 gap-1">
                      {['CV/Resume','Transcript','National ID','Photo','Certificates','Cover Letter'].map(d => (
                        <div key={d} className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-brand-600" />
                          <span className="text-xs text-brand-700">{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button onClick={handlePostJob} disabled={!newJobTitle} className="w-full h-11 gap-2">
                    <Send className="w-4 h-4" /> Publish Job
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Applicants */}
          {portalTab === 'applicants' && (
            <div className="bg-white rounded-2xl p-8 border border-neutral-100 shadow-sm text-center">
              <p className="text-sm font-semibold text-neutral-500">No applications yet</p>
              <p className="text-xs text-neutral-400 mt-1">Post a job to start receiving applications</p>
              <button onClick={() => setPortalTab('post')} className="mt-3 px-4 py-2 bg-brand-600 text-white text-xs font-semibold rounded-lg hover:bg-brand-700 transition-colors">
                + Post a Job
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Auth screens ──────────────────────────────────────────────────
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
            {authMode === 'login' ? 'Sign in to your employer account' : 'Start hiring Egypt\'s best graduates'}
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
                    value={form.company}
                    onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
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
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
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
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <Button onClick={handleAuth} className="w-full h-11 mt-4 gap-2">
            <LogIn className="w-4 h-4" />
            {authMode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>

          <p className="text-center text-xs text-neutral-500 mt-4">
            {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              className="text-brand-400 font-semibold hover:underline"
            >
              {authMode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>

          <button onClick={() => setAuthMode('landing')} className="w-full text-center text-xs text-neutral-600 mt-3 hover:text-neutral-400 transition-colors">
            ← Back to overview
          </button>
        </motion.div>
      </div>
    )
  }

  // ── Landing page ──────────────────────────────────────────────────
  return (
    <div className={cn('min-h-dvh font-sans bg-neutral-950', ar && 'font-arabic')} dir={ar ? 'rtl' : 'ltr'}>
      {/* Nav */}
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

          {/* Social proof */}
          <motion.div variants={fadeUp} className="flex items-center gap-4 mt-8">
            <div className="flex -space-x-2">
              {COMPANIES_LIST.slice(0, 4).map(c => (
                <div key={c.name} className="w-8 h-8 rounded-full bg-neutral-800 border-2 border-neutral-950 flex items-center justify-center text-sm">
                  {c.logo}
                </div>
              ))}
            </div>
            <p className="text-sm text-neutral-400">
              {ar ? 'انضمت 6+ شركات رائدة في مصر' : '6+ leading Egyptian companies already on board'}
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Benefits grid */}
      <section className="px-6 md:px-10 py-16 max-w-[1200px] mx-auto">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="mb-10 text-center"
        >
          <motion.p variants={fadeUp} className="text-brand-400 text-xs font-semibold uppercase tracking-widest mb-3">
            {ar ? 'لماذا Sho8lana' : 'Why Sho8lana'}
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-serif text-white">
            {ar ? 'ستغيّر طريقة توظيفك للأبد' : 'It changes how you hire forever'}
          </motion.h2>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BENEFITS.map(({ icon: Icon, color, title, titleAr, body, bodyAr }, i) => (
            <motion.div
              key={title}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${color}20` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{ar ? titleAr : title}</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">{ar ? bodyAr : body}</p>
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
              <motion.div
                key={s.num}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="relative"
              >
                <div className="text-4xl font-bold text-brand-600/20 mb-3">{s.num}</div>
                <h3 className="text-sm font-bold text-white mb-2">{s.title}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Companies already on board */}
      <section className="px-6 md:px-10 py-16 max-w-[1200px] mx-auto text-center">
        <p className="text-brand-400 text-xs font-semibold uppercase tracking-widest mb-4">
          {ar ? 'شركات تستخدم Sho8lana' : 'Companies already hiring on Sho8lana'}
        </p>
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {COMPANIES_LIST.map(c => (
            <div key={c.name} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-xl">{c.logo}</span>
              <div>
                <p className="text-sm font-semibold text-white">{c.name}</p>
                <p className="text-xs text-neutral-500">{c.hires} hires</p>
              </div>
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto"
        >
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

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 md:px-10 py-6 text-center">
        <p className="text-xs text-neutral-600">
          © 2026 Sho8lana · شغلانة · Built for Egyptian students and companies
        </p>
      </footer>
    </div>
  )
}
