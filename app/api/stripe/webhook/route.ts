import { stripe } from '@/utils/stripe'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'

export async function POST(req: Request) {
  console.log('[WEBHOOK] ========== WEBHOOK RECEIVED ==========')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  // Preferir service role key, pero caer a anon key si no existe
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('[WEBHOOK] Config check:')
  console.log('[WEBHOOK] - URL presente:', !!supabaseUrl)
  console.log('[WEBHOOK] - SERVICE_ROLE_KEY presente:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
  console.log('[WEBHOOK] - ANON_KEY presente:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  console.log('[WEBHOOK] - KEY being used:', supabaseKey ? '✅ YES' : '❌ NO')
  console.log('[WEBHOOK] - WEBHOOK_SECRET presente:', !!process.env.STRIPE_WEBHOOK_SECRET)

  if (!supabaseUrl || !supabaseKey) {
    console.error('[WEBHOOK] CRITICAL: Missing Supabase configuration')
    console.error('[WEBHOOK] URL:', supabaseUrl || 'MISSING')
    console.error('[WEBHOOK] KEY:', supabaseKey || 'MISSING')
    return Response.json({ error: 'Missing Supabase credentials' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const body = await req.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature') || ''

  console.log('[WEBHOOK] - Body length:', body.length)
  console.log('[WEBHOOK] - Signature present:', !!sig)

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
    console.log(`[WEBHOOK] ✅ Event validated: ${event.type}`)
  } catch (err: any) {
    console.error('[WEBHOOK] ❌ Signature verification failed:', err.message)
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Process the event - Handle both payment_intent.succeeded and checkout.session.completed
  if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded') {
    let sessionData
    let email, name, tier, amount, paymentIntentId, sessionId

    if (event.type === 'checkout.session.completed') {
      sessionData = event.data.object as any
      email = sessionData.customer_email || sessionData.metadata?.customer_email || 'unknown@example.com'
      name = sessionData.metadata?.customer_name || 'Customer'
      tier = sessionData.metadata?.tier || 'lite'
      amount = sessionData.amount_total ? (sessionData.amount_total / 100) : 0
      paymentIntentId = sessionData.payment_intent || ''
      sessionId = sessionData.id
    } else {
      // payment_intent.succeeded
      sessionData = event.data.object as any
      email = sessionData.charges?.data?.[0]?.billing_details?.email || sessionData.metadata?.customer_email || 'unknown@example.com'
      name = sessionData.metadata?.customer_name || 'Customer'
      tier = sessionData.metadata?.tier || 'lite'
      amount = sessionData.amount ? (sessionData.amount / 100) : 0
      paymentIntentId = sessionData.id
      sessionId = sessionData.metadata?.session_id || `pi-${sessionData.id}`
    }
    
    console.log('[WEBHOOK] Processing payment for:', { email, name, tier, amount })

    try {
      console.log(`[WEBHOOK] Attempting to insert into Supabase...`)
      
      const { data, error } = await supabase
        .from('orders')
        .insert({
          customer_email: email,
          customer_name: name,
          product_tier: tier,
          amount: amount,
          status: 'pending',
          stripe_session_id: sessionId,
          stripe_payment_intent_id: paymentIntentId,
        })
        .select()

      if (error) {
        console.error('[WEBHOOK] ❌ Supabase insert failed:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        })
      } else {
        console.log('[WEBHOOK] ✅ Order inserted successfully:', {
          id: data?.[0]?.id,
          email: email,
          session_id: sessionId,
        })
      }
    } catch (err: any) {
      console.error('[WEBHOOK] ❌ Exception during insert:', {
        message: err.message,
        stack: err.stack,
      })
    }
  } else {
    console.log(`[WEBHOOK] Ignoring event type: ${event.type}`)
  }

  // ALWAYS return 200 to Stripe
  console.log('[WEBHOOK] ========== WEBHOOK COMPLETE (200) ==========')
  return Response.json({ received: true }, { status: 200 })
}