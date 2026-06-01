'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  Building2,
  FlaskConical,
  CreditCard,
  ScrollText,
  Headphones,
  Activity,
  Bell,
  Eye,
  CheckCircle,
  PauseCircle,
  Ban,
  XCircle,
  ExternalLink,
  X,
  Search,
  ChevronDown,
  RefreshCw,
  Send,
  Shield,
  TrendingUp,
  TrendingDown,
  Circle,
  LogOut,
  Lock,
  AlertTriangle,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Notification {
  id: string
  type: 'student' | 'company' | 'simulation' | 'application' | 'payment' | 'security'
  message: string
  timestamp: Date
  read: boolean
}

interface Student {
  id: string
  name: string
  email: string
  university: string
  major: string
  talentScore: number
  subscription: 'Free' | 'Pro'
  status: 'Active' | 'Suspended' | 'Banned'
  joined: string
  lastLogin: string
  applicationsCount: number
  simCompletions: number
  kpis: { leadership: number; analytical: number; communication: number; cognitive: number }
}

interface Company {
  id: string
  name: string
  industry: string
  plan: 'Starter' | 'Pro' | 'Enterprise'
  status: 'Pending Approval' | 'Active' | 'Suspended'
  recruiters: number
  simulations: number
  joined: string
}

interface Simulation {
  id: string
  title: string
  company: string
  category: string
  submitted: string
  status: 'Pending Review' | 'Approved' | 'Rejected'
  description: string
  duration: string
  rejectionReason?: string
}

interface Payment {
  id: string
  name: string
  plan: string
  amount: string
  status: 'Active' | 'Cancelled'
  nextBilling: string
  started: string
  type: 'student' | 'company'
  recruiters?: number
}

interface AuditEntry {
  id: string
  timestamp: string
  actor: string
  action: 'login' | 'user_update' | 'subscription_change' | 'company_approval' | 'simulation_upload' | 'admin_action' | 'security_event'
  description: string
  ip: string
}

