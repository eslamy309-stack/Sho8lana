import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    groqKeySet: !!process.env.GROQ_KEY,
    groqKeyLength: process.env.GROQ_KEY?.length ?? 0,
    nodeEnv: process.env.NODE_ENV,
  })
}
