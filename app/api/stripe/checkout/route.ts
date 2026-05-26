import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', { apiVersion: '2024-06-20' })

const PLANS: Record<string, { priceId: string; name: string }> = {
  starter:    { priceId: process.env.STRIPE_STARTER_PRICE_ID ?? '', name: 'Starter' },
  pro:        { priceId: process.env.STRIPE_PRO_PRICE_ID    ?? '', name: 'Pro' },
  enterprise: { priceId: process.env.STRIPE_ENT_PRICE_ID    ?? '', name: 'Enterprise' },
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }
    const { plan, companyId, email } = await req.json()
    const planConfig = PLANS[plan]
    if (!planConfig) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

    const origin = req.headers.get('origin') ?? 'https://sho8lana.vercel.app'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: email,
      line_items: [{ price: planConfig.priceId, quantity: 1 }],
      metadata: { companyId: companyId ?? '', plan },
      success_url: `${origin}/?stripe=success&plan=${plan}`,
      cancel_url:  `${origin}/?stripe=cancel`,
      allow_promotion_codes: true,
    })
    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Stripe error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