interface Ticket {
  id: string
  subject: string
  fromName: string
  fromEmail: string
  category: 'Bug' | 'Question' | 'Billing' | 'Account'
  priority: 'High' | 'Medium' | 'Low'
  status: 'Open' | 'In Progress' | 'Resolved'
  created: string
  message: string
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_STUDENTS: Student[] = [
  { id: '1', name: 'Nour El-Din Hassan', email: 'nour@aucegypt.edu', university: 'AUC', major: 'Business Administration', talentScore: 89, subscription: 'Pro', status: 'Active', joined: '2024-09-15', lastLogin: '2026-06-01', applicationsCount: 12, simCompletions: 5, kpis: { leadership: 92, analytical: 85, communication: 88, cognitive: 90 } },
  { id: '2', name: 'Salma Mahmoud', email: 'salma@cairo.edu', university: 'Cairo University', major: 'Computer Science', talentScore: 76, subscription: 'Free', status: 'Active', joined: '2024-10-03', lastLogin: '2026-05-29', applicationsCount: 7, simCompletions: 3, kpis: { leadership: 74, analytical: 82, communication: 71, cognitive: 78 } },
  { id: '3', name: 'Ahmed Farouk', email: 'ahmed.f@alexu.edu', university: 'Alexandria University', major: 'Marketing', talentScore: 63, subscription: 'Free', status: 'Suspended', joined: '2024-11-20', lastLogin: '2026-04-10', applicationsCount: 3, simCompletions: 1, kpis: { leadership: 65, analytical: 60, communication: 68, cognitive: 59 } },
  { id: '4', name: 'Mariam Youssef', email: 'mariam@guc.edu.eg', university: 'GUC', major: 'Engineering', talentScore: 94, subscription: 'Pro', status: 'Active', joined: '2024-08-01', lastLogin: '2026-06-01', applicationsCount: 18, simCompletions: 8, kpis: { leadership: 96, analytical: 94, communication: 92, cognitive: 95 } },
  { id: '5', name: 'Omar Khaled', email: 'omar.k@aast.edu', university: 'AAST', major: 'Finance', talentScore: 55, subscription: 'Free', status: 'Banned', joined: '2025-01-12', lastLogin: '2026-02-28', applicationsCount: 1, simCompletions: 0, kpis: { leadership: 52, analytical: 58, communication: 54, cognitive: 56 } },
  { id: '6', name: 'Hana Ibrahim', email: 'hana@aucegypt.edu', university: 'AUC', major: 'Psychology', talentScore: 81, subscription: 'Pro', status: 'Active', joined: '2024-09-22', lastLogin: '2026-05-31', applicationsCount: 9, simCompletions: 4, kpis: { leadership: 84, analytical: 78, communication: 86, cognitive: 76 } },
  { id: '7', name: 'Youssef Tamer', email: 'youssef@must.edu', university: 'MUST', major: 'Data Science', talentScore: 71, subscription: 'Free', status: 'Active', joined: '2025-02-14', lastLogin: '2026-05-30', applicationsCount: 5, simCompletions: 2, kpis: { leadership: 68, analytical: 79, communication: 66, cognitive: 72 } },
  { id: '8', name: 'Dina Raouf', email: 'dina@bue.edu.eg', university: 'BUE', major: 'Architecture', talentScore: 87, subscription: 'Pro', status: 'Active', joined: '2024-07-18', lastLogin: '2026-06-01', applicationsCount: 14, simCompletions: 6, kpis: { leadership: 88, analytical: 83, communication: 90, cognitive: 87 } },
]

const MOCK_COMPANIES: Company[] = [
  { id: '1', name: 'Vodafone Egypt', industry: 'Telecom', plan: 'Enterprise', status: 'Active', recruiters: 12, simulations: 5, joined: '2024-06-01' },
  { id: '2', name: 'Banque Misr', industry: 'Banking', plan: 'Pro', status: 'Active', recruiters: 6, simulations: 3, joined: '2024-07-15' },
  { id: '3', name: 'Startup Egypt', industry: 'Technology', plan: 'Starter', status: 'Pending Approval', recruiters: 2, simulations: 1, joined: '2026-05-29' },
  { id: '4', name: 'Orange Egypt', industry: 'Telecom', plan: 'Enterprise', status: 'Active', recruiters: 9, simulations: 4, joined: '2024-09-10' },
  { id: '5', name: 'TechVentures Co', industry: 'Technology', plan: 'Starter', status: 'Pending Approval', recruiters: 1, simulations: 0, joined: '2026-06-01' },
  { id: '6', name: 'EgyptAir', industry: 'Aviation', plan: 'Pro', status: 'Suspended', recruiters: 4, simulations: 2, joined: '2024-11-01' },
]

const MOCK_SIMULATIONS: Simulation[] = [
  { id: '1', title: 'Customer Experience Strategy', company: 'Vodafone Egypt', category: 'Marketing', submitted: '2026-05-28', status: 'Pending Review', description: 'Participants will design a 90-day CX improvement plan for a telecom company facing churn issues.', duration: '3 hours' },
  { id: '2', title: 'Financial Risk Assessment', company: 'Banque Misr', category: 'Finance', submitted: '2026-05-25', status: 'Approved', description: 'Analyze a portfolio of SME loans and identify credit risk factors.', duration: '4 hours' },
  { id: '3', title: 'Product Launch Roadmap', company: 'Orange Egypt', category: 'Product', submitted: '2026-05-20', status: 'Rejected', description: 'Build a GTM strategy for a new mobile broadband product.', duration: '2.5 hours', rejectionReason: 'Questions were too vague and lacked measurable outcomes. Please revise and resubmit.' },
  { id: '4', title: 'HR Talent Acquisition Pipeline', company: 'Startup Egypt', category: 'Human Resources', submitted: '2026-06-01', status: 'Pending Review', description: 'Design an end-to-end recruitment process for a fast-growing tech startup.', duration: '2 hours' },
]

const MOCK_PAYMENTS: Payment[] = [
  { id: '1', name: 'Mariam Youssef', plan: 'Pro Monthly', amount: 'EGP 150/mo', status: 'Active', nextBilling: '2026-07-01', started: '2026-06-01', type: 'student' },
  { id: '2', name: 'Nour El-Din Hassan', plan: 'Pro Monthly', amount: 'EGP 150/mo', status: 'Active', nextBilling: '2026-07-01', started: '2026-05-01', type: 'student' },
  { id: '3', name: 'Hana Ibrahim', plan: 'Pro Monthly', amount: 'EGP 150/mo', status: 'Active', nextBilling: '2026-07-01', started: '2026-04-01', type: 'student' },
  { id: '4', name: 'Dina Raouf', plan: 'Pro Monthly', amount: 'EGP 150/mo', status: 'Active', nextBilling: '2026-07-01', started: '2026-03-18', type: 'student' },
  { id: '5', name: 'Youssef Tamer', plan: 'Pro Monthly', amount: 'EGP 150/mo', status: 'Cancelled', nextBilling: '—', started: '2026-02-14', type: 'student' },
  { id: '6', name: 'Omar Khaled', plan: 'Pro Monthly', amount: 'EGP 150/mo', status: 'Cancelled', nextBilling: '—', started: '2025-01-12', type: 'student' },
  { id: '7', name: 'Vodafone Egypt', plan: 'Enterprise Annual', amount: 'EGP 10,000/yr', status: 'Active', nextBilling: '2027-06-01', started: '2026-06-01', type: 'company', recruiters: 12 },
  { id: '8', name: 'Banque Misr', plan: 'Pro Monthly', amount: 'EGP 1,000/mo', status: 'Active', nextBilling: '2026-07-01', started: '2026-05-15', type: 'company', recruiters: 6 },
  { id: '9', name: 'Orange Egypt', plan: 'Enterprise Annual', amount: 'EGP 10,000/yr', status: 'Active', nextBilling: '2027-09-10', started: '2026-09-10', type: 'company', recruiters: 9 },
  { id: '10', name: 'Startup Egypt', plan: 'Starter Monthly', amount: 'EGP 300/mo', status: 'Active', nextBilling: '2026-06-29', started: '2026-05-29', type: 'company', recruiters: 2 },
  { id: '11', name: 'EgyptAir', plan: 'Pro Monthly', amount: 'EGP 1,000/mo', status: 'Cancelled', nextBilling: '—', started: '2025-11-01', type: 'company', recruiters: 4 },
]

const MOCK_AUDIT: AuditEntry[] = [
  { id: '1', timestamp: '2026-06-01 14:32:11', actor: 'Admin', action: 'company_approval', description: 'Approved company: Vodafone Egypt', ip: '197.48.x.x' },
  { id: '2', timestamp: '2026-06-01 13:15:04', actor: 'System', action: 'security_event', description: '5 failed login attempts for user: unknown@test.com', ip: '41.33.x.x' },
  { id: '3', timestamp: '2026-06-01 12:00:00', actor: 'Mariam Youssef', action: 'subscription_change', description: 'Upgraded from Free to Pro Monthly', ip: '156.210.x.x' },
  { id: '4', timestamp: '2026-06-01 11:45:22', actor: 'Admin', action: 'simulation_upload', description: 'Approved simulation: Financial Risk Assessment by Banque Misr', ip: '197.48.x.x' },
  { id: '5', timestamp: '2026-06-01 11:02:50', actor: 'Startup Egypt', action: 'simulation_upload', description: 'Submitted new simulation: HR Talent Acquisition Pipeline', ip: '197.53.x.x' },
  { id: '6', timestamp: '2026-06-01 10:30:01', actor: 'Admin', action: 'user_update', description: 'Suspended student: Ahmed Farouk (spam activity)', ip: '197.48.x.x' },
  { id: '7', timestamp: '2026-06-01 09:58:33', actor: 'Nour El-Din Hassan', action: 'login', description: 'Successful login from new device', ip: '102.47.x.x' },
  { id: '8', timestamp: '2026-05-31 23:10:45', actor: 'System', action: 'admin_action', description: 'Daily metrics snapshot taken', ip: 'internal' },
  { id: '9', timestamp: '2026-05-31 20:05:12', actor: 'Dina Raouf', action: 'login', description: 'Standard login', ip: '41.34.x.x' },
  { id: '10', timestamp: '2026-05-31 18:22:07', actor: 'Admin', action: 'company_approval', description: 'Rejected simulation: Product Launch Roadmap by Orange Egypt', ip: '197.48.x.x' },
  { id: '11', timestamp: '2026-05-31 16:45:00', actor: 'Hana Ibrahim', action: 'subscription_change', description: 'Renewed Pro Monthly subscription', ip: '156.215.x.x' },
  { id: '12', timestamp: '2026-05-31 14:30:18', actor: 'System', action: 'security_event', description: 'Rate limit triggered for IP: 41.33.x.x', ip: '41.33.x.x' },
  { id: '13', timestamp: '2026-05-30 09:00:00', actor: 'TechVentures Co', action: 'login', description: 'Company account created and first login', ip: '196.219.x.x' },
  { id: '14', timestamp: '2026-05-29 15:12:33', actor: 'Admin', action: 'admin_action', description: 'Updated platform fee configuration', ip: '197.48.x.x' },
  { id: '15', timestamp: '2026-05-28 11:00:00', actor: 'Vodafone Egypt', action: 'simulation_upload', description: 'Submitted simulation: Customer Experience Strategy', ip: '196.158.x.x' },
]

const MOCK_TICKETS: Ticket[] = [
  { id: '#001', subject: 'Cannot access simulation results', fromName: 'Nour El-Din Hassan', fromEmail: 'nour@aucegypt.edu', category: 'Bug', priority: 'High', status: 'Open', created: '2026-06-01 08:30', message: 'Hi, I completed the Vodafone simulation 2 days ago but I still cannot see my results or score. The page shows a loading spinner indefinitely. Please fix this urgently as I need to share my score with companies.' },
  { id: '#002', subject: 'Billing question about Pro plan', fromName: 'Salma Mahmoud', fromEmail: 'salma@cairo.edu', category: 'Billing', priority: 'Medium', status: 'In Progress', created: '2026-05-31 14:22', message: 'I was charged twice for my Pro subscription this month. Please refund the duplicate charge. Transaction IDs: TXN-4421 and TXN-4422.' },
  { id: '#003', subject: 'How to update university info?', fromName: 'Youssef Tamer', fromEmail: 'youssef@must.edu', category: 'Question', priority: 'Low', status: 'Open', created: '2026-05-31 09:15', message: 'I transferred from MUST to Cairo University but cannot find where to update my university in the profile settings. Can you help?' },
  { id: '#004', subject: 'Account locked after password reset', fromName: 'Ahmed Farouk', fromEmail: 'ahmed.f@alexu.edu', category: 'Account', priority: 'High', status: 'Open', created: '2026-05-30 16:00', message: 'I reset my password but now I cannot log in at all. I tried 5 times and it says my account is locked. I need access urgently.' },
  { id: '#005', subject: 'Company dashboard missing features', fromName: 'Startup Egypt HR', fromEmail: 'hr@startupegypt.com', category: 'Bug', priority: 'Medium', status: 'Resolved', created: '2026-05-28 10:30', message: 'The analytics charts in the company dashboard are not loading. We see blank panels where the charts should be.' },
]

const MOCK_ACTIVITY = [
  { time: '2 min ago', type: 'student', desc: 'New student registered: Layla Adel from Cairo University' },
  { time: '8 min ago', type: 'application', desc: 'Ahmed Sami applied to Vodafone Egypt – Data Analyst internship' },
  { time: '15 min ago', type: 'payment', desc: 'Pro subscription activated: Reem Hassan' },
  { time: '23 min ago', type: 'simulation', desc: 'Simulation submitted for review: HR Pipeline by Startup Egypt' },
  { time: '31 min ago', type: 'company', desc: 'New company registered: TechVentures Co' },
  { time: '45 min ago', type: 'security', desc: 'Failed login attempts threshold reached for unknown@test.com' },
  { time: '1 hr ago', type: 'application', desc: 'Mariam Youssef accepted for interview at Orange Egypt' },
  { time: '1.5 hrs ago', type: 'student', desc: 'New student registered: Kareem Mostafa from GUC' },
  { time: '2 hrs ago', type: 'payment', desc: 'Company plan renewed: Banque Misr – Pro Monthly' },
  { time: '3 hrs ago', type: 'application', desc: 'Dina Raouf completed simulation: Financial Risk Assessment' },
]

// ─── Helper Components ─────────────────────────────────────────────────────────

function Badge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Active: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
    Approved: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
    Resolved: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
    Pending: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
    'Pending Approval': 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
    'Pending Review': 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
    'In Progress': 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
    Suspended: 'bg-orange-500/15 text-orange-400 border border-orange-500/20',
    Banned: 'bg-red-500/15 text-red-400 border border-red-500/20',
    Rejected: 'bg-red-500/15 text-red-400 border border-red-500/20',
    Cancelled: 'bg-neutral-500/15 text-neutral-400 border border-neutral-500/20',
    Open: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
    Pro: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20',
    Enterprise: 'bg-purple-500/15 text-purple-400 border border-purple-500/20',
    Starter: 'bg-neutral-500/15 text-neutral-400 border border-neutral-500/20',
    Free: 'bg-neutral-500/15 text-neutral-400 border border-neutral-500/20',
    High: 'bg-red-500/15 text-red-400 border border-red-500/20',
    Medium: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
    Low: 'bg-neutral-500/15 text-neutral-400 border border-neutral-500/20',
  }
  const cls = map[status] ?? 'bg-neutral-500/15 text-neutral-400'
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${cls}`}>{status}</span>
}

function AuditBadge({ action }: { action: AuditEntry['action'] }) {
  const map: Record<string, { cls: string; label: string }> = {
    login: { cls: 'bg-blue-500/15 text-blue-400', label: 'Login' },
    user_update: { cls: 'bg-indigo-500/15 text-indigo-400', label: 'User Update' },
    subscription_change: { cls: 'bg-emerald-500/15 text-emerald-400', label: 'Subscription' },
    company_approval: { cls: 'bg-amber-500/15 text-amber-400', label: 'Company' },
    simulation_upload: { cls: 'bg-purple-500/15 text-purple-400', label: 'Simulation' },
    admin_action: { cls: 'bg-neutral-500/15 text-neutral-300', label: 'Admin' },
    security_event: { cls: 'bg-red-500/15 text-red-400', label: 'Security' },
  }
  const { cls, label } = map[action] ?? { cls: '', label: action }
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border border-white/10 ${cls}`}>{label}</span>
}

