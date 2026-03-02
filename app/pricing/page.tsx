'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

const PRICING = {
  lite: { name: 'Data Lite', price: 29, description: 'Quick earnings summary' },
  premium: { name: 'Data Premium', price: 99, description: 'Complete analysis' },
  pro: { name: 'Data Pro', price: 199, description: 'Expert consultation' },
}

const TICKERS: Record<string, string> = {
  AAPL: 'Apple Inc.',
  MSFT: 'Microsoft Corporation',
  NVDA: 'NVIDIA Corporation',
  GOOGL: 'Alphabet Inc.',
  AMZN: 'Amazon.com Inc.',
  META: 'Meta Platforms Inc.',
  TSLA: 'Tesla Inc.',
  BRK: 'Berkshire Hathaway Inc.',
  TSM: 'Taiwan Semiconductor Manufacturing',
  AVGO: 'Broadcom Inc.',
  JPM: 'JPMorgan Chase & Co.',
  LLY: 'Eli Lilly and Company',
  V: 'Visa Inc.',
  XOM: 'Exxon Mobil Corporation',
  MA: 'Mastercard Incorporated',
  UNH: 'UnitedHealth Group Inc.',
  JNJ: 'Johnson & Johnson',
  COST: 'Costco Wholesale Corporation',
  HD: 'The Home Depot Inc.',
  PG: 'Procter & Gamble Co.',
  BAC: 'Bank of America Corporation',
  NFLX: 'Netflix Inc.',
  AMD: 'Advanced Micro Devices Inc.',
  CRM: 'Salesforce Inc.',
  ORCL: 'Oracle Corporation',
  INTC: 'Intel Corporation',
  QCOM: 'Qualcomm Incorporated',
  IBM: 'International Business Machines',
  UBER: 'Uber Technologies Inc.',
  ABNB: 'Airbnb Inc.',
  SHOP: 'Shopify Inc.',
  SQ: 'Block Inc.',
  PYPL: 'PayPal Holdings Inc.',
  COIN: 'Coinbase Global Inc.',
  PLTR: 'Palantir Technologies Inc.',
  ARM: 'Arm Holdings plc',
  SMCI: 'Super Micro Computer Inc.',
  MU: 'Micron Technology Inc.',
  GS: 'Goldman Sachs Group Inc.',
  MS: 'Morgan Stanley',
  WMT: 'Walmart Inc.',
  DIS: 'The Walt Disney Company',
  BABA: 'Alibaba Group Holding',
  NKE: 'Nike Inc.',
  SBUX: 'Starbucks Corporation',
  BA: 'The Boeing Company',
  GE: 'GE Aerospace',
  F: 'Ford Motor Company',
  GM: 'General Motors Company',
  T: 'AT&T Inc.',
  VZ: 'Verizon Communications Inc.',
}

