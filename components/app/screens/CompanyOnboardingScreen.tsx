'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2, ChevronRight, ChevronLeft, Check,
  Upload, Code2, Monitor, Cpu, Zap, Star, Crown,
  ArrowRight, Loader2,
} from 'lucide-react'
import { useApp } from '@/lib/store'

// ── Constants ─────────────────────────────────────────────────────────────────

const INDUSTRIES = [
  'Technology', 'Banking & Finance', 'FMCG', 'Consulting',
  'Telecom', 'Healthcare', 'Energy', 'Retail', 'Real Estate', 'Other',
]

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '500-1000', '1000+']

const PLANS = [
  {
    id: 'free',
    label: 'Free Trial',
    price: null,
    priceLabel: '14 days free',
    description: '25 candidates/month',
    icon: Zap,
    color: '#6EE7B7',
    accent: 'rgba(110,231,183,0.12)',
    border: 'rgba(110,231,183,0.3)',
  },
  {
    id: 'starter',
    label: 'Starter',
    price: 99,
    priceLabel: '$99/mo',
    description: 'Up to 100 candidates/month, basic analytics',
    icon: Star,
    color: '#818CF8',
    accent: 'rgba(129,140,248,0.12)',
    border: 'rgba(129,140,248,0.3)',
  },
  {
    id: 'pro',
    label: 'Pro',
    price: 299,
    priceLabel: '$299/mo',
    description: 'Unlimited candidates, full analytics + API access',
    icon: Crown,
    color: '#F59E0B',
    accent: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.3)',
  },
  {
    id: 'enterprise',
    label: 'Enterprise',
    price: null,
    priceLabel: 'Custom',
    description: 'Custom simulations, dedicated support, SLA',
    icon: Building2,
    color: '#EC4899',
    accent: 'rgba(236,72,153,0.12)',
    border: 'rgba(236,72,153,0.3)',
  },
]

const INTEGRATION_METHODS = [
  {
    id: 'upload',
    label: 'Direct Upload',
    description: 'Upload simulation files or create simulations directly on Sho8lana',
    icon: Upload,
  },
  {
    id: 'api',
    label: 'API Integration',
    description: 'Connect via REST API. Pull results back to your systems',
    icon: Code2,
  },
  {
    id: 'iframe',
    label: 'iFrame Embed',
    description: 'Embed our simulation player in your own platform',
    icon: Monitor,
  },
  {
    id: 'sdk',
    label: 'SDK Integration',
    description: 'Use our JavaScript SDK for full control',
    icon: Cpu,
  },
]

const STORAGE_KEY = 'sho8_company_onboarding'
const PROFILE_KEY = 'sho8_company_profile'

// ── Types ─────────────────────────────────────────────────────────────────────

interface FormData {
  companyName: string
  industry: string
  companySize: string
  website: string
  plan: string
  integrationMethod: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function loadSaved(): Partial<FormData> {
  if (typeof window === 'undefined') return {}
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v ? JSON.parse(v) : {}
  } catch { return {} }
}

function saveProgress(data: FormData) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
}

// ── Step components ───────────────────────────────────────────────────────────

function InputField({
  label, value, onChange, placeholder, required, type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  type?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label style={{ color: '#9CA3AF', fontSize: 13, fontWeight: 500 }}>
        {label}{required && <span style={{ color: '#818CF8' }}> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10,
          padding: '10px 14px',
          color: '#F9FAFB',
          fontSize: 14,
          outline: 'none',
          width: '100%',
          transition: 'border-color 0.2s',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = 'rgba(129,140,248,0.6)' }}
        onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
      />
    </div>
  )
}

