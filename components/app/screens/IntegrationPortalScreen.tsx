'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, Plus, Key, Webhook, BarChart2, Activity, Settings,
  CheckCircle2, XCircle, AlertCircle, Copy, Eye, EyeOff, Trash2,
  Globe, Zap, Code2, Play, RefreshCw, Shield, TrendingUp, Users,
  Clock, ArrowRight, ExternalLink, Terminal, BookOpen,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

type PortalTab = 'overview' | 'simulations' | 'apikeys' | 'webhooks' | 'logs' | 'docs'

interface MockApiKey {
  id: string; prefix: string; name: string; env: 'live' | 'test'
  active: boolean; lastUsed: string; created: string
}

interface MockSimulation {
  id: string; name: string; category: string; difficulty: string
  xpReward: number; isActive: boolean; calls: number; avgScore: number
}

interface MockLogEntry {
  id: string; type: string; severity: 'info' | 'warning' | 'error'
  path: string; status: number; ms: number; time: string
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_KEYS: MockApiKey[] = [
  { id: 'k1', prefix: 'sk_live_ab12cd', name: 'Production Key',   env: 'live', active: true,  lastUsed: '2 min ago',  created: '2025-04-01' },
  { id: 'k2', prefix: 'sk_test_ef34gh', name: 'Development Key',  env: 'test', active: true,  lastUsed: '1 hr ago',   created: '2025-04-01' },
  { id: 'k3', prefix: 'sk_live_ij56kl', name: 'CI / CD Key',      env: 'live', active: false, lastUsed: '3 days ago', created: '2025-03-15' },
]

const MOCK_SIMS: MockSimulation[] = [
  { id: 'budget-variance', name: 'Budget Variance Analysis', category: 'Finance',    difficulty: 'Intermediate', xpReward: 150, isActive: true,  calls: 342,  avgScore: 78 },
  { id: 'mkt-campaign',    name: 'Campaign Strategy Sim',   category: 'Marketing',  difficulty: 'Advanced',     xpReward: 180, isActive: true,  calls: 218,  avgScore: 71 },
  { id: 'ops-warehouse',   name: 'Warehouse Optimisation',  category: 'Engineering',difficulty: 'Intermediate', xpReward: 120, isActive: false, calls: 94,   avgScore: 65 },
]

const MOCK_LOGS: MockLogEntry[] = [
  { id: 'l1', type: 'api.request',      severity: 'info',    path: '/api/gateway/mckinsey-cairo/budget-variance', status: 200, ms: 142,  time: '14:32:01' },
  { id: 'l2', type: 'contract.validated',severity: 'info',   path: '/api/webhooks/simulation-events',             status: 200, ms: 38,   time: '14:31:58' },
  { id: 'l3', type: 'api.error',        severity: 'error',   path: '/api/gateway/mckinsey-cairo/mkt-campaign',    status: 502, ms: 30001,time: '14:30:11' },
  { id: 'l4', type: 'key.auth_failed',  severity: 'warning', path: '/api/gateway/mckinsey-cairo/budget-variance', status: 401, ms: 4,    time: '14:28:44' },
  { id: 'l5', type: 'session.completed',severity: 'info',    path: '/api/webhooks/simulation-events',             status: 200, ms: 55,   time: '14:27:30' },
  { id: 'l6', type: 'api.request',      severity: 'info',    path: '/api/gateway/mckinsey-cairo/budget-variance', status: 200, ms: 188,  time: '14:26:12' },
]

const STATS = [
  { label: 'Total Sessions',   value: '1,284',  delta: '+12%', icon: Play,        color: '#0D9488' },
  { label: 'Completion Rate',  value: '73.4%',  delta: '+4%',  icon: CheckCircle2,color: '#10B981' },
  { label: 'Avg Score',        value: '74.2',   delta: '+2.1', icon: TrendingUp,  color: '#8B5CF6' },
  { label: 'Active Devs',      value: '342',    delta: '+28',  icon: Users,       color: '#F59E0B' },
  { label: 'API Calls / Day',  value: '4.7K',   delta: '+8%',  icon: Activity,    color: '#3B82F6' },
  { label: 'Avg Latency',      value: '148 ms', delta: '-12ms',icon: Clock,       color: '#EC4899' },
]

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ stat, index }: { stat: typeof STATS[0]; index: number }) {
  const Icon = stat.icon
  const up   = stat.delta.startsWith('+') || stat.delta.startsWith('-1')
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className="bg-white rounded-2xl border border-neutral-100 p-4"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}18` }}>
          <Icon className="w-4 h-4" style={{ color: stat.color }} />
        </div>
        <span className={cn('text-2xs font-bold px-1.5 py-0.5 rounded-full',
          up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
        )}>{stat.delta}</span>
      </div>
      <p className="text-xl font-bold text-neutral-900 mt-1">{stat.value}</p>
      <p className="text-2xs text-neutral-400 mt-0.5">{stat.label}</p>
    </motion.div>
  )
}

// ── Environment badge ─────────────────────────────────────────────────────────

function EnvBadge({ env }: { env: 'live' | 'test' }) {
  return (
    <span className={cn(
      'text-2xs font-bold px-1.5 py-0.5 rounded-full',
      env === 'live' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
    )}>
      {env === 'live' ? '● Live' : '◎ Test'}
    </span>
  )
}

// ── Severity badge ────────────────────────────────────────────────────────────

function SeverityBadge({ sev }: { sev: MockLogEntry['severity'] }) {
  const cfg = {
    info:    { cls: 'bg-blue-50 text-blue-600',   icon: CheckCircle2 },
    warning: { cls: 'bg-amber-50 text-amber-600', icon: AlertCircle  },
    error:   { cls: 'bg-red-50 text-red-500',     icon: XCircle      },
  }[sev]
  const Icon = cfg.icon
  return (
    <span className={cn('flex items-center gap-1 text-2xs font-semibold px-1.5 py-0.5 rounded-full', cfg.cls)}>
      <Icon className="w-3 h-3" />{sev}
    </span>
  )
}

// ── Code block ────────────────────────────────────────────────────────────────

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard?.writeText(code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="relative bg-neutral-900 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-800">
        <span className="text-2xs text-neutral-400 font-mono">{lang}</span>
        <button onClick={copy} className="flex items-center gap-1 text-2xs text-neutral-400 hover:text-white transition-colors">
          <Copy className="w-3 h-3" />{copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 text-xs text-neutral-300 font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap break-all">
        {code}
      </pre>
    </div>
  )
}

// ── Tab: Overview ─────────────────────────────────────────────────────────────

function OverviewTab() {
  return (
    <div className="flex flex-col gap-4">
      {/* Status banner */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3 flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
        <div>
          <p className="text-sm font-bold text-emerald-800">Integration Active</p>
          <p className="text-2xs text-emerald-600">API gateway healthy · 3 simulations registered · 2 webhooks configured</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {STATS.map((s, i) => <StatCard key={s.label} stat={s} index={i} />)}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-4">
        <p className="text-sm font-bold text-neutral-900 mb-3">Quick Actions</p>
        <div className="flex flex-col gap-2">
          {[
            { label: 'Register new simulation',    icon: Plus,      color: '#0D9488' },
            { label: 'Generate API key',           icon: Key,       color: '#8B5CF6' },
            { label: 'Configure webhook',          icon: Webhook,   color: '#F59E0B' },
            { label: 'View developer docs',        icon: BookOpen,  color: '#3B82F6' },
          ].map(a => {
            const Icon = a.icon
            return (
              <button key={a.label} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-neutral-50 transition-colors text-left">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${a.color}18` }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: a.color }} />
                </div>
                <span className="text-sm font-semibold text-neutral-700">{a.label}</span>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-300 ml-auto" />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Tab: Simulations ──────────────────────────────────────────────────────────

