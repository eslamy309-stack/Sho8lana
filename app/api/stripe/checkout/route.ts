import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const PLANS: Record<string, { priceId?: string; name: string; free?: boolean }> = {
  starter:    { name: 'Starter', free: true },
  pro:        { name: 'Pro',        priceId: process.env.STRIPE_PRO_PRICE_ID },
  enterprise: { name: 'Enterprise', priceId: process.env.STRIPE_ENT_PRICE_ID },
}

export async function POST(req: NextRequest) {
  try {
    const { plan, companyId, email } = await req.json()
    const planConfig = PLANS[plan]
    if (!planConfig) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

    // Starter is free — no Stripe checkout needed
    if (planConfig.free) {
      return NextResponse.json({ free: true })
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const origin = req.headers.get('origin') ?? 'https://sho8lana.vercel.app'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: email,
      line_items: [{ price: planConfig.priceId!, quantity: 1 }],
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
