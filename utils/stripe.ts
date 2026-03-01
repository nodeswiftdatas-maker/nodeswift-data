import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
})

export const PRICING = {
  lite: {
    name: 'Data Lite',
    price: 29,
    description: 'Quick earnings summary for rapid decision-making',
    features: [
      'CSV dataset download',
      'EPS & Revenue surprise %',
      'Guidance analysis',
    ],
  },
  premium: {
    name: 'Data Premium',
    price: 99,
    description: 'Complete analysis for serious traders and investors',
    features: [
      'Full JSON dataset',
      'Detailed analysis report',
      'Sentiment analysis',
      'Insider tracking',
    ],
  },
  pro: {
    name: 'Data Pro',
    price: 199,
    description: 'Full service with expert consultation',
    features: [
      'Everything in Premium',
      '30-min Zoom consultation',
      'Custom analysis',
      'Priority support',
    ],
  },
}

export async function createPaymentIntent(
  amount: number,
  email: string,
  metadata: Record<string, string>
) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'usd',
    receipt_email: email,
    metadata,
  })
  return paymentIntent
}

export async function createCheckoutSession(
  tier: keyof typeof PRICING,
  email: string,
  customerName: string
) {
  const price = PRICING[tier]

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: price.name,
            description: price.description,
          },
          unit_amount: Math.round(price.price * 100),
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    customer_email: email,
    metadata: {
      tier,
      customer_name: customerName,
    },
  })

  return session
}