import { stripe } from '@/utils/stripe'
import { analyzeEarningsWithKimi } from '@/utils/kimi'
import { sendOrderConfirmationEmail, sendAnalysisCompleteEmail } from '@/utils/email'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'

export async function POST(req: Request) {
  console.log('[WEBHOOK] ========== WEBHOOK RECEIVED ==========')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('[WEBHOOK] Config check:')
  console.log('[WEBHOOK] - URL presente:', !!supabaseUrl)
  console.log('[WEBHOOK] - SERVICE_ROLE_KEY presente:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
  console.log('[WEBHOOK] - ANON_KEY presente:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  console.log('[WEBHOOK] - KEY being used:', supabaseKey ? '✅ YES' : '❌ NO')
  console.log('[WEBHOOK] - WEBHOOK_SECRET presente:', !!process.env.STRIPE_WEBHOOK_SECRET)

  if (!supabaseUrl || !supabaseKey) {
    console.error('[WEBHOOK] CRITICAL: Missing Supabase configuration')
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
    console.log('[WEBHOOK] ✅ Event validated:', event.type)
  } catch (err: any) {
    console.error('[WEBHOOK] ❌ Signature verification failed:', err.message)
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded') {
    let sessionData: any
    let email: string, name: string, tier: string, amount: number
    let paymentIntentId: string, sessionId: string
    let ticker: string, company: string, earningsDate: string

    if (event.type === 'checkout.session.completed') {
      sessionData = event.data.object
      email = sessionData.customer_email || sessionData.metadata?.customer_email || 'unknown@example.com'
      name = sessionData.metadata?.customer_name || 'Customer'
      tier = sessionData.metadata?.tier || 'lite'
      amount = sessionData.amount_total ? sessionData.amount_total / 100 : 0
      paymentIntentId = sessionData.payment_intent || ''
      sessionId = sessionData.id
      ticker = sessionData.metadata?.ticker || ''
      company = sessionData.metadata?.company || ''
      earningsDate = sessionData.metadata?.earnings_date || ''
    } else {
      sessionData = event.data.object
      email = sessionData.charges?.data?.[0]?.billing_details?.email || sessionData.metadata?.customer_email || 'unknown@example.com'
      name = sessionData.metadata?.customer_name || 'Customer'
      tier = sessionData.metadata?.tier || 'lite'
      amount = sessionData.amount ? sessionData.amount / 100 : 0
      paymentIntentId = sessionData.id
      sessionId = sessionData.metadata?.session_id || 'pi-' + sessionData.id
      ticker = sessionData.metadata?.ticker || ''
      company = sessionData.metadata?.company || ''
      earningsDate = sessionData.metadata?.earnings_date || ''
    }

    console.log('[WEBHOOK] Processing payment for:', { email, name, tier, amount, ticker, company })

    try {
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
          ticker: ticker || null,
          company: company || null,
          earnings_date: earningsDate || null,
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
        const orderId = data?.[0]?.id
        console.log('[WEBHOOK] ✅ Order inserted:', { id: orderId, email, ticker })

        // Send confirmation email (fire and forget)
        sendOrderConfirmationEmail(email, { order_id: orderId, tier, amount })
          .catch(err => console.error('[EMAIL] Confirmation failed:', err))

        // Trigger Kimi analysis (fire and forget — returns 200 to Stripe immediately)
        if (ticker && company) {
          runKimiAnalysis(orderId, email, { ticker, company, earningsDate, tier, supabase })
            .catch(err => console.error('[KIMI] Analysis failed:', err))
        } else {
          console.warn('[WEBHOOK] No ticker/company — skipping Kimi analysis')
        }
      }
    } catch (err: any) {
      console.error('[WEBHOOK] ❌ Exception during insert:', err.message)
    }
  } else {
    console.log('[WEBHOOK] Ignoring event type:', event.type)
  }

  console.log('[WEBHOOK] ========== WEBHOOK COMPLETE (200) ==========')
  return Response.json({ received: true }, { status: 200 })
}

async function runKimiAnalysis(
  orderId: string,
  email: string,
  params: {
    ticker: string
    company: string
    earningsDate: string
    tier: string
    supabase: SupabaseClient
  }
) {
  const { ticker, company, earningsDate, tier, supabase } = params

  console.log('[KIMI] Starting analysis for', ticker, '(order', orderId + ')')

  try {
    await supabase.from('orders').update({ status: 'processing' }).eq('id', orderId)

    console.log('[KIMI] Calling Moonshot API for', ticker + '...')

    const result = await analyzeEarningsWithKimi({
      ticker,
      company,
      earningsDate,
      analysisType: tier as 'lite' | 'premium' | 'pro',
    })

    console.log('[KIMI] ✅ Analysis complete for', ticker, '— signal:', result.signal_strength)

    await supabase
      .from('orders')
      .update({ status: 'completed', analysis_data: result })
      .eq('id', orderId)

    await sendAnalysisCompleteEmail(email, {
      ticker: result.ticker,
      company: result.company,
      eps_beat: result.eps_beat,
      sentiment: result.management_tone,
      confidence: result.signal_strength,
    })

    console.log('[KIMI] ✅ Email sent to', email, 'for', ticker)
  } catch (err: any) {
    console.error('[KIMI] ❌ Analysis failed for', ticker + ':', err.message)
    await supabase.from('orders').update({ status: 'failed' }).eq('id', orderId)
  }
}
