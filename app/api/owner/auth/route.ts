import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json()
    const secret = process.env.OWNER_SECRET
    if (!secret) return NextResponse.json({ error: 'Owner access not configured.' }, { status: 500 })
    if (password !== secret) {
      // Small delay to slow brute force
      await new Promise(r => setTimeout(r, 800))
      return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 })
    }
    // Issue a time-limited session token (valid 8 hours)
    const ts = Date.now().toString()
    const sig = createHmac('sha256', secret).update(ts).digest('hex')
    const token = Buffer.from(`${ts}.${sig}`).toString('base64url')
    return NextResponse.json({ token })
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token')
    const secret = process.env.OWNER_SECRET
    if (!secret || !token) return NextResponse.json({ valid: false })
    const decoded = Buffer.from(token, 'base64url').toString()
    const [ts, sig] = decoded.split('.')
    const expected = createHmac('sha256', secret).update(ts).digest('hex')
    const age = Date.now() - parseInt(ts)
    const valid = sig === expected && age < 8 * 60 * 60 * 1000
    return NextResponse.json({ valid })
  } catch {
    return NextResponse.json({ valid: false })
  }
}
