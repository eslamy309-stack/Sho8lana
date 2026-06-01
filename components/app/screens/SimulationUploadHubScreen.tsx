'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, Link, Code, Monitor, LayoutTemplate, X, ChevronRight, ChevronLeft,
  Check, Plus, Grip, Trash2, Eye, Copy, ArrowUp, ArrowDown, FileText,
  Video, Image, Zap, Brain, Target, Users, Clock, Settings, Star, Filter, Search,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { cn } from '@/lib/utils'

// ─── Animation variants ───────────────────────────────────────────────────────
const up = {
  hidden: { opacity: 0, y: 14 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] } }),
}
const slideLeft = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0, transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
}

// ─── Types ────────────────────────────────────────────────────────────────────
type View = 'hub' | 'method' | 'wizard'
type MethodId = 'upload' | 'builder' | 'link' | 'api' | 'embed'
type WizardStep = 1 | 2 | 3 | 4 | 5

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  status: 'processing' | 'ready'
}

interface BuilderBlock {
  id: string
  type: 'scenario' | 'multiChoice' | 'written' | 'fileUpload' | 'timedChallenge' | 'kpi' | 'evalCriteria' | 'video' | 'imageBlock'
  content: Record<string, string | string[] | number | boolean>
}

interface WizardData {
  title: string
  description: string
  category: string
  type: string
  skills: string[]
  skillWeights: Record<string, number>
  difficulty: string
  duration: number
  tracks: string[]
  minTalentScore: number
  university: string
  maxCandidates: string
  visibility: string
}

interface Template {
  id: string
  title: string
  category: string
  duration: number
  description: string
  skills: string[]
  color: string
}

// ─── Constants ────────────────────────────────────────────────────────────────
const METHODS = [
  {
    id: 'upload' as MethodId,
    icon: Upload,
    color: '#10B981',
    bg: '#ECFDF5',
    border: '#10B981',
    title: 'Upload Files',
    description: 'PDF, DOCX, PPTX, video, ZIP, SCORM. AI converts to simulation.',
    time: '~3 min',
  },
  {
    id: 'builder' as MethodId,
    icon: LayoutTemplate,
    color: '#7C3AED',
    bg: '#EDE9FE',
    border: '#7C3AED',
    title: 'Simulation Builder',
    description: 'Drag-and-drop scenario, decision, quiz, and KPI blocks. No coding.',
    time: '~10 min',
  },
  {
    id: 'link' as MethodId,
    icon: Link,
    color: '#2563EB',
    bg: '#EFF6FF',
    border: '#2563EB',
    title: 'External Link',
    description: 'Paste your simulation URL. Students launch directly from our platform.',
    time: '~2 min',
  },
  {
    id: 'api' as MethodId,
    icon: Code,
    color: '#EA580C',
    bg: '#FFF7ED',
    border: '#EA580C',
    title: 'API Integration',
    description: 'Connect via REST, GraphQL, or webhooks. Auto-sync scores and KPIs.',
    time: '~15 min',
  },
  {
    id: 'embed' as MethodId,
    icon: Monitor,
    color: '#4F46E5',
    bg: '#EEF2FF',
    border: '#4F46E5',
    title: 'Embed iFrame',
    description: 'Embed your existing simulation. Students stay on our platform.',
    time: '~5 min',
  },
]

const TEMPLATES: Template[] = [
  { id: 't1', title: 'Sales Negotiation', category: 'Sales', duration: 45, description: 'Negotiate a contract renewal with a reluctant client', skills: ['Communication', 'Decision Making'], color: '#10B981' },
  { id: 't2', title: 'Marketing Campaign', category: 'Marketing', duration: 60, description: 'Design a digital campaign with a limited budget', skills: ['Creativity', 'Analytical'], color: '#2563EB' },
  { id: 't3', title: 'Financial Analysis', category: 'Finance', duration: 30, description: 'Analyze Q3 financials and recommend cost cuts', skills: ['Analytical', 'Problem Solving'], color: '#7C3AED' },
  { id: 't4', title: 'HR Interview Simulation', category: 'HR', duration: 45, description: 'Conduct a structured competency interview', skills: ['Communication', 'Leadership'], color: '#EA580C' },
  { id: 't5', title: 'Operations Optimization', category: 'Operations', duration: 60, description: 'Redesign a fulfillment process to cut costs 20%', skills: ['Problem Solving', 'Decision Making'], color: '#0891B2' },
  { id: 't6', title: 'Tech Product Sprint', category: 'Tech', duration: 90, description: 'Lead a 2-day sprint to ship a feature under pressure', skills: ['Leadership', 'Teamwork'], color: '#4F46E5' },
]

const ALL_SKILLS = ['Leadership', 'Communication', 'Problem Solving', 'Decision Making', 'Teamwork', 'Analytical Thinking']
const CATEGORIES = ['HR', 'Marketing', 'Finance', 'Sales', 'Operations', 'Tech', 'Custom']
const SIM_TYPES = ['Internship Assessment', 'Skills Test', 'Full Simulation', 'Case Study']
const TRACKS = ['All', 'Marketing', 'Finance', 'Operations', 'Tech', 'HR', 'Sales']

const EMPTY_WIZARD: WizardData = {
  title: '',
  description: '',
  category: '',
  type: '',
  skills: [],
  skillWeights: {},
  difficulty: 'Medium',
  duration: 45,
  tracks: ['All'],
  minTalentScore: 0,
  university: '',
  maxCandidates: '',
  visibility: 'Public',
}

