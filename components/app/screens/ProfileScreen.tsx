'use client'

import { motion } from 'framer-motion'
import { Trophy, FileText, CheckCircle2, Edit3, Flame, Star, GraduationCap, MapPin } from 'lucide-react'
import { useApp } from '@/lib/store'
import { DOCUMENTS } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }
const up = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } } }

export function ProfileScreen() {
  const { state, dispatch } = useApp()
  const ar = state.lang === 'ar'
  const { user, simXP, simBadges, simDone, applications } = state

  const docUploaded = DOCUMENTS.filter(d => user.documents[d.key]).length
  const profileComplete =
    user.name && user.university && user.major &&
    DOCUMENTS.filter(d => d.required).every(d => user.documents[d.key])

  const completionPct = Math.round(
    ([user.name, user.university, user.major, user.gpa, user.email, user.phone]
      .filter(Boolean).length / 6) * 50 +
    (docUploaded / DOCUMENTS.length) * 50
  )

  return (
    <div className="min-h-dvh bg-neutral-50">
      {/* Topbar */}
      <div className="sticky top-0 z-20 bg-white border-b border-neutral-100 px-4 py-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-neutral-900">{ar ? 'ملفي' : 'My Profile'}</h2>
        <button onClick={() => dispatch({ type: 'GO', screen: 'onboard' })}
          className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 bg-brand-50 px-3 py-1.5 rounded-full hover:bg-brand-100 transition-colors">
          <Edit3 className="w-3 h-3" /> {ar ? 'تعديل' : 'Edit'}
        </button>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="visible" className="px-4 py-4 flex flex-col gap-4">
        {/* Profile hero card */}
        <motion.div variants={up}
          className="rounded-2xl p-5 text-white overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, #0F172A, #0F766E)' }}>
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
          <div className="relative">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center text-3xl mb-3">
              {user.name ? user.name[0].toUpperCase() : '👤'}
            </div>
            <h3 className="text-lg font-extrabold">{user.name || (ar ? 'طالب' : 'Student')}</h3>
            {user.major && (
              <p className="text-sm text-white/70 mt-0.5 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" /> {user.major}
                {user.university && ` · ${user.university}`}
              </p>
            )}
            {user.location && (
              <p className="text-xs text-white/50 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {user.location}
                {user.gpa && ` · GPA ${user.gpa}`}
              </p>
            )}

            {/* Profile completeness */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-white/60 mb-1.5">
                <span>{ar ? 'اكتمال الملف' : 'Profile completeness'}</span>
                <span>{completionPct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-white"
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div variants={up} className="grid grid-cols-3 gap-2">
          {[
            { label: ar ? 'طلبات' : 'Applications', value: applications.length, icon: <FileText className="w-4 h-4 text-brand-500" />, color: 'brand' },
            { label: ar ? 'نقاط XP' : 'XP Points', value: simXP, icon: <Flame className="w-4 h-4 text-warning-500" />, color: 'warning' },
            { label: ar ? 'شارات' : 'Badges', value: simBadges.length, icon: <Trophy className="w-4 h-4 text-violet-500" />, color: 'violet' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-3 border border-neutral-100 text-center">
              <div className="flex justify-center mb-1">{stat.icon}</div>
              <p className="text-xl font-extrabold text-neutral-900">{stat.value}</p>
              <p className="text-2xs text-neutral-400">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Badges earned */}
        {simBadges.length > 0 && (
          <motion.div variants={up}>
            <h3 className="text-sm font-bold text-neutral-700 mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-warning-500" />
              {ar ? 'الشارات المكتسبة' : 'Earned Badges'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {simBadges.map(b => (
                <motion.span
                  key={b.id}
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold bg-warning-50 text-warning-700 border border-warning-200 px-3 py-1.5 rounded-full"
                >
                  <Star className="w-3 h-3 fill-warning-400 text-warning-400" />
                  {b.label}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Simulation progress */}
        {simDone.length > 0 && (
          <motion.div variants={up} className="bg-white rounded-xl border border-neutral-200 p-4">
            <h3 className="text-sm font-bold text-neutral-900 mb-1">{ar ? 'تقدم التدريب' : 'Simulation Progress'}</h3>
            <p className="text-xs text-neutral-400 mb-3">{ar ? `أكملت ${simDone.length} مهمة` : `${simDone.length} task${simDone.length !== 1 ? 's' : ''} completed`}</p>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-warning-500" />
              <div className="flex-1 h-2 rounded-full bg-neutral-100 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-warning-400 to-brand-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((simXP / 200) * 100, 100)}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                />
              </div>
              <span className="text-xs font-bold text-neutral-600">{simXP}/200</span>
            </div>
          </motion.div>
        )}

        {/* Document vault */}
        <motion.div variants={up}>
          <h3 className="text-sm font-bold text-neutral-700 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-500" />
            {ar ? 'خزنة المستندات' : 'Document Vault'}
            <span className="text-2xs font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full ml-auto">
              {docUploaded}/{DOCUMENTS.length}
            </span>
          </h3>
          <div className="flex flex-col gap-2">
            {DOCUMENTS.map(doc => {
              const uploaded = !!user.documents[doc.key]
              return (
                <div key={doc.key}
                  className={cn('flex items-center gap-3 p-3 rounded-xl border transition-colors',
                    uploaded ? 'border-success-200 bg-success-50' : 'border-neutral-200 bg-white')}>
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                    uploaded ? 'bg-success-100' : 'bg-neutral-100')}>
                    {uploaded
                      ? <CheckCircle2 className="w-4 h-4 text-success-600" />
                      : <FileText className="w-4 h-4 text-neutral-400" />
                    }
                  </div>
                  <div className="flex-1">
                    <p className={cn('text-xs font-semibold', uploaded ? 'text-success-700' : 'text-neutral-700')}>
                      {ar ? doc.labelAr : doc.label}
                      {doc.required && <span className="text-danger-500 ml-1">*</span>}
                    </p>
                    <p className={cn('text-2xs mt-0.5', uploaded ? 'text-success-500' : 'text-neutral-400')}>
                      {uploaded ? (ar ? 'تم الرفع ✓' : 'Uploaded ✓') : doc.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
          {!profileComplete && (
            <Button size="md" className="w-full mt-3"
              onClick={() => dispatch({ type: 'GO', screen: 'onboard' })}>
              {ar ? 'أكمل ملفك' : 'Complete your profile'}
            </Button>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
