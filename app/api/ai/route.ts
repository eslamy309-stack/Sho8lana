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