export default function PricingPage() {
  const [selectedTier, setSelectedTier] = useState<keyof typeof PRICING>('premium')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [ticker, setTicker] = useState('')
  const [company, setCompany] = useState('')
  const [earningsDate, setEarningsDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [tickerSuggestions, setTickerSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const tickerRef = useRef<HTMLDivElement>(null)

  const handleTickerInput = (value: string) => {
    const upper = value.toUpperCase()
    setTicker(upper)
    if (upper.length >= 1) {
      const matches = Object.keys(TICKERS).filter(t => t.startsWith(upper) || TICKERS[t].toUpperCase().includes(upper))
      setTickerSuggestions(matches.slice(0, 6))
      setShowSuggestions(true)
    } else {
      setTickerSuggestions([])
      setShowSuggestions(false)
    }
  }

  const selectTicker = (t: string) => {
    setTicker(t)
    setCompany(TICKERS[t])
    setShowSuggestions(false)
  }

  const handleCheckout = async (tier: keyof typeof PRICING) => {
    if (!email || !name || !ticker || !company || !earningsDate) {
      alert('Please fill in all fields including the company details')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, email, customerName: name, ticker: ticker.toUpperCase(), company, earningsDate }),
      })

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout')
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
          <Link href="/" className="text-gray-300 hover:text-cyan-400 transition">
            Back to Home
          </Link>
        </div>
      </nav>

      <div className="py-20 px-4 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold text-center mb-4">Choose Your Dataset</h1>
          <p className="text-center text-gray-300 mb-16">
            Pay-per-dataset pricing. No subscriptions. No hidden fees. Get exactly what you need, when you need it.
          </p>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {(Object.entries(PRICING) as [keyof typeof PRICING, any][]).map(([key, tier]) => (
              <div
                key={key}
                className={`p-8 rounded-lg border transition cursor-pointer ${
                  selectedTier === key
                    ? 'border-cyan-500 bg-cyan-500/5 shadow-lg shadow-cyan-500/20'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                }`}
                onClick={() => setSelectedTier(key)}
              >
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <p className="text-gray-400 mb-6 text-sm">{tier.description}</p>

                <div className="mb-6">
                  <span className="text-5xl font-bold text-cyan-400">${tier.price}</span>
                  <span className="text-gray-400">/dataset</span>
                </div>

                <button
                  onClick={() => setSelectedTier(key)}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg mb-6 transition"
                >
                  Select
                </button>

                <ul className="space-y-3">
                  {key === 'lite' && (
                    <>
                      <li className="flex items-start text-gray-300">
                        <span className="text-cyan-400 mr-3">✓</span>
                        CSV dataset download
                      </li>
                      <li className="flex items-start text-gray-300">
                        <span className="text-cyan-400 mr-3">✓</span>
                        EPS & Revenue surprise %
                      </li>
                      <li className="flex items-start text-gray-300">
                        <span className="text-cyan-400 mr-3">✓</span>
                        Guidance analysis
                      </li>
                    </>
                  )}
                  {key === 'premium' && (
                    <>
                      <li className="flex items-start text-gray-300">
                        <span className="text-cyan-400 mr-3">✓</span>
                        Full JSON dataset
                      </li>
                      <li className="flex items-start text-gray-300">
                        <span className="text-cyan-400 mr-3">✓</span>
                        Detailed analysis report
                      </li>
                      <li className="flex items-start text-gray-300">
                        <span className="text-cyan-400 mr-3">✓</span>
                        Sentiment analysis
                      </li>
                      <li className="flex items-start text-gray-300">
                        <span className="text-cyan-400 mr-3">✓</span>
                        Insider tracking
                      </li>
                    </>
                  )}
                  {key === 'pro' && (
                    <>
                      <li className="flex items-start text-gray-300">
                        <span className="text-cyan-400 mr-3">✓</span>
                        Everything in Premium
                      </li>
                      <li className="flex items-start text-gray-300">
                        <span className="text-cyan-400 mr-3">✓</span>
                        30-min Zoom consultation
                      </li>
                      <li className="flex items-start text-gray-300">
                        <span className="text-cyan-400 mr-3">✓</span>
                        Custom analysis
                      </li>
                      <li className="flex items-start text-gray-300">
                        <span className="text-cyan-400 mr-3">✓</span>
                        Priority support
                      </li>
                    </>
                  )}
                </ul>
              </div>
            ))}
          </div>

          {/* Checkout Form */}
          <div className="max-w-md mx-auto bg-slate-800 border border-slate-700 p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-6">Complete Your Order</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-gray-300 mb-2 text-sm">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2 text-sm">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="border-t border-slate-600 pt-4">
                <p className="text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">Company to Analyze</p>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="relative" ref={tickerRef}>
                    <label className="block text-gray-300 mb-2 text-sm">Ticker Symbol</label>
                    <input
                      type="text"
                      value={ticker}
                      onChange={(e) => handleTickerInput(e.target.value)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                      placeholder="NVDA"
                      maxLength={10}
                      autoComplete="off"
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none uppercase"
                    />
                    {showSuggestions && tickerSuggestions.length > 0 && (
                      <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl overflow-hidden">
                        {tickerSuggestions.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onMouseDown={() => selectTicker(t)}
                            className="w-full text-left px-3 py-2 hover:bg-slate-700 flex justify-between items-center"
                          >
                            <span className="text-cyan-400 font-bold text-sm">{t}</span>
                            <span className="text-gray-400 text-xs truncate ml-2">{TICKERS[t]}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm">Earnings Date</label>
                    <input
                      type="date"
                      value={earningsDate}
                      onChange={(e) => setEarningsDate(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-300 mb-2 text-sm">Company Name</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="NVIDIA Corporation"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-slate-700/50 p-4 rounded">
                <p className="text-gray-300 text-sm">
                  <strong>Selected:</strong> {PRICING[selectedTier].name}
                </p>
                <p className="text-cyan-400 font-bold text-xl">
                  ${PRICING[selectedTier].price}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleCheckout(selectedTier)}
              disabled={loading || !email || !name || !ticker || !company || !earningsDate}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : `Pay $${PRICING[selectedTier].price}`}
            </button>

            <p className="text-xs text-gray-500 mt-6 text-center">
              ⚠️ Educational analysis only. Not investment advice. Always consult a financial advisor.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}