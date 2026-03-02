import { stripe } from '@/utils/stripe'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'

export async function POST(req: Request) {
  console.log('[WEBHOOK] ========== WEBHOOK RECEIVED ==========')
  
  // Inicializar cliente Supabase dentro de la función
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log('[WEBHOOK] Config check:')
  console.log('[WEBHOOK] - URL presente:', !!supabaseUrl)
  console.log('[WEBHOOK] - KEY presente:', !!supabaseKey)
  console.log('[WEBHOOK] - WEBHOOK_SECRET presente:', !!process.env.STRIPE_WEBHOOK_SECRET)

  if (!supabaseUrl || !supabaseKey) {
    console.error('[WEBHOOK] CRITICAL: Missing Supabase credentials')
    return Response.json({ error: 'Missing credentials' }, { status: 500 })
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

  // Procesar el evento
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any
    
    console.log('[WEBHOOK] Processing checkout.session.completed')
    console.log('[WEBHOOK] Session ID:', session.id)
    console.log('[WEBHOOK] Customer email:', session.customer_email)
    console.log('[WEBHOOK] Metadata:', session.metadata)

    const email = session.customer_email || session.metadata?.customer_email || 'unknown@example.com'
    const name = session.metadata?.customer_name || 'Customer'
    const tier = session.metadata?.tier || 'lite'
    const amount = session.amount_total ? (session.amount_total / 100) : 0
    const paymentIntentId = session.payment_intent || ''

    console.log('[WEBHOOK] Extracted data:', { email, name, tier, amount, paymentIntentId })

    try {
      // Insertar datos
      console.log(`[WEBHOOK] Attempting to insert into Supabase...`)
      
      const { data, error } = await supabase
        .from('orders')
        .insert({
          customer_email: email,
          customer_name: name,
          product_tier: tier,
          amount: amount,
          status: 'pending',
          stripe_session_id: session.id,
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
        throw new Error(`Supabase error: ${error.message}`)
      }

      console.log('[WEBHOOK] ✅ Order inserted successfully:', {
        id: data?.[0]?.id,
        email: email,
        session_id: session.id,
      })
    } catch (err: any) {
      console.error('[WEBHOOK] ❌ Fatal error:', {
        message: err.message,
        stack: err.stack,
      })
    }
  } else {
    console.log(`[WEBHOOK] Ignoring event type: ${event.type}`)
  }

  // SIEMPRE devolver 200
  console.log('[WEBHOOK] ========== WEBHOOK COMPLETE (200) ==========')
  return Response.json({ received: true }, { status: 200 })
}