const INITIAL_BLOCKS: BuilderBlock[] = [
  {
    id: 'b1',
    type: 'scenario',
    content: {
      text: "You are a sales manager at a mid-size company. You've been asked to negotiate a contract renewal with a key client who is considering a competitor's offer.",
    },
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function FileIcon({ type }: { type: string }) {
  if (type.includes('video')) return <Video className="w-4 h-4 text-violet-500" />
  if (type.includes('image')) return <Image className="w-4 h-4 text-blue-500" />
  return <FileText className="w-4 h-4 text-neutral-500" />
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ─── Method 1: Upload Files ───────────────────────────────────────────────────
function UploadMethodView({ onContinue }: { onContinue: (title: string) => void }) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [aiPhase, setAiPhase] = useState<'idle' | 'analyzing' | 'done'>('idle')
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFiles(raw: FileList | null) {
    if (!raw) return
    const newFiles: UploadedFile[] = Array.from(raw).map(f => ({
      id: Math.random().toString(36).slice(2),
      name: f.name,
      size: f.size,
      type: f.type,
      status: 'processing',
    }))
    setFiles(prev => [...prev, ...newFiles])
    setAiPhase('analyzing')
    newFiles.forEach(file => {
      const delay = 2000 + Math.random() * 1000
      setTimeout(() => {
        setFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: 'ready' } : f))
      }, delay)
    })
    setTimeout(() => setAiPhase('done'), 3500)
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Drop Zone */}
        <div className="space-y-3">
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
            className="border-2 border-dashed border-emerald-200 rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <Upload className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-neutral-800">Drag &amp; drop files here</p>
              <p className="text-xs text-neutral-500 mt-1">or click to browse</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.pptx,.mp4,.mov,.zip,.png,.jpg,.xlsx"
              className="hidden"
              onChange={e => handleFiles(e.target.files)}
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['PDF', 'DOCX', 'PPTX', 'MP4', 'MOV', 'ZIP', 'SCORM', 'PNG', 'JPG', 'XLSX'].map(ext => (
              <span key={ext} className="px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full text-[10px] font-medium">{ext}</span>
            ))}
          </div>
        </div>

        {/* Uploaded files + AI panel */}
        <div className="space-y-3">
          {files.length > 0 && (
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm divide-y divide-neutral-50">
              {files.map(file => (
                <div key={file.id} className="flex items-center gap-3 px-3 py-2.5">
                  <FileIcon type={file.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-neutral-800 truncate">{file.name}</p>
                    <p className="text-[10px] text-neutral-400">{formatBytes(file.size)}</p>
                  </div>
                  {file.status === 'processing' ? (
                    <span className="flex items-center gap-1 text-[10px] text-amber-600 font-medium">
                      <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="inline-block w-3 h-3 border border-amber-400 border-t-transparent rounded-full" />
                      Processing…
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                      <Check className="w-3 h-3" /> AI Ready
                    </span>
                  )}
                  <button onClick={() => setFiles(prev => prev.filter(f => f.id !== file.id))} className="text-neutral-300 hover:text-red-400 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* AI Processing Panel */}
          <AnimatePresence>
            {aiPhase !== 'idle' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="rounded-2xl p-4 bg-gradient-to-br from-indigo-600 to-violet-600 text-white"
              >
                {aiPhase === 'analyzing' ? (
                  <div className="flex items-center gap-3">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      className="w-8 h-8 rounded-full border-2 border-white border-t-transparent"
                    />
                    <div>
                      <p className="text-sm font-semibold">AI is analyzing your content…</p>
                      <p className="text-xs text-indigo-200 mt-0.5">Detecting tasks, questions, and KPIs</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-emerald-300" />
                      <p className="text-sm font-bold">Simulation Generated</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: '3 tasks detected', icon: Target },
                        { label: '8 questions generated', icon: Brain },
                        { label: '4 KPI metrics mapped', icon: Zap },
                      ].map(({ label, icon: Icon }) => (
                        <div key={label} className="bg-white/15 rounded-xl p-2 text-center">
                          <Icon className="w-4 h-4 mx-auto mb-1 text-indigo-100" />
                          <p className="text-[10px] font-medium leading-tight">{label}</p>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setShowPreview(true)}
                      className="w-full py-2 bg-white text-indigo-700 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-colors"
                    >
                      Preview Generated Simulation
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Generated Simulation Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl"
            >
              <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-neutral-900">Sales Negotiation Challenge</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">AI-generated from your files</p>
                </div>
                <button onClick={() => setShowPreview(false)} className="text-neutral-400 hover:text-neutral-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 space-y-3">
                {[
                  { title: 'Opening Negotiation', desc: 'Introduce yourself and understand client concerns', type: 'Multiple Choice' },
                  { title: 'Counter-Proposal', desc: 'Create a written counter-offer with justification', type: 'Written Response' },
                  { title: 'Final Agreement', desc: 'Upload the signed term sheet document', type: 'File Upload' },
                ].map((task, i) => (
                  <div key={i} className="bg-neutral-50 rounded-xl p-3">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-neutral-800">{task.title}</p>
                      <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0',
                        task.type === 'Multiple Choice' ? 'bg-blue-100 text-blue-700' :
                        task.type === 'Written Response' ? 'bg-violet-100 text-violet-700' : 'bg-emerald-100 text-emerald-700'
                      )}>{task.type}</span>
                    </div>
                    <p className="text-xs text-neutral-500">{task.desc}</p>
                  </div>
                ))}
                <button
                  onClick={() => { setShowPreview(false); onContinue('Sales Negotiation Challenge') }}
                  className="w-full py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 mt-2"
                >
                  Looks good — Continue to Publish <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Method 2: Simulation Builder ─────────────────────────────────────────────
const BLOCK_PALETTE = [
  { type: 'scenario', label: 'Scenario Block', icon: FileText, category: 'Content' },
  { type: 'video', label: 'Video Block', icon: Video, category: 'Content' },
  { type: 'imageBlock', label: 'Image Block', icon: Image, category: 'Content' },
  { type: 'multiChoice', label: 'Multiple Choice', icon: Brain, category: 'Tasks' },
  { type: 'written', label: 'Written Response', icon: FileText, category: 'Tasks' },
  { type: 'fileUpload', label: 'File Upload', icon: Upload, category: 'Tasks' },
  { type: 'timedChallenge', label: 'Timed Challenge', icon: Clock, category: 'Tasks' },
  { type: 'kpi', label: 'KPI Block', icon: Zap, category: 'Scoring' },
  { type: 'evalCriteria', label: 'Evaluation Criteria', icon: Star, category: 'Scoring' },
] as const

type BlockType = (typeof BLOCK_PALETTE)[number]['type']

function BlockEditor({ block, onChange, onDelete, onMoveUp, onMoveDown, canUp, canDown }: {
  block: BuilderBlock
  onChange: (id: string, content: Record<string, string | string[] | number | boolean>) => void
  onDelete: (id: string) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
  canUp: boolean
  canDown: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const palette = BLOCK_PALETTE.find(b => b.type === block.type)
  const Icon = palette?.icon ?? FileText
  const typeLabel = palette?.label ?? block.type

  const content = block.content

  return (
    <div className="bg-white rounded-xl border border-neutral-100 shadow-sm">
      <div className="flex items-center gap-2 px-3 py-2.5 cursor-pointer" onClick={() => setExpanded(p => !p)}>
        <Grip className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
        <Icon className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
        <span className="text-xs font-medium text-neutral-700 flex-1 truncate">
          {typeLabel}
          {block.type === 'scenario' && content.text ? ` — ${(content.text as string).slice(0, 40)}…` : ''}
        </span>
        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
          <button disabled={!canUp} onClick={() => onMoveUp(block.id)} className="disabled:opacity-30 text-neutral-400 hover:text-neutral-700 p-0.5">
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button disabled={!canDown} onClick={() => onMoveDown(block.id)} className="disabled:opacity-30 text-neutral-400 hover:text-neutral-700 p-0.5">
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(block.id)} className="text-neutral-300 hover:text-red-400 p-0.5">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-neutral-50 pt-2">
          {block.type === 'scenario' && (
            <textarea
              value={content.text as string || ''}
              onChange={e => onChange(block.id, { ...content, text: e.target.value })}
              rows={3}
              placeholder="Describe the scenario…"
              className="w-full text-xs border border-neutral-200 rounded-lg px-2.5 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          )}
          {block.type === 'multiChoice' && (
            <div className="space-y-2">
              <input value={content.question as string || ''} onChange={e => onChange(block.id, { ...content, question: e.target.value })} placeholder="Question text" className="w-full text-xs border border-neutral-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
              {['A', 'B', 'C', 'D'].map((opt, i) => (
                <div key={opt} className="flex items-center gap-2">
                  <input type="radio" name={`correct-${block.id}`} checked={content.correct === opt} onChange={() => onChange(block.id, { ...content, correct: opt })} />
                  <input value={(content[`option${i}`] as string) || ''} onChange={e => onChange(block.id, { ...content, [`option${i}`]: e.target.value })} placeholder={`Option ${opt}`} className="flex-1 text-xs border border-neutral-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                </div>
              ))}
            </div>
          )}
          {block.type === 'kpi' && (
            <div className="space-y-2">
              <select value={content.kpi as string || ''} onChange={e => onChange(block.id, { ...content, kpi: e.target.value })} className="w-full text-xs border border-neutral-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-400">
                <option value="">Select KPI</option>
                {ALL_SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div>
                <label className="text-[10px] text-neutral-500 font-medium">Weight: {content.weight || 20}</label>
                <input type="range" min={0} max={100} value={Number(content.weight) || 20} onChange={e => onChange(block.id, { ...content, weight: Number(e.target.value) })} className="w-full accent-indigo-600" />
              </div>
            </div>
          )}
          {block.type === 'fileUpload' && (
            <div className="space-y-2">
              <textarea value={content.instructions as string || ''} onChange={e => onChange(block.id, { ...content, instructions: e.target.value })} rows={2} placeholder="Upload instructions…" className="w-full text-xs border border-neutral-200 rounded-lg px-2.5 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-400" />
              <div className="flex flex-wrap gap-2">
                {['PDF', 'DOCX', 'XLSX', 'PNG', 'ZIP'].map(fmt => (
                  <label key={fmt} className="flex items-center gap-1 text-[10px] text-neutral-600">
                    <input type="checkbox" defaultChecked className="accent-indigo-600" /> {fmt}
                  </label>
                ))}
              </div>
            </div>
          )}
          {(block.type === 'written' || block.type === 'video' || block.type === 'imageBlock' || block.type === 'timedChallenge' || block.type === 'evalCriteria') && (
            <textarea value={content.text as string || ''} onChange={e => onChange(block.id, { ...content, text: e.target.value })} rows={2} placeholder="Enter content or instructions…" className="w-full text-xs border border-neutral-200 rounded-lg px-2.5 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-400" />
          )}
        </div>
      )}
    </div>
  )
}

function BuilderMethodView({ onContinue }: { onContinue: (title: string) => void }) {
  const [blocks, setBlocks] = useState<BuilderBlock[]>(INITIAL_BLOCKS)
  const [settings, setSettings] = useState({ title: 'My Simulation', duration: 45, difficulty: 'Medium', category: 'Sales' })
  const [showPreview, setShowPreview] = useState(false)

  function addBlock(type: BlockType) {
    setBlocks(prev => [...prev, { id: Math.random().toString(36).slice(2), type, content: {} }])
  }
  function updateBlock(id: string, content: Record<string, string | string[] | number | boolean>) {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, content } : b))
  }
  function deleteBlock(id: string) { setBlocks(prev => prev.filter(b => b.id !== id)) }
  function moveBlock(id: string, dir: 'up' | 'down') {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id)
      if (dir === 'up' && idx === 0) return prev
      if (dir === 'down' && idx === prev.length - 1) return prev
      const arr = [...prev]
      const swap = dir === 'up' ? idx - 1 : idx + 1
      ;[arr[idx], arr[swap]] = [arr[swap], arr[idx]]
      return arr
    })
  }

  const categories = ['Content', 'Tasks', 'Scoring'] as const

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Header bar */}
      <div className="bg-white border-b border-neutral-100 px-4 py-2.5 flex items-center gap-3">
        <span className="text-sm font-bold text-neutral-800 flex-1">Builder</span>
        <div className="relative group">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-medium hover:bg-violet-700 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Block
          </button>
          <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-neutral-100 w-48 z-20 hidden group-hover:block">
            {categories.map(cat => (
              <div key={cat}>
                <p className="px-3 pt-2 pb-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{cat}</p>
                {BLOCK_PALETTE.filter(b => b.category === cat).map(b => (
                  <button key={b.type} onClick={() => addBlock(b.type as BlockType)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-neutral-700 hover:bg-neutral-50 transition-colors">
                    <b.icon className="w-3.5 h-3.5 text-neutral-400" /> {b.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
        <button onClick={() => setShowPreview(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-lg text-xs font-medium hover:bg-neutral-200 transition-colors">
          <Eye className="w-3.5 h-3.5" /> Preview
        </button>
        <button onClick={() => onContinue(settings.title)} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors">
          Continue to Publish <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex gap-0">
        {/* Block palette sidebar */}
        <div className="w-44 shrink-0 bg-neutral-50 border-r border-neutral-100 overflow-y-auto p-2 space-y-3">
          {categories.map(cat => (
            <div key={cat}>
              <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider px-1 mb-1">{cat}</p>
              {BLOCK_PALETTE.filter(b => b.category === cat).map(b => (
                <button key={b.type} onClick={() => addBlock(b.type as BlockType)} className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-neutral-700 hover:bg-white hover:shadow-sm rounded-lg transition-all">
                  <b.icon className="w-3 h-3 text-neutral-400 shrink-0" />
                  <span className="truncate">{b.label}</span>
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2"
          style={{ background: '#F8FAFC', backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        >
          {blocks.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-neutral-400">
              <LayoutTemplate className="w-10 h-10" />
              <p className="text-sm">Add blocks from the left palette</p>
            </div>
          )}
          {blocks.map((block, i) => (
            <BlockEditor key={block.id} block={block} onChange={updateBlock} onDelete={deleteBlock}
              onMoveUp={id => moveBlock(id, 'up')} onMoveDown={id => moveBlock(id, 'down')}
              canUp={i > 0} canDown={i < blocks.length - 1}
            />
          ))}
        </div>

        {/* Settings panel */}
        <div className="w-60 shrink-0 bg-white border-l border-neutral-100 overflow-y-auto p-3 space-y-3">
          <p className="text-xs font-bold text-neutral-700 flex items-center gap-1.5"><Settings className="w-3.5 h-3.5" /> Settings</p>
          <div>
            <label className="text-[10px] text-neutral-500 font-medium">Title</label>
            <input value={settings.title} onChange={e => setSettings(p => ({ ...p, title: e.target.value }))} className="mt-1 w-full text-xs border border-neutral-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
          </div>
          <div>
            <label className="text-[10px] text-neutral-500 font-medium">Duration: {settings.duration} min</label>
            <input type="range" min={15} max={120} value={settings.duration} onChange={e => setSettings(p => ({ ...p, duration: Number(e.target.value) }))} className="w-full accent-indigo-600" />
          </div>
          <div>
            <label className="text-[10px] text-neutral-500 font-medium">Difficulty</label>
            <div className="flex gap-1 mt-1">
              {['Easy', 'Medium', 'Hard'].map(d => (
                <button key={d} onClick={() => setSettings(p => ({ ...p, difficulty: d }))} className={cn('flex-1 py-1 rounded-lg text-[10px] font-medium border transition-colors', settings.difficulty === d ? 'bg-indigo-600 text-white border-indigo-600' : 'border-neutral-200 text-neutral-600 hover:border-indigo-400')}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] text-neutral-500 font-medium">Category</label>
            <select value={settings.category} onChange={e => setSettings(p => ({ ...p, category: e.target.value }))} className="mt-1 w-full text-xs border border-neutral-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-400">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Preview modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowPreview(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
              <div className="bg-indigo-600 px-5 py-4">
                <p className="text-white text-xs font-medium opacity-80">Student Preview</p>
                <h3 className="text-white font-bold mt-0.5">{settings.title}</h3>
                <div className="flex gap-2 mt-2">
                  <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full">{settings.difficulty}</span>
                  <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full">{settings.duration} min</span>
                </div>
              </div>
              <div className="p-5 space-y-3">
                {blocks.slice(0, 3).map((block, i) => {
                  const pal = BLOCK_PALETTE.find(b => b.type === block.type)
                  const Icon2 = pal?.icon ?? FileText
                  return (
                    <div key={block.id} className="flex items-center gap-3 bg-neutral-50 rounded-xl p-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                        <Icon2 className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-neutral-800">Step {i + 1}: {pal?.label}</p>
                        <p className="text-[10px] text-neutral-400">{(block.content.text as string || block.content.question as string || '').slice(0, 50) || 'No content yet'}</p>
                      </div>
                    </div>
                  )
                })}
                <button onClick={() => setShowPreview(false)} className="w-full py-2 bg-neutral-100 text-neutral-700 rounded-xl text-xs font-medium hover:bg-neutral-200 transition-colors">Close Preview</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Method 3: External Link ──────────────────────────────────────────────────
const SKILL_CHIPS = ['Leadership', 'Communication', 'Problem Solving', 'Decision Making', 'Teamwork', 'Technical', 'Analytical', 'Creativity']

function LinkMethodView({ onContinue }: { onContinue: (title: string) => void }) {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [duration, setDuration] = useState(45)
  const [syncMethod, setSyncMethod] = useState('manual')

  const urlValid = url.startsWith('http')

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-lg mx-auto space-y-4">
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5 space-y-4">
          {/* URL field */}
          <div>
            <label className="text-xs font-semibold text-neutral-700">Simulation URL</label>
            <div className="relative mt-1">
              <input
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://sim.yourcompany.com/assessment"
                className="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {urlValid && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Check className="w-4 h-4 text-emerald-500" />
                </div>
              )}
            </div>
          </div>
          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-neutral-700">Simulation Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="mt-1 w-full text-sm border border-neutral-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-neutral-700">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 w-full text-sm border border-neutral-200 rounded-xl px-4 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          {/* Skills */}
          <div>
            <label className="text-xs font-semibold text-neutral-700">Skills Assessed</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {SKILL_CHIPS.map(s => (
                <button key={s} onClick={() => setSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                  className={cn('px-3 py-1 rounded-full text-xs font-medium border transition-colors', skills.includes(s) ? 'bg-blue-600 text-white border-blue-600' : 'border-neutral-200 text-neutral-600 hover:border-blue-400')}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          {/* Duration */}
          <div>
            <label className="text-xs font-semibold text-neutral-700">Estimated Duration: {duration} min</label>
            <input type="range" min={15} max={120} value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full accent-blue-600 mt-1" />
          </div>
          {/* Sync method */}
          <div>
            <label className="text-xs font-semibold text-neutral-700">Result Sync Method</label>
            <div className="space-y-2 mt-2">
              {[
                { value: 'manual', label: 'Manual scoring', desc: 'HR enters results manually' },
                { value: 'webhook', label: 'Webhook', desc: 'We call your endpoint with results' },
                { value: 'api', label: 'API pull', desc: 'We fetch from your API' },
              ].map(opt => (
                <label key={opt.value} className="flex items-start gap-3 cursor-pointer">
                  <input type="radio" name="sync" value={opt.value} checked={syncMethod === opt.value} onChange={() => setSyncMethod(opt.value)} className="accent-blue-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-neutral-800">{opt.label}</p>
                    <p className="text-[10px] text-neutral-500">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Preview card */}
        <AnimatePresence>
          {urlValid && title && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
              <div className="bg-neutral-200 h-7 flex items-center px-3 gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="flex-1 ml-2 bg-white rounded text-[9px] text-neutral-500 px-2 py-0.5 truncate">{url}</span>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-neutral-900">{title}</h3>
                {description && <p className="text-xs text-neutral-500 mt-1">{description}</p>}
                <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-medium">Launch Simulation</button>
                <p className="text-[10px] text-neutral-400 mt-3">Students will be redirected to this URL and return here when complete.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => onContinue(title || 'External Simulation')}
          disabled={!urlValid}
          className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          Continue to Publish <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ─── Method 4: API Integration ────────────────────────────────────────────────
const SAMPLE_PAYLOAD = `{
  "event": "simulation.completed",
  "candidate_id": "std_abc123",
  "score": 87,
  "kpis": {
    "leadership": 82,
    "communication": 79
  }
}`

function ApiMethodView({ onContinue }: { onContinue: (title: string) => void }) {
  const [apiType, setApiType] = useState<'REST' | 'GraphQL' | 'Webhook'>('REST')
  const [endpoint, setEndpoint] = useState('')
  const [authMethod, setAuthMethod] = useState('None')
  const [authValue, setAuthValue] = useState('')
  const [showAuth, setShowAuth] = useState(false)
  const [events, setEvents] = useState(['Simulation Completed', 'Score Submitted'])
  const [testStatus, setTestStatus] = useState<null | 'success'>(null)
  const [kpiMap, setKpiMap] = useState([
    { platform: 'Talent Score', field: 'data.score' },
    { platform: 'Leadership', field: 'data.kpis.leadership' },
    { platform: 'Communication', field: 'data.kpis.communication' },
  ])
  const [copied, setCopied] = useState<string | null>(null)

  function toggleEvent(ev: string) {
    setEvents(prev => prev.includes(ev) ? prev.filter(e => e !== ev) : [...prev, ev])
  }
  function copyText(text: string, key: string) {
    navigator.clipboard?.writeText(text).catch(() => {})
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }
  function sendTest() {
    setTimeout(() => setTestStatus('success'), 1000)
    setTimeout(() => setTestStatus(null), 4000)
  }

  const endpointDoc = 'POST https://sho8lana.vercel.app/api/integrations/{companyId}/results\nAuthorization: Bearer {your_api_key}'

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Left: Config */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5 space-y-4">
            {/* API Type tabs */}
            <div>
              <label className="text-xs font-semibold text-neutral-700">API Type</label>
              <div className="flex gap-1 mt-1 bg-neutral-100 rounded-xl p-1">
                {(['REST', 'GraphQL', 'Webhook'] as const).map(t => (
                  <button key={t} onClick={() => setApiType(t)} className={cn('flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors', apiType === t ? 'bg-white text-orange-600 shadow-sm' : 'text-neutral-500')}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            {/* Endpoint */}
            <div>
              <label className="text-xs font-semibold text-neutral-700">Endpoint URL</label>
              <div className="flex gap-2 mt-1">
                <input value={endpoint} onChange={e => setEndpoint(e.target.value)} placeholder="https://api.yourcompany.com/sim" className="flex-1 text-xs border border-neutral-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-400" />
                <button className="px-3 py-2 bg-orange-50 text-orange-600 rounded-xl text-xs font-medium border border-orange-200 hover:bg-orange-100 transition-colors shrink-0">Test</button>
              </div>
            </div>
            {/* Auth */}
            <div>
              <label className="text-xs font-semibold text-neutral-700">Auth Method</label>
              <select value={authMethod} onChange={e => setAuthMethod(e.target.value)} className="mt-1 w-full text-xs border border-neutral-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-400">
                {['None', 'API Key', 'Bearer Token', 'OAuth 2.0'].map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
            {authMethod !== 'None' && (
              <div>
                <label className="text-xs font-semibold text-neutral-700">Auth Value</label>
                <div className="flex gap-2 mt-1">
                  <input type={showAuth ? 'text' : 'password'} value={authValue} onChange={e => setAuthValue(e.target.value)} className="flex-1 text-xs border border-neutral-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-400" />
                  <button onClick={() => setShowAuth(p => !p)} className="px-2 py-1 text-neutral-400 hover:text-neutral-700">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            {/* Events */}
            <div>
              <label className="text-xs font-semibold text-neutral-700">Events to Sync</label>
              <div className="space-y-1.5 mt-2">
                {['Simulation Started', 'Progress Updated', 'Simulation Completed', 'Score Submitted'].map(ev => (
                  <label key={ev} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={events.includes(ev)} onChange={() => toggleEvent(ev)} className="accent-orange-600" />
                    <span className="text-xs text-neutral-700">{ev}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* KPI Mapping */}
            <div>
              <label className="text-xs font-semibold text-neutral-700">KPI Field Mapping</label>
              <div className="mt-2 rounded-xl overflow-hidden border border-neutral-100">
                <div className="grid grid-cols-2 bg-neutral-50 px-3 py-1.5">
                  <span className="text-[10px] font-bold text-neutral-500">Platform KPI</span>
                  <span className="text-[10px] font-bold text-neutral-500">Your API field</span>
                </div>
                {kpiMap.map((row, i) => (
                  <div key={i} className="grid grid-cols-2 px-3 py-1.5 border-t border-neutral-50">
                    <span className="text-xs text-neutral-700">{row.platform}</span>
                    <input value={row.field} onChange={e => setKpiMap(prev => prev.map((r, j) => j === i ? { ...r, field: e.target.value } : r))} className="text-xs text-orange-600 bg-transparent focus:outline-none" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Test payload */}
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-neutral-700">Test Payload</label>
              <button onClick={() => copyText(SAMPLE_PAYLOAD, 'payload')} className="flex items-center gap-1 text-[10px] text-neutral-500 hover:text-neutral-800">
                {copied === 'payload' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />} Copy
              </button>
            </div>
            <pre className="bg-neutral-900 text-emerald-400 rounded-xl p-3 text-[10px] overflow-x-auto leading-relaxed">{SAMPLE_PAYLOAD}</pre>
            <button onClick={sendTest} className="mt-3 w-full py-2 bg-orange-50 text-orange-600 border border-orange-200 rounded-xl text-xs font-medium hover:bg-orange-100 transition-colors">
              {testStatus === 'success' ? '✓ Test successful' : 'Send Test Event'}
            </button>
          </div>
          <button onClick={() => onContinue('API Integration')} className="w-full py-3 bg-orange-600 text-white rounded-xl text-sm font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2">
            Continue to Publish <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Docs */}
        <div className="bg-neutral-900 rounded-2xl p-5 text-white space-y-4">
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Your Webhook Endpoint</p>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-neutral-400">Endpoint</span>
              <button onClick={() => copyText(endpointDoc, 'endpoint')} className="flex items-center gap-1 text-[10px] text-neutral-400 hover:text-white">
                {copied === 'endpoint' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />} Copy
              </button>
            </div>
            <pre className="bg-neutral-800 rounded-xl p-3 text-[10px] text-emerald-400 leading-relaxed overflow-x-auto whitespace-pre-wrap">{endpointDoc}</pre>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-neutral-400">Sample Response</span>
              <button onClick={() => copyText(SAMPLE_PAYLOAD, 'response')} className="flex items-center gap-1 text-[10px] text-neutral-400 hover:text-white">
                {copied === 'response' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />} Copy
              </button>
            </div>
            <pre className="bg-neutral-800 rounded-xl p-3 text-[10px] text-emerald-400 leading-relaxed overflow-x-auto">{SAMPLE_PAYLOAD}</pre>
          </div>
          <div className="bg-orange-500/20 rounded-xl p-3">
            <p className="text-orange-300 text-xs font-semibold mb-1">Tip</p>
            <p className="text-neutral-300 text-[11px] leading-relaxed">Events are delivered in real-time via HTTPS POST. Respond with 200 within 5 seconds to acknowledge receipt.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Method 5: Embed iFrame ───────────────────────────────────────────────────
function EmbedMethodView({ onContinue }: { onContinue: (title: string) => void }) {
  const [iframeUrl, setIframeUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [height, setHeight] = useState(600)
  const [sandbox, setSandbox] = useState(['allow-scripts', 'allow-forms', 'allow-same-origin'])
  const [passData, setPassData] = useState(false)
  const [completion, setCompletion] = useState('manual')
  const [copied, setCopied] = useState(false)

  const sandboxOptions = ['allow-scripts', 'allow-forms', 'allow-same-origin', 'allow-popups', 'allow-downloads']
  function toggleSandbox(opt: string) {
    setSandbox(prev => prev.includes(opt) ? prev.filter(s => s !== opt) : [...prev, opt])
  }

  const displayUrl = passData && iframeUrl ? `${iframeUrl}?student_id={id}&name={name}` : iframeUrl

  const codeSnippet = `<iframe
  src="${displayUrl || '[your-url]'}"
  width="100%"
  height="${height}px"
  sandbox="${sandbox.join(' ')}"
  frameborder="0"
></iframe>`

  function doCopy() {
    navigator.clipboard?.writeText(codeSnippet).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Left: Config */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-neutral-700">iFrame URL</label>
              <input value={iframeUrl} onChange={e => setIframeUrl(e.target.value)} placeholder="https://sim.yourcompany.com/embed" className="mt-1 w-full text-xs border border-neutral-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-700">Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} className="mt-1 w-full text-xs border border-neutral-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-700">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="mt-1 w-full text-xs border border-neutral-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-700">Height: {height}px</label>
              <input type="range" min={400} max={900} value={height} onChange={e => setHeight(Number(e.target.value))} className="w-full accent-indigo-600 mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-700">Sandbox Permissions</label>
              <div className="space-y-1.5 mt-2">
                {sandboxOptions.map(opt => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={sandbox.includes(opt)} onChange={() => toggleSandbox(opt)} className="accent-indigo-600" />
                    <span className="text-xs font-mono text-neutral-700">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-neutral-700">Pass student data</p>
                <p className="text-[10px] text-neutral-400">Appends ?student_id= to URL</p>
              </div>
              <button onClick={() => setPassData(p => !p)} className={cn('w-10 h-5 rounded-full transition-colors relative', passData ? 'bg-indigo-600' : 'bg-neutral-200')}>
                <motion.div animate={{ x: passData ? 20 : 2 }} className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" />
              </button>
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-700">Completion Detection</label>
              <div className="space-y-2 mt-2">
                {[{ v: 'manual', l: 'Manual', d: 'Student clicks "Done"' }, { v: 'auto', l: 'Auto-detect', d: 'Listen for postMessage' }].map(opt => (
                  <label key={opt.v} className="flex items-start gap-2 cursor-pointer">
                    <input type="radio" name="completion" value={opt.v} checked={completion === opt.v} onChange={() => setCompletion(opt.v)} className="accent-indigo-600 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-neutral-800">{opt.l}</p>
                      <p className="text-[10px] text-neutral-500">{opt.d}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-neutral-700">Embed Code</label>
              <button onClick={doCopy} className="flex items-center gap-1 text-[10px] text-neutral-500 hover:text-neutral-800">
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />} {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="bg-neutral-900 text-emerald-400 rounded-xl p-3 text-[10px] overflow-x-auto leading-relaxed whitespace-pre">{codeSnippet}</pre>
          </div>
          <button onClick={() => onContinue(title || 'Embedded Simulation')} className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
            Continue to Publish <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Preview */}
        <div>
          <p className="text-xs font-semibold text-neutral-700 mb-3">Live Preview</p>
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
            {/* Browser chrome */}
            <div className="bg-neutral-200 h-8 flex items-center px-3 gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="flex-1 ml-2 bg-white rounded text-[9px] text-neutral-500 px-2 py-0.5 truncate">
                {displayUrl || 'https://...'}
              </span>
            </div>
            {/* Preview area */}
            <div className="flex items-center justify-center bg-neutral-50" style={{ height: Math.min(height, 300) }}>
              {iframeUrl ? (
                <div className="text-center">
                  <Monitor className="w-10 h-10 text-indigo-300 mx-auto mb-2" />
                  <p className="text-xs text-neutral-500">Simulation Preview</p>
                  <p className="text-[10px] text-neutral-400 truncate max-w-[200px]">{displayUrl}</p>
                </div>
              ) : (
                <div className="text-center">
                  <Monitor className="w-10 h-10 text-neutral-200 mx-auto mb-2" />
                  <p className="text-xs text-neutral-400">[ Simulation Preview ]</p>
                  <p className="text-[10px] text-neutral-300 mt-1">Enter a URL to preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Publishing Wizard ────────────────────────────────────────────────────────
const STEP_LABELS = ['Details', 'Skills & KPIs', 'Audience', 'Review', 'Publish']

function WizardView({
  initialData,
  methodId,
  onSuccess,
  onBack,
}: {
  initialData: Partial<WizardData>
  methodId: MethodId
  onSuccess: () => void
  onBack: () => void
}) {
  const [step, setStep] = useState<WizardStep>(1)
  const [data, setData] = useState<WizardData>({ ...EMPTY_WIZARD, ...initialData })
  const [published, setPublished] = useState(false)
  const [savedDraft, setSavedDraft] = useState(false)

  function setField<K extends keyof WizardData>(key: K, value: WizardData[K]) {
    setData(prev => ({ ...prev, [key]: value }))
  }

  function toggleSkill(skill: string) {
    setData(prev => {
      const has = prev.skills.includes(skill)
      const skills = has ? prev.skills.filter(s => s !== skill) : [...prev.skills, skill]
      const weights = { ...prev.skillWeights }
      if (!has) weights[skill] = 20
      else delete weights[skill]
      return { ...prev, skills, skillWeights: weights }
    })
  }

  function toggleTrack(track: string) {
    setData(prev => {
      if (track === 'All') return { ...prev, tracks: ['All'] }
      const tracks = prev.tracks.filter(t => t !== 'All')
      return { ...prev, tracks: tracks.includes(track) ? tracks.filter(t => t !== track) : [...tracks, track] }
    })
  }

  const totalWeight = data.skills.reduce((s, sk) => s + (data.skillWeights[sk] || 0), 0)
  const methodLabel = METHODS.find(m => m.id === methodId)?.title ?? 'Unknown'

  if (published) {
    return (
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-8 text-center relative">
        {/* Animated celebration rings */}
        {[80, 130, 180].map((size, i) => (
          <motion.div key={size} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: [0.6, 0] }}
            transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity, ease: 'easeOut' }}
            className="absolute rounded-full border-2 border-emerald-400"
            style={{ width: size, height: size }}
          />
        ))}
        {/* Floating dots */}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 0, x: 0 }}
            animate={{ opacity: [0, 1, 0], y: -80 - Math.random() * 60, x: (Math.random() - 0.5) * 120 }}
            transition={{ duration: 1.5, delay: i * 0.1, repeat: Infinity }}
            className="absolute w-2 h-2 rounded-full"
            style={{ background: ['#10B981', '#6366F1', '#F59E0B', '#EF4444', '#3B82F6'][i % 5] }}
          />
        ))}
        <div className="relative z-10 space-y-4">
          <div className="text-5xl">🎉</div>
          <h2 className="text-2xl font-bold text-neutral-900">Simulation Published!</h2>
          <p className="text-sm text-neutral-500">Your simulation is now live. Students will start applying within minutes.</p>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-emerald-50 rounded-2xl p-4">
              <p className="text-2xl font-bold text-emerald-700">52,847</p>
              <p className="text-xs text-emerald-600">Estimated student reach</p>
            </div>
            <div className="bg-indigo-50 rounded-2xl p-4">
              <p className="text-2xl font-bold text-indigo-700">{data.minTalentScore}+</p>
              <p className="text-xs text-indigo-600">Talent Score threshold</p>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={onSuccess} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors">
              View Simulation
            </button>
            <button onClick={onBack} className="flex-1 py-3 bg-neutral-100 text-neutral-700 rounded-xl text-sm font-bold hover:bg-neutral-200 transition-colors">
              Add Another
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (savedDraft) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center">
          <FileText className="w-8 h-8 text-neutral-400" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900">Draft Saved</h2>
        <p className="text-sm text-neutral-500">Your simulation has been saved as a draft. You can publish it later.</p>
        <button onClick={onBack} className="px-6 py-2.5 bg-neutral-800 text-white rounded-xl text-sm font-medium">Back to Hub</button>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      {/* Progress bar */}
      <div className="bg-white border-b border-neutral-100 px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <button onClick={onBack} className="text-neutral-400 hover:text-neutral-700 mr-1">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <p className="text-xs font-medium text-neutral-500">Step {step} of 5 — {STEP_LABELS[step - 1]}</p>
        </div>
        <div className="flex gap-1">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex-1 flex flex-col gap-1">
              <div className={cn('h-1.5 rounded-full transition-colors', i + 1 <= step ? 'bg-indigo-600' : 'bg-neutral-200')} />
              <p className={cn('text-[9px] font-medium text-center', i + 1 === step ? 'text-indigo-600' : 'text-neutral-400')}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {/* Step 1: Details */}
          {step === 1 && (
            <motion.div key="step1" variants={slideLeft} initial="enter" animate="center" exit="exit" className="space-y-4 max-w-lg mx-auto">
              <h2 className="text-lg font-bold text-neutral-900">Simulation Details</h2>
              <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-700">Title</label>
                  <input value={data.title} onChange={e => setField('title', e.target.value)} className="mt-1 w-full text-sm border border-neutral-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-700">Description</label>
                  <textarea value={data.description} onChange={e => setField('description', e.target.value)} rows={3} className="mt-1 w-full text-sm border border-neutral-200 rounded-xl px-4 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-700">Category</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {CATEGORIES.map(c => (
                      <button key={c} onClick={() => setField('category', c)} className={cn('px-3 py-1 rounded-full text-xs font-medium border transition-colors', data.category === c ? 'bg-indigo-600 text-white border-indigo-600' : 'border-neutral-200 text-neutral-600 hover:border-indigo-400')}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-700">Type</label>
                  <select value={data.type} onChange={e => setField('type', e.target.value)} className="mt-1 w-full text-sm border border-neutral-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                    <option value="">Select type…</option>
                    {SIM_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-700">Company</label>
                  <input value="Your Company" readOnly className="mt-1 w-full text-sm border border-neutral-100 bg-neutral-50 rounded-xl px-4 py-2.5 text-neutral-500" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Skills & KPIs */}
          {step === 2 && (
            <motion.div key="step2" variants={slideLeft} initial="enter" animate="center" exit="exit" className="space-y-4 max-w-lg mx-auto">
              <h2 className="text-lg font-bold text-neutral-900">Skills &amp; KPIs</h2>
              <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-700">Select Skills to Measure</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {ALL_SKILLS.map(skill => (
                      <button key={skill} onClick={() => toggleSkill(skill)} className={cn('px-3 py-1 rounded-full text-xs font-medium border transition-colors', data.skills.includes(skill) ? 'bg-emerald-600 text-white border-emerald-600' : 'border-neutral-200 text-neutral-600 hover:border-emerald-400')}>
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
                {data.skills.length > 0 && (
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-neutral-700">Skill Weights</label>
                    {data.skills.map(skill => (
                      <div key={skill}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-neutral-700">{skill}</span>
                          <span className="text-xs font-bold text-neutral-900">{data.skillWeights[skill] || 0}</span>
                        </div>
                        <input
                          type="range" min={0} max={100} value={data.skillWeights[skill] || 0}
                          onChange={e => setData(prev => ({ ...prev, skillWeights: { ...prev.skillWeights, [skill]: Number(e.target.value) } }))}
                          className="w-full accent-emerald-600"
                        />
                      </div>
                    ))}
                    <div className={cn('flex items-center justify-between p-3 rounded-xl text-xs font-medium', totalWeight === 100 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700')}>
                      <span>Total weight: {totalWeight}</span>
                      {totalWeight !== 100 && <span>⚠ Must sum to 100</span>}
                      {totalWeight === 100 && <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Perfect</span>}
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-xs font-semibold text-neutral-700">Difficulty</label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[
                      { d: 'Easy', desc: 'Foundational tasks, all levels' },
                      { d: 'Medium', desc: 'Moderate challenge, 1-2 yrs exp' },
                      { d: 'Hard', desc: 'Complex scenarios, senior level' },
                      { d: 'Expert', desc: 'Executive decision-making' },
                    ].map(({ d, desc }) => (
                      <button key={d} onClick={() => setField('difficulty', d)} className={cn('p-2.5 rounded-xl border text-left transition-colors', data.difficulty === d ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-neutral-200 text-neutral-700 hover:border-indigo-400')}>
                        <p className="text-xs font-semibold">{d}</p>
                        <p className={cn('text-[10px] mt-0.5', data.difficulty === d ? 'text-indigo-200' : 'text-neutral-400')}>{desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-700">Duration: {data.duration} min</label>
                  <input type="range" min={15} max={120} value={data.duration} onChange={e => setField('duration', Number(e.target.value))} className="w-full accent-indigo-600 mt-1" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Audience */}
          {step === 3 && (
            <motion.div key="step3" variants={slideLeft} initial="enter" animate="center" exit="exit" className="space-y-4 max-w-lg mx-auto">
              <h2 className="text-lg font-bold text-neutral-900">Target Audience</h2>
              <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-700">Target Track</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {TRACKS.map(track => (
                      <button key={track} onClick={() => toggleTrack(track)} className={cn('px-3 py-1 rounded-full text-xs font-medium border transition-colors', data.tracks.includes(track) ? 'bg-indigo-600 text-white border-indigo-600' : 'border-neutral-200 text-neutral-600 hover:border-indigo-400')}>
                        {track}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-700">Minimum Talent Score: {data.minTalentScore === 0 ? 'Open to all' : data.minTalentScore}</label>
                  <input type="range" min={0} max={100} value={data.minTalentScore} onChange={e => setField('minTalentScore', Number(e.target.value))} className="w-full accent-indigo-600 mt-1" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-700">University Filter <span className="text-neutral-400 font-normal">(optional)</span></label>
                  <input value={data.university} onChange={e => setField('university', e.target.value)} placeholder="e.g. GUC, AUC, Cairo University" className="mt-1 w-full text-sm border border-neutral-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-700">Max Candidates <span className="text-neutral-400 font-normal">(leave blank for unlimited)</span></label>
                  <input value={data.maxCandidates} onChange={e => setField('maxCandidates', e.target.value)} type="number" min={1} className="mt-1 w-full text-sm border border-neutral-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-700">Visibility</label>
                  <div className="space-y-2 mt-2">
                    {[
                      { v: 'Public', desc: 'Visible to all students' },
                      { v: 'Invite-only', desc: 'Only invited candidates can access' },
                      { v: 'Unlisted', desc: 'Accessible via link only' },
                    ].map(opt => (
                      <label key={opt.v} className="flex items-start gap-3 cursor-pointer">
                        <input type="radio" name="visibility" value={opt.v} checked={data.visibility === opt.v} onChange={() => setField('visibility', opt.v)} className="accent-indigo-600 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-neutral-800">{opt.v}</p>
                          <p className="text-[10px] text-neutral-500">{opt.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <motion.div key="step4" variants={slideLeft} initial="enter" animate="center" exit="exit" className="space-y-4 max-w-lg mx-auto">
              <h2 className="text-lg font-bold text-neutral-900">Review</h2>
              <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm divide-y divide-neutral-50">
                {/* Method */}
                <div className="px-5 py-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Method</p>
                    <span className="mt-1 inline-flex px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">{methodLabel}</span>
                  </div>
                  <button onClick={() => onBack()} className="text-xs text-indigo-600 font-medium">Edit</button>
                </div>
                {/* Details */}
                <div className="px-5 py-4 flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Details</p>
                    <p className="text-sm font-bold text-neutral-900 mt-1">{data.title || '—'}</p>
                    {data.description && <p className="text-xs text-neutral-500 mt-0.5">{data.description.slice(0, 100)}{data.description.length > 100 ? '…' : ''}</p>}
                    <p className="text-xs text-neutral-400 mt-1">{data.category} · {data.type} · {data.difficulty} · {data.duration} min</p>
                  </div>
                  <button onClick={() => setStep(1)} className="text-xs text-indigo-600 font-medium shrink-0">Edit</button>
                </div>
                {/* Skills */}
                <div className="px-5 py-4 flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Skills Mapped</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {data.skills.length === 0 ? <span className="text-xs text-neutral-400">None selected</span> : data.skills.map(s => (
                        <span key={s} className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">{s} ({data.skillWeights[s] || 0}%)</span>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => setStep(2)} className="text-xs text-indigo-600 font-medium shrink-0">Edit</button>
                </div>
                {/* Audience */}
                <div className="px-5 py-4 flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Audience</p>
                    <p className="text-xs text-neutral-700 mt-1">Tracks: {data.tracks.join(', ')}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">Min Talent Score: {data.minTalentScore === 0 ? 'Open to all' : data.minTalentScore}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">Visibility: {data.visibility}</p>
                    {data.university && <p className="text-xs text-neutral-500 mt-0.5">University: {data.university}</p>}
                    {data.maxCandidates && <p className="text-xs text-neutral-500 mt-0.5">Max candidates: {data.maxCandidates}</p>}
                  </div>
                  <button onClick={() => setStep(3)} className="text-xs text-indigo-600 font-medium shrink-0">Edit</button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 5: Publish */}
          {step === 5 && (
            <motion.div key="step5" variants={slideLeft} initial="enter" animate="center" exit="exit" className="space-y-4 max-w-lg mx-auto text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900">Ready to Publish</h2>
              <p className="text-sm text-neutral-500">Your simulation is configured and ready. Choose how to proceed.</p>
              <div className="space-y-3 mt-6">
                <button
                  onClick={() => setPublished(true)}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl text-base font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5" /> Publish Now
                </button>
                <button
                  onClick={() => setSavedDraft(true)}
                  className="w-full py-3.5 border-2 border-neutral-200 text-neutral-700 rounded-2xl text-sm font-bold hover:border-neutral-300 hover:bg-neutral-50 transition-colors"
                >
                  Save as Draft
                </button>
              </div>
              <div className="bg-neutral-50 rounded-2xl p-4 mt-4 text-left space-y-2">
                <p className="text-xs font-semibold text-neutral-700">What happens next:</p>
                {[
                  'Your simulation goes live immediately',
                  'Matching students receive a notification',
                  'Applications begin appearing in your dashboard',
                  'Results sync automatically based on your method',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-neutral-600">{item}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Wizard nav buttons */}
      {!published && !savedDraft && (
        <div className="bg-white border-t border-neutral-100 px-4 py-3 flex gap-3">
          {step > 1 && (
            <button onClick={() => setStep(s => (s - 1) as WizardStep)} className="flex items-center gap-1.5 px-4 py-2.5 border border-neutral-200 text-neutral-700 rounded-xl text-sm font-medium hover:bg-neutral-50 transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          )}
          {step < 5 && (
            <button onClick={() => setStep(s => (s + 1) as WizardStep)} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Templates Panel ──────────────────────────────────────────────────────────
function TemplatesPanel({ open, onClose, onUse }: { open: boolean; onClose: () => void; onUse: (t: Template) => void }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-80 bg-white z-50 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
              <div>
                <h3 className="font-bold text-neutral-900">Simulation Templates</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Start from a ready-made framework</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {TEMPLATES.map(t => (
                <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900">{t.title}</h4>
                      <p className="text-xs text-neutral-500 mt-0.5">{t.description}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0" style={{ background: `${t.color}18`, color: t.color }}>
                      {t.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex items-center gap-1 text-[10px] text-neutral-500">
                      <Clock className="w-3 h-3" /> {t.duration} min
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {t.skills.map(s => (
                      <span key={s} className="px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full text-[10px]">{s}</span>
                    ))}
                  </div>
                  <button
                    onClick={() => { onUse(t); onClose() }}
                    className="w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors text-white"
                    style={{ background: t.color }}
                  >
                    Use Template <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export function SimulationUploadHubScreen() {
  const { dispatch } = useApp()

  const [view, setView] = useState<View>('hub')
  const [activeMethod, setActiveMethod] = useState<MethodId | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)
  const [wizardInitial, setWizardInitial] = useState<Partial<WizardData>>({})

  function goToMethod(id: MethodId) {
    setActiveMethod(id)
    setView('method')
  }

  function goToWizard(title: string) {
    setWizardInitial({ title })
    setView('wizard')
  }

  function useTemplate(t: Template) {
    setWizardInitial({
      title: t.title,
      description: t.description,
      category: t.category,
      skills: t.skills,
      skillWeights: Object.fromEntries(t.skills.map(s => [s, Math.floor(100 / t.skills.length)])),
      duration: t.duration,
    })
    setActiveMethod('upload')
    setView('wizard')
  }

  function handlePublishSuccess() {
    dispatch({ type: 'GO', screen: 'companyPortal' as never })
  }

  function resetToHub() {
    setView('hub')
    setActiveMethod(null)
    setWizardInitial({})
  }

  const methodConfig = activeMethod ? METHODS.find(m => m.id === activeMethod) : null

  // ── Hub view ──
  if (view === 'hub') {
    return (
      <div className="flex flex-col h-full bg-neutral-50">
        {/* Header */}
        <div className="bg-white border-b border-neutral-100 px-4 pt-4 pb-4 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => dispatch({ type: 'GO_BACK' })}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral-500 hover:bg-neutral-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex-1">
              <h1 className="text-base font-bold text-neutral-900">Add Simulation</h1>
              <p className="text-xs text-neutral-500">Choose how to add your simulation</p>
            </div>
            <button
              onClick={() => setShowTemplates(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-semibold hover:bg-indigo-100 transition-colors border border-indigo-100"
            >
              <Star className="w-3.5 h-3.5" /> Templates
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Method cards grid */}
          <motion.div initial="hidden" animate="visible" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {METHODS.map((method, i) => {
              const Icon = method.icon
              return (
                <motion.div
                  key={method.id}
                  variants={up}
                  custom={i}
                  className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4 hover:shadow-md transition-all cursor-pointer group"
                  style={{ borderLeft: `4px solid ${method.border}` }}
                  onClick={() => goToMethod(method.id)}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: method.bg }}>
                      <Icon className="w-5 h-5" style={{ color: method.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-neutral-900 group-hover:text-neutral-700 transition-colors">{method.title}</h3>
                      <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{method.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[10px] font-medium text-neutral-400 bg-neutral-50 px-2 py-1 rounded-full">
                      <Clock className="w-3 h-3" /> {method.time}
                    </span>
                    <button className="flex items-center gap-1 text-xs font-semibold transition-colors" style={{ color: method.color }}>
                      Select <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Templates section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-neutral-900">Simulation Templates</h2>
              <button onClick={() => setShowTemplates(true)} className="text-xs text-indigo-600 font-medium">View all</button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
              {TEMPLATES.map(t => (
                <div key={t.id} className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-3 flex-shrink-0 w-48">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] font-bold" style={{ background: t.color }}>
                      {t.category[0]}
                    </span>
                    <span className="text-[10px] font-medium text-neutral-500">{t.category} · {t.duration}m</span>
                  </div>
                  <h3 className="text-xs font-bold text-neutral-900 mb-1">{t.title}</h3>
                  <p className="text-[10px] text-neutral-500 leading-relaxed">{t.description}</p>
                  <button
                    onClick={() => useTemplate(t)}
                    className="mt-2.5 w-full py-1.5 rounded-lg text-[10px] font-bold text-white flex items-center justify-center gap-1 transition-opacity hover:opacity-90"
                    style={{ background: t.color }}
                  >
                    Use Template <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <TemplatesPanel open={showTemplates} onClose={() => setShowTemplates(false)} onUse={useTemplate} />
      </div>
    )
  }

  // ── Method view ──
  if (view === 'method' && activeMethod && methodConfig) {
    const Icon = methodConfig.icon
    return (
      <div className="flex flex-col h-full bg-neutral-50">
        {/* Method header */}
        <div className="bg-white border-b border-neutral-100 px-4 pt-4 pb-4 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={resetToHub} className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral-500 hover:bg-neutral-100 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: methodConfig.bg }}>
              <Icon className="w-4 h-4" style={{ color: methodConfig.color }} />
            </div>
            <div className="flex-1">
              <h1 className="text-base font-bold text-neutral-900">{methodConfig.title}</h1>
              <p className="text-xs text-neutral-400">{methodConfig.time} to set up</p>
            </div>
            <button onClick={() => setShowTemplates(true)} className="text-xs text-indigo-600 font-medium border border-indigo-100 bg-indigo-50 px-2.5 py-1 rounded-lg">
              Templates
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeMethod} variants={slideLeft} initial="enter" animate="center" exit="exit" className="flex-1 overflow-hidden flex flex-col">
            {activeMethod === 'upload' && <UploadMethodView onContinue={goToWizard} />}
            {activeMethod === 'builder' && <BuilderMethodView onContinue={goToWizard} />}
            {activeMethod === 'link' && <LinkMethodView onContinue={goToWizard} />}
            {activeMethod === 'api' && <ApiMethodView onContinue={goToWizard} />}
            {activeMethod === 'embed' && <EmbedMethodView onContinue={goToWizard} />}
          </motion.div>
        </AnimatePresence>

        <TemplatesPanel open={showTemplates} onClose={() => setShowTemplates(false)} onUse={useTemplate} />
      </div>
    )
  }

  // ── Wizard view ──
  if (view === 'wizard') {
    return (
      <div className="flex flex-col h-full bg-neutral-50">
        <WizardView
          initialData={wizardInitial}
          methodId={activeMethod ?? 'upload'}
          onSuccess={handlePublishSuccess}
          onBack={resetToHub}
        />
        <TemplatesPanel open={showTemplates} onClose={() => setShowTemplates(false)} onUse={useTemplate} />
      </div>
    )
  }

  return null
}