function SimulationsTab() {
  return (
    <div className="flex flex-col gap-3">
      <button className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border-2 border-dashed border-neutral-200 text-sm font-semibold text-neutral-500 hover:border-brand-300 hover:text-brand-600 transition-colors">
        <Plus className="w-4 h-4" /> Register Simulation Endpoint
      </button>

      {MOCK_SIMS.map((sim, i) => (
        <motion.div
          key={sim.id}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
          className="bg-white rounded-2xl border border-neutral-100 p-4"
        >
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <p className="text-sm font-bold text-neutral-900">{sim.name}</p>
              <p className="text-2xs text-neutral-400 mt-0.5">{sim.category} · {sim.difficulty}</p>
            </div>
            <span className={cn(
              'text-2xs font-bold px-1.5 py-0.5 rounded-full flex-shrink-0',
              sim.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-neutral-100 text-neutral-400'
            )}>
              {sim.isActive ? 'Active' : 'Paused'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: 'Sessions',  value: sim.calls.toString() },
              { label: 'Avg Score', value: `${sim.avgScore}%` },
              { label: 'XP Reward', value: `+${sim.xpReward}` },
            ].map(m => (
              <div key={m.label} className="bg-neutral-50 rounded-xl px-2 py-1.5 text-center">
                <p className="text-sm font-bold text-neutral-900">{m.value}</p>
                <p className="text-2xs text-neutral-400">{m.label}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <code className="flex-1 text-2xs text-neutral-500 bg-neutral-50 rounded-lg px-2 py-1 truncate font-mono">
              /api/gateway/mckinsey-cairo/{sim.id}
            </code>
            <button className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-brand-600 transition-colors">
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// ── Tab: API Keys ─────────────────────────────────────────────────────────────

function ApiKeysTab() {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})

  return (
    <div className="flex flex-col gap-3">
      <button className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border-2 border-dashed border-neutral-200 text-sm font-semibold text-neutral-500 hover:border-brand-300 hover:text-brand-600 transition-colors">
        <Plus className="w-4 h-4" /> Generate New API Key
      </button>

      {MOCK_KEYS.map((key, i) => (
        <motion.div
          key={key.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className={cn('bg-white rounded-2xl border p-4', key.active ? 'border-neutral-100' : 'border-neutral-100 opacity-60')}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <p className="text-sm font-bold text-neutral-900">{key.name}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <EnvBadge env={key.env} />
                {!key.active && <span className="text-2xs text-neutral-400 font-semibold">Revoked</span>}
              </div>
            </div>
            <button
              onClick={() => !key.active ? undefined : setRevealed(r => ({ ...r, [key.id]: !r[key.id] }))}
              className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 transition-colors"
            >
              {revealed[key.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-2 bg-neutral-50 rounded-xl px-3 py-2 mb-3">
            <code className="flex-1 text-xs font-mono text-neutral-700">
              {revealed[key.id] ? key.prefix + '••••••••••••••••' : key.prefix.slice(0, 8) + '••••••••'}
            </code>
            <button className="p-0.5 text-neutral-400 hover:text-neutral-700 transition-colors">
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex justify-between text-2xs text-neutral-400">
            <span>Last used: {key.lastUsed}</span>
            <span>Created: {key.created}</span>
          </div>

          {key.active && (
            <button className="mt-2 flex items-center gap-1 text-2xs text-red-400 hover:text-red-600 transition-colors">
              <Trash2 className="w-3 h-3" /> Revoke key
            </button>
          )}
        </motion.div>
      ))}

      {/* Security tips */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-amber-600" />
          <p className="text-xs font-bold text-amber-700">Security best practices</p>
        </div>
        <ul className="flex flex-col gap-1">
          {[
            'Never commit API keys to version control',
            'Rotate keys every 90 days',
            'Use separate keys for live and test environments',
            'Set expiry dates on all long-lived keys',
          ].map(tip => (
            <li key={tip} className="text-2xs text-amber-700 flex items-start gap-1.5">
              <span className="mt-0.5 flex-shrink-0">•</span>{tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ── Tab: Webhooks ─────────────────────────────────────────────────────────────

function WebhooksTab() {
  const samplePayload = `POST https://your-server.com/sho8lana-events
Content-Type: application/json
X-Sho8lana-Signature: t=1716820831,v1=abc123...

{
  "event": "session.completed",
  "sessionId": "sess_abc123",
  "userId": "user_xyz",
  "finalScore": 84,
  "xpAwarded": 120
}`

  return (
    <div className="flex flex-col gap-3">
      <button className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border-2 border-dashed border-neutral-200 text-sm font-semibold text-neutral-500 hover:border-brand-300 hover:text-brand-600 transition-colors">
        <Plus className="w-4 h-4" /> Add Webhook Endpoint
      </button>

      {/* Active webhook */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <p className="text-sm font-bold text-neutral-900">Production Webhook</p>
            <p className="text-2xs text-neutral-400 mt-0.5">https://api.mckinsey-cairo.com/sho8lana</p>
          </div>
          <span className="text-2xs font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600">Active</span>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {['session.completed', 'session.failed', 'score.updated'].map(ev => (
            <span key={ev} className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
              {ev}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[{ label: 'Delivered', value: '1,240' }, { label: 'Failed', value: '8' }, { label: 'Success Rate', value: '99.4%' }].map(m => (
            <div key={m.label} className="text-center">
              <p className="text-sm font-bold text-neutral-900">{m.value}</p>
              <p className="text-2xs text-neutral-400">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Signature verification guide */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-brand-600" />
          <p className="text-xs font-bold text-neutral-800">Signature Verification</p>
        </div>
        <p className="text-2xs text-neutral-500 mb-3">We sign every outbound webhook with HMAC-SHA256. Verify the <code className="bg-neutral-100 px-1 rounded">X-Sho8lana-Signature</code> header to confirm authenticity.</p>
        <CodeBlock code={samplePayload} lang="HTTP Payload" />
      </div>
    </div>
  )
}

// ── Tab: Logs ─────────────────────────────────────────────────────────────────

function LogsTab() {
  const [filter, setFilter] = useState<'all' | 'error' | 'warning'>('all')
  const filtered = useMemo(() =>
    MOCK_LOGS.filter(l => filter === 'all' || l.severity === filter),
    [filter]
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1.5">
        {(['all', 'error', 'warning'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors',
              filter === f ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-500 border-neutral-200'
            )}
          >
            {f === 'all' ? 'All Events' : f.charAt(0).toUpperCase() + f.slice(1) + 's'}
          </button>
        ))}
        <button className="ml-auto p-1.5 rounded-xl border border-neutral-200 text-neutral-400 hover:text-neutral-700 hover:border-neutral-300 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        {filtered.map((log, i) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-white rounded-xl border border-neutral-100 p-3 flex items-start gap-3"
          >
            <div className="flex-shrink-0 mt-0.5">
              <SeverityBadge sev={log.severity} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-neutral-700 truncate">{log.type}</p>
              <p className="text-2xs text-neutral-400 font-mono truncate mt-0.5">{log.path}</p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className={cn('text-xs font-bold', log.status < 400 ? 'text-emerald-600' : 'text-red-500')}>{log.status}</p>
              <p className="text-2xs text-neutral-400">{log.ms}ms</p>
              <p className="text-2xs text-neutral-300 mt-0.5">{log.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────

const TABS: { id: PortalTab; label: string; icon: React.ElementType }[] = [
  { id: 'overview',    label: 'Overview',    icon: BarChart2   },
  { id: 'simulations', label: 'Simulations', icon: Play        },
  { id: 'apikeys',     label: 'API Keys',    icon: Key         },
  { id: 'webhooks',    label: 'Webhooks',    icon: Webhook     },
  { id: 'logs',        label: 'Logs',        icon: Activity    },
  { id: 'docs',        label: 'Docs',        icon: BookOpen    },
]

export function IntegrationPortalScreen() {
  const { state, dispatch } = useApp()
  const ar  = state.lang === 'ar'
  const [tab, setTab] = useState<PortalTab>('overview')

  return (
    <div className="h-full flex flex-col bg-neutral-50 overflow-hidden">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-neutral-100 flex-shrink-0">
        <div className="flex items-center justify-between px-5 py-4">
          <button onClick={() => dispatch({ type: 'GO_BACK' })} className="p-1 text-neutral-500 hover:text-neutral-800 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-900">Integration Portal</p>
              <p className="text-2xs text-neutral-400">McKinsey Cairo</p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex overflow-x-auto no-scrollbar px-2 pb-0 gap-0">
          {TABS.map(t => {
            const Icon = t.icon
            const active = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'relative flex items-center gap-1.5 px-3 py-3 text-xs font-semibold flex-shrink-0 transition-colors',
                  active ? 'text-brand-600' : 'text-neutral-400 hover:text-neutral-600'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
                {active && (
                  <motion.div
                    layoutId="portal-tab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full"
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-4">
          <AnimatePresence mode="wait">
            {tab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                <OverviewTab />
              </motion.div>
            )}
            {tab === 'simulations' && (
              <motion.div key="simulations" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                <SimulationsTab />
              </motion.div>
            )}
            {tab === 'apikeys' && (
              <motion.div key="apikeys" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                <ApiKeysTab />
              </motion.div>
            )}
            {tab === 'webhooks' && (
              <motion.div key="webhooks" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                <WebhooksTab />
              </motion.div>
            )}
            {tab === 'logs' && (
              <motion.div key="logs" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                <LogsTab />
              </motion.div>
            )}
            {tab === 'docs' && (
              <motion.div key="docs" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                <div className="flex flex-col gap-4">
                  <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl p-5 text-white">
                    <div className="flex items-center gap-2 mb-3">
                      <Terminal className="w-5 h-5 text-brand-400" />
                      <p className="text-sm font-bold">Developer Documentation</p>
                    </div>
                    <p className="text-xs text-neutral-400 mb-4">
                      Full API reference, SDKs, integration guides, and sandbox testing environment.
                    </p>
                    <button
                      onClick={() => dispatch({ type: 'GO', screen: 'devPortal' })}
                      className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 rounded-xl text-sm font-semibold text-white transition-colors"
                    >
                      <Code2 className="w-4 h-4" />
                      Open Developer Portal
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {[
                    { title: 'Getting Started Guide',   desc: '5-minute integration walkthrough',        icon: BookOpen,   color: '#0D9488' },
                    { title: 'Simulation Contract v1.0', desc: 'Universal result schema reference',       icon: Globe,      color: '#8B5CF6' },
                    { title: 'API Reference',           desc: 'Full endpoint documentation',             icon: Code2,      color: '#3B82F6' },
                    { title: 'Sandbox Environment',     desc: 'Test your integration safely',            icon: Settings,   color: '#F59E0B' },
                  ].map(item => {
                    const Icon = item.icon
                    return (
                      <button key={item.title} className="bg-white rounded-2xl border border-neutral-100 p-4 flex items-center gap-3 hover:border-brand-200 transition-colors text-left">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}18` }}>
                          <Icon className="w-4.5 h-4.5" style={{ color: item.color }} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-neutral-900">{item.title}</p>
                          <p className="text-2xs text-neutral-400">{item.desc}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-neutral-300 flex-shrink-0" />
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="h-4" />
        </div>
      </div>
    </div>
  )
}
