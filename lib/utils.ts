import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { UserProfile, DocumentFile } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

export interface ProfileCompletionResult {
  score: number          // 0–100
  completed: string[]
  missing: string[]
}

export function calcProfileCompletion(
  user: UserProfile,
  documentFiles: Record<string, DocumentFile>
): ProfileCompletionResult {
  const fields: Array<{ key: string; label: string; check: () => boolean }> = [
    { key: 'name',           label: 'Full name',        check: () => Boolean(user.name?.trim()) },
    { key: 'university',     label: 'University',       check: () => Boolean(user.university?.trim()) },
    { key: 'major',          label: 'Major',            check: () => Boolean(user.major?.trim()) },
    { key: 'graduationYear', label: 'Graduation year',  check: () => Boolean(user.graduationYear?.trim()) },
    { key: 'skills',         label: 'Skills',           check: () => (user.skills?.length ?? 0) > 0 },
    { key: 'cv',             label: 'CV / Resume',      check: () => Boolean(documentFiles?.cv) },
    { key: 'bio',            label: 'Bio',              check: () => Boolean(user.bio?.trim()) },
    { key: 'photo',          label: 'Profile photo',   check: () => Boolean(user.avatarUrl || documentFiles?.photo) },
  ]

  const completed = fields.filter(f => f.check()).map(f => f.label)
  const missing   = fields.filter(f => !f.check()).map(f => f.label)
  const score     = Math.round((completed.length / fields.length) * 100)

  return { score, completed, missing }
}