function ScoreBadge({ score }: { score: number }) {
  const cls = score >= 85 ? 'text-emerald-400 bg-emerald-500/10' : score >= 70 ? 'text-amber-400 bg-amber-500/10' : 'text-red-400 bg-red-500/10'
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${cls}`}>{score}</span>
}

function MetricCard({ label, value, sub, icon: Icon, trend }: { label: string; value: string | number; sub?: string; icon?: React.ElementType; trend?: 'up' | 'down' | 'neutral' }) {
  return (
    <div className="bg-[#0D1526] rounded-xl border border-white/5 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-neutral-500 text-xs mb-1">{label}</p>
          <p className="text-white text-2xl font-bold">{value}</p>
          {sub && <p className="text-neutral-500 text-xs mt-1">{sub}</p>}
        </div>
        {Icon && <div className="bg-indigo-500/10 p-2 rounded-lg"><Icon size={18} className="text-indigo-400" /></div>}
      </div>
      {trend && (
        <div className={`mt-2 flex items-center gap-1 text-xs ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-neutral-500'}`}>
          {trend === 'up' ? <TrendingUp size={12} /> : trend === 'down' ? <TrendingDown size={12} /> : null}
          <span>{trend === 'up' ? '+12% this week' : trend === 'down' ? '-3% this week' : 'No change'}</span>
        </div>
      )}
    </div>
  )
}

// ─── Login Screen ─────────────────────────────────────────────────────────────

