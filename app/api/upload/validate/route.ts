import { NextRequest, NextResponse } from 'next/server'

// Mirrors the DOCUMENTS array — single source of truth kept server-side
const RULES: Record<string, { mimes: string[]; maxMB: number }> = {
  cv: {
    mimes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    maxMB: 5,
  },
  transcript: {
    mimes: ['application/pdf', 'image/jpeg', 'image/png'],
    maxMB: 10,
  },
  nationalId: {
    mimes: ['image/jpeg', 'image/png', 'application/pdf'],
    maxMB: 5,
  },
  photo: {
    mimes: ['image/jpeg', 'image/png', 'image/webp'],
    maxMB: 3,
  },
  certificates: {
    mimes: ['application/pdf', 'image/jpeg', 'image/png'],
    maxMB: 10,
  },
  coverLetter: {
    mimes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    maxMB: 2,
  },
  portfolio: {
    mimes: ['application/pdf', 'image/jpeg', 'image/png', 'application/zip'],
    maxMB: 20,
  },
}

function friendlyMimes(mimes: string[]): string {
  return mimes
    .map(m =>
      m
        .split('/')
        .pop()!
        .replace('vnd.openxmlformats-officedocument.wordprocessingml.document', 'docx')
        .replace('msword', 'doc')
        .replace('jpeg', 'jpg')
    )
    .join(', ')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { key, name, size, mimeType } = body as {
      key?: string
      name?: string
      size?: number
      mimeType?: string
    }

    if (!key || !name || !size || !mimeType) {
      return NextResponse.json(
        { error: 'Missing required fields: key, name, size, mimeType' },
        { status: 400 }
      )
    }

    const rules = RULES[key]
    if (!rules) {
      return NextResponse.json({ error: 'Unknown document type' }, { status: 400 })
    }

    if (!rules.mimes.includes(mimeType)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed formats: ${friendlyMimes(rules.mimes)}` },
        { status: 400 }
      )
    }

    const maxBytes = rules.maxMB * 1024 * 1024
    if (size > maxBytes) {
      return NextResponse.json(
        { error: `File too large. Maximum allowed size is ${rules.maxMB} MB.` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      key,
      name,
      size,
      mimeType,
      validatedAt: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json({ error: 'Validation failed. Please try again.' }, { status: 500 })
  }
}