function SelectField({
  label, value, onChange, options, placeholder, required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder?: string
  required?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label style={{ color: '#9CA3AF', fontSize: 13, fontWeight: 500 }}>
        {label}{required && <span style={{ color: '#818CF8' }}> *</span>}
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          background: '#1A1D2E',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10,
          padding: '10px 14px',
          color: value ? '#F9FAFB' : '#6B7280',
          fontSize: 14,
          outline: 'none',
          width: '100%',
          cursor: 'pointer',
          transition: 'border-color 0.2s',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = 'rgba(129,140,248,0.6)' }}
        onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

// Step 1
function StepCompanyProfile({ data, setData }: { data: FormData; setData: (d: FormData) => void }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 style={{ color: '#F9FAFB', fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
          Company Profile
        </h2>
        <p style={{ color: '#6B7280', fontSize: 14 }}>
          Tell us about your company so we can personalise your experience.
        </p>
      </div>

      <InputField
        label="Company Name"
        value={data.companyName}
        onChange={v => setData({ ...data, companyName: v })}
        placeholder="Acme Corp"
        required
      />

      <SelectField
        label="Industry"
        value={data.industry}
        onChange={v => setData({ ...data, industry: v })}
        options={INDUSTRIES}
        placeholder="Select industry…"
        required
      />

      <SelectField
        label="Company Size"
        value={data.companySize}
        onChange={v => setData({ ...data, companySize: v })}
        options={COMPANY_SIZES}
        placeholder="Select size…"
      />

      <InputField
        label="Website"
        value={data.website}
        onChange={v => setData({ ...data, website: v })}
        placeholder="https://acme.com"
        type="url"
      />
    </div>
  )
}

// Step 2
function StepChoosePlan({ data, setData }: { data: FormData; setData: (d: FormData) => void }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 style={{ color: '#F9FAFB', fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
          Choose Your Plan
        </h2>
        <p style={{ color: '#6B7280', fontSize: 14 }}>
          Select the plan that best fits your hiring needs. You can upgrade anytime.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {PLANS.map(plan => {
          const Icon = plan.icon
          const selected = data.plan === plan.id
          return (
            <motion.button
              key={plan.id}
              onClick={() => setData({ ...data, plan: plan.id })}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              style={{
                background: selected ? plan.accent : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${selected ? plan.border : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 14,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                width: '100%',
              }}
            >
              <div style={{
                width: 42, height: 42, borderRadius: 10,
                background: `${plan.color}22`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={20} color={plan.color} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ color: '#F9FAFB', fontWeight: 600, fontSize: 15 }}>{plan.label}</span>
                  <span style={{
                    color: plan.color, fontSize: 13, fontWeight: 700,
                    background: `${plan.color}18`, borderRadius: 6,
                    padding: '1px 8px',
                  }}>{plan.priceLabel}</span>
                </div>
                <p style={{ color: '#9CA3AF', fontSize: 12, margin: 0 }}>{plan.description}</p>
              </div>

              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                border: `2px solid ${selected ? plan.color : 'rgba(255,255,255,0.2)'}`,
                background: selected ? plan.color : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 0.2s',
              }}>
                {selected && <Check size={12} color="#fff" strokeWidth={3} />}
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// Step 3
function StepIntegration({ data, setData }: { data: FormData; setData: (d: FormData) => void }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 style={{ color: '#F9FAFB', fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
          Simulation Integration
        </h2>
        <p style={{ color: '#6B7280', fontSize: 14 }}>
          How will you bring simulations into your hiring workflow?
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {INTEGRATION_METHODS.map(method => {
          const Icon = method.icon
          const selected = data.integrationMethod === method.id
          return (
            <motion.button
              key={method.id}
              onClick={() => setData({ ...data, integrationMethod: method.id })}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                background: selected ? 'rgba(129,140,248,0.12)' : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${selected ? 'rgba(129,140,248,0.5)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 14,
                padding: '16px 14px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
                width: '100%',
                minHeight: 120,
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: selected ? 'rgba(129,140,248,0.2)' : 'rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}>
                <Icon size={20} color={selected ? '#818CF8' : '#9CA3AF'} />
              </div>
              <div>
                <p style={{
                  color: selected ? '#818CF8' : '#E5E7EB',
                  fontWeight: 600, fontSize: 13, marginBottom: 4,
                }}>{method.label}</p>
                <p style={{ color: '#6B7280', fontSize: 11, lineHeight: 1.4 }}>{method.description}</p>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// Step 4
function StepDone({ companyName }: { companyName: string }) {
  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        style={{
          width: 88, height: 88, borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(129,140,248,0.3), rgba(110,231,183,0.3))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid rgba(129,140,248,0.4)',
        }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.3 }}
        >
          <Check size={40} color="#818CF8" strokeWidth={2.5} />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <h2 style={{ color: '#F9FAFB', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
          You're all set{companyName ? `, ${companyName}` : ''}!
        </h2>
        <p style={{ color: '#9CA3AF', fontSize: 14, lineHeight: 1.6, maxWidth: 320 }}>
          Your company account is ready. Head to the HR Dashboard to start building your talent pipeline with AI-powered simulations.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="flex flex-col gap-2 w-full"
        style={{ maxWidth: 300 }}
      >
        {[
          'Company profile saved',
          'Plan selected',
          'Integration method configured',
        ].map((item, i) => (
          <motion.div
            key={item}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + i * 0.1 }}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <div style={{
              width: 18, height: 18, borderRadius: '50%',
              background: 'rgba(110,231,183,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Check size={10} color="#6EE7B7" strokeWidth={3} />
            </div>
            <span style={{ color: '#9CA3AF', fontSize: 13 }}>{item}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function CompanyOnboardingScreen() {
  const { state, dispatch } = useApp()

  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [completing, setCompleting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const [formData, setFormData] = useState<FormData>(() => {
    const saved = loadSaved()
    return {
      companyName: saved.companyName ?? '',
      industry: saved.industry ?? '',
      companySize: saved.companySize ?? '',
      website: saved.website ?? '',
      plan: saved.plan ?? 'free',
      integrationMethod: saved.integrationMethod ?? '',
    }
  })

  // Persist on every change
  useEffect(() => {
    saveProgress(formData)
  }, [formData])

  const TOTAL_STEPS = 4
  const progress = ((step + 1) / TOTAL_STEPS) * 100

  function validate(): boolean {
    const errs: string[] = []
    if (step === 0) {
      if (!formData.companyName.trim()) errs.push('Company name is required.')
      if (!formData.industry) errs.push('Industry is required.')
    }
    setErrors(errs)
    return errs.length === 0
  }

  function goNext() {
    if (!validate()) return
    if (step < TOTAL_STEPS - 1) {
      setDirection(1)
      setStep(s => s + 1)
    }
  }

  function goBack() {
    if (step > 0) {
      setDirection(-1)
      setStep(s => s - 1)
    }
    setErrors([])
  }

  async function handleComplete() {
    setCompleting(true)
    try {
      // Save company profile
      const profile = {
        companyName: formData.companyName,
        industry: formData.industry,
        companySize: formData.companySize,
        website: formData.website,
        plan: formData.plan,
        integrationMethod: formData.integrationMethod,
        completedAt: new Date().toISOString(),
      }
      if (typeof window !== 'undefined') {
        try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)) } catch {}
      }

      // Stripe checkout for paid plans
      if (formData.plan !== 'free' && formData.plan !== 'enterprise') {
        fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan: formData.plan, email: state.user?.email }),
        })
          .then(r => r.json())
          .then(d => { if (d.url) window.open(d.url, '_blank') })
          .catch(() => {})
      }

      dispatch({ type: 'GO', screen: 'hrDashboard' })
    } finally {
      setCompleting(false)
    }
  }

  const stepVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  }

  const stepLabels = ['Profile', 'Plan', 'Integration', 'Done']
  const isLastStep = step === TOTAL_STEPS - 1

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ background: '#0F1117', fontFamily: 'Inter, sans-serif' }}
    >
      {/* Progress bar */}
      <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', position: 'relative' }}>
        <motion.div
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, #6366F1, #818CF8)',
            borderRadius: '0 2px 2px 0',
          }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      {/* Header */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'rgba(99,102,241,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Building2 size={18} color="#818CF8" />
          </div>
          <span style={{ color: '#9CA3AF', fontSize: 13, fontWeight: 500 }}>Company Setup</span>
        </div>

        {/* Step dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          {stepLabels.map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <motion.div
                  animate={{
                    background: i < step
                      ? '#6366F1'
                      : i === step
                        ? 'linear-gradient(135deg, #6366F1, #818CF8)'
                        : 'rgba(255,255,255,0.1)',
                    scale: i === step ? 1.15 : 1,
                  }}
                  style={{
                    width: 10, height: 10, borderRadius: '50%',
                    border: i === step ? '2px solid rgba(99,102,241,0.5)' : '2px solid transparent',
                    boxSizing: 'border-box',
                  }}
                  transition={{ duration: 0.3 }}
                />
                <span style={{
                  fontSize: 10,
                  color: i === step ? '#818CF8' : i < step ? '#6366F1' : '#4B5563',
                  fontWeight: i === step ? 600 : 400,
                  whiteSpace: 'nowrap',
                }}>{label}</span>
              </div>
              {i < stepLabels.length - 1 && (
                <div style={{
                  width: 24, height: 1,
                  background: i < step ? '#6366F1' : 'rgba(255,255,255,0.1)',
                  marginBottom: 14,
                  transition: 'background 0.4s',
                }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div style={{ flex: 1, padding: '8px 20px 0', overflowY: 'auto' }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: 'easeInOut' }}
          >
            {step === 0 && (
              <StepCompanyProfile data={formData} setData={setFormData} />
            )}
            {step === 1 && (
              <StepChoosePlan data={formData} setData={setFormData} />
            )}
            {step === 2 && (
              <StepIntegration data={formData} setData={setFormData} />
            )}
            {step === 3 && (
              <StepDone companyName={formData.companyName} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Errors */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            style={{ margin: '8px 20px 0' }}
          >
            {errors.map((e, i) => (
              <p key={i} style={{
                color: '#F87171', fontSize: 12,
                background: 'rgba(248,113,113,0.08)',
                borderRadius: 8, padding: '6px 12px',
                border: '1px solid rgba(248,113,113,0.2)',
                marginBottom: 4,
              }}>{e}</p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div style={{
        padding: '16px 20px 32px',
        display: 'flex',
        gap: 10,
        alignItems: 'center',
      }}>
        {/* Back */}
        <motion.button
          onClick={goBack}
          whileTap={{ scale: 0.96 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '11px 16px',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'transparent',
            color: step === 0 ? '#374151' : '#9CA3AF',
            fontSize: 14, fontWeight: 500,
            cursor: step === 0 ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            flexShrink: 0,
          }}
          disabled={step === 0}
        >
          <ChevronLeft size={16} />
          Back
        </motion.button>

        {/* Next / Complete */}
        <motion.button
          onClick={isLastStep ? handleComplete : goNext}
          whileTap={{ scale: 0.97 }}
          whileHover={{ opacity: 0.9 }}
          disabled={completing}
          style={{
            flex: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '12px 20px',
            borderRadius: 12,
            border: 'none',
            background: isLastStep
              ? 'linear-gradient(135deg, #6366F1, #818CF8)'
              : 'linear-gradient(135deg, #4F46E5, #6366F1)',
            color: '#fff',
            fontSize: 15, fontWeight: 600,
            cursor: completing ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
            transition: 'all 0.2s',
          }}
        >
          {completing ? (
            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
          ) : isLastStep ? (
            <>
              Open HR Dashboard
              <ArrowRight size={17} />
            </>
          ) : (
            <>
              Next
              <ChevronRight size={17} />
            </>
          )}
        </motion.button>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
