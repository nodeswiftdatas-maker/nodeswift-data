import { stripe } from '@/utils/stripe'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'

// Crear cliente Supabase con credenciales de admin para webhook
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(req: Request) {
  console.log('[WEBHOOK] Iniciando procesamiento de webhook')

  // Validar configuración crítica
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('[WEBHOOK] ERROR CRÍTICO: Credenciales de Supabase no configuradas')
    console.error('[WEBHOOK] URL:', supabaseUrl ? 'OK' : 'MISSING')
    console.error('[WEBHOOK] SERVICE KEY:', supabaseServiceKey ? 'OK' : 'MISSING')
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
    console.log(`[WEBHOOK] Evento validado: ${event.type}`)
  } catch (err: any) {
    console.error('[WEBHOOK] ERROR: Validación de firma Stripe falló:', err.message)
    // Devolver 400 si la firma es inválida - Stripe no reintentará
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Siempre devolver 200 después de recibir el evento válido
  // Procesar en paralelo sin bloquear la respuesta
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any
    
    // Extraer datos del sesión
    const email = session.customer_email || session.metadata?.customer_email || 'unknown@example.com'
    const name = session.metadata?.customer_name || 'Customer'
    const tier = session.metadata?.tier || 'lite'
    const amount = session.amount_total ? (session.amount_total / 100) : 0

    console.log('[WEBHOOK] Datos extraídos:', { email, name, tier, amount, session_id: session.id })

    // Procesar insert de forma no bloqueante
    processOrder(email, name, tier, amount, session.id, session.payment_intent || '')
      .catch(err => {
        console.error('[WEBHOOK] Error procesando orden (no bloqueante):', err)
      })
  }

  // Siempre devolver 200 inmediatamente
  return Response.json({ received: true }, { status: 200 })
}

async function processOrder(
  email: string,
  name: string,
  tier: string,
  amount: number,
  sessionId: string,
  paymentIntentId: string
) {
  try {
    console.log(`[WEBHOOK] Guardando orden para ${email}...`)
    
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
      console.error('[WEBHOOK] ERROR en insert Supabase:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      })
      throw error
    }

    console.log('[WEBHOOK] ✅ Orden guardada exitosamente:', {
      session_id: sessionId,
      email: email,
      id: data?.[0]?.id,
    })
  } catch (err: any) {
    console.error('[WEBHOOK] ❌ Error fatal al procesar orden:', {
      message: err.message,
      code: err.code,
      stack: err.stack,
    })
    throw err
  }
}