function LoginScreen({ onAuth }: { onAuth: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    await new Promise(r => setTimeout(r, 600))
    const adminPwd = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? 'sho8admin2026'
    if (password === adminPwd) {
      sessionStorage.setItem('sho8_admin_authed', 'true')
      onAuth()
    } else {
      setError('Incorrect password. Access denied.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#060D1F] flex items-center justify-center">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="bg-[#0D1526] rounded-2xl border border-white/10 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield size={28} className="text-white" />
            </div>
            <h1 className="text-white text-2xl font-bold">Sho8lana</h1>
            <p className="text-indigo-400 text-sm mt-1 font-medium">Super Admin Portal</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-neutral-400 text-xs mb-1.5 block">Admin Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="Enter admin password"
                  className="w-full bg-[#060D1F] border border-white/10 rounded-lg px-4 py-2.5 pl-9 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
                />
              </div>
            </div>
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                <AlertTriangle size={12} />
                {error}
              </motion.div>
            )}
            <button onClick={handleLogin} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-60">
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </div>
          <p className="text-neutral-600 text-xs text-center mt-6">Restricted access. Authorized personnel only.</p>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Notification Panel ───────────────────────────────────────────────────────

function NotificationPanel({ notifications, onClose, onMarkAllRead }: { notifications: Notification[]; onClose: () => void; onMarkAllRead: () => void }) {
  const icons: Record<string, string> = { student: '👤', company: '🏢', simulation: '🎯', application: '📋', payment: '💳', security: '🔒' }
  return (
    <motion.div
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ type: 'spring', damping: 25 }}
      className="fixed top-0 right-0 h-full w-80 bg-[#0D1526] border-l border-white/10 z-50 shadow-2xl flex flex-col"
    >
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h3 className="text-white font-semibold text-sm">Notifications</h3>
        <div className="flex items-center gap-2">
          <button onClick={onMarkAllRead} className="text-indigo-400 text-xs hover:text-indigo-300">Mark all read</button>
          <button onClick={onClose} className="text-neutral-500 hover:text-white"><X size={16} /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-neutral-600 text-sm">No notifications</div>
        ) : (
          notifications.map(n => (
            <div key={n.id} className={`flex gap-3 p-4 border-b border-white/[0.04] hover:bg-white/[0.02] ${!n.read ? 'bg-indigo-500/[0.03]' : ''}`}>
              <span className="text-lg flex-shrink-0">{icons[n.type]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-neutral-300 text-xs leading-relaxed">{n.message}</p>
                <p className="text-neutral-600 text-xs mt-1">{n.timestamp.toLocaleTimeString()}</p>
              </div>
              {!n.read && <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1 flex-shrink-0" />}
            </div>
          ))
        )}
      </div>
    </motion.div>
  )
}

// ─── Student Detail Modal ─────────────────────────────────────────────────────

