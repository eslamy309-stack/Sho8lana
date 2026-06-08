'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, Check, Copy, ChevronDown, ChevronUp,
  Globe, Webhook, Code2, Zap, BarChart2, Terminal, CheckCircle2,
  XCircle, Play, BookOpen, Key, Layers, Activity,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { cn } from '@/lib/utils'
import { SAMPLE_CONTRACT } from '@/lib/simulation-contract'
import { validateSimulationResult } from '@/lib/simulation-contract'
import type { ValidationError } from '@/lib/simulation-contract'

// ── Types ─────────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'quickstart' | 'api' | 'contract' | 'sandbox'
type Lang = 'nodejs' | 'python' | 'curl' | 'go'

// ── Animation variants ────────────────────────────────────────────────────────

const tabContent = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.18 } },
}

// ── Syntax highlighted code block ─────────────────────────────────────────────

const COLORS = {
  key:     'text-sky-300',
  str:     'text-emerald-300',
  num:     'text-amber-300',
  bool:    'text-violet-300',
  comment: 'text-neutral-500',
  kw:      'text-violet-400',
  fn:      'text-blue-300',
  punct:   'text-neutral-400',
}

function tokenizeLine(line: string, lang: string): React.ReactNode {
  // Very lightweight highlighting — no external library
  if (lang === 'json') {
    // "key": — key
    // "string value" — str
    // number / true/false/null
    const parts: React.ReactNode[] = []
    const re = /("(?:[^"\\]|\\.)*")\s*(:)?|(\btrue\b|\bfalse\b|\bnull\b)|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|([{}[\],])/g
    let last = 0, m: RegExpExecArray | null
    while ((m = re.exec(line)) !== null) {
      if (m.index > last) parts.push(<span key={last} className={COLORS.punct}>{line.slice(last, m.index)}</span>)
      if (m[1] !== undefined) {
        if (m[2]) parts.push(<span key={m.index} className={COLORS.key}>{m[1]}</span>, <span className={COLORS.punct}>:</span>)
        else parts.push(<span key={m.index} className={COLORS.str}>{m[1]}</span>)
      } else if (m[3]) parts.push(<span key={m.index} className={COLORS.bool}>{m[3]}</span>)
      else if (m[4]) parts.push(<span key={m.index} className={COLORS.num}>{m[4]}</span>)
      else if (m[5]) parts.push(<span key={m.index} className={COLORS.punct}>{m[5]}</span>)
      last = re.lastIndex
    }
    if (last < line.length) parts.push(<span key="tail" className={COLORS.punct}>{line.slice(last)}</span>)
    return <>{parts}</>
  }

  // Generic highlighting: strings, comments, keywords
  if (lang === 'bash' || lang === 'curl') {
    const BASH_KW = /\b(curl|fetch|POST|GET|http|https|null|true|false)\b/g
    const STR     = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g
    const parts: React.ReactNode[] = []
    let text = line
    // Simple: just color keywords
    if (line.trimStart().startsWith('#')) return <span className={COLORS.comment}>{line}</span>
    parts.push(<span key="raw">{text}</span>)
    void BASH_KW; void STR
    return <span className="text-neutral-200">{line}</span>
  }

  return <span className="text-neutral-200">{line}</span>
}

interface CodeBlockProps {
  code: string
  lang?: string
  showLineNumbers?: boolean
}

function CodeBlock({ code, lang = 'json', showLineNumbers = true }: CodeBlockProps) {
  const lines = code.split('\n')
  return (
    <div className="relative rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900">
      <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800 bg-neutral-950">
        <span className="text-xs text-neutral-500 font-mono uppercase tracking-wider">{lang}</span>
        <button
          className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
          onClick={() => navigator.clipboard?.writeText(code).catch(() => null)}
        >
          <Copy className="w-3 h-3" />
          Copy
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-xs leading-relaxed font-mono">
        {lines.map((line, i) => (
          <div key={i} className="flex">
            {showLineNumbers && (
              <span className="select-none w-7 text-right mr-4 text-neutral-600 flex-shrink-0">
                {i + 1}
              </span>
            )}
            <span className="flex-1">{tokenizeLine(line, lang)}</span>
          </div>
        ))}
      </pre>
    </div>
  )
}

// ── Method badge ──────────────────────────────────────────────────────────────

