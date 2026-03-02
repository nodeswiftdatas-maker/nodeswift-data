import { stripe } from '@/utils/stripe'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { tier, email, customerName } = body

    if (!tier || !email || !customerName) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const PRICING: any = {
      lite: { name: 'Data Lite', price: 29 },
      premium: { name: 'Data Premium', price: 99 },
      pro: { name: 'Data Pro', price: 199 },
    }

    const price = PRICING[tier]

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: price.name,
              description: 'Earnings analysis dataset',
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
      metadata: {
        tier,
        customer_name: customerName,
        ticker: 'NVDA',
        company: 'NVIDIA Corporation',
        earnings_date: new Date().toISOString(),
      },
    })

    return Response.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return Response.json({ error: error.message || 'Failed to create checkout' }, { status: 500 })
  }
}