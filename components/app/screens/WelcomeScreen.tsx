'use client'

import { motion } from 'framer-motion'
import {
  GraduationCap, Building2, Globe, Zap, CheckCircle2,
  ArrowRight, Sparkles, TrendingUp,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────
// Translations
// ─────────────────────────────────────────────────────────────
const t = {
  en: {
    logo: 'Sho8lana',
    eyebrow: '#1 in Egypt',
    headline: "Egypt's Premier\nCareer Platform",
    subline: 'Choose your path to unlock the full experience.',
    student: {
      badge: 'For Students',
      headline: 'Launch Your Career',
      sub: 'Find internships, build real skills, and land your dream job.',
      features: [
        '10,000+ internships across Egypt',
        'Real business simulations & XP',
        'AI career coach, 24/7',
      ],
      stats: [
        { v: '214K+', l: 'Graduates/yr' },
        { v: '500+',  l: 'Companies' },
        { v: '1-tap', l: 'Apply' },
      ],
      cta: 'Get Started Free',
    },
    company: {
      badge: 'For Companies',
      headline: "Hire Egypt's Best",
      sub: 'Pre-screened, simulation-tested talent from Egypt\'s top universities.',
      features: [
        'Smart AI candidate matching',
        'Simulation-based assessments',
        'Full recruitment pipeline',
      ],
      stats: [
        { v: '500+', l: 'Companies' },
        { v: '25',   l: 'Free trials' },
        { v: 'Live', l: 'Dashboard' },
      ],
      cta: 'Post Jobs & Find Talent',
    },
    footer: {
      haveAccount: 'Already have an account?',
      signIn: 'Sign in',
      trust: "Trusted by Egypt's leading employers",
    },
  },
  ar: {
    logo: 'شُغلانة',
    eyebrow: 'الأول في مصر',
    headline: 'المنصة المهنية\nالأولى في مصر',
    subline: 'اختر مسارك للوصول إلى التجربة الكاملة.',
    student: {
      badge: 'للطلاب',
      headline: 'أطلق مسيرتك المهنية',
      sub: 'ابحث عن التدريب، طوّر مهاراتك، واحصل على وظيفة أحلامك.',
      features: [
        '+10,000 فرصة تدريب في مصر',
        'محاكاة مهنية حقيقية وخبرات',
        'مدرب مهني بالذكاء الاصطناعي 24/7',
      ],
      stats: [
        { v: '+214K', l: 'خريج/سنة' },
        { v: '+500',  l: 'شركة' },
        { v: 'بضغطة', l: 'تقديم' },
      ],
      cta: 'ابدأ مجاناً',
    },
    company: {
      badge: 'للشركات',
      headline: 'وظّف أفضل الكفاءات',
      sub: 'مواهب مُقيَّمة ومُختبَرة من أفضل الجامعات المصرية.',
      features: [
        'مطابقة ذكية للمرشحين بالذكاء الاصطناعي',
        'تقييمات قائمة على المحاكاة',
        'خط توظيف كامل وتحليلات',
      ],
      stats: [
        { v: '+500', l: 'شركة' },
        { v: '25',   l: 'تجربة مجانية' },
        { v: 'مباشر', l: 'لوحة التحكم' },
      ],
      cta: 'انشر وظائف واكتشف المواهب',
    },
    footer: {
      haveAccount: 'لديك حساب بالفعل؟',
      signIn: 'سجّل دخولك',
      trust: 'موثوق به من كبرى شركات مصر',
    },
  },
}

// ─────────────────────────────────────────────────────────────
// Door Card
// ─────────────────────────────────────────────────────────────
interface DoorCardProps {
  type: 'student' | 'company'
  data: (typeof t)['en']['student'] | (typeof t)['en']['company']
  lang: 'en' | 'ar'
  delay: number
  onSelect: () => void
}

function DoorCard({ type, data, lang, delay, onSelect }: DoorCardProps) {
  const ar        = lang === 'ar'
  const isStu     = type === 'student'

  const Icon       = isStu ? GraduationCap : Building2
  const TrendIcon  = isStu ? Sparkles      : TrendingUp
  const iconBg     = isStu ? '#0D9488'     : '#7C3AED'   // brand-600 / violet-600
  const badgeBg    = isStu ? 'bg-brand-500/15  text-brand-300'   : 'bg-violet-500/15 text-violet-300'
  const checkColor = isStu ? 'text-brand-400'             : 'text-violet-400'
  const statColor  = isStu ? 'text-brand-300'             : 'text-violet-300'
  const borderGlow = isStu ? 'border-brand-500/25  hover:border-brand-400/45'
                           : 'border-violet-500/25 hover:border-violet-400/45'
  const ctaBg      = isStu
    ? 'bg-brand-600  hover:bg-brand-500  shadow-[0_4px_14px_0_rgba(13,148,136,0.35)]'
    : 'bg-violet-600 hover:bg-violet-500 shadow-[0_4px_14px_0_rgba(124,58,237,0.35)]'
  const cardBg     = isStu
    ? 'linear-gradient(145deg,#0e1c1a 0%,#042F2E 100%)'
    : 'linear-gradient(145deg,#120d1e 0%,#1c1033 100%)'
  const glowColor  = isStu ? 'rgba(13,148,136,0.12)' : 'rgba(124,58,237,0.12)'

  return (
    <motion.button
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const, delay }}
      whileTap={{ scale: 0.984 }}
      onClick={onSelect}
      aria-label={data.badge}
      className={cn(
        'w-full text-left rounded-2xl border p-5 relative overflow-hidden',
        'transition-all duration-300 active:brightness-95 cursor-pointer',
        borderGlow,
        ar && 'text-right',
      )}
      style={{ background: cardBg }}
    >
      {/* Ambient glow blob */}
      <div
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl pointer-events-none"
        style={{ background: glowColor }}
      />

      {/* ── Badge row ── */}
      <div className={cn('flex items-center gap-2 mb-3', ar && 'flex-row-reverse justify-end')}>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md"
          style={{ background: iconBg }}
        >
          <Icon className="w-5 h-5 text-white" strokeWidth={2} />
        </div>
        <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', badgeBg)}>
          {data.badge}
        </span>
        <TrendIcon className={cn('w-3.5 h-3.5 ml-auto', statColor, ar && 'ml-0 mr-auto')} />
      </div>

      {/* ── Headline ── */}
      <h2 className={cn(
        'text-white font-bold leading-tight mb-1.5',
        ar ? 'font-arabic text-xl' : 'text-xl',
      )}>
        {data.headline}
      </h2>
      <p className="text-neutral-400 text-xs leading-relaxed mb-3">
        {data.sub}
      </p>

      {/* ── Feature bullets ── */}
      <ul className="flex flex-col gap-1.5 mb-4">
        {data.features.map((feat, i) => (
          <li
            key={i}
            className={cn('flex items-start gap-2 text-xs text-neutral-300', ar && 'flex-row-reverse text-right')}
          >
            <CheckCircle2 className={cn('w-3.5 h-3.5 shrink-0 mt-0.5', checkColor)} />
            <span>{feat}</span>
          </li>
        ))}
      </ul>

      {/* ── Stats strip ── */}
      <div className={cn(
        'flex gap-4 mb-4 pb-4 border-b border-white/8',
        ar && 'flex-row-reverse',
      )}>
        {data.stats.map((s, i) => (
          <div key={i} className={cn('text-center', i === 0 && !ar && 'text-left', i === 0 && ar && 'text-right')}>
            <p className={cn('text-base font-bold tabular-nums', statColor)}>{s.v}</p>
            <p className="text-neutral-500 text-2xs mt-0.5">{s.l}</p>
          </div>
        ))}
      </div>

      {/* ── CTA button ── */}
      <div className={cn(
        'flex items-center justify-center gap-2 w-full py-3 rounded-xl',
        'text-white text-sm font-semibold transition-colors duration-200',
        ctaBg,
        ar && 'flex-row-reverse',
      )}>
        <span>{data.cta}</span>
        <ArrowRight className="w-4 h-4 shrink-0" />
      </div>
    </motion.button>
  )
}

