import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

let ratelimit: Ratelimit | null = null
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    prefix: 'sho8lana:ai',
  })
}

export async function POST(request: NextRequest) {
  // Rate limit: 10 requests per minute per IP
  if (ratelimit) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'anonymous'
    const { success, limit, remaining, reset } = await ratelimit.limit(ip)
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait before sending another message.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit':     String(limit),
            'X-RateLimit-Remaining': String(remaining),
            'X-RateLimit-Reset':     String(reset),
            'Retry-After':           String(Math.ceil((reset - Date.now()) / 1000)),
          },
        }
      )
    }
  }

  const key = process.env.GROQ_KEY
  if (!key) {
    return NextResponse.json({ error: 'AI service not configured.' }, { status: 500 })
  }

  const { prompt, system } = await request.json()
  if (!prompt || typeof prompt !== 'string') {
    return NextResponse.json({ error: 'Missing prompt.' }, { status: 400 })
  }
  if (prompt.length > 4000) {
    return NextResponse.json({ error: 'Prompt too long. Maximum 4000 characters.' }, { status: 400 })
  }
  if (system && typeof system === 'string' && system.length > 1000) {
    return NextResponse.json({ error: 'System prompt too long.' }, { status: 400 })
  }

  let res: Response
  let data: Record<string, unknown>

  try {
    res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: system || 'You are a career advisor for Egyptian college students. Be concise and encouraging.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    })
    data = await res.json()
  } catch (e: unknown) {
    return NextResponse.json(
      { error: `Network error reaching Groq: ${e instanceof Error ? e.message : 'unknown'}` },
      { status: 502 }
    )
  }

  if (!res.ok) {
    // Return full Groq error details so client can show them
    const groqErr = (data as { error?: { message?: string; type?: string } }).error
    return NextResponse.json(
      { error: groqErr?.message ?? `Groq error ${res.status}`, type: groqErr?.type, status: res.status },
      { status: res.status }
    )
  }

  return NextResponse.json({
    content: (data as { choices?: { message?: { content?: string } }[] }).choices?.[0]?.message?.content?.trim() ?? '',
  })
}