function StudentModal({ student, onClose }: { student: Student; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#0D1526] rounded-2xl border border-white/10 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h3 className="text-white font-semibold">Student Profile</h3>
          <button onClick={onClose} className="text-neutral-500 hover:text-white"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center text-indigo-400 font-bold text-lg">
              {student.name.charAt(0)}
            </div>
            <div>
              <p className="text-white font-semibold">{student.name}</p>
              <p className="text-neutral-500 text-sm">{student.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#060D1F] rounded-lg p-3">
              <p className="text-neutral-500 text-xs">University</p>
              <p className="text-white text-sm mt-0.5">{student.university}</p>
            </div>
            <div className="bg-[#060D1F] rounded-lg p-3">
              <p className="text-neutral-500 text-xs">Major</p>
              <p className="text-white text-sm mt-0.5">{student.major}</p>
            </div>
            <div className="bg-[#060D1F] rounded-lg p-3">
              <p className="text-neutral-500 text-xs">Applications</p>
              <p className="text-white text-sm font-semibold mt-0.5">{student.applicationsCount}</p>
            </div>
            <div className="bg-[#060D1F] rounded-lg p-3">
              <p className="text-neutral-500 text-xs">Sims Completed</p>
              <p className="text-white text-sm font-semibold mt-0.5">{student.simCompletions}</p>
            </div>
            <div className="bg-[#060D1F] rounded-lg p-3">
              <p className="text-neutral-500 text-xs">Last Login</p>
              <p className="text-white text-sm mt-0.5">{student.lastLogin}</p>
            </div>
            <div className="bg-[#060D1F] rounded-lg p-3">
              <p className="text-neutral-500 text-xs">Subscription</p>
              <Badge status={student.subscription} />
            </div>
          </div>
          <div>
            <p className="text-neutral-500 text-xs mb-2">KPI Breakdown</p>
            <div className="space-y-2">
              {Object.entries(student.kpis).map(([key, val]) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-neutral-400 text-xs capitalize w-24">{key}</span>
                  <div className="flex-1 bg-white/5 rounded-full h-1.5">
                    <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${val}%` }} />
                  </div>
                  <span className="text-white text-xs w-6 text-right">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Simulation Approval Modal ─────────────────────────────────────────────────

function SimApprovalModal({ sim, onClose, onApprove, onReject }: { sim: Simulation; onClose: () => void; onApprove: () => void; onReject: (reason: string) => void }) {
  const [reason, setReason] = useState('')
  const [mode, setMode] = useState<'view' | 'reject'>('view')
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#0D1526] rounded-2xl border border-white/10 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h3 className="text-white font-semibold">Review Simulation</h3>
          <button onClick={onClose} className="text-neutral-500 hover:text-white"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <p className="text-white font-semibold">{sim.title}</p>
            <p className="text-neutral-500 text-sm">{sim.company} · {sim.category}</p>
          </div>
          <div className="bg-[#060D1F] rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Duration</span>
              <span className="text-white">{sim.duration}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Submitted</span>
              <span className="text-white">{sim.submitted}</span>
            </div>
          </div>
          <div>
            <p className="text-neutral-500 text-xs mb-1">Description</p>
            <p className="text-neutral-300 text-sm leading-relaxed">{sim.description}</p>
          </div>
          {mode === 'reject' && (
            <div>
              <p className="text-neutral-500 text-xs mb-1">Rejection Reason</p>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Explain why this simulation is being rejected..."
                rows={3}
                className="w-full bg-[#060D1F] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500/50 resize-none"
              />
            </div>
          )}
          <div className="flex gap-2 pt-1">
            {mode === 'view' ? (
              <>
                <button onClick={onApprove} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg py-2 text-sm font-medium transition-colors">Approve</button>
                <button onClick={() => setMode('reject')} className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/20 rounded-lg py-2 text-sm font-medium transition-colors">Reject</button>
              </>
            ) : (
              <>
                <button onClick={() => onReject(reason)} disabled={!reason.trim()} className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded-lg py-2 text-sm font-medium transition-colors disabled:opacity-50">Confirm Reject</button>
                <button onClick={() => setMode('view')} className="flex-1 bg-white/5 hover:bg-white/10 text-white rounded-lg py-2 text-sm font-medium transition-colors">Cancel</button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Views ────────────────────────────────────────────────────────────────────

function OverviewView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white text-xl font-bold mb-1">Platform Overview</h2>
        <p className="text-neutral-500 text-sm">Real-time metrics across the Sho8lana platform</p>
      </div>

      <div>
        <p className="text-neutral-500 text-xs uppercase tracking-wider mb-3">Students</p>
        <div className="grid grid-cols-3 gap-4">
          <MetricCard label="Total Students" value="52,847" trend="up" />
          <MetricCard label="Active Today" value="1,203" sub="2.3% of total" />
          <MetricCard label="New This Week" value="847" trend="up" />
        </div>
      </div>

      <div>
        <p className="text-neutral-500 text-xs uppercase tracking-wider mb-3">Companies</p>
        <div className="grid grid-cols-3 gap-4">
          <MetricCard label="Total Companies" value="234" trend="up" />
          <MetricCard label="Active Companies" value="89" sub="38% of total" />
          <MetricCard label="Recruiters Online" value="23" />
        </div>
      </div>

      <div>
        <p className="text-neutral-500 text-xs uppercase tracking-wider mb-3">Applications</p>
        <div className="grid grid-cols-3 gap-4">
          <MetricCard label="Total Applications" value="18,429" trend="up" />
          <MetricCard label="Interviews Scheduled" value="342" />
          <MetricCard label="Hired" value="1,847" trend="up" />
        </div>
      </div>

      <div>
        <p className="text-neutral-500 text-xs uppercase tracking-wider mb-3">Simulations</p>
        <div className="grid grid-cols-3 gap-4">
          <MetricCard label="Total Simulations" value="12" />
          <MetricCard label="Completion Rate" value="73%" trend="up" />
          <MetricCard label="Avg Talent Score" value="71" />
        </div>
      </div>

      <div>
        <p className="text-neutral-500 text-xs uppercase tracking-wider mb-3">Revenue</p>
        <div className="grid grid-cols-3 gap-4">
          <MetricCard label="MRR" value="EGP 48,300" trend="up" />
          <MetricCard label="ARR" value="EGP 579,600" />
          <MetricCard label="Active Subscriptions" value="161" trend="up" />
        </div>
      </div>

      <div className="bg-[#0D1526] rounded-xl border border-white/5 p-5">
        <h3 className="text-white font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {MOCK_ACTIVITY.map((item, i) => {
            const clsMap: Record<string, string> = { student: 'bg-indigo-500/10 text-indigo-400', application: 'bg-blue-500/10 text-blue-400', payment: 'bg-emerald-500/10 text-emerald-400', simulation: 'bg-purple-500/10 text-purple-400', company: 'bg-amber-500/10 text-amber-400', security: 'bg-red-500/10 text-red-400' }
            const emojiMap: Record<string, string> = { student: '👤', application: '📋', payment: '💳', simulation: '🎯', company: '🏢', security: '🔒' }
            return (
              <div key={i} className="flex items-start gap-3">
                <span className={`text-sm px-1.5 py-0.5 rounded ${clsMap[item.type]}`}>{emojiMap[item.type]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-neutral-300 text-sm">{item.desc}</p>
                </div>
                <span className="text-neutral-600 text-xs flex-shrink-0">{item.time}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StudentsView() {
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [subFilter, setSubFilter] = useState('All')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()) || s.university.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All' || s.status === statusFilter
    const matchSub = subFilter === 'All' || s.subscription === subFilter
    return matchSearch && matchStatus && matchSub
  })

  const updateStatus = (id: string, status: Student['status']) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s))
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-xl font-bold mb-1">Students</h2>
          <p className="text-neutral-500 text-sm">{students.length} registered students</p>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..." className="w-full bg-[#0D1526] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500/50" />
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-[#0D1526] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none appearance-none pr-8 cursor-pointer">
            {['All', 'Active', 'Suspended', 'Banned'].map(v => <option key={v}>{v}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
        </div>
        <div className="relative">
          <select value={subFilter} onChange={e => setSubFilter(e.target.value)} className="bg-[#0D1526] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none appearance-none pr-8 cursor-pointer">
            {['All', 'Free', 'Pro'].map(v => <option key={v}>{v}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
        </div>
      </div>

      <div className="bg-[#0D1526] rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.04]">
              {['Name', 'University', 'Score', 'Plan', 'Status', 'Joined', 'Actions'].map(h => (
                <th key={h} className="text-left text-neutral-500 text-xs font-medium px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <p className="text-white text-sm font-medium">{s.name}</p>
                    <p className="text-neutral-500 text-xs">{s.email}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-neutral-300 text-sm">{s.university}</p>
                    <p className="text-neutral-600 text-xs">{s.major}</p>
                  </div>
                </td>
                <td className="px-4 py-3"><ScoreBadge score={s.talentScore} /></td>
                <td className="px-4 py-3"><Badge status={s.subscription} /></td>
                <td className="px-4 py-3"><Badge status={s.status} /></td>
                <td className="px-4 py-3 text-neutral-500 text-xs">{s.joined}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button title="View Profile" onClick={() => setSelectedStudent(s)} className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"><Eye size={14} /></button>
                    <button title="Verify" onClick={() => updateStatus(s.id, 'Active')} className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-neutral-400 hover:text-emerald-400 transition-colors"><CheckCircle size={14} /></button>
                    <button title="Suspend" onClick={() => updateStatus(s.id, 'Suspended')} className="p-1.5 rounded-lg hover:bg-amber-500/10 text-neutral-400 hover:text-amber-400 transition-colors"><PauseCircle size={14} /></button>
                    <button title="Ban" onClick={() => updateStatus(s.id, 'Banned')} className="p-1.5 rounded-lg hover:bg-red-500/10 text-neutral-400 hover:text-red-400 transition-colors"><Ban size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-10 text-neutral-600">No students match your filters</div>
        )}
      </div>

      <AnimatePresence>
        {selectedStudent && <StudentModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />}
      </AnimatePresence>
    </div>
  )
}

function CompaniesView() {
  const [companies, setCompanies] = useState<Company[]>(MOCK_COMPANIES)
  const pending = companies.filter(c => c.status === 'Pending Approval')

  const updateStatus = (id: string, status: Company['status']) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, status } : c))
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-white text-xl font-bold mb-1">Companies</h2>
        <p className="text-neutral-500 text-sm">{companies.length} registered companies</p>
      </div>

      {pending.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle size={16} className="text-amber-400 flex-shrink-0" />
          <p className="text-amber-300 text-sm"><span className="font-semibold">{pending.length} companies</span> are awaiting approval: {pending.map(c => c.name).join(', ')}</p>
        </motion.div>
      )}

      <div className="bg-[#0D1526] rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.04]">
              {['Company', 'Industry', 'Plan', 'Status', 'Recruiters', 'Simulations', 'Joined', 'Actions'].map(h => (
                <th key={h} className="text-left text-neutral-500 text-xs font-medium px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {companies.map(c => (
              <tr key={c.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400 text-xs font-bold">{c.name.charAt(0)}</div>
                    <span className="text-white text-sm font-medium">{c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-neutral-400 text-sm">{c.industry}</td>
                <td className="px-4 py-3"><Badge status={c.plan} /></td>
                <td className="px-4 py-3"><Badge status={c.status} /></td>
                <td className="px-4 py-3 text-neutral-400 text-sm">{c.recruiters}</td>
                <td className="px-4 py-3 text-neutral-400 text-sm">{c.simulations}</td>
                <td className="px-4 py-3 text-neutral-500 text-xs">{c.joined}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {c.status === 'Pending Approval' && (
                      <>
                        <button title="Approve" onClick={() => updateStatus(c.id, 'Active')} className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-neutral-400 hover:text-emerald-400 transition-colors"><CheckCircle size={14} /></button>
                        <button title="Reject" onClick={() => updateStatus(c.id, 'Suspended')} className="p-1.5 rounded-lg hover:bg-red-500/10 text-neutral-400 hover:text-red-400 transition-colors"><XCircle size={14} /></button>
                      </>
                    )}
                    {c.status === 'Active' && (
                      <button title="Suspend" onClick={() => updateStatus(c.id, 'Suspended')} className="p-1.5 rounded-lg hover:bg-amber-500/10 text-neutral-400 hover:text-amber-400 transition-colors"><PauseCircle size={14} /></button>
                    )}
                    {c.status === 'Suspended' && (
                      <button title="Reactivate" onClick={() => updateStatus(c.id, 'Active')} className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-neutral-400 hover:text-emerald-400 transition-colors"><CheckCircle size={14} /></button>
                    )}
                    <button title="View Dashboard" className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"><ExternalLink size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SimulationsView() {
  const [sims, setSims] = useState<Simulation[]>(MOCK_SIMULATIONS)
  const [selectedSim, setSelectedSim] = useState<Simulation | null>(null)

  const approve = (id: string) => {
    setSims(prev => prev.map(s => s.id === id ? { ...s, status: 'Approved' as const } : s))
    setSelectedSim(null)
  }

  const reject = (id: string, reason: string) => {
    setSims(prev => prev.map(s => s.id === id ? { ...s, status: 'Rejected' as const, rejectionReason: reason } : s))
    setSelectedSim(null)
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-white text-xl font-bold mb-1">Simulations</h2>
        <p className="text-neutral-500 text-sm">Simulation approval queue and management</p>
      </div>

      <div className="bg-[#0D1526] rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.04]">
              {['Title', 'Company', 'Category', 'Submitted', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left text-neutral-500 text-xs font-medium px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sims.map(sim => (
              <tr key={sim.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3">
                  <p className="text-white text-sm font-medium">{sim.title}</p>
                  <p className="text-neutral-600 text-xs mt-0.5">{sim.duration}</p>
                </td>
                <td className="px-4 py-3 text-neutral-400 text-sm">{sim.company}</td>
                <td className="px-4 py-3 text-neutral-400 text-sm">{sim.category}</td>
                <td className="px-4 py-3 text-neutral-500 text-xs">{sim.submitted}</td>
                <td className="px-4 py-3"><Badge status={sim.status} /></td>
                <td className="px-4 py-3">
                  {sim.status === 'Pending Review' && (
                    <div className="flex gap-1">
                      <button onClick={() => setSelectedSim(sim)} className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/20 rounded-lg text-xs font-medium transition-colors">Preview & Review</button>
                    </div>
                  )}
                  {sim.status === 'Approved' && <span className="text-emerald-400 text-xs">Published</span>}
                  {sim.status === 'Rejected' && (
                    <div title={sim.rejectionReason} className="text-red-400 text-xs cursor-help">
                      Rejected {sim.rejectionReason && '(hover for reason)'}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {selectedSim && (
          <SimApprovalModal
            sim={selectedSim}
            onClose={() => setSelectedSim(null)}
            onApprove={() => approve(selectedSim.id)}
            onReject={(reason) => reject(selectedSim.id, reason)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function PaymentsView() {
  const [tab, setTab] = useState<'student' | 'company'>('student')
  const studentPayments = MOCK_PAYMENTS.filter(p => p.type === 'student')
  const companyPayments = MOCK_PAYMENTS.filter(p => p.type === 'company')
  const activeStudent = studentPayments.filter(p => p.status === 'Active').length
  const activeCompany = companyPayments.filter(p => p.status === 'Active').length

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-white text-xl font-bold mb-1">Payments</h2>
        <p className="text-neutral-500 text-sm">Subscription management and revenue</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <MetricCard label="MRR" value="EGP 48,300" trend="up" />
        <MetricCard label="Total Revenue (All Time)" value="EGP 289,400" />
        <MetricCard label="Active Paid Subscriptions" value={activeStudent + activeCompany} />
        <div className="bg-[#0D1526] rounded-xl border border-red-500/20 p-4">
          <p className="text-neutral-500 text-xs mb-1">Failed Payments</p>
          <p className="text-red-400 text-2xl font-bold">3</p>
          <p className="text-red-500 text-xs mt-1">Requires attention</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab('student')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'student' ? 'bg-indigo-600 text-white' : 'bg-[#0D1526] text-neutral-400 hover:text-white border border-white/10'}`}>Student Plans</button>
        <button onClick={() => setTab('company')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'company' ? 'bg-indigo-600 text-white' : 'bg-[#0D1526] text-neutral-400 hover:text-white border border-white/10'}`}>Company Plans</button>
      </div>

      <div className="bg-[#0D1526] rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.04]">
              {tab === 'student'
                ? ['Name', 'Plan', 'Amount', 'Status', 'Next Billing', 'Started'].map(h => <th key={h} className="text-left text-neutral-500 text-xs font-medium px-4 py-3">{h}</th>)
                : ['Company', 'Plan', 'Amount', 'Status', 'Recruiters', 'Next Billing'].map(h => <th key={h} className="text-left text-neutral-500 text-xs font-medium px-4 py-3">{h}</th>)
              }
            </tr>
          </thead>
          <tbody>
            {(tab === 'student' ? studentPayments : companyPayments).map(p => (
              <tr key={p.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 text-white text-sm font-medium">{p.name}</td>
                <td className="px-4 py-3 text-neutral-400 text-sm">{p.plan}</td>
                <td className="px-4 py-3 text-neutral-300 text-sm">{p.amount}</td>
                <td className="px-4 py-3"><Badge status={p.status} /></td>
                {tab === 'student' ? (
                  <>
                    <td className="px-4 py-3 text-neutral-500 text-xs">{p.nextBilling}</td>
                    <td className="px-4 py-3 text-neutral-500 text-xs">{p.started}</td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 text-neutral-400 text-sm">{p.recruiters}</td>
                    <td className="px-4 py-3 text-neutral-500 text-xs">{p.nextBilling}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AuditLogView() {
  const [entries, setEntries] = useState<AuditEntry[]>(MOCK_AUDIT)
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [refreshing, setRefreshing] = useState(false)

  const refresh = useCallback(async () => {
    setRefreshing(true)
    try {
      const { data } = await supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(50)
      if (data && data.length > 0) setEntries(data as AuditEntry[])
    } catch {
      // fallback to mock
    }
    setRefreshing(false)
  }, [])

  useEffect(() => {
    const interval = setInterval(refresh, 30000)
    return () => clearInterval(interval)
  }, [refresh])

  const filtered = entries.filter(e => {
    const matchSearch = e.actor.toLowerCase().includes(search.toLowerCase()) || e.description.toLowerCase().includes(search.toLowerCase()) || e.ip.includes(search)
    const matchType = typeFilter === 'All' || e.action === typeFilter
    return matchSearch && matchType
  })

  const actionTypes = ['All', 'login', 'user_update', 'subscription_change', 'company_approval', 'simulation_upload', 'admin_action', 'security_event']

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-xl font-bold mb-1">Audit Log</h2>
          <p className="text-neutral-500 text-sm">All admin and system actions — auto-refreshes every 30s</p>
        </div>
        <button onClick={refresh} className={`flex items-center gap-2 px-3 py-2 bg-[#0D1526] border border-white/10 rounded-lg text-neutral-400 hover:text-white text-sm transition-colors ${refreshing ? 'animate-pulse' : ''}`}>
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..." className="w-full bg-[#0D1526] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500/50" />
        </div>
        <div className="relative">
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="bg-[#0D1526] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none appearance-none pr-8 cursor-pointer">
            {actionTypes.map(v => <option key={v}>{v}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
        </div>
      </div>

      <div className="bg-[#0D1526] rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.04]">
              {['Timestamp', 'Actor', 'Action', 'Description', 'IP'].map(h => (
                <th key={h} className="text-left text-neutral-500 text-xs font-medium px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => (
              <tr key={e.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 text-neutral-500 text-xs font-mono whitespace-nowrap">{e.timestamp}</td>
                <td className="px-4 py-3 text-neutral-300 text-sm">{e.actor}</td>
                <td className="px-4 py-3"><AuditBadge action={e.action} /></td>
                <td className="px-4 py-3 text-neutral-400 text-sm max-w-xs">{e.description}</td>
                <td className="px-4 py-3 text-neutral-600 text-xs font-mono">{e.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-10 text-neutral-600">No log entries match your filters</div>
        )}
      </div>
    </div>
  )
}

function SupportView() {
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [reply, setReply] = useState('')

  const open = tickets.filter(t => t.status === 'Open').length
  const inProgress = tickets.filter(t => t.status === 'In Progress').length

  const updateTicket = (id: string, changes: Partial<Ticket>) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, ...changes } : t))
    if (selectedTicket?.id === id) setSelectedTicket(prev => prev ? { ...prev, ...changes } : null)
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-white text-xl font-bold mb-1">Support</h2>
        <p className="text-neutral-500 text-sm">Ticket management and customer support</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <MetricCard label="Open Tickets" value={open} />
        <MetricCard label="In Progress" value={inProgress} />
        <MetricCard label="Resolved This Month" value="12" />
        <MetricCard label="Avg Response Time" value="2.4 hrs" />
      </div>

      <div className="flex gap-4">
        <div className="flex-1 bg-[#0D1526] rounded-xl border border-white/5 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.04]">
                {['ID', 'Subject', 'From', 'Category', 'Priority', 'Status', 'Created'].map(h => (
                  <th key={h} className="text-left text-neutral-500 text-xs font-medium px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tickets.map(t => (
                <tr key={t.id} onClick={() => setSelectedTicket(t)} className={`border-b border-white/[0.04] hover:bg-white/[0.02] cursor-pointer transition-colors ${selectedTicket?.id === t.id ? 'bg-indigo-500/[0.05]' : ''}`}>
                  <td className="px-4 py-3 text-neutral-500 text-xs font-mono">{t.id}</td>
                  <td className="px-4 py-3 text-white text-sm max-w-[180px] truncate">{t.subject}</td>
                  <td className="px-4 py-3">
                    <p className="text-neutral-300 text-sm">{t.fromName}</p>
                    <p className="text-neutral-600 text-xs">{t.fromEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-neutral-400 text-sm">{t.category}</td>
                  <td className="px-4 py-3"><Badge status={t.priority} /></td>
                  <td className="px-4 py-3"><Badge status={t.status} /></td>
                  <td className="px-4 py-3 text-neutral-600 text-xs">{t.created}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <AnimatePresence>
          {selectedTicket && (
            <motion.div initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 40, opacity: 0 }} className="w-80 bg-[#0D1526] rounded-xl border border-white/5 flex flex-col flex-shrink-0">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <span className="text-neutral-500 text-xs font-mono">{selectedTicket.id}</span>
                <button onClick={() => setSelectedTicket(null)} className="text-neutral-500 hover:text-white"><X size={14} /></button>
              </div>
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                <div>
                  <p className="text-white font-semibold text-sm">{selectedTicket.subject}</p>
                  <p className="text-neutral-500 text-xs mt-0.5">{selectedTicket.fromName} · {selectedTicket.fromEmail}</p>
                </div>
                <div className="flex gap-2">
                  <Badge status={selectedTicket.category} />
                  <Badge status={selectedTicket.priority} />
                  <Badge status={selectedTicket.status} />
                </div>
                <div className="bg-[#060D1F] rounded-lg p-3">
                  <p className="text-neutral-300 text-sm leading-relaxed">{selectedTicket.message}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-neutral-500 text-xs">Change Status</p>
                  <div className="relative">
                    <select
                      value={selectedTicket.status}
                      onChange={e => updateTicket(selectedTicket.id, { status: e.target.value as Ticket['status'] })}
                      className="w-full bg-[#060D1F] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none appearance-none pr-8 cursor-pointer"
                    >
                      {['Open', 'In Progress', 'Resolved'].map(v => <option key={v}>{v}</option>)}
                    </select>
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-white/10 space-y-2">
                <textarea
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  placeholder="Type your reply..."
                  rows={3}
                  className="w-full bg-[#060D1F] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500/50 resize-none"
                />
                <button
                  onClick={() => { setReply(''); updateTicket(selectedTicket.id, { status: 'In Progress' }) }}
                  disabled={!reply.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Send size={12} />
                  Send Reply
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function PlatformHealthView() {
  const [activeUsers, setActiveUsers] = useState(872)
  const [simRunning, setSimRunning] = useState(7)
  const [revenueToday, setRevenueToday] = useState(2400)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(847 + Math.floor(Math.random() * 76))
      setSimRunning(5 + Math.floor(Math.random() * 6))
      setRevenueToday(prev => prev + Math.floor(Math.random() * 150))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const apiUsage = [14200, 18500, 22100, 19800, 25400, 21300, 28900]
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const maxUsage = Math.max(...apiUsage)

  const services = [
    { name: 'API Gateway', status: 'Operational' },
    { name: 'Database', status: 'Operational' },
    { name: 'Auth Service', status: 'Operational' },
    { name: 'Email Service', status: 'Operational' },
    { name: 'Payments', status: 'Operational' },
    { name: 'AI Engine', status: 'Operational' },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-white text-xl font-bold mb-1">Platform Health</h2>
        <p className="text-neutral-500 text-sm">Live system status and performance metrics</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#0D1526] rounded-xl border border-white/5 p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <p className="text-neutral-500 text-xs">Active Users Now</p>
          </div>
          <p className="text-white text-4xl font-bold tabular-nums">{activeUsers.toLocaleString()}</p>
        </div>
        <div className="bg-[#0D1526] rounded-xl border border-white/5 p-5">
          <p className="text-neutral-500 text-xs mb-2">Simulations Running</p>
          <p className="text-white text-4xl font-bold tabular-nums">{simRunning}</p>
        </div>
        <div className="bg-[#0D1526] rounded-xl border border-white/5 p-5">
          <p className="text-neutral-500 text-xs mb-2">Revenue Today</p>
          <p className="text-emerald-400 text-4xl font-bold tabular-nums">EGP {revenueToday.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <MetricCard label="Companies Online" value="23" />
        <MetricCard label="Applications Today" value="134" trend="up" />
        <div className="bg-[#0D1526] rounded-xl border border-white/5 p-4">
          <p className="text-neutral-500 text-xs mb-1">Error Rate</p>
          <p className="text-emerald-400 text-2xl font-bold">0.02%</p>
          <p className="text-neutral-600 text-xs mt-1">All systems nominal</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#0D1526] rounded-xl border border-white/5 p-5">
          <h3 className="text-white font-semibold text-sm mb-4">System Status</h3>
          <div className="space-y-3">
            {services.map(s => (
              <div key={s.name} className="flex items-center justify-between">
                <span className="text-neutral-400 text-sm">{s.name}</span>
                <div className="flex items-center gap-2">
                  <Circle size={8} className="fill-emerald-500 text-emerald-500" />
                  <span className="text-emerald-400 text-xs">{s.status}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-neutral-500 text-xs">Avg Response Time</span>
            <span className="text-emerald-400 text-sm font-semibold">187ms</span>
          </div>
        </div>

        <div className="bg-[#0D1526] rounded-xl border border-white/5 p-5">
          <h3 className="text-white font-semibold text-sm mb-4">API Usage – Last 7 Days</h3>
          <div className="flex items-end gap-2 h-32">
            {apiUsage.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-indigo-600/80 rounded-t-sm" style={{ height: `${(val / maxUsage) * 100}%` }} />
                <span className="text-neutral-600 text-xs">{days[i]}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-neutral-500 text-xs">Total API calls this week</span>
            <span className="text-white text-sm font-semibold">{apiUsage.reduce((a, b) => a + b, 0).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Admin Page ─────────────────────────────────────────────────────────

type NavItem = { id: string; label: string; icon: React.ElementType }

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'companies', label: 'Companies', icon: Building2 },
  { id: 'simulations', label: 'Simulations', icon: FlaskConical },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'audit', label: 'Audit Log', icon: ScrollText },
  { id: 'support', label: 'Support', icon: Headphones },
  { id: 'health', label: 'Platform Health', icon: Activity },
]

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'company', message: 'New company registered: TechVentures Co', timestamp: new Date(Date.now() - 2 * 60000), read: false },
  { id: '2', type: 'student', message: '👤 New student registered: Layla Adel from Cairo University', timestamp: new Date(Date.now() - 8 * 60000), read: false },
  { id: '3', type: 'payment', message: '💳 Subscription purchased: Mariam Youssef – Pro Monthly', timestamp: new Date(Date.now() - 15 * 60000), read: false },
  { id: '4', type: 'security', message: '🔒 Suspicious activity: 5+ failed logins for unknown@test.com', timestamp: new Date(Date.now() - 25 * 60000), read: true },
  { id: '5', type: 'simulation', message: '🎯 Simulation submitted: HR Talent Acquisition Pipeline by Startup Egypt', timestamp: new Date(Date.now() - 40 * 60000), read: true },
]

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [activeNav, setActiveNav] = useState('overview')
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS)
  const realtimeRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  // Auth check on mount
  useEffect(() => {
    const stored = sessionStorage.getItem('sho8_admin_authed')
    if (stored === 'true') {
      setAuthed(true)
    } else {
      // Also check Supabase session + admin email
      const checkSession = async () => {
        try {
          const { data } = await supabase.auth.getSession()
          const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
          if (data.session?.user?.email && adminEmail && data.session.user.email === adminEmail) {
            sessionStorage.setItem('sho8_admin_authed', 'true')
            setAuthed(true)
            return
          }
          // Check profile role
          if (data.session?.user?.id) {
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.session.user.id).single()
            if (profile?.role === 'super_admin') {
              sessionStorage.setItem('sho8_admin_authed', 'true')
              setAuthed(true)
              return
            }
          }
        } catch {
          // ignore
        }
        setAuthed(false)
      }
      checkSession()
    }
  }, [])

  // Supabase Realtime subscriptions
  useEffect(() => {
    if (!authed) return

    const addNotification = (type: Notification['type'], message: string) => {
      setNotifications(prev => {
        const n: Notification = { id: Date.now().toString(), type, message, timestamp: new Date(), read: false }
        return [n, ...prev].slice(0, 50)
      })
    }

    try {
      realtimeRef.current = supabase
        .channel('admin-realtime')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, payload => {
          addNotification('student', `👤 New student registered: ${(payload.new as Record<string, string>)?.name ?? 'Unknown'}`)
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'companies' }, payload => {
          addNotification('company', `🏢 New company registered: ${(payload.new as Record<string, string>)?.name ?? 'Unknown'}`)
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'applications' }, () => {
          addNotification('application', '📋 New internship application submitted')
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'simulations' }, payload => {
          addNotification('simulation', `🎯 Simulation submitted: ${(payload.new as Record<string, string>)?.title ?? 'Unknown'}`)
        })
        .subscribe()
    } catch {
      // Realtime not available — silently ignore
    }

    return () => {
      if (realtimeRef.current) {
        supabase.removeChannel(realtimeRef.current)
      }
    }
  }, [authed])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const handleSignOut = () => {
    sessionStorage.removeItem('sho8_admin_authed')
    setAuthed(false)
  }

  // Loading state
  if (authed === null) {
    return (
      <div className="min-h-screen bg-[#060D1F] flex items-center justify-center">
        <div className="text-neutral-500 text-sm animate-pulse">Checking access...</div>
      </div>
    )
  }

  // Login screen
  if (!authed) {
    return <LoginScreen onAuth={() => setAuthed(true)} />
  }

  const renderView = () => {
    switch (activeNav) {
      case 'overview': return <OverviewView />
      case 'students': return <StudentsView />
      case 'companies': return <CompaniesView />
      case 'simulations': return <SimulationsView />
      case 'payments': return <PaymentsView />
      case 'audit': return <AuditLogView />
      case 'support': return <SupportView />
      case 'health': return <PlatformHealthView />
      default: return <OverviewView />
    }
  }

  return (
    <div className="flex h-screen bg-[#060D1F] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-[#0A0F1E] border-r border-white/[0.06] flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">Sho8lana</p>
              <p className="text-indigo-400 text-[10px] mt-0.5">Super Admin</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            const active = activeNav === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${active ? 'bg-indigo-600/15 text-indigo-400' : 'text-neutral-500 hover:text-white hover:bg-white/[0.04]'}`}
              >
                <Icon size={16} />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Sign out */}
        <div className="px-3 py-4 border-t border-white/[0.06]">
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-500 hover:text-red-400 hover:bg-red-500/[0.06] transition-all">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex-shrink-0 h-14 bg-[#0A0F1E]/80 border-b border-white/[0.06] flex items-center justify-between px-6 backdrop-blur-sm">
          <h1 className="text-white font-semibold text-sm">Super Admin</h1>
          <div className="flex items-center gap-3">
            {/* Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(v => !v)}
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/[0.06] text-neutral-400 hover:text-white transition-colors relative"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-indigo-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Avatar */}
            <div className="w-8 h-8 bg-indigo-600/30 border border-indigo-500/30 rounded-full flex items-center justify-center text-indigo-300 text-xs font-bold select-none">
              SA
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            key={activeNav}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderView()}
          </motion.div>
        </main>
      </div>

      {/* Notification panel */}
      <AnimatePresence>
        {showNotifications && (
          <NotificationPanel
            notifications={notifications}
            onClose={() => setShowNotifications(false)}
            onMarkAllRead={markAllRead}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
