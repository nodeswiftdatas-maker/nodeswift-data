'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <main className="bg-slate-950 text-white">
      {/* Navbar */}
      <nav className="bg-slate-900/80 backdrop-blur border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center text-sm font-bold">NS</div>
            <span className="font-bold text-lg">NodeSwift Data</span>
          </div>
          <div className="hidden md:flex gap-8">
            <Link href="#pricing" className="text-gray-300 hover:text-cyan-400 transition">Pricing</Link>
            <Link href="#about" className="text-gray-300 hover:text-cyan-400 transition">About</Link>
          </div>
          <Link href="/pricing" className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-lg font-semibold transition">
            Get Data
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-block mb-4 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
            <p className="text-cyan-400 text-sm font-semibold">⚡ Earnings Data in Minutes, Not Days</p>
          </div>
          
          <h1 className="text-6xl font-bold mb-6 leading-tight">
            Earnings Data in
            <span className="text-cyan-400"> Minutes</span>, Not Days
          </h1>
          
          <p className="text-xl text-gray-300 mb-8">
            AI-powered earnings extraction and analysis. 6 specialized agents process SEC filings, transcripts, sentiment, and insider trading in 30-40 minutes. Real systems, real results.
          </p>
          
          <div className="flex gap-4 mb-12">
            <Link href="/pricing" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg transition inline-block">
              Get Data — From $29 →
            </Link>
          </div>

          <div className="flex gap-12 text-sm">
            <div>
              <p className="text-cyan-400 font-bold text-2xl">30-40 min</p>
              <p className="text-gray-400">vs 2-3 days Wall St</p>
            </div>
            <div>
              <p className="text-cyan-400 font-bold text-2xl">92nd %ile</p>
              <p className="text-gray-400">surprise accuracy</p>
            </div>
          </div>
        </div>

        {/* Mobile Mockup */}
        <div className="relative">
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl border border-slate-700 shadow-2xl p-4 max-w-sm mx-auto">
            <div className="bg-slate-900 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400">NVDA Q4 2024</span>
                <span className="text-green-400 font-bold">+8.2% Surprise</span>
              </div>
              <div className="border-t border-slate-800 pt-4">
                <p className="text-gray-400 text-xs mb-2">Analysis Ready</p>
                <p className="text-2xl font-bold">38 min</p>
              </div>
              <div className="border-t border-slate-800 pt-4">
                <p className="text-gray-400 text-xs mb-3">Key Metrics</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>EPS Beat</span>
                    <span className="text-green-400">+7.8%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Guidance</span>
                    <span className="text-cyan-400">Positive</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-900/50 py-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">
            6 specialized AI agents work in parallel to extract and analyze earnings data
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'SEC Filing Extraction', desc: '10-K, 10-Q documents parsed in seconds', icon: '📄' },
              { title: 'Transcript Analysis', desc: 'Earnings call sentiment and key metrics extracted', icon: '🎙️' },
              { title: 'Consensus Comparison', desc: 'Actual vs expected: revenue, EPS, guidance', icon: '📊' },
              { title: 'Sentiment Aggregation', desc: 'Market tone analysis: bullish, bearish, neutral', icon: '💭' },
              { title: 'Insider Tracking', desc: 'Executive trades and form 4 filings', icon: '👔' },
              { title: 'Investment Thesis', desc: 'AI-generated summary with signal strength', icon: '🎯' },
            ].map((item, i) => (
              <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-cyan-500/50 transition">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20" id="pricing">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">Simple Pricing</h2>
          <p className="text-center text-gray-400 mb-16">Pay per dataset. No subscriptions. No hidden fees.</p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { name: 'Data Lite', price: '$29', desc: 'Quick summary', features: ['CSV download', 'EPS surprise %', 'Guidance'] },
              { name: 'Data Premium', price: '$99', desc: 'Full analysis', features: ['JSON dataset', 'Detailed report', 'Sentiment', 'Insider tracking'], highlight: true },
              { name: 'Data Pro', price: '$199', desc: 'Expert consultation', features: ['Everything Premium', '30-min consultation', 'Custom analysis'] },
            ].map((tier, i) => (
              <div key={i} className={`rounded-lg p-8 border transition ${tier.highlight ? 'border-cyan-500 bg-cyan-500/5 shadow-lg shadow-cyan-500/20' : 'border-slate-700 bg-slate-800/50'}`}>
                {tier.highlight && <div className="text-cyan-400 text-sm font-bold mb-4">★ MOST POPULAR</div>}
                <h3 className="font-bold text-2xl mb-2">{tier.name}</h3>
                <p className="text-gray-400 text-sm mb-6">{tier.desc}</p>
                <p className="text-4xl font-bold text-cyan-400 mb-6">{tier.price}</p>
                <Link href="/pricing" className={`w-full block text-center py-2 rounded-lg font-bold mb-6 transition ${tier.highlight ? 'bg-cyan-500 hover:bg-cyan-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}>
                  Get Data
                </Link>
                <ul className="space-y-3">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-start text-gray-300 text-sm">
                      <span className="text-cyan-400 mr-3">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/pricing" className="inline-block bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg transition">
              View All Pricing & Get Data
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-slate-900/50 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm font-bold mb-8">TRUSTED BY ACTIVE TRADERS</p>
          <div className="flex justify-center gap-6 mb-4">
            {['A', 'B', 'C', 'D'].map((letter) => (
              <div key={letter} className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
                {letter}
              </div>
            ))}
          </div>
          <p className="text-gray-400">Join professionals using NodeSwift</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Start with Data Lite for $29. Upgrade anytime.
          </p>
          <Link href="/pricing" className="inline-block bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition">
            Get Data Now →
          </Link>
          <p className="text-gray-500 text-sm mt-8">
            ⚠️ Educational analysis only. Always consult a financial advisor before trading.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <p>© 2026 NodeSwift Data. All rights reserved.</p>
          <p className="mt-4">⚠️ Educational analysis only. Not investment advice. Always consult a financial advisor.</p>
        </div>
      </footer>
    </main>
  )
}