// ─────────────────────────────────────────────────────────────
// WelcomeScreen
// ─────────────────────────────────────────────────────────────
const up = {
  hidden:  { opacity: 0, y: 16 },
  visible: (d: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const, delay: d * 0.09 },
  }),
}

export function WelcomeScreen() {
  const { state, dispatch } = useApp()
  const lang = state.lang ?? 'en'
  const ar   = lang === 'ar'
  const tx   = t[lang]

  function goStudent() {
    dispatch({ type: 'SET_USER', user: { role: 'student' } })
    dispatch({ type: 'GO', screen: 'onboard' })
  }

  function goCompany() {
    dispatch({ type: 'SET_USER', user: { role: 'company_recruiter' } })
    dispatch({ type: 'GO', screen: 'companyOnboarding' })
  }

  return (
    <div
      className="min-h-dvh flex flex-col bg-neutral-950 relative overflow-x-hidden"
      dir={ar ? 'rtl' : 'ltr'}
    >
      {/* ── Ambient background blobs ─────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-16 -left-16 w-72 h-72 rounded-full blur-[100px] opacity-60"
          style={{ background: 'radial-gradient(circle,rgba(13,148,136,0.18) 0%,transparent 70%)' }}
        />
        <div
          className="absolute top-[40%] -right-20 w-80 h-80 rounded-full blur-[100px] opacity-50"
          style={{ background: 'radial-gradient(circle,rgba(124,58,237,0.18) 0%,transparent 70%)' }}
        />
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* ── Scrollable content ───────────────────────────────── */}
      <div className="relative z-10 flex flex-col px-5 pt-safe pb-8 min-h-dvh">

        {/* ── Top bar ──────────────────────────────────────────── */}
        <motion.header
          custom={0}
          variants={up}
          initial="hidden"
          animate="visible"
          className={cn('flex items-center justify-between py-4', ar && 'flex-row-reverse')}
        >
          {/* Logo */}
          <div className={cn('flex items-center gap-2.5', ar && 'flex-row-reverse')}>
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/40">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className={cn('flex items-center gap-2', ar && 'flex-row-reverse')}>
              <span className={cn('text-xl text-white', ar ? 'font-arabic font-semibold' : 'font-serif')}>
                {tx.logo}
              </span>
              <span className="text-2xs font-bold bg-brand-500/20 text-brand-300 px-1.5 py-0.5 rounded-md tracking-wide uppercase">
                Beta
              </span>
            </div>
          </div>

          {/* Language toggle */}
          <button
            onClick={() => dispatch({ type: 'GO', screen: 'lang' })}
            aria-label="Change language"
            className="w-11 h-11 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center text-neutral-400 hover:bg-white/12 hover:text-white transition-colors active:scale-95"
          >
            <Globe className="w-4 h-4" />
          </button>
        </motion.header>

        {/* ── Hero text ────────────────────────────────────────── */}
        <motion.div
          custom={1}
          variants={up}
          initial="hidden"
          animate="visible"
          className="mt-4 mb-6"
        >
          {/* Eyebrow badge */}
          <div className={cn('flex items-center gap-2 mb-3', ar && 'flex-row-reverse')}>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />
            <span className="text-brand-400 text-2xs font-bold tracking-widest uppercase whitespace-nowrap">
              {tx.eyebrow}
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />
          </div>

          <h1 className={cn(
            'text-white font-bold leading-tight text-balance',
            ar ? 'font-arabic text-3xl' : 'font-serif text-4xl',
          )}>
            {tx.headline.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i === 0 && <br />}
              </span>
            ))}
          </h1>

          <p className="text-neutral-400 text-sm mt-2.5 leading-relaxed">
            {tx.subline}
          </p>
        </motion.div>

        {/* ── Two door cards ───────────────────────────────────── */}
        <div className="flex flex-col gap-3 flex-1">
          <DoorCard
            type="student"
            data={tx.student}
            lang={lang}
            delay={0.25}
            onSelect={goStudent}
          />
          <DoorCard
            type="company"
            data={tx.company}
            lang={lang}
            delay={0.4}
            onSelect={goCompany}
          />
        </div>

        {/* ── Footer ───────────────────────────────────────────── */}
        <motion.footer
          custom={2}
          variants={up}
          initial="hidden"
          animate="visible"
          className="mt-5 flex flex-col items-center gap-2"
        >
          <p className={cn('text-sm text-neutral-500 text-center', ar && 'font-arabic')}>
            {tx.footer.haveAccount}{' '}
            <button
              onClick={() => dispatch({ type: 'GO', screen: 'login' })}
              className="text-brand-400 font-semibold hover:text-brand-300 transition-colors underline-offset-2 hover:underline"
            >
              {tx.footer.signIn}
            </button>
          </p>

          {/* Trust line */}
          <div className={cn('flex items-center gap-2 mt-1', ar && 'flex-row-reverse')}>
            <div className="h-px w-8 bg-neutral-700" />
            <p className="text-2xs text-neutral-600 text-center">{tx.footer.trust}</p>
            <div className="h-px w-8 bg-neutral-700" />
          </div>

          {/* Decorative dots — company logos placeholder */}
          <div className="flex items-center gap-3 mt-2">
            {['#10b981','#3b82f6','#f59e0b','#ef4444','#8b5cf6'].map((color, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full opacity-40 border border-white/10"
                style={{ background: color }}
              />
            ))}
          </div>
        </motion.footer>
      </div>
    </div>
  )
}
