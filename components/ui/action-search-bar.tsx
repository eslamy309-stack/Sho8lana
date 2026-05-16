'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Send, Briefcase, BarChart2, Code2, Users, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SearchAction {
  id: string
  label: string
  icon: React.ReactNode
  category: string
  shortcut?: string
}

interface ActionSearchBarProps {
  actions?: SearchAction[]
  placeholder?: string
  onSelect?: (action: SearchAction) => void
  className?: string
}

const defaultActions: SearchAction[] = [
  { id: '1', label: 'Marketing Intern — Vodafone Egypt',   icon: <TrendingUp className="h-4 w-4 text-rose-500" />,   category: 'Telecom',     shortcut: '⭐ Featured' },
  { id: '2', label: 'Financial Analyst Intern — CIB',      icon: <BarChart2 className="h-4 w-4 text-blue-500" />,    category: 'Banking',     shortcut: '⭐ Featured' },
  { id: '3', label: 'Software Engineering Intern — MSFT',  icon: <Code2 className="h-4 w-4 text-sky-500" />,         category: 'Technology',  shortcut: '⭐ Featured' },
  { id: '4', label: 'Business Analyst Intern — McKinsey',  icon: <Briefcase className="h-4 w-4 text-indigo-500" />,  category: 'Consulting',  shortcut: 'EGP 10K/mo'  },
  { id: '5', label: 'Product Manager Intern — Fawry',      icon: <Users className="h-4 w-4 text-amber-500" />,       category: 'FinTech',     shortcut: 'EGP 6K/mo'   },
]

const listVariants = {
  hidden: { opacity: 0, height: 0 },
  show: {
    opacity: 1, height: 'auto',
    transition: { height: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }, staggerChildren: 0.05 },
  },
  exit: {
    opacity: 0, height: 0,
    transition: { height: { duration: 0.2 }, opacity: { duration: 0.15 } },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit:   { opacity: 0, y: -4, transition: { duration: 0.15 } },
}

export function ActionSearchBar({
  actions = defaultActions,
  placeholder = 'Search internships, skills, companies…',
  onSelect,
  className,
}: ActionSearchBarProps) {
  const [query, setQuery]         = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [selected, setSelected]   = useState<SearchAction | null>(null)

  const filtered = query
    ? actions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()))
    : actions

  function handleSelect(a: SearchAction) {
    setSelected(a)
    setQuery(a.label)
    setIsFocused(false)
    onSelect?.(a)
  }

  return (
    <div className={cn('w-full max-w-xl mx-auto', className)}>
      <div className="relative">
        <div className="relative flex items-center bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden
                        focus-within:border-brand-600 focus-within:shadow-glow transition-all duration-200">
          <span className="pl-4 text-neutral-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={query}
            placeholder={placeholder}
            onChange={e => { setQuery(e.target.value); setSelected(null) }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 150)}
            className="flex-1 px-3 py-3.5 text-sm text-neutral-900 placeholder:text-neutral-400
                       bg-transparent outline-none font-sans"
          />
          <AnimatePresence mode="popLayout">
            <motion.span
              key={query ? 'send' : 'search'}
              className="pr-4 text-neutral-400"
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0,  opacity: 1 }}
              exit={{ y: 8, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {query ? <Send className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            </motion.span>
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {isFocused && !selected && (
            <motion.div
              className="absolute z-50 w-full mt-2 bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden"
              variants={listVariants}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              <motion.ul className="py-1">
                {filtered.map(action => (
                  <motion.li
                    key={action.id}
                    variants={itemVariants}
                    onClick={() => handleSelect(action)}
                    className="flex items-center justify-between px-4 py-2.5 cursor-pointer
                               hover:bg-neutral-50 transition-colors duration-100 group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex-shrink-0">{action.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-neutral-900 group-hover:text-brand-600 transition-colors">
                          {action.label}
                        </p>
                        <p className="text-xs text-neutral-400">{action.category}</p>
                      </div>
                    </div>
                    {action.shortcut && (
                      <span className="text-2xs font-semibold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-md">
                        {action.shortcut}
                      </span>
                    )}
                  </motion.li>
                ))}
              </motion.ul>
              <div className="border-t border-neutral-100 px-4 py-2 flex items-center justify-between">
                <span className="text-2xs text-neutral-400">Press ↵ to search</span>
                <span className="text-2xs text-neutral-400">ESC to close</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
