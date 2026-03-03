export const maxDuration = 60

import { createClient } from '@supabase/supabase-js'
import { analyzeEarningsWithKimi } from '@/utils/kimi'
import { sendAnalysisCompleteEmail } from '@/utils/email'
import { after } from 'next/server'

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json()
    if (!orderId) {
      return Response.json({ error: 'Missing orderId' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (error || !order) {
      return Response.json({ error: 'Order not found' }, { status: 404 })
    }

    if (!order.ticker || !order.company) {
      return Response.json({ error: 'Order has no ticker/company' }, { status: 400 })
    }

    // Mark as processing immediately
    await supabase.from('orders').update({ status: 'processing' }).eq('id', orderId)

    after(async () => {
      try {
        const result = await analyzeEarningsWithKimi({
          ticker: order.ticker,
          company: order.company,
          earningsDate: order.earnings_date || '',
          analysisType: order.product_tier as 'lite' | 'premium' | 'pro',
        })

        await supabase
          .from('orders')
          .update({ status: 'completed', analysis_data: result })
          .eq('id', orderId)

        await sendAnalysisCompleteEmail(order.customer_email, {
          ticker: result.ticker,
          company: result.company,
          eps_beat: result.eps_beat,
          sentiment: result.management_tone,
          confidence: result.signal_strength,
        })

        console.log('[RETRY] ✅ Done for', order.ticker)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error('[RETRY] ❌ Failed:', msg)
        await supabase.from('orders').update({ status: 'failed' }).eq('id', orderId)
      }
    })

    return Response.json({ success: true, message: 'Analysis started' })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return Response.json({ error: msg }, { status: 500 })
  }
}
