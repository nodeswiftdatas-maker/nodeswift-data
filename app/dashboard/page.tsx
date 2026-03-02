'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Order {
  id: string
  customer_email: string
  customer_name: string
  product_tier: string
  amount: number
  status: string
  created_at: string
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
      {/* Navbar */}
      <nav className="bg-slate-900/80 backdrop-blur border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center text-sm font-bold">NS</div>
            <span className="font-bold text-lg">NodeSwift Data</span>
          </Link>
          <div className="flex gap-4">
            <Link href="/pricing" className="text-gray-300 hover:text-cyan-400 transition">Get Data</Link>
            <Link href="/" className="text-gray-300 hover:text-cyan-400 transition">Home</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold mb-2">Your Orders</h1>
        <p className="text-gray-400 mb-12">View your earnings analysis orders and download your data</p>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-12">
          <label className="block text-gray-300 mb-2">Enter your email to view orders:</label>
          <div className="flex gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-6 rounded disabled:opacity-50 transition"
            >
              {loading ? 'Searching...' : 'View Orders'}
            </button>
          </div>
        </form>

        {/* Orders List */}
        {searched && orders.length === 0 && !loading && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
            <p className="text-gray-400">No orders found for this email.</p>
            <p className="text-gray-500 text-sm mt-2">If you placed an order, please check your email for details.</p>
          </div>
        )}

        {orders.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Your Orders ({orders.length})</h2>
            {orders.map((order) => (
              <div key={order.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{order.product_tier.toUpperCase()}</h3>
                    <p className="text-gray-400 text-sm">{order.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-cyan-400">${order.amount}</p>
                    <p className="text-gray-400 text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                    order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    order.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                    order.status === 'pending' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>

                {/* Order Details */}
                <div className="grid md:grid-cols-2 gap-4 mb-6 text-sm text-gray-400">
                  <div>
                    <p className="text-gray-500">Order ID</p>
                    <p className="font-mono text-xs">{order.id.slice(0, 8)}...</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p>{order.customer_email}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {order.status === 'completed' && (
                    <button className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded transition">
                      Download Data
                    </button>
                  )}
                  {order.status === 'processing' && (
                    <div className="text-gray-400 text-sm">
                      ⏳ Your analysis is being processed. You'll receive an email when ready (30-40 min).
                    </div>
                  )}
                  {order.status === 'pending' && (
                    <div className="text-gray-400 text-sm">
                      ⏳ Payment confirmed. Processing will begin shortly.
                    </div>
                  )}
                  {order.status === 'failed' && (
                    <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition">
                      Retry Payment
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <p>© 2026 NodeSwift Data. All rights reserved.</p>
          <p className="mt-4">⚠️ Educational analysis only. Not investment advice.</p>
        </div>
      </footer>
    </main>
  )
}