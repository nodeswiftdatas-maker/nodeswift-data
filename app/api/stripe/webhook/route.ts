import { stripe } from '@/utils/stripe'
import { supabase } from '@/lib/supabase'
import { sendOrderConfirmationEmail } from '@/utils/email'
import { analyzeEarningsWithKimi } from '@/utils/kimi'
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

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as any

      const metadata = paymentIntent.metadata || {}
      const email = paymentIntent.receipt_email || metadata.customer_email || 'unknown@example.com'
      const customerName = metadata.customer_name || 'Customer'
      const tier = metadata.tier || 'lite'

      console.log('✅ Payment successful:', {
        id: paymentIntent.id,
        email,
        tier,
        amount: paymentIntent.amount / 100,
      })

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

      try {
        await sendOrderConfirmationEmail(email, {
          order_id: order.id,
          tier,
          amount: order.amount,
        })
      } catch (emailError) {
        console.error('Email error (non-blocking):', emailError)
      }

      try {
        const ticker = metadata.ticker || 'NVDA'
        const company = metadata.company || 'NVIDIA Corporation'
        const analysisType = tier as 'lite' | 'premium' | 'pro'

        console.log('🤖 Starting Kimi analysis for:', ticker)

        const analysis = await analyzeEarningsWithKimi({
          ticker,
          company,
          earningsDate: metadata.earnings_date || new Date().toISOString(),
          analysisType,
        })

        const { error: updateError } = await supabase
          .from('orders')
          .update({
            status: 'completed',
            analysis_data: analysis,
          })
          .eq('id', order.id)

        if (updateError) {
          console.error('Error updating order with analysis:', updateError)
        } else {
          console.log('✅ Analysis completed and saved:', order.id)
        }
      } catch (analysisError) {
        console.error('❌ Error in Kimi analysis:', analysisError)
        try {
          await supabase
            .from('orders')
            .update({ status: 'failed' })
            .eq('id', order.id)
        } catch (e) {
          console.error('Error marking order as failed:', e)
        }
      }

      console.log('✅ Order workflow completed:', order.id)
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