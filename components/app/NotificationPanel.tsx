'use client'

import { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Check, ChevronRight, Briefcase, Trophy, UserCircle, Sparkles } from 'lucide-react'
import { useApp } from '@/lib/store'
import { cn } from '@/lib/utils'
import type { AppNotification, NotificationType, Screen } from '@/lib/types'

const TYPE_CONFIG: Record<NotificationType, { icon: React.ReactNode; color: string; bg: string }> = {
  status_change:    { icon: <Briefcase className="w-4 h-4" />,   color: 'text-brand-600',   bg: 'bg-brand-50' },
  sim_complete:     { icon: <Trophy className="w-4 h-4" />,      color: 'text-amber-600',   bg: 'bg-amber-50' },
  profile_reminder: { icon: <UserCircle className="w-4 h-4" />,  color: 'text-purple-600',  bg: 'bg-purple-50' },
  new_match:        { icon: <Sparkles className="w-4 h-4" />,    color: 'text-emerald-600', bg: 'bg-emerald-50' },
  general:          { icon: <Bell className="w-4 h-4" />,        color: 'text-neutral-600', bg: 'bg-neutral-100' },
  new_application:  { icon: <Briefcase className="w-4 h-4" />,   color: 'text-brand-600',   bg: 'bg-brand-50' },
  new_job:          { icon: <Sparkles className="w-4 h-4" />,    color: 'text-teal-600',    bg: 'bg-teal-50' },
  welcome:          { icon: <Check className="w-4 h-4" />,       color: 'text-emerald-600', bg: 'bg-emerald-50' },
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  return `${Math.floor(hr / 24)}d ago`
}

interface Props {
  open: boolean
  onClose: () => void
}

export function NotificationPanel({ open, onClose }: Props) {
  const { state, dispatch } = useApp()
  const panelRef = useRef<HTMLDivElement>(null)
  const notifications = state.notifications
  const unreadCount = notifications.filter(n => !n.read).length

  function markRead(id: string) {
    dispatch({ type: 'MARK_NOTIFICATION_READ', id })
  }

  function dismiss(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    dispatch({ type: 'DISMISS_NOTIFICATION', id })
  }

  function handleNotificationClick(n: AppNotification) {
    markRead(n.id)
    if (n.actionScreen) {
      dispatch({ type: 'GO', screen: n.actionScreen as Screen })
    }
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } }}
            exit={{ opacity: 0, y: -8, scale: 0.97, transition: { duration: 0.15 } }}
            className="absolute top-2 right-2 z-50 w-[calc(100%-1rem)] max-w-sm bg-white rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden"
            style={{ maxHeight: 'calc(100dvh - 100px)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-neutral-700" />
                <span className="text-sm font-bold text-neutral-900">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-xs font-bold bg-brand-500 text-white rounded-full px-1.5 py-0.5 leading-none">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' })}
                    className="flex items-center gap-1 text-xs text-brand-600 font-semibold hover:text-brand-700 transition-colors"
                  >
                    <Check className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
                <button onClick={onClose} className="p-1 rounded-lg hover:bg-neutral-100 transition-colors">
                  <X className="w-4 h-4 text-neutral-500" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100dvh - 180px)' }}>
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center">
                    <Bell className="w-6 h-6 text-neutral-300" />
                  </div>
                  <p className="text-sm text-neutral-400 font-medium">No notifications yet</p>
                </div>
              ) : (
                <ul className="divide-y divide-neutral-50">
                  {notifications.map(n => {
                    const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.general
                    return (
                      <li key={n.id}>
                        <button
                          onClick={() => handleNotificationClick(n)}
                          className={cn(
                            'w-full text-left flex items-start gap-3 px-4 py-3 transition-colors hover:bg-neutral-50',
                            !n.read && 'bg-brand-50/40'
                          )}
                        >
                          {/* Icon */}
                          <div className={cn('flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mt-0.5', cfg.bg, cfg.color)}>
                            {cfg.icon}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={cn('text-sm font-semibold text-neutral-900 leading-snug', !n.read && 'text-brand-700')}>
                                {n.title}
                              </p>
                              {!n.read && (
                                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-brand-500 mt-1.5" />
                              )}
                            </div>
                            <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed line-clamp-2">{n.body}</p>
                            <p className="text-2xs text-neutral-400 mt-1">{timeAgo(n.createdAt)}</p>
                          </div>

                          {/* Nav arrow */}
                          {n.actionScreen && (
                            <ChevronRight className="flex-shrink-0 w-4 h-4 text-neutral-300 mt-2" />
                          )}
                        </button>

                        {/* Dismiss button */}
                        <div className="flex justify-end px-4 pb-1 -mt-1">
                          <button
                            onClick={e => dismiss(e, n.id)}
                            className="text-2xs text-neutral-300 hover:text-red-400 transition-colors font-medium"
                          >
                            Dismiss
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-neutral-100 px-4 py-2.5 flex justify-center">
                <button
                  onClick={() => {
                    notifications.forEach(n => dispatch({ type: 'DISMISS_NOTIFICATION', id: n.id }))
                  }}
                  className="text-xs text-neutral-400 hover:text-red-500 font-medium transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

interface BellButtonProps {
  onClick: () => void
  unreadCount: number
}

export function NotificationBell({ onClick, unreadCount }: BellButtonProps) {
  return (
    <button
      onClick={onClick}
      className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-neutral-200 shadow-sm hover:bg-neutral-50 transition-colors"
      aria-label="Notifications"
    >
      <Bell className="w-[18px] h-[18px] text-neutral-600" />
      {unreadCount > 0 && (
        <motion.span
          key={unreadCount}
          initial={{ scale: 0.5 }} animate={{ scale: 1 }}
          className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center px-1 leading-none shadow"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </motion.span>
      )}
    </button>
  )
}
