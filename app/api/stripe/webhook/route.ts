export const maxDuration = 60

import { stripe } from '@/utils/stripe'
import Stripe from 'stripe'
import { analyzeEarningsWithKimi } from '@/utils/kimi'
import { sendOrderConfirmationEmail, sendAnalysisCompleteEmail } from '@/utils/email'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { after } from 'next/server'

export async function POST(req: Request) {
  console.log('[WEBHOOK] ========== RECEIVED ==========')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('[WEBHOOK] Missing Supabase config')
    return Response.json({ error: 'Missing config' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const body = await req.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature') || ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET || '')
    console.log('[WEBHOOK] ✅ Event:', event.type)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[WEBHOOK] ❌ Signature failed:', msg)
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Extract metadata from both event types
  let metadata: Stripe.Metadata | null = null
  let paymentIntentId = ''
  let sessionId = ''
  let amount = 0

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    metadata = session.metadata
    paymentIntentId = typeof session.payment_intent === 'string'
      ? session.payment_intent
      : (session.payment_intent?.id ?? '')
    sessionId = session.id
    amount = session.amount_total ? session.amount_total / 100 : 0
  } else if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent
    metadata = pi.metadata
    paymentIntentId = pi.id
    sessionId = pi.metadata?.session_id || `pi-${pi.id}`
    amount = pi.amount ? pi.amount / 100 : 0
  } else {
    console.log('[WEBHOOK] Ignoring:', event.type)
    return Response.json({ received: true })
  }

  if (!metadata?.customer_email) {
    console.warn('[WEBHOOK] No metadata/email — skipping. Event:', event.type)
    return Response.json({ received: true })
  }

  const email = metadata.customer_email
  const name = metadata.customer_name || 'Customer'
  const tier = metadata.tier || 'lite'
  const ticker = metadata.ticker || ''
  const company = metadata.company || ''
  const earningsDate = metadata.earnings_date || ''

  console.log('[WEBHOOK] Processing:', { email, name, tier, ticker, amount })

  // Deduplicate: skip if order with same payment_intent already exists
  const { data: existing } = await supabase
    .from('orders')
    .select('id')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .maybeSingle()

  if (existing) {
    console.log('[WEBHOOK] Duplicate — order already exists for', paymentIntentId)
    return Response.json({ received: true })
  }

  const { data, error } = await supabase
    .from('orders')
    .insert({
      customer_email: email,
      customer_name: name,
      product_tier: tier,
      amount,
      status: 'pending',
      stripe_session_id: sessionId,
      stripe_payment_intent_id: paymentIntentId,
      ticker: ticker || null,
      company: company || null,
      earnings_date: earningsDate || null,
    })
    .select()

  if (error) {
    console.error('[WEBHOOK] ❌ Insert failed:', error.message, error.code)
    return Response.json({ received: true })
  }

  const orderId = data?.[0]?.id
  console.log('[WEBHOOK] ✅ Order created:', orderId, email, ticker)

  // Fire confirmation email immediately (non-blocking)
  sendOrderConfirmationEmail(email, { order_id: orderId, tier, amount })
    .catch(err => console.error('[EMAIL] Confirmation failed:', err))

  // Run Kimi AFTER response is sent — `after()` keeps the function alive on Vercel
  if (ticker && company) {
    after(async () => {
      await runKimiAnalysis(orderId, email, { ticker, company, earningsDate, tier, supabase })
    })
  } else {
    console.warn('[WEBHOOK] No ticker — skipping Kimi')
  }

  console.log('[WEBHOOK] ========== DONE (200) ==========')
  return Response.json({ received: true })
}

async function runKimiAnalysis(
  orderId: string,
  email: string,
  params: { ticker: string; company: string; earningsDate: string; tier: string; supabase: SupabaseClient }
) {
  const { ticker, company, earningsDate, tier, supabase } = params
  console.log('[KIMI] Starting for', ticker, 'order', orderId)

  try {
    await supabase.from('orders').update({ status: 'processing' }).eq('id', orderId)

    const result = await analyzeEarningsWithKimi({
      ticker,
      company,
      earningsDate,
      analysisType: tier as 'lite' | 'premium' | 'pro',
    })

    console.log('[KIMI] ✅ Done for', ticker, 'signal:', result.signal_strength)

    await supabase.from('orders')
      .update({ status: 'completed', analysis_data: result })
      .eq('id', orderId)

    await sendAnalysisCompleteEmail(email, {
      ticker: result.ticker,
      company: result.company,
      eps_beat: result.eps_beat,
      sentiment: result.management_tone,
      confidence: result.signal_strength,
    })

    console.log('[KIMI] ✅ Email sent to', email)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[KIMI] ❌ Failed for', ticker + ':', msg)
    await supabase.from('orders').update({ status: 'failed' }).eq('id', orderId)
  }
}
