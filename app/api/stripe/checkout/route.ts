import { stripe } from '@/utils/stripe'

const PRICING: Record<string, { name: string; price: number }> = {
  lite: { name: 'Data Lite', price: 29 },
  premium: { name: 'Data Premium', price: 99 },
  pro: { name: 'Data Pro', price: 199 },
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { tier, email, customerName, ticker, company, earningsDate } = body

    if (!tier || !email || !customerName || !ticker || !company || !earningsDate) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const price = PRICING[tier]
    if (!price) {
      return Response.json({ error: 'Invalid tier' }, { status: 400 })
    }

    // Metadata attached to BOTH the session AND the payment_intent
    // so we can extract it from either checkout.session.completed OR payment_intent.succeeded
    const sharedMetadata = {
      tier,
      customer_name: customerName,
      customer_email: email,
      ticker,
      company,
      earnings_date: earningsDate,
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: price.name,
              description: `Earnings analysis: ${ticker} - ${company}`,
            },
            unit_amount: Math.round(price.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      customer_email: email,
      metadata: sharedMetadata,
      payment_intent_data: {
        metadata: sharedMetadata,
      },
    })

    return Response.json({ sessionId: session.id, url: session.url })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create checkout'
    console.error('Checkout error:', msg)
    return Response.json({ error: msg }, { status: 500 })
  }
}
