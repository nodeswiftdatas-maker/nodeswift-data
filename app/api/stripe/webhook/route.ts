import { stripe } from '@/utils/stripe'
import { supabase } from '@/lib/supabase'
import { headers } from 'next/headers'

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature') || ''

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err: any) {
    console.error('Webhook signature error:', err.message)
    return Response.json({ error: err.message }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any
    const email = session.customer_email || session.metadata?.customer_email || 'unknown@example.com'
    const name = session.metadata?.customer_name || 'Customer'
    const tier = session.metadata?.tier || 'lite'
    const amount = (session.amount_total || 0) / 100

    try {
      const { error } = await supabase.from('orders').insert({
        customer_email: email,
        customer_name: name,
        product_tier: tier,
        amount: amount,
        status: 'pending',
        stripe_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent || '',
      })

      if (error) {
        console.error('Supabase insert error:', error)
        return Response.json({ error: error.message }, { status: 500 })
      }

      console.log('Order saved:', session.id)
    } catch (err: any) {
      console.error('Webhook error:', err)
      return Response.json({ error: err.message }, { status: 500 })
    }
  }

  return Response.json({ received: true })
}