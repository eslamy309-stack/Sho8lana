import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const key = process.env.GROQ_KEY
  if (!key) {
    return NextResponse.json({ error: 'AI service not configured.' }, { status: 500 })
  }

  const { prompt, system } = await request.json()
  if (!prompt) {
    return NextResponse.json({ error: 'Missing prompt.' }, { status: 400 })
  }

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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

  const data = await res.json()

  if (!res.ok) {
    return NextResponse.json(
      { error: data.error?.message ?? `Groq error ${res.status}` },
      { status: res.status }
    )
  }

  return NextResponse.json({
    content: data.choices?.[0]?.message?.content?.trim() ?? '',
  })
}
