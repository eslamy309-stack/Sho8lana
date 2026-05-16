'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, MapPin, Briefcase, Building2, Star, X } from 'lucide-react'
import { useApp } from '@/lib/store'
import { COMPANIES, JOBS } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const up = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
}

// Egyptian districts with positions on our visual map (% from left, % from top)
const DISTRICTS: Record<string, { x: number; y: number }> = {
  'Smart Village':    { x: 22, y: 34 },
  'New Cairo':        { x: 64, y: 42 },
  '6th October':      { x: 20, y: 46 },
  'Maadi':            { x: 54, y: 48 },
  'Heliopolis':       { x: 60, y: 36 },
  'Nasr City':        { x: 58, y: 40 },
  'Downtown Cairo':   { x: 50, y: 44 },
  'New Capital':      { x: 76, y: 48 },
  'Alexandria':       { x: 30, y: 18 },
  'Giza':             { x: 44, y: 46 },
  'Sheikh Zayed':     { x: 18, y: 38 },
  'Mansoura':         { x: 66, y: 24 },
}

interface DistrictInfo {
  name: string
  x: number
  y: number
  jobCount: number
  companyCount: number
  companies: typeof COMPANIES
  topJob: typeof JOBS[0] | null
}

export function MapScreen() {
  const { state, dispatch } = useApp()
  const ar = state.lang === 'ar'
  const [selected, setSelected] = useState<DistrictInfo | null>(null)
  const [filter, setFilter] = useState<'all' | 'internship' | 'full-time'>('all')
  const containerRef = useRef<HTMLDivElement>(null)

  const districts: DistrictInfo[] = Object.entries(DISTRICTS).map(([name, pos]) => {
    const companies = COMPANIES.filter(c => c.location === name)
    const jobs = JOBS.filter(j => {
      const matchLoc = j.location === name
      const matchType = filter === 'all' || j.type === filter
      return matchLoc && matchType
    })
    return {
      name,
      x: pos.x,
      y: pos.y,
      jobCount: jobs.length,
      companyCount: companies.length,
      companies,
      topJob: jobs[0] ?? null,
    }
  }).filter(d => d.companyCount > 0 || d.jobCount > 0)

  function goToJobs(district: string) {
    dispatch({ type: 'SET_LOCATION_FILTER', location: district })
    dispatch({ type: 'GO', screen: 'home' })
  }

  const totalJobs = JOBS.filter(j => filter === 'all' || j.type === filter).length

  return (
    <div className="flex flex-col h-full bg-neutral-50">
      {/* Topbar */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 bg-white border-b border-neutral-100 sticky top-0 z-20">
        <button
          onClick={() => dispatch({ type: 'GO_BACK' })}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral-500 hover:bg-neutral-100 transition-colors"
        >
          {ar ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
        <div className="flex-1">
          <h1 className="text-sm font-semibold text-neutral-900">{ar ? 'خريطة الفرص' : 'Opportunity Map'}</h1>
          <p className="text-xs text-neutral-500">{ar ? `${totalJobs} فرصة عبر مصر` : `${totalJobs} opportunities across Egypt`}</p>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 px-4 py-3 bg-white border-b border-neutral-100">
        {(['all', 'internship', 'full-time'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-semibold transition-colors',
              filter === f
                ? 'bg-brand-600 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
            )}
          >
            {f === 'all'
              ? (ar ? 'الكل' : 'All')
              : f === 'internship'
              ? (ar ? 'تدريب' : 'Internship')
              : (ar ? 'دوام كامل' : 'Full-time')}
          </button>
        ))}
      </div>

      {/* Visual Map */}
      <div className="flex-1 overflow-hidden relative bg-gradient-to-b from-sky-50 to-blue-100">
        {/* Egypt outline SVG background */}
        <div ref={containerRef} className="absolute inset-0">
          <svg viewBox="0 0 100 100" className="w-full h-full opacity-15" preserveAspectRatio="none">
            {/* Simplified Egypt shape */}
            <path
              d="M 25 10 L 75 10 L 80 20 L 82 30 L 80 45 L 78 55 L 72 65 L 65 75 L 55 82 L 50 88 L 45 82 L 38 75 L 30 65 L 22 55 L 18 45 L 18 30 L 20 20 Z"
              fill="#0D9488"
              stroke="#065F56"
              strokeWidth="0.5"
            />
            {/* Nile river */}
            <path
              d="M 50 88 L 51 75 L 52 60 L 51 48 L 50 36 L 49 24 L 48 14"
              fill="none"
              stroke="#006994"
              strokeWidth="0.8"
              opacity="0.6"
            />
            {/* Nile Delta */}
            <path
              d="M 48 14 L 35 10 L 50 14 L 65 10 Z"
              fill="#006994"
              opacity="0.4"
            />
          </svg>

          {/* District pins */}
          {districts.map((d, i) => (
            <motion.button
              key={d.name}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.06, duration: 0.3, type: 'spring', stiffness: 300 }}
              onClick={() => setSelected(selected?.name === d.name ? null : d)}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${d.x}%`, top: `${d.y}%` }}
            >
              <div className="relative flex flex-col items-center">
                <div
                  className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded-full shadow-md text-white text-xs font-bold transition-all',
                    selected?.name === d.name
                      ? 'bg-brand-600 scale-110 shadow-lg'
                      : 'bg-neutral-800 hover:bg-brand-600 hover:scale-105',
                  )}
                >
                  <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                  <span>{d.jobCount}</span>
                </div>
                <div className="text-center mt-0.5 bg-white/80 backdrop-blur-sm rounded px-1 text-xs font-medium text-neutral-700 whitespace-nowrap leading-tight">
                  {d.name}
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-xl p-2 shadow-sm">
          <p className="text-xs font-semibold text-neutral-600 mb-1">{ar ? 'الرمز' : 'Legend'}</p>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-neutral-800" />
            <span className="text-xs text-neutral-600">{ar ? 'عدد الوظائف' : '# of jobs'}</span>
          </div>
        </div>
      </div>

      {/* District detail drawer */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-30 p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-base font-bold text-neutral-900">{selected.name}</h2>
                <p className="text-xs text-neutral-500">
                  {selected.jobCount} {ar ? 'وظيفة' : 'jobs'} · {selected.companyCount} {ar ? 'شركة' : 'companies'}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5 text-neutral-500" />
              </button>
            </div>

            {/* Company logos */}
            <div className="flex gap-2 mb-3 flex-wrap">
              {selected.companies.slice(0, 5).map(c => (
                <div
                  key={c.id}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-neutral-50 border border-neutral-100"
                >
                  <span className="text-sm">{c.logo}</span>
                  <span className="text-xs font-medium text-neutral-700">{c.name}</span>
                  <div className="flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                    <span className="text-xs text-neutral-500">{c.rating}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Top job preview */}
            {selected.topJob && (
              <div className="bg-brand-50 border border-brand-100 rounded-xl p-3 mb-3">
                <p className="text-xs text-brand-600 font-semibold mb-1">{ar ? 'أبرز وظيفة' : 'Top opportunity'}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">
                      {ar ? selected.topJob.titleAr : selected.topJob.title}
                    </p>
                    <p className="text-xs text-neutral-500">{selected.topJob.salary}</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                    {selected.topJob.applicants} {ar ? 'متقدم' : 'applicants'}
                  </span>
                </div>
              </div>
            )}

            <Button onClick={() => goToJobs(selected.name)} className="w-full h-10 text-sm">
              <Briefcase className="w-4 h-4 mr-1.5" />
              {ar ? `عرض كل وظائف ${selected.name}` : `View all ${selected.name} jobs`}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* All districts list when nothing selected */}
      {!selected && (
        <div className="border-t border-neutral-100 bg-white">
          <div className="overflow-x-auto scroll-hide">
            <div className="flex gap-2 px-4 py-3" style={{ width: 'max-content' }}>
              {districts.sort((a, b) => b.jobCount - a.jobCount).map(d => (
                <button
                  key={d.name}
                  onClick={() => setSelected(d)}
                  className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-100 hover:border-brand-300 hover:bg-brand-50 transition-colors min-w-[80px]"
                >
                  <Building2 className="w-4 h-4 text-brand-600" />
                  <span className="text-xs font-semibold text-neutral-700 text-center leading-tight">{d.name}</span>
                  <span className="text-xs text-brand-600 font-bold">{d.jobCount} jobs</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
