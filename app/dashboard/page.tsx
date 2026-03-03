'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface AnalysisData {
  ticker: string
  company: string
  eps_beat: number
  revenue_beat: number
  guidance: string
  management_tone: string
  key_catalysts: string[]
  insider_activity: string
  thesis: string
  signal_strength: number
}

interface Order {
  id: string
  customer_email: string
  customer_name: string
  product_tier: string
  amount: number
  status: string
  created_at: string
  ticker: string | null
  company: string | null
  earnings_date: string | null
  analysis_data: AnalysisData | null
}

function SignalBar({ value }: { value: number }) {
  const color = value >= 70 ? '#22c55e' : value >= 40 ? '#eab308' : '#ef4444'
  return (
    <div style={{ width: '100%', background: '#1e293b', borderRadius: 6, height: 10, overflow: 'hidden' }}>
      <div style={{ width: `${value}%`, background: color, height: '100%', borderRadius: 6, transition: 'width 0.5s' }} />
    </div>
  )
}

function AnalysisCard({ data, tier }: { data: AnalysisData; tier: string }) {
  const toneColor = data.management_tone?.toLowerCase().includes('bull') ? 'text-green-400' :
    data.management_tone?.toLowerCase().includes('bear') ? 'text-red-400' : 'text-yellow-400'

  const guidanceColor = data.guidance?.toLowerCase().includes('rais') ? 'text-green-400' :
    data.guidance?.toLowerCase().includes('lower') ? 'text-red-400' : 'text-yellow-400'

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${data.ticker}_analysis.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadCSV = () => {
    const rows = [
      ['Field', 'Value'],
      ['Ticker', data.ticker],
      ['Company', data.company],
      ['EPS Beat %', data.eps_beat],
      ['Revenue Beat %', data.revenue_beat],
      ['Guidance', data.guidance],
      ['Management Tone', data.management_tone],
      ['Insider Activity', data.insider_activity],
      ['Signal Strength', data.signal_strength],
      ['Key Catalysts', (data.key_catalysts || []).join('; ')],
      ['Investment Thesis', data.thesis],
    ]
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${data.ticker}_analysis.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mt-4 space-y-4">
      {/* Signal Strength */}
      <div className="bg-slate-900 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Signal Strength</span>
          <span className="text-2xl font-bold" style={{ color: data.signal_strength >= 70 ? '#22c55e' : data.signal_strength >= 40 ? '#eab308' : '#ef4444' }}>
            {data.signal_strength}/100
          </span>
        </div>
        <SignalBar value={data.signal_strength} />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900 rounded-lg p-4">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">EPS Beat</p>
          <p className={`text-xl font-bold ${data.eps_beat >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {data.eps_beat >= 0 ? '+' : ''}{data.eps_beat?.toFixed(1)}%
          </p>
        </div>
        <div className="bg-slate-900 rounded-lg p-4">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Revenue Beat</p>
          <p className={`text-xl font-bold ${data.revenue_beat >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {data.revenue_beat >= 0 ? '+' : ''}{data.revenue_beat?.toFixed(1)}%
          </p>
        </div>
        <div className="bg-slate-900 rounded-lg p-4">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Guidance</p>
          <p className={`text-lg font-bold capitalize ${guidanceColor}`}>{data.guidance}</p>
        </div>
        <div className="bg-slate-900 rounded-lg p-4">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Management Tone</p>
          <p className={`text-lg font-bold capitalize ${toneColor}`}>{data.management_tone}</p>
        </div>
      </div>

      {/* Thesis */}
      {data.thesis && (
        <div className="bg-slate-900 rounded-lg p-4">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Investment Thesis</p>
          <p className="text-gray-300 text-sm leading-relaxed">{data.thesis}</p>
        </div>
      )}

      {/* Key Catalysts */}
      {data.key_catalysts?.length > 0 && (
        <div className="bg-slate-900 rounded-lg p-4">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">Key Catalysts</p>
          <ul className="space-y-2">
            {data.key_catalysts.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-cyan-400 mt-0.5">▸</span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Insider Activity */}
      {data.insider_activity && (
        <div className="bg-slate-900 rounded-lg p-4">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Insider Activity</p>
          <p className="text-gray-300 text-sm">{data.insider_activity}</p>
        </div>
      )}

      {/* Download Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={downloadJSON}
          className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition text-sm"
        >
          Download JSON
        </button>
        {(tier === 'premium' || tier === 'pro') && (
          <button
            onClick={downloadCSV}
            className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg transition text-sm"
          >
            Download CSV
          </button>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setSearched(true)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_email', email)
        .order('created_at', { ascending: false })
      if (error) throw error
      setOrders(data || [])
    } catch (err) {
      console.error('Error fetching orders:', err)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="bg-slate-950 text-white min-h-screen">
      <nav className="bg-slate-900/80 backdrop-blur border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center text-sm font-bold">NS</div>
            <span className="font-bold text-lg">NodeSwift Data</span>
          </Link>
          <Link href="/pricing" className="text-gray-300 hover:text-cyan-400 transition">Get Data</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold mb-2">Your Orders</h1>
        <p className="text-gray-400 mb-12">Enter your email to view your earnings analysis results</p>

        <form onSubmit={handleSearch} className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-12">
          <label className="block text-gray-300 mb-2 text-sm">Email address</label>
          <div className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !email}
              className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-6 rounded disabled:opacity-50 transition"
            >
              {loading ? 'Loading...' : 'View Orders'}
            </button>
          </div>
        </form>

        {searched && !loading && orders.length === 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
            <p className="text-gray-400">No orders found for this email.</p>
            <Link href="/pricing" className="inline-block mt-4 text-cyan-400 hover:text-cyan-300 transition text-sm">
              Place an order →
            </Link>
          </div>
        )}

        {orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    {order.ticker ? (
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-cyan-400">{order.ticker}</span>
                        <span className="text-gray-300">{order.company}</span>
                      </div>
                    ) : (
                      <h3 className="font-bold text-lg">{order.product_tier.toUpperCase()}</h3>
                    )}
                    <p className="text-gray-500 text-sm mt-1">
                      {order.product_tier.charAt(0).toUpperCase() + order.product_tier.slice(1)} plan
                      {order.earnings_date ? ` · Earnings: ${new Date(order.earnings_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-cyan-400">${order.amount}</p>
                    <p className="text-gray-500 text-xs">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Status */}
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${
                  order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                  order.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                  order.status === 'pending' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {order.status === 'completed' ? '✓ Analysis Ready' :
                   order.status === 'processing' ? '⏳ Processing...' :
                   order.status === 'pending' ? '⏳ Queued' : '✗ Failed'}
                </span>

                {/* Pending/Processing message */}
                {(order.status === 'pending' || order.status === 'processing') && (
                  <p className="text-gray-400 text-sm">
                    Your analysis is being prepared. You&apos;ll receive an email when it&apos;s ready (30–40 min).
                  </p>
                )}

                {/* Analysis Results */}
                {order.status === 'completed' && order.analysis_data && (
                  <AnalysisCard data={order.analysis_data} tier={order.product_tier} />
                )}

                {order.status === 'failed' && (
                  <div className="mt-3">
                    <p className="text-red-400 text-sm mb-3">Analysis failed. Please contact support.</p>
                    <Link href="/pricing" className="text-cyan-400 hover:text-cyan-300 text-sm transition">
                      Place a new order →
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="border-t border-slate-800 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2026 NodeSwift Data · Educational analysis only. Not investment advice.</p>
        </div>
      </footer>
    </main>
  )
}
