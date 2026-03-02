import { stripe } from '@/utils/stripe'
import { supabase } from '@/lib/supabase'
import { headers } from 'next/headers'

export async function POST(req: Request) {
  // Validar configuración crítica
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('CRITICAL: NEXT_PUBLIC_SUPABASE_URL not configured')
    return Response.json({ error: 'Supabase URL not configured' }, { status: 500 })
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('CRITICAL: Supabase credentials not configured')
    return Response.json({ error: 'Supabase credentials not configured' }, { status: 500 })
  }

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
      console.log('Processing order:', { email, name, tier, amount, session_id: session.id })
      
      const { data, error } = await supabase.from('orders').insert({
        customer_email: email,
        customer_name: name,
        product_tier: tier,
        amount: amount,
        status: 'pending',
        stripe_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent || '',
      }).select()

      if (error) {
        console.error('Supabase insert error:', error)
        return Response.json({ error: error.message }, { status: 500 })
      }

      console.log('Order saved successfully:', { session_id: session.id, data })
    } catch (err: any) {
      console.error('Webhook error:', err)
      return Response.json({ error: err.message }, { status: 500 })
    }
  }

  return Response.json({ received: true })
}