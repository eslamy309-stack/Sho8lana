'use client'

import { motion } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, Wifi, TrendingUp, Newspaper,
  Target, BarChart2, Briefcase, Brain, Mic,
} from 'lucide-react'
import { useApp } from '@/lib/store'

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }
const up = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } } }

const FEED_ITEMS: {
  tag: string; tagAr: string; title: string; titleAr: string;
  body: string; bodyAr: string; color: string; icon: React.ElementType;
  date: string; dateAr: string;
}[] = [
  {
    tag: 'Internship Tip', tagAr: 'نصيحة تدريب',
    title: 'How to stand out in your first internship application',
    titleAr: 'كيف تتميز في أول طلب تدريب',
    body: 'Tailor your CV to each role, highlight university projects, and follow up within a week.',
    bodyAr: 'خصص سيرتك الذاتية لكل وظيفة، أبرز مشاريعك الجامعية، وتابع خلال أسبوع.',
    color: '#0D9488', icon: Target, date: 'Today', dateAr: 'اليوم',
  },
  {
    tag: 'Market Insight', tagAr: 'رؤية السوق',
    title: 'Top in-demand skills for Egyptian graduates in 2025',
    titleAr: 'أكثر المهارات طلباً لخريجي مصر 2025',
    body: 'Data analysis, digital marketing, and financial modeling top the list for business graduates.',
    bodyAr: 'تحليل البيانات، التسويق الرقمي، والنمذجة المالية في صدارة القائمة.',
    color: '#7C3AED', icon: BarChart2, date: '2 days ago', dateAr: 'منذ يومين',
  },
  {
    tag: 'Career Advice', tagAr: 'نصيحة مهنية',
    title: 'Build your LinkedIn before you graduate',
    titleAr: 'ابنِ ملفك على LinkedIn قبل التخرج',
    body: 'Students with active LinkedIn profiles are 2× more likely to get interview calls.',
    bodyAr: 'الطلاب الذين لديهم ملفات LinkedIn نشطة أكثر عرضة مرتين للحصول على دعوات مقابلات.',
    color: '#0891B2', icon: Briefcase, date: '3 days ago', dateAr: 'منذ 3 أيام',
  },
  {
    tag: 'AI & Tech', tagAr: 'الذكاء الاصطناعي',
    title: 'How AI is changing internship hiring in Egypt',
    titleAr: 'كيف يغير الذكاء الاصطناعي التوظيف في مصر',
    body: 'Platforms now use AI screening — strong keywords and clear achievements beat generic CVs.',
    bodyAr: 'المنصات تستخدم الذكاء الاصطناعي في الفرز — الكلمات المفتاحية القوية تفوق السير الذاتية العامة.',
    color: '#D97706', icon: Brain, date: '5 days ago', dateAr: 'منذ 5 أيام',
  },
  {
    tag: 'Interview Prep', tagAr: 'تحضير المقابلة',
    title: 'Common behavioral questions Egyptian companies ask',
    titleAr: 'أسئلة السلوك الشائعة في الشركات المصرية',
    body: 'Prepare STAR-format answers for: teamwork, handling pressure, and problem-solving scenarios.',
    bodyAr: 'احضّر إجابات بصيغة STAR لـ: العمل الجماعي، والتعامل مع الضغط، وحل المشكلات.',
    color: '#059669', icon: Mic, date: '1 week ago', dateAr: 'منذ أسبوع',
  },
]

export function FeedsScreen() {
  const { state, dispatch } = useApp()
  const ar = state.lang === 'ar'

  return (
    <div className="min-h-dvh bg-neutral-50">
      {/* Topbar */}
      <div className="sticky top-0 z-20 bg-white border-b border-neutral-100 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => dispatch({ type: 'GO_BACK' })}
          aria-label="Go back"
          className="w-9 h-9 flex items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 transition-colors -ml-1"
        >
          {ar ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
        <div className="flex items-center gap-2 flex-1">
          <Wifi className="w-4 h-4 text-success-500" />
          <h2 className="text-sm font-bold text-neutral-900">{ar ? 'الأخبار والنصائح' : 'Career Feed'}</h2>
        </div>
        <span className="text-2xs font-semibold text-success-600 bg-success-50 px-2 py-1 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" />
          {ar ? 'مباشر' : 'Live'}
        </span>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="visible" className="px-4 py-4 flex flex-col gap-4">
        {/* Header */}
        <motion.div variants={up} className="rounded-2xl p-4 border border-brand-200 bg-brand-50">
          <div className="flex items-center gap-2 mb-1">
            <Newspaper className="w-4 h-4 text-brand-600" />
            <span className="text-sm font-bold text-brand-800">{ar ? 'لك فقط' : 'Curated for you'}</span>
          </div>
          <p className="text-xs text-brand-600">
            {ar ? 'أحدث النصائح، رؤى السوق، والفرص لطلاب الجامعات المصرية.' : 'Latest tips, market insights, and opportunities for Egyptian university students.'}
          </p>
        </motion.div>

        {FEED_ITEMS.map((item, i) => (
          <motion.div
            key={i}
            variants={up}
            custom={i}
            whileHover={{ y: -2, boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}
            className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-card"
          >
            <div className="flex items-start gap-3">
              {(() => {
                const FeedIcon = item.icon
                return (
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                       style={{ background: `${item.color}15` }}>
                    <FeedIcon className="w-5 h-5" style={{ color: item.color }} />
                  </div>
                )
              })()}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xs font-bold px-2 py-0.5 rounded-md"
                        style={{ background: `${item.color}15`, color: item.color }}>
                    {ar ? item.tagAr : item.tag}
                  </span>
                  <span className="text-2xs text-neutral-400">{ar ? item.dateAr : item.date}</span>
                </div>
                <h4 className="text-sm font-bold text-neutral-900 leading-snug mb-1.5">
                  {ar ? item.titleAr : item.title}
                </h4>
                <p className="text-xs text-neutral-500 leading-relaxed">{ar ? item.bodyAr : item.body}</p>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Trending section */}
        <motion.div variants={up} className="rounded-2xl p-4 border border-neutral-200 bg-white">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-warning-500" />
            <span className="text-sm font-bold text-neutral-800">{ar ? 'الأكثر بحثاً' : 'Trending searches'}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(ar
              ? ['تدريب صيفي', 'تسويق رقمي', 'تحليل بيانات', 'مقابلة عمل', 'سيرة ذاتية', 'LinkedIn']
              : ['Summer internship', 'Digital marketing', 'Data analysis', 'Interview tips', 'CV writing', 'LinkedIn']
            ).map((tag, i) => (
              <span key={i} className="text-xs font-medium text-neutral-600 bg-neutral-100 px-3 py-1.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
