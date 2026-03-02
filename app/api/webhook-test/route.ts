import { createClient } from '@supabase/supabase-js'

export async function GET(req: Request) {
  console.log('[WEBHOOKTEST] Testing configuration and Supabase connection')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const stripeSecret = process.env.STRIPE_WEBHOOK_SECRET

  const config = {
    supabase_url: supabaseUrl ? '✅ SET' : '❌ MISSING',
    supabase_key: supabaseKey ? '✅ SET' : '❌ MISSING',
    stripe_webhook_secret: stripeSecret ? '✅ SET' : '❌ MISSING',
  }

  console.log('[WEBHOOKTEST] Config:', config)

  if (!supabaseUrl || !supabaseKey) {
    return Response.json({
      status: 'ERROR',
      message: 'Missing Supabase configuration',
      config,
    }, { status: 500 })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Test insert
    const testData = {
      customer_email: `webhook-test-${Date.now()}@test.com`,
      customer_name: 'Webhook Test',
      product_tier: 'test',
      amount: 0,
      status: 'pending',
      stripe_session_id: `test-${Date.now()}`,
      stripe_payment_intent_id: `pi-test-${Date.now()}`,
    }

    console.log('[WEBHOOKTEST] Attempting insert with:', testData)

    const { data, error } = await supabase
      .from('orders')
      .insert(testData)
      .select()

    if (error) {
      console.error('[WEBHOOKTEST] Insert failed:', error)
      return Response.json({
        status: 'ERROR',
        message: 'Failed to insert test record',
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
        config,
      }, { status: 500 })
    }

    console.log('[WEBHOOKTEST] ✅ Insert successful:', data)

    return Response.json({
      status: 'SUCCESS',
      message: 'Webhook configuration is working correctly',
      config,
      test_record: data?.[0]?.id,
    }, { status: 200 })
  } catch (err: any) {
    console.error('[WEBHOOKTEST] Exception:', err)
    return Response.json({
      status: 'ERROR',
      message: 'Exception occurred',
      error: err.message,
      config,
    }, { status: 500 })
  }
}