const METHOD_STYLES: Record<string, string> = {
  GET:    'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  POST:   'bg-blue-500/15   text-blue-400   border-blue-500/30',
  PUT:    'bg-amber-500/15  text-amber-400  border-amber-500/30',
  PATCH:  'bg-orange-500/15 text-orange-400 border-orange-500/30',
  DELETE: 'bg-red-500/15    text-red-400    border-red-500/30',
}

function MethodBadge({ method }: { method: string }) {
  return (
    <span className={cn(
      'inline-flex px-2 py-0.5 rounded text-xs font-bold border font-mono flex-shrink-0',
      METHOD_STYLES[method] ?? 'bg-neutral-700 text-neutral-300 border-neutral-600',
    )}>
      {method}
    </span>
  )
}

// ── Overview tab ──────────────────────────────────────────────────────────────

const STEPS = [
  { n: 1, title: 'Register your company', desc: 'Submit your company details and get approved on the Sho8lana developer dashboard.' },
  { n: 2, title: 'Generate API key',       desc: 'Create a scoped API key with the required permissions for your integration tier.' },
  { n: 3, title: 'POST your results',      desc: 'After each simulation session, post the SimulationResult contract to our webhook endpoint.' },
]

const CHECKLIST = [
  'Company registration submitted and approved',
  'API key generated with simulations:write permission',
  'Simulation endpoint registered in the dashboard',
  'Webhook target URL configured for session events',
  'Contract v1.0 schema tested in the Sandbox tab',
  'CORS origin whitelisted for iframe embed delivery',
]

const METHODS = [
  { icon: Globe,    label: 'REST API',        desc: 'Full CRUD API over HTTPS',       status: 'live'    },
  { icon: Webhook,  label: 'Webhooks',        desc: 'Push events to your server',     status: 'live'    },
  { icon: Code2,    label: 'iframe Embed',    desc: 'Embed simulations in our shell', status: 'live'    },
  { icon: Zap,      label: 'SDK',             desc: 'Node.js & Python SDKs',          status: 'soon'    },
  { icon: Activity, label: 'WebSocket',       desc: 'Real-time session events',       status: 'live'    },
  { icon: Layers,   label: 'GraphQL',         desc: 'Flexible query layer',           status: 'planned' },
]

