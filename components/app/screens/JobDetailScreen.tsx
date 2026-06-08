'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, MapPin, Clock, Users, Check, Sparkles, Copy, Send, Loader2, AlertCircle } from 'lucide-react'
import { useApp, callGemini } from '@/lib/store'
import { COMPANIES, JOBS, SOURCE_CONFIG, DOCUMENTS } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }
const up = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } } }

export function JobDetailScreen() {
  const { state, dispatch } = useApp()
  const ar = state.lang === 'ar'
  const job = JOBS.find(j => j.id === state.selectedJob)
  const [applying, setApplying] = useState(false)
  const [applyError, setApplyError] = useState('')

  if (!job) { dispatch({ type: 'GO', screen: 'home' }); return null }

  const company = COMPANIES.find(c => c.id === job.companyId)!
  const src = SOURCE_CONFIG[job.source]
  const applied = state.applications.some(a => a.jobId === job.id)
  const isProfileDone =
    state.user.name && state.user.university && state.user.major &&
    DOCUMENTS.filter(d => d.required).every(d => state.user.documents[d.key])

  async function getMatchScore() {
    if (!job) return
    dispatch({ type: 'SET_MATCH_LOADING', loading: true })
    const res = await callGemini(
      `Rate match 0-100. Return ONLY JSON: {"score":N,"reasons":["r1","r2","r3"],"tips":["t1","t2"]}. Student: ${state.user.name||'Student'}, ${state.user.major||'Business'}, GPA:${state.user.gpa||'3.0'}, ${state.user.location}. Job: ${job.title} at ${company.name}, skills: ${job.skills.join(', ')}. ${ar ? 'reasons and tips in Arabic.' : ''}`,
      'Return ONLY valid JSON. No markdown.'
    )
    try { dispatch({ type: 'SET_MATCH_SCORE', score: JSON.parse(res.replace(/```json|```/g,'').trim()) }) }
    catch { dispatch({ type: 'SET_MATCH_SCORE', score: { score: 74, reasons: [ar?'تخصص مناسب':'Relevant major', ar?'موقع قريب':'Good location', ar?'مهارات متوافقة':'Skills match'], tips: [ar?'طوّر مهاراتك':'Build technical skills'] } }) }
    dispatch({ type: 'SET_MATCH_LOADING', loading: false })
  }

  async function genCoverLetter() {
    if (!job) return
    dispatch({ type: 'SET_CV_LOADING', loading: true })
    const res = await callGemini(
      `Write a 100-word professional cover letter for ${job.title} at ${company.name} in Egypt. Student: ${state.user.name||'Student'}, studying ${state.user.major||'Business'} at ${state.user.university||'Egyptian university'}, GPA: ${state.user.gpa||'3.0'}. ${ar ? 'Write in Arabic.' : 'Write in English.'}`,
      `Write concise professional cover letters.`
    )
    dispatch({ type: 'SET_CV_TEXT', text: res })
    dispatch({ type: 'SET_CV_LOADING', loading: false })
  }

  async function apply() {
    if (!job) return
    if (!state.user.supabaseId) {
      setApplyError(ar ? 'يجب تسجيل الدخول للتقديم' : 'Sign in required to apply.')
      return
    }
    setApplying(true)
    setApplyError('')
    try {
      // Look up the Supabase UUID for this curated job (seeded via seed.sql)
      const dbJobId = state.jobDbIds[job.id] ?? null

      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId:      state.user.supabaseId,
          jobId:       dbJobId,
          jobTitle:    ar ? job.titleAr : job.title,
          company:     company.name,
          companyLogo: company.logo,
          coverNote:   state.cvText ?? '',
          source:      job.source,
          // Fall back to externalUrl so the duplicate check still works before seed is run
          externalJobId: dbJobId ? undefined : `local-${job.id}`,
        }),
      })
      const data = await res.json()
      if (res.status === 409) {
        // Already applied — mark as applied locally and continue
        dispatch({ type: 'ADD_APPLICATION', app: {
          id: Date.now(), jobId: job.id, title: ar ? job.titleAr : job.title,
          company: company.name, status: 'applied',
          date: new Date().toLocaleDateString('en-GB'), logo: company.logo,
        }})
        return
      }
      if (!res.ok) throw new Error(data.error ?? 'Application failed')
      dispatch({ type: 'ADD_APPLICATION', app: {
        id: data.application?.id ?? Date.now(),
        jobId: job.id, title: ar ? job.titleAr : job.title,
        company: company.name, status: 'applied',
        date: new Date().toLocaleDateString('en-GB'), logo: company.logo,
      }})
    } catch (e: unknown) {
      setApplyError(e instanceof Error ? e.message : 'Failed to submit application')
    } finally {
      setApplying(false)
    }
  }

  return (
    <div className="min-h-dvh bg-white pb-24">
      {/* Topbar */}
      <div className="sticky top-0 z-20 bg-white border-b border-neutral-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => dispatch({ type: 'GO_BACK' })} className="p-1 text-neutral-500">
          {ar ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
        <span className="text-sm font-semibold text-neutral-900 flex-1">
          {ar ? 'تفاصيل التدريب' : 'Internship Details'}
        </span>
        <span className="text-2xs font-bold px-2 py-1 rounded-md"
              style={{ background: `${src.color}15`, color: src.color }}>
          {src.label}
        </span>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="visible" className="px-4 py-4 flex flex-col gap-4">
        {/* Header */}
        <motion.div variants={up} className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-sm font-black text-white"
               style={{ background: company.color }}>
            {company.name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-neutral-900">{ar ? job.titleAr : job.title}</h2>
            <p className="text-sm text-neutral-500 mt-0.5">{company.name}</p>
          </div>
        </motion.div>

        {/* Meta badges */}
        <motion.div variants={up} className="flex gap-2 flex-wrap">
          {[
            { icon: <MapPin className="w-3 h-3" />, label: job.location, color: 'brand' },
            { icon: null, label: job.salary, color: 'warning' },
            { icon: <Clock className="w-3 h-3" />, label: ar ? '3 أشهر' : '3 months', color: 'neutral' },
            { icon: <Users className="w-3 h-3" />, label: `${job.applicants} ${ar ? 'متقدم' : 'applied'}`, color: 'neutral' },
          ].map((b, i) => (
            <span key={i} className={cn(
              'inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium',
              b.color === 'brand' && 'text-brand-700 bg-brand-50',
              b.color === 'warning' && 'text-warning-700 bg-warning-50',
              b.color === 'neutral' && 'text-neutral-600 bg-neutral-100',
            )}>
              {b.icon}{b.label}
            </span>
          ))}
        </motion.div>

        {/* AI Match Score */}
        <motion.div variants={up} className="rounded-2xl p-4 border border-violet-200 bg-violet-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-600" />
              <span className="text-sm font-bold text-violet-800">{ar ? 'درجة التوافق' : 'AI Match Score'}</span>
            </div>
            {!state.matchScore && !state.matchLoading && (
              <button onClick={getMatchScore}
                className="text-xs font-semibold text-violet-600 bg-violet-600/10 px-3 py-1.5 rounded-lg hover:bg-violet-600/20 transition-colors flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> {ar ? 'احسب' : 'Calculate'}
              </button>
            )}
            {state.matchLoading && <div className="w-4 h-4 border-2 border-violet-600/30 border-t-violet-600 rounded-full animate-spin" />}
          </div>
          {state.matchScore && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center font-extrabold text-base text-violet-700"
                   style={{ background: `conic-gradient(#7C3AED ${state.matchScore.score * 3.6}deg, #EDE9FE ${state.matchScore.score * 3.6}deg)` }}>
                <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center">
                  {state.matchScore.score}%
                </div>
              </div>
              <div className="flex flex-col gap-1">
                {state.matchScore.reasons.map((r, i) => (
                  <p key={i} className="text-xs text-violet-700">✓ {r}</p>
                ))}
                {state.matchScore.tips.map((tp, i) => (
                  <p key={i} className="text-xs text-violet-500">💡 {tp}</p>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* About */}
        <motion.div variants={up}>
          <h3 className="text-sm font-bold text-neutral-900 mb-2">{ar ? 'عن هذا الدور' : 'About this role'}</h3>
          <p className="text-sm text-neutral-600 leading-relaxed">{ar ? job.descriptionAr : job.description}</p>
        </motion.div>

        {/* Requirements */}
        <motion.div variants={up}>
          <h3 className="text-sm font-bold text-neutral-900 mb-2">{ar ? 'المتطلبات' : 'Requirements'}</h3>
          <div className="flex flex-col gap-1.5">
            {(ar ? job.requirementsAr : job.requirements).map((r, i) => (
              <div key={i} className="flex gap-2 items-start">
                <Check className="w-3.5 h-3.5 text-brand-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-neutral-600">{r}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Skills */}
        <motion.div variants={up}>
          <h3 className="text-sm font-bold text-neutral-900 mb-2">{ar ? 'المهارات' : 'Skills'}</h3>
          <div className="flex gap-2 flex-wrap">
            {job.skills.map(s => (
              <span key={s} className="text-xs font-medium text-brand-600 bg-brand-50 px-3 py-1.5 rounded-full">{s}</span>
            ))}
          </div>
        </motion.div>

        {/* Documents */}
        <motion.div variants={up} className="bg-neutral-50 rounded-xl p-4">
          <h4 className="text-xs font-semibold text-neutral-600 mb-2">{ar ? 'المستندات المرفقة تلقائياً' : 'Documents auto-attached'}</h4>
          <div className="flex flex-wrap gap-2">
            {DOCUMENTS.filter(d => d.required).map(d => {
              const up2 = !!state.user.documents[d.key]
              return (
                <span key={d.key} className={cn('text-2xs font-semibold px-2 py-1 rounded-md inline-flex items-center gap-1',
                  up2 ? 'text-success-700 bg-success-50' : 'text-danger-600 bg-danger-50')}>
                  {up2 ? '✓' : '!'} {ar ? d.labelAr : d.label}
                </span>
              )
            })}
          </div>
          {!isProfileDone && <p className="text-xs text-danger-500 mt-2">{ar ? 'أكمل ملفك للتقديم →' : '← Complete your profile to apply'}</p>}
        </motion.div>

        {/* Cover Letter */}
        <motion.div variants={up} className="bg-neutral-50 rounded-xl p-4 border border-neutral-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-brand-600" /> {ar ? 'خطاب تقديم' : 'Cover Letter'}
            </span>
            {!state.cvLoading
              ? <button onClick={genCoverLetter} className="text-xs font-semibold text-brand-600 bg-brand-50 px-3 py-1.5 rounded-lg hover:bg-brand-100 transition-colors flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> {ar ? 'توليد بالذكاء' : 'Generate with AI'}
                </button>
              : <div className="w-4 h-4 border-2 border-brand-600/30 border-t-brand-600 rounded-full animate-spin" />
            }
          </div>
          {state.cvText && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
              <div className="bg-white rounded-lg border border-neutral-200 p-3">
                <p id="cv-text-inner" className="text-xs text-neutral-600 leading-relaxed whitespace-pre-wrap">{state.cvText}</p>
              </div>
              <button
                onClick={() => navigator.clipboard?.writeText(document.getElementById('cv-text-inner')?.textContent || '')}
                className="mt-2 flex items-center gap-1.5 text-2xs text-neutral-500 hover:text-neutral-700 transition-colors"
              >
                <Copy className="w-3 h-3" /> {ar ? 'نسخ' : 'Copy'}
              </button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Fixed Apply CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app px-4 py-4 bg-white border-t border-neutral-100 pb-safe">
        {applyError && (
          <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-2">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {applyError}
          </div>
        )}
        {applied
          ? <Button className="w-full bg-success-500 hover:bg-success-600 gap-2" disabled>
              <Check className="w-4 h-4" /> {ar ? '✓ تم الإرسال' : '✓ Application Sent'}
            </Button>
          : <Button className="w-full gap-2" onClick={apply} disabled={!isProfileDone || applying}
              variant={isProfileDone ? 'primary' : 'ghost'}>
              {applying
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Send className="w-4 h-4" />}
              {applying
                ? (ar ? 'جارٍ الإرسال...' : 'Submitting...')
                : isProfileDone
                  ? (ar ? 'قدّم بضغطة' : 'Apply with 1 Tap')
                  : (ar ? 'أكمل ملفك أولاً' : 'Complete profile first')}
            </Button>
        }
      </div>
    </div>
  )
}
