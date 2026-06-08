import { createHmac } from 'crypto'
import type { NextRequest } from 'next/server'

export function verifyOwnerToken(token: string | null | undefined): boolean {
  if (!token) return false
  const secret = process.env.OWNER_SECRET
  if (!secret) return false
  try {
    const decoded = Buffer.from(token, 'base64url').toString()
    const dotIdx = decoded.indexOf('.')
    if (dotIdx === -1) return false
    const ts = decoded.slice(0, dotIdx)
    const sig = decoded.slice(dotIdx + 1)
    const expected = createHmac('sha256', secret).update(ts).digest('hex')
    const age = Date.now() - parseInt(ts, 10)
    return sig === expected && age < 8 * 60 * 60 * 1000
  } catch {
    return false
  }
}

// Extracts token from cookie OR Authorization: Bearer header
export function extractAdminToken(req: NextRequest): string | null {
  const cookie = req.cookies.get('sho8_owner_token')?.value
  if (cookie) return cookie
  const auth = req.headers.get('authorization')
  if (auth?.startsWith('Bearer ')) return auth.slice(7)
  return null
}

export function isAdminAuthorized(req: NextRequest): boolean {
  return verifyOwnerToken(extractAdminToken(req))
}
