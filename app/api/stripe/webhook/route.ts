import { stripe } from '@/utils/stripe'
import { supabase } from '@/lib/supabase'
import { sendOrderConfirmationEmail } from '@/utils/email'
import { headers } from 'next/headers'

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const headersList = await headers()
    const sig = headersList.get('stripe-signature')

    if (!sig) {
      return new Response('No signature', { status: 400 })
    }

    let event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      )
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }

    // Handle payment_intent.succeeded
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as any

      const metadata = paymentIntent.metadata || {}
      const email = paymentIntent.receipt_email
      const customerName = metadata.customer_name || 'Customer'
      const tier = metadata.tier || 'lite'

      console.log('✅ Payment successful:', {
        id: paymentIntent.id,
        email,
        tier,
        amount: paymentIntent.amount / 100,
      })

      // 1. Create or get customer
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .upsert(
          {
            email,
            name: customerName,
            stripe_customer_id: paymentIntent.customer || '',
          },
          { onConflict: 'email' }
        )
        .select()
        .single()

      if (customerError) {
        console.error('Customer error:', customerError)
        throw customerError
      }

      // 2. Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: customer.id,
          stripe_payment_intent_id: paymentIntent.id,
          tier,
          amount: paymentIntent.amount / 100,
          status: 'processing',
        })
        .select()
        .single()

      if (orderError) {
        console.error('Order error:', orderError)
        throw orderError
      }

      // 3. Send confirmation email
      try {
        await sendOrderConfirmationEmail(email, {
          order_id: order.id,
          tier,
          amount: order.amount,
        })
      } catch (emailError) {
        console.error('Email error (non-blocking):', emailError)
      }

      console.log('✅ Order created:', order.id)
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Webhook processing failed', { status: 500 })
  }
}