function OverviewTab() {
  return (
    <div className="flex flex-col gap-8 px-4 py-6">
      {/* Hero */}
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 w-fit">
          <Zap className="w-3.5 h-3.5 text-violet-400" />
          <span className="text-xs font-semibold text-violet-300">Developer API</span>
        </div>
        <h1 className="text-2xl font-black text-white leading-tight">Integrate in minutes</h1>
        <p className="text-neutral-400 text-sm leading-relaxed">
          Connect your company's simulation to Sho8lana with our universal contract.
          Students get scored, ranked, and matched — you get rich behavioural analytics.
        </p>
      </div>

      {/* 3-step cards */}
      <div className="flex flex-col gap-3">
        {STEPS.map(s => (
          <div key={s.n}
            className="flex gap-4 p-4 rounded-xl bg-neutral-900 border border-neutral-800">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center
                            text-white text-sm font-black flex-shrink-0">
              {s.n}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{s.title}</p>
              <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Architecture diagram */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-white">Architecture</h2>
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 overflow-x-auto">
          <div className="flex items-center gap-1.5 min-w-max text-xs font-mono">
            {[
              { label: 'Company Server', color: '#3B82F6' },
              { label: 'API Gateway',    color: '#8B5CF6' },
              { label: 'Contract Validator', color: '#10B981' },
              { label: 'Leaderboard / Analytics', color: '#F59E0B' },
            ].map((node, i, arr) => (
              <div key={node.label} className="flex items-center gap-1.5">
                <div className="px-3 py-2 rounded-lg text-white text-2xs font-bold"
                     style={{ background: `${node.color}20`, border: `1px solid ${node.color}40`, color: node.color }}>
                  {node.label}
                </div>
                {i < arr.length - 1 && (
                  <svg width="24" height="12" viewBox="0 0 24 12" className="flex-shrink-0">
                    <path d="M0 6 H18 M14 2 L22 6 L14 10" stroke="#4B5563" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-white">Integration checklist</h2>
        <div className="flex flex-col gap-2">
          {CHECKLIST.map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-neutral-900 border border-neutral-800">
              <div className="w-5 h-5 rounded-md border-2 border-neutral-700 flex-shrink-0 mt-0.5
                              flex items-center justify-center bg-neutral-800">
                <div className="w-2 h-2 rounded-sm bg-neutral-600" />
              </div>
              <span className="text-xs text-neutral-300 leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Supported methods */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-white">Supported integration methods</h2>
        <div className="grid grid-cols-2 gap-2.5">
          {METHODS.map(m => (
            <div key={m.label}
              className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <m.icon className="w-4 h-4 text-neutral-400" />
                <span className={cn(
                  'text-2xs font-bold px-2 py-0.5 rounded-full',
                  m.status === 'live'    && 'bg-emerald-500/15 text-emerald-400',
                  m.status === 'soon'    && 'bg-amber-500/15 text-amber-400',
                  m.status === 'planned' && 'bg-neutral-700 text-neutral-400',
                )}>
                  {m.status === 'live' ? 'Live' : m.status === 'soon' ? 'Soon' : 'Planned'}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-white">{m.label}</p>
                <p className="text-2xs text-neutral-500 mt-0.5">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Quickstart tab ────────────────────────────────────────────────────────────

const CODE_SAMPLES: Record<Lang, { label: string; code: string }> = {
  nodejs: {
    label: 'Node.js',
    code: `// npm install axios
const axios = require('axios');

const result = {
  contractVersion: "1.0",
  userId: "user_abc123",
  simulationId: "budget-variance-v2",
  companyId: "your-company-id",
  sessionId: "sess_xyz789",
  completionStatus: "completed",
  startedAt: new Date(Date.now() - 3600000).toISOString(),
  completedAt: new Date().toISOString(),
  durationSeconds: 3540,
  finalScore: 84,
  scores: { accuracy: 87, speed: 74, decision: 91, overall: 84 },
  kpiMetrics: [],
  decisionLog: [],
  behavioralAnalytics: {},
  eventTimeline: [],
  metadata: {}
};

await axios.post(
  'https://api.sho8lana.com/api/webhooks/simulation-events',
  result,
  { headers: { 'Authorization': 'Bearer sk_live_YOUR_KEY' } }
);`,
  },
  python: {
    label: 'Python',
    code: `# pip install requests
import requests
from datetime import datetime, timedelta

result = {
    "contractVersion": "1.0",
    "userId": "user_abc123",
    "simulationId": "budget-variance-v2",
    "companyId": "your-company-id",
    "sessionId": "sess_xyz789",
    "completionStatus": "completed",
    "startedAt": (datetime.utcnow() - timedelta(hours=1)).isoformat() + "Z",
    "completedAt": datetime.utcnow().isoformat() + "Z",
    "durationSeconds": 3540,
    "finalScore": 84,
    "scores": {"accuracy": 87, "speed": 74, "decision": 91, "overall": 84},
    "kpiMetrics": [],
    "decisionLog": [],
    "behavioralAnalytics": {},
    "eventTimeline": [],
    "metadata": {}
}

resp = requests.post(
    "https://api.sho8lana.com/api/webhooks/simulation-events",
    json=result,
    headers={"Authorization": "Bearer sk_live_YOUR_KEY"}
)
print(resp.status_code, resp.json())`,
  },
  curl: {
    label: 'cURL',
    code: `curl -X POST https://api.sho8lana.com/api/webhooks/simulation-events \\
  -H "Authorization: Bearer sk_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "contractVersion": "1.0",
    "userId": "user_abc123",
    "simulationId": "budget-variance-v2",
    "companyId": "your-company-id",
    "sessionId": "sess_xyz789",
    "completionStatus": "completed",
    "startedAt": "2026-05-17T10:00:00Z",
    "completedAt": "2026-05-17T11:00:00Z",
    "durationSeconds": 3540,
    "finalScore": 84,
    "scores": {
      "accuracy": 87, "speed": 74, "decision": 91, "overall": 84
    },
    "kpiMetrics": [],
    "decisionLog": [],
    "behavioralAnalytics": {},
    "eventTimeline": [],
    "metadata": {}
  }'`,
  },
  go: {
    label: 'Go',
    code: `package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
    "time"
)

func main() {
    now := time.Now()
    result := map[string]interface{}{
        "contractVersion":   "1.0",
        "userId":            "user_abc123",
        "simulationId":      "budget-variance-v2",
        "companyId":         "your-company-id",
        "sessionId":         "sess_xyz789",
        "completionStatus":  "completed",
        "startedAt":         now.Add(-time.Hour).Format(time.RFC3339),
        "completedAt":       now.Format(time.RFC3339),
        "durationSeconds":   3540,
        "finalScore":        84,
        "scores": map[string]int{
            "accuracy": 87, "speed": 74, "decision": 91, "overall": 84,
        },
        "kpiMetrics": []interface{}{},
        "decisionLog": []interface{}{},
        "behavioralAnalytics": map[string]interface{}{},
        "eventTimeline": []interface{}{},
        "metadata": map[string]interface{}{},
    }

    body, _ := json.Marshal(result)
    req, _ := http.NewRequest("POST",
        "https://api.sho8lana.com/api/webhooks/simulation-events",
        bytes.NewBuffer(body))
    req.Header.Set("Authorization", "Bearer sk_live_YOUR_KEY")
    req.Header.Set("Content-Type", "application/json")

    resp, err := http.DefaultClient.Do(req)
    if err != nil { panic(err) }
    defer resp.Body.Close()
    fmt.Println(resp.Status)
}`,
  },
}

const QS_STEPS = [
  { n: 1, title: 'Register your company',     desc: 'Go to the Sho8lana Company Portal and submit your integration request.' },
  { n: 2, title: 'Get your API key',           desc: 'Once approved, generate a live API key with simulations:write permission.' },
  { n: 3, title: 'Start a simulation session', desc: 'POST to /api/integrations/{companyId}/simulations to receive a sessionId.' },
  { n: 4, title: 'POST results',               desc: 'On completion, POST the SimulationResult payload to the webhook endpoint.' },
]

function QuickstartTab() {
  const [lang, setLang] = useState<Lang>('nodejs')
  const sample = CODE_SAMPLES[lang]
  const LANGS: Lang[] = ['nodejs', 'python', 'curl', 'go']

  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      {/* Steps */}
      <div className="flex flex-col gap-3">
        {QS_STEPS.map(s => (
          <div key={s.n} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center
                              text-white text-xs font-black flex-shrink-0">
                {s.n}
              </div>
              {s.n < 4 && <div className="w-px flex-1 bg-neutral-800 mt-1.5 mb-0.5 min-h-[20px]" />}
            </div>
            <div className="pb-4">
              <p className="text-sm font-semibold text-white">{s.title}</p>
              <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Language selector */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-white">Send a simulation result</h2>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {LANGS.map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0',
                lang === l
                  ? 'bg-violet-600 text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200',
              )}
            >
              {CODE_SAMPLES[l].label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={lang} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            <CodeBlock code={sample.code} lang={lang === 'curl' ? 'bash' : lang} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── API Reference tab ─────────────────────────────────────────────────────────

const ENDPOINTS = [
  {
    method: 'GET',
    path: '/api/integrations',
    desc: 'List all company integrations',
    auth: true,
    perms: 'simulations:read',
    requestBody: null,
    response: { integrations: [{ id: 'int_123', companyId: 'your-company', status: 'active', tier: 'professional' }] },
  },
  {
    method: 'POST',
    path: '/api/integrations',
    desc: 'Register a new company integration',
    auth: true,
    perms: 'admin',
    requestBody: { companyId: 'your-company', companyName: 'Your Company', contactEmail: 'dev@company.com', tier: 'standard' },
    response: { id: 'int_456', companyId: 'your-company', status: 'pending', createdAt: '2026-05-17T12:00:00Z' },
  },
  {
    method: 'POST',
    path: '/api/integrations/{companyId}/simulations',
    desc: 'Start a new simulation session for a student',
    auth: true,
    perms: 'simulations:execute',
    requestBody: { simulationId: 'budget-variance-v2', userId: 'user_abc123' },
    response: { sessionId: 'sess_xyz789', externalToken: 'tok_...', expiresAt: '2026-05-17T14:00:00Z' },
  },
  {
    method: 'POST',
    path: '/api/webhooks/simulation-events',
    desc: 'Deliver a simulation result from your server to Sho8lana',
    auth: true,
    perms: 'simulations:write',
    requestBody: { contractVersion: '1.0', userId: 'user_abc123', finalScore: 84, '...': '(full SimulationResult)' },
    response: { received: true, sessionId: 'sess_xyz789', xpAwarded: 120, leaderboardPosition: 3 },
  },
  {
    method: 'GET',
    path: '/api/analytics',
    desc: 'Retrieve aggregated analytics for your company integrations',
    auth: true,
    perms: 'analytics:read',
    requestBody: null,
    response: { period: 'month', totalSessions: 512, completionRate: 0.87, avgFinalScore: 74.3 },
  },
  {
    method: 'GET',
    path: '/api/gateway/{companyId}/{simId}',
    desc: 'Proxy a request through the integration gateway to a company simulation server',
    auth: true,
    perms: 'simulations:execute',
    requestBody: null,
    response: { status: 200, body: { '...': 'upstream response' }, durationMs: 142, cached: false },
  },
]

function ApiReferenceTab() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="flex flex-col gap-3 px-4 py-6">
      <div className="flex flex-col gap-1 mb-2">
        <h2 className="text-base font-black text-white">API Reference</h2>
        <p className="text-xs text-neutral-400">All endpoints require <span className="font-mono text-violet-300">Authorization: Bearer sk_live_…</span></p>
      </div>

      {ENDPOINTS.map((ep, i) => (
        <div key={i} className="rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
          >
            <MethodBadge method={ep.method} />
            <span className="flex-1 font-mono text-xs text-neutral-200 truncate">{ep.path}</span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-2xs text-neutral-500 hidden sm:block">{ep.perms}</span>
              {open === i
                ? <ChevronUp   className="w-4 h-4 text-neutral-500" />
                : <ChevronDown className="w-4 h-4 text-neutral-500" />
              }
            </div>
          </button>

          <AnimatePresence>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 flex flex-col gap-3 border-t border-neutral-800">
                  <p className="text-xs text-neutral-400 pt-3 leading-relaxed">{ep.desc}</p>
                  <div className="flex items-center gap-2">
                    <Key className="w-3 h-3 text-neutral-500" />
                    <span className="text-2xs text-neutral-500">Required permission:</span>
                    <span className="text-2xs font-mono text-violet-300">{ep.perms}</span>
                  </div>
                  {ep.requestBody && (
                    <div>
                      <p className="text-2xs text-neutral-500 font-semibold uppercase tracking-wider mb-1.5">Request body</p>
                      <CodeBlock code={JSON.stringify(ep.requestBody, null, 2)} lang="json" showLineNumbers={false} />
                    </div>
                  )}
                  <div>
                    <p className="text-2xs text-neutral-500 font-semibold uppercase tracking-wider mb-1.5">Response example</p>
                    <CodeBlock code={JSON.stringify(ep.response, null, 2)} lang="json" showLineNumbers={false} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}

// ── Contract tab ──────────────────────────────────────────────────────────────

const CONTRACT_FIELDS = [
  { field: 'contractVersion',     type: '"1.0" | "1.1" | "2.0"', required: true,  desc: 'Schema version used by your simulation' },
  { field: 'userId',              type: 'string',                required: true,  desc: 'Sho8lana user ID of the participant' },
  { field: 'simulationId',        type: 'string',                required: true,  desc: 'Company-scoped simulation slug' },
  { field: 'companyId',           type: 'string',                required: true,  desc: 'Your registered company slug' },
  { field: 'sessionId',           type: 'string',                required: true,  desc: 'Unique session identifier' },
  { field: 'completionStatus',    type: '"completed" | "failed" | "abandoned" | "partial"', required: true,  desc: 'Final outcome of the session' },
  { field: 'startedAt',           type: 'ISO 8601 string',       required: true,  desc: 'Session start timestamp' },
  { field: 'completedAt',         type: 'ISO 8601 string',       required: true,  desc: 'Session end timestamp' },
  { field: 'durationSeconds',     type: 'number ≥ 0',            required: true,  desc: 'Total elapsed session duration' },
  { field: 'finalScore',          type: 'number 0–100',          required: true,  desc: 'Overall weighted score' },
  { field: 'scores',              type: 'ContractScore',         required: true,  desc: 'accuracy, speed, decision, overall (0–100 each)' },
  { field: 'kpiMetrics',          type: 'ContractKpiMetric[]',   required: true,  desc: 'Weighted performance KPIs (weights should sum to 1.0)' },
  { field: 'decisionLog',         type: 'ContractDecisionEntry[]', required: false, desc: 'Ordered log of every question/choice made' },
  { field: 'behavioralAnalytics', type: 'ContractBehavioralAnalytics', required: false, desc: 'Auto-derived from decisionLog if omitted' },
  { field: 'eventTimeline',       type: 'ContractEventEntry[]',  required: false, desc: 'Chronological session events for replay' },
  { field: 'xpEarned',            type: 'number',                required: false, desc: 'Override XP calculation (else platform computes it)' },
  { field: 'certificateEligible', type: 'boolean',               required: false, desc: 'Whether to issue a completion certificate' },
  { field: 'metadata',            type: 'Record<string, unknown>', required: true,  desc: 'Any extra data you want to store alongside the result' },
]

function ContractTab() {
  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      <div>
        <h2 className="text-base font-black text-white">SimulationResult schema</h2>
        <p className="text-xs text-neutral-400 mt-1">Every POST to our webhook must conform to this contract.</p>
      </div>

      {/* Full sample */}
      <CodeBlock code={JSON.stringify(SAMPLE_CONTRACT, null, 2)} lang="json" />

      {/* Field table */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-bold text-white">Field reference</h3>
        <div className="rounded-xl overflow-hidden border border-neutral-800">
          {/* Header */}
          <div className="grid grid-cols-[1fr_1fr_auto] gap-px bg-neutral-800 text-2xs font-bold uppercase tracking-wider text-neutral-500 px-4 py-2">
            <span>Field</span>
            <span>Type</span>
            <span className="text-right">Req.</span>
          </div>
          {CONTRACT_FIELDS.map((f, i) => (
            <div
              key={f.field}
              className={cn(
                'px-4 py-3 flex flex-col gap-0.5',
                i % 2 === 0 ? 'bg-neutral-950' : 'bg-neutral-900',
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-sky-300">{f.field}</span>
                <span className={cn(
                  'text-2xs font-bold',
                  f.required ? 'text-red-400' : 'text-neutral-500',
                )}>
                  {f.required ? 'required' : 'optional'}
                </span>
              </div>
              <span className="text-2xs font-mono text-amber-300/80">{f.type}</span>
              <span className="text-2xs text-neutral-500">{f.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Sandbox tab ───────────────────────────────────────────────────────────────

function SandboxTab() {
  const [companyId,        setCompanyId]        = useState('')
  const [jsonPayload,      setJsonPayload]       = useState(JSON.stringify(SAMPLE_CONTRACT, null, 2))
  const [validationResult, setValidationResult] = useState<{ valid: boolean; errors: ValidationError[]; warnings: { field: string; message: string }[] } | null>(null)
  const [toastVisible,     setToastVisible]     = useState(false)

  const handleValidate = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonPayload)
      const result = validateSimulationResult(parsed)
      setValidationResult(result)
    } catch {
      setValidationResult({
        valid:    false,
        errors:   [{ field: 'root', message: 'Invalid JSON — could not parse payload' }],
        warnings: [],
      })
    }
  }, [jsonPayload])

  const handleSendTest = useCallback(() => {
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2500)
  }, [])

  return (
    <div className="flex flex-col gap-5 px-4 py-6">
      <div>
        <h2 className="text-base font-black text-white">Sandbox</h2>
        <p className="text-xs text-neutral-400 mt-1">Validate your payload against the contract locally — no network call needed.</p>
      </div>

      {/* Company ID */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-neutral-300">Company ID</label>
        <input
          type="text"
          placeholder="e.g. mckinsey-cairo"
          value={companyId}
          onChange={e => setCompanyId(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-sm text-white
                     placeholder:text-neutral-600 focus:outline-none focus:border-violet-500/70 focus:ring-2
                     focus:ring-violet-500/20 transition-all font-mono"
        />
      </div>

      {/* JSON payload */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-neutral-300">Simulation result payload (JSON)</label>
        <textarea
          rows={12}
          value={jsonPayload}
          onChange={e => setJsonPayload(e.target.value)}
          spellCheck={false}
          className="w-full px-3.5 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-neutral-200
                     font-mono placeholder:text-neutral-600 focus:outline-none focus:border-violet-500/70 focus:ring-2
                     focus:ring-violet-500/20 resize-none transition-all leading-relaxed"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2.5">
        <button
          onClick={handleValidate}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                     bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
        >
          <Terminal className="w-4 h-4" />
          Validate Contract
        </button>
        <button
          onClick={handleSendTest}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                     bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-semibold transition-colors
                     border border-neutral-700"
        >
          <Play className="w-4 h-4" />
          Send Test
        </button>
      </div>

      {/* Validation result */}
      <AnimatePresence>
        {validationResult && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={cn(
              'rounded-xl border p-4 flex flex-col gap-3',
              validationResult.valid
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-red-500/10 border-red-500/30',
            )}
          >
            {/* Header */}
            <div className="flex items-center gap-2.5">
              {validationResult.valid
                ? <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                : <XCircle      className="w-5 h-5 text-red-400 flex-shrink-0" />
              }
              <span className={cn(
                'text-sm font-bold',
                validationResult.valid ? 'text-emerald-300' : 'text-red-300',
              )}>
                {validationResult.valid ? 'Contract valid' : `${validationResult.errors.length} error${validationResult.errors.length !== 1 ? 's' : ''} found`}
              </span>
            </div>

            {/* Errors */}
            {validationResult.errors.map((err, i) => (
              <div key={i} className="flex flex-col gap-0.5 pl-7">
                <span className="text-xs font-mono text-red-300">{err.field}</span>
                <span className="text-xs text-red-400/80">{err.message}</span>
              </div>
            ))}

            {/* Warnings */}
            {validationResult.warnings.length > 0 && (
              <div className="flex flex-col gap-2 mt-1">
                <span className="text-2xs text-neutral-500 font-bold uppercase tracking-wider pl-7">Warnings</span>
                {validationResult.warnings.map((w, i) => (
                  <div key={i} className="flex flex-col gap-0.5 pl-7">
                    <span className="text-xs font-mono text-amber-300">{w.field}</span>
                    <span className="text-xs text-amber-400/80">{w.message}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toastVisible && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5
                       px-5 py-3 rounded-xl bg-neutral-800 border border-neutral-700 shadow-2xl"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold text-white">Webhook delivered (mock)</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Tab config ────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'overview',   label: 'Overview',    icon: BookOpen  },
  { id: 'quickstart', label: 'Quickstart',  icon: Terminal  },
  { id: 'api',        label: 'API',         icon: Globe     },
  { id: 'contract',   label: 'Contract',    icon: Code2     },
  { id: 'sandbox',    label: 'Sandbox',     icon: Play      },
]

// ── Main component ────────────────────────────────────────────────────────────

export function DevPortalScreen() {
  const { state, dispatch } = useApp()
  const ar   = state.lang === 'ar'
  const [tab, setTab] = useState<Tab>('overview')

  return (
    <div className="fixed inset-0 flex flex-col bg-neutral-950 text-white overflow-hidden">

      {/* Header */}
      <div className="flex-shrink-0 bg-neutral-950 border-b border-neutral-800 px-4 pt-safe-top pb-0">
        <div className="flex items-center gap-3 py-3">
          <button
            onClick={() => dispatch({ type: 'GO_BACK' })}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800
                       transition-colors flex-shrink-0"
          >
            {ar
              ? <ChevronRight className="w-5 h-5" />
              : <ChevronLeft  className="w-5 h-5" />
            }
          </button>
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white leading-tight">Developer Portal</p>
              <p className="text-2xs text-neutral-500 truncate">Integration documentation</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-2xs font-semibold text-emerald-400">API Live</span>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-0.5 overflow-x-auto pb-px scroll-hide">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold whitespace-nowrap flex-shrink-0',
                'border-b-2 transition-all duration-200',
                tab === t.id
                  ? 'border-violet-500 text-violet-300'
                  : 'border-transparent text-neutral-500 hover:text-neutral-300',
              )}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            variants={tabContent}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {tab === 'overview'   && <OverviewTab />}
            {tab === 'quickstart' && <QuickstartTab />}
            {tab === 'api'        && <ApiReferenceTab />}
            {tab === 'contract'   && <ContractTab />}
            {tab === 'sandbox'    && <SandboxTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
