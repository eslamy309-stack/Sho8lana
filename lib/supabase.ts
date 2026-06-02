import { createClient } from '@supabase/supabase-js'
import type { UserProfile, DocumentFile } from './types'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function sbSignUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  })
  if (error) throw error
  return data.user
}

export async function sbSignIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data.user
}

export async function sbSignOut() {
  await supabase.auth.signOut()
}

export async function sbGetSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

// ── MFA ───────────────────────────────────────────────────────────────────────

export async function sbMfaEnroll() {
  const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
  if (error) throw error
  return data   // { id, type, totp: { qr_code, secret, uri } }
}

export async function sbMfaChallengeAndVerify(factorId: string, code: string) {
  const { data, error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code })
  if (error) throw error
  return data
}

export async function sbMfaChallenge(factorId: string) {
  const { data, error } = await supabase.auth.mfa.challenge({ factorId })
  if (error) throw error
  return data   // { id: challengeId }
}

export async function sbMfaVerify(factorId: string, challengeId: string, code: string) {
  const { data, error } = await supabase.auth.mfa.verify({ factorId, challengeId, code })
  if (error) throw error
  return data
}

export async function sbMfaListFactors() {
  const { data, error } = await supabase.auth.mfa.listFactors()
  if (error) throw error
  return data.totp   // TotpFactor[]
}

export async function sbMfaUnenroll(factorId: string) {
  const { error } = await supabase.auth.mfa.unenroll({ factorId })
  if (error) throw error
}

export async function sbMfaGetAAL() {
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (error) throw error
  return data   // { currentLevel, nextLevel }
}

// ── Profile ───────────────────────────────────────────────────────────────────

export async function sbSaveProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    name: profile.name ?? '',
    university: profile.university ?? '',
    major: profile.major ?? '',
    // DB columns are NUMERIC(3,2) and INT — never pass empty strings
    gpa: profile.gpa ? parseFloat(profile.gpa) : null,
    phone: profile.phone ?? '',
    location: profile.location ?? 'Cairo',
    graduation_year: profile.graduationYear ? parseInt(profile.graduationYear, 10) : null,
    bio: profile.bio ?? null,
    linkedin_url: profile.linkedinUrl ?? null,
    portfolio_url: profile.portfolioUrl ?? null,
    avatar_url: profile.avatarUrl ?? null,
    github_username: profile.githubUsername ?? null,
    auth_provider: profile.authProvider ?? null,
    onboarding_completed: profile.onboardingCompleted ?? false,
    kpi_score: profile.kpiScore ?? 0,
    skills: profile.skills ?? [],
    updated_at: new Date().toISOString(),
    // role is never overwritten by client — only set by server/admin
  })
  if (error) throw new Error(error.message)
}

export async function sbLoadProfile(userId: string): Promise<Partial<UserProfile> | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error || !data) return null
  return {
    name: data.name ?? '',
    university: data.university ?? '',
    major: data.major ?? '',
    gpa: data.gpa != null ? String(data.gpa) : '',
    phone: data.phone ?? '',
    location: data.location ?? 'Cairo',
    graduationYear: data.graduation_year != null ? String(data.graduation_year) : '',
    bio: data.bio ?? undefined,
    linkedinUrl: data.linkedin_url ?? undefined,
    portfolioUrl: data.portfolio_url ?? undefined,
    avatarUrl: data.avatar_url ?? undefined,
    githubUsername: data.github_username ?? undefined,
    authProvider: data.auth_provider ?? undefined,
    onboardingCompleted: data.onboarding_completed ?? false,
    kpiScore: data.kpi_score ?? 0,
    skills: data.skills ?? [],
    role: data.role ?? 'student',
  }
}

// ── Document storage ──────────────────────────────────────────────────────────

export async function sbUploadDocument(
  userId: string,
  file: File,
  docKey: string
): Promise<string> {
  const path = `${userId}/${docKey}/${file.name}`
  const { error } = await supabase.storage
    .from('documents')
    .upload(path, file, { upsert: true })
  if (error) throw error

  const { data } = await supabase.storage.from('documents').createSignedUrl(path, 3600)
  return data?.signedUrl ?? ''
}

export async function sbGetDocumentUrl(
  userId: string,
  docKey: string,
  fileName: string
): Promise<string | null> {
  const path = `${userId}/${docKey}/${fileName}`
  const { data, error } = await supabase.storage.from('documents').createSignedUrl(path, 3600)
  if (error) return null
  return data.signedUrl
}

export async function sbDeleteDocument(userId: string, docKey: string, fileName: string) {
  const path = `${userId}/${docKey}/${fileName}`
  await supabase.storage.from('documents').remove([path])
  await supabase.from('document_files').delete().eq('user_id', userId).eq('key', docKey)
}

export async function sbSaveDocumentMeta(
  userId: string,
  file: DocumentFile
) {
  const { error } = await supabase.from('document_files').upsert({
    user_id: userId,
    key: file.key,
    name: file.name,
    size: file.size,
    mime_type: file.mimeType,
    storage_path: `${userId}/${file.key}/${file.name}`,
    uploaded_at: file.uploadedAt,
  })
  if (error) console.error('sbSaveDocumentMeta error:', error.message)
}

export async function sbLoadDocuments(userId: string): Promise<DocumentFile[]> {
  const { data, error } = await supabase
    .from('document_files')
    .select('*')
    .eq('user_id', userId)
  if (error || !data) return []
  return data.map(row => ({
    key: row.key,
    name: row.name,
    size: row.size,
    mimeType: row.mime_type,
    uploadedAt: row.uploaded_at,
    status: 'uploaded' as const,
    storageType: 'supabase' as const,
  }))
}
