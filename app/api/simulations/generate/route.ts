import { NextRequest, NextResponse } from 'next/server'

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions'

export async function POST(req: NextRequest) {
  try {
    const { content, fileName, fileType } = await req.json()

    if (!content) {
      return NextResponse.json({ error: 'No content provided' }, { status: 400 })
    }

    const key = process.env.GROQ_KEY
    if (!key) {
      // Return plausible mock if AI not configured
      return NextResponse.json(mockSimulation(fileName))
    }

    const prompt = `You are an expert simulation designer for a talent assessment platform.

A company has uploaded the following document content to create a business simulation:

File: ${fileName || 'document'} (${fileType || 'unknown'})
Content:
---
${content.slice(0, 6000)}
---

Generate a structured simulation assessment based on this content. Return ONLY valid JSON with this exact shape:
{
  "title": "string (simulation title)",
  "description": "string (1-2 sentence overview)",
  "category": "string (HR|Marketing|Finance|Sales|Operations|Tech)",
  "estimatedMinutes": number,
  "difficulty": "Easy|Medium|Hard",
  "skills": ["Leadership","Communication","Problem Solving","Decision Making","Teamwork","Analytical Thinking"],
  "tasks": [
    {
      "id": "task_1",
      "title": "string",
      "description": "string",
      "type": "scenario|multiple_choice|written_response|file_upload",
      "content": "string (scenario text or question)",
      "options": ["A...","B...","C...","D..."] or null,
      "correctOption": 0 or null,
      "kpiWeight": { "Leadership": 30, "Communication": 20 }
    }
  ],
  "evaluationCriteria": ["string"],
  "kpiMapping": {
    "Leadership": number,
    "Communication": number,
    "Problem Solving": number,
    "Decision Making": number,
    "Teamwork": number,
    "Analytical Thinking": number
  }
}`

    const res = await fetch(GROQ_API, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 2048,
        response_format: { type: 'json_object' },
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Groq error:', err)
      return NextResponse.json(mockSimulation(fileName))
    }

    const data = await res.json()
    const text = data.choices?.[0]?.message?.content
    if (!text) return NextResponse.json(mockSimulation(fileName))

    const parsed = JSON.parse(text)
    return NextResponse.json(parsed)
  } catch (err) {
    console.error('Generate simulation error:', err)
    return NextResponse.json(mockSimulation('document'))
  }
}

function mockSimulation(fileName?: string) {
  const base = fileName?.replace(/\.[^.]+$/, '') ?? 'Business Simulation'
  return {
    title: `${base} Assessment`,
    description: 'A comprehensive simulation assessing core business competencies through real-world scenarios.',
    category: 'Operations',
    estimatedMinutes: 45,
    difficulty: 'Medium',
    skills: ['Leadership', 'Problem Solving', 'Decision Making', 'Analytical Thinking'],
    tasks: [
      {
        id: 'task_1',
        title: 'Situation Analysis',
        description: 'Analyze the business scenario and identify key challenges.',
        type: 'scenario',
        content: 'You are a senior manager facing a critical business decision. Your company is experiencing a 15% revenue decline and you must recommend a strategic response within 48 hours.',
        options: null,
        correctOption: null,
        kpiWeight: { Leadership: 40, 'Decision Making': 60 },
      },
      {
        id: 'task_2',
        title: 'Strategic Options',
        description: 'Select the most appropriate strategic response.',
        type: 'multiple_choice',
        content: 'Which strategy would you prioritize to address the revenue decline?',
        options: [
          'A. Cut costs by 20% across all departments immediately',
          'B. Launch an emergency marketing campaign to acquire new customers',
          'C. Analyze root causes and develop a phased recovery plan',
          'D. Seek external investment to sustain current operations',
        ],
        correctOption: 2,
        kpiWeight: { 'Analytical Thinking': 50, 'Problem Solving': 50 },
      },
      {
        id: 'task_3',
        title: 'Executive Recommendation',
        description: 'Write a concise recommendation memo.',
        type: 'written_response',
        content: 'Write a 200-word executive memo recommending your chosen strategy and explaining the expected outcomes.',
        options: null,
        correctOption: null,
        kpiWeight: { Leadership: 40, Communication: 60 },
      },
    ],
    evaluationCriteria: [
      'Quality of situational analysis',
      'Clarity and logic of recommendation',
      'Consideration of stakeholder impact',
      'Communication effectiveness',
    ],
    kpiMapping: {
      Leadership: 30,
      Communication: 20,
      'Problem Solving': 20,
      'Decision Making': 20,
      Teamwork: 0,
      'Analytical Thinking': 10,
    },
  }
}
