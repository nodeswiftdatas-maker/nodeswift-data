import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)

// Types para órdenes
export interface Order {
  id: string
  customer_email: string
  customer_name: string
  product_tier: 'lite' | 'premium' | 'pro'
  amount: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  stripe_payment_intent_id: string
  analysis_data?: {
    company: string
    ticker: string
    eps_beat: number
    guidance: string
    sentiment: string
    confidence: number
  }
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  email: string
  name: string
  stripe_customer_id: string
  total_spent: number
  orders_count: number
  created_at: string
}