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
            <Link href="#how-it-works" className="text-gray-300 hover:text-cyan-400 transition">How It Works</Link>
            <Link href="#pricing" className="text-gray-300 hover:text-cyan-400 transition">Pricing</Link>
            <Link href="#faq" className="text-gray-300 hover:text-cyan-400 transition">FAQ</Link>
          </div>
          <Link href="/pricing" className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-lg font-semibold transition">
            Get Data
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 py-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-block mb-4 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
            <p className="text-cyan-400 text-sm font-semibold">⚡ AI-Powered Earnings Intelligence</p>
          </div>
          <h1 className="text-6xl font-bold mb-6 leading-tight">
            Earnings Data in <span className="text-cyan-400">Minutes</span>, Not Days
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            6 specialized AI agents process SEC filings, transcripts, sentiment, and insider trading in 30-40 minutes. The edge Wall Street pays thousands for — starting at $29.
          </p>
          <div className="flex gap-4 mb-12">
            <Link href="/pricing" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg transition">
              Get Data — From $29 →
            </Link>
          </div>
          <div className="flex gap-12 text-sm">
            <div>
              <p className="text-cyan-400 font-bold text-2xl">30-40 min</p>
              <p className="text-gray-400">vs 2-3 days manually</p>
            </div>
            <div>
              <p className="text-cyan-400 font-bold text-2xl">6 agents</p>
              <p className="text-gray-400">working in parallel</p>
            </div>
            <div>
              <p className="text-cyan-400 font-bold text-2xl">$29</p>
              <p className="text-gray-400">starting price</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 rounded-2xl border border-slate-700 p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Live Analysis — NVDA Q4 2024</span>
            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full font-bold">● Complete</span>
          </div>
          <div className="space-y-3">
            {[
              { label: 'EPS Surprise', value: '+7.8%', color: 'text-green-400' },
              { label: 'Revenue Beat', value: '+12.3%', color: 'text-green-400' },
              { label: 'Guidance', value: 'Raised ↑', color: 'text-cyan-400' },
              { label: 'Sentiment', value: 'Bullish', color: 'text-cyan-400' },
              { label: 'Insider Activity', value: 'Net Buying', color: 'text-green-400' },
              { label: 'Signal Strength', value: '87/100', color: 'text-yellow-400' },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-slate-800">
                <span className="text-gray-400 text-sm">{item.label}</span>
                <span className={`font-bold text-sm ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-slate-800 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">AI Investment Thesis</p>
            <p className="text-sm text-gray-200">Strong beat across all metrics. Management raised guidance citing data center demand surge. Bullish setup for next quarter.</p>
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">⏱ Analysis completed in 38 minutes</p>
        </div>
      </section>

      {/* Problem Section */}
      <section className="bg-slate-900/50 border-t border-slate-800 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">The Problem With Earnings Research</h2>
              <div className="space-y-4">
                {[
                  { icon: '⏰', text: 'Reading a full earnings transcript takes 2-3 hours manually' },
                  { icon: '💸', text: 'Bloomberg Terminal costs $24,000/year — out of reach for most' },
                  { icon: '😵', text: 'SEC filings are dense, technical, and easy to misinterpret' },
                  { icon: '🐢', text: 'By the time you finish, the market has already moved' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                    <span className="text-2xl">{item.icon}</span>
                    <p className="text-gray-300">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-bold mb-6 text-cyan-400">The NodeSwift Solution</h2>
              <div className="space-y-4">
                {[
                  { icon: '⚡', text: 'Full earnings analysis delivered in 30-40 minutes' },
                  { icon: '💰', text: 'Starting at $29 per dataset — pay only for what you need' },
                  { icon: '🤖', text: '6 AI agents parse, extract, and synthesize everything automatically' },
                  { icon: '🎯', text: 'Actionable signal with confidence score — ready to trade' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-4">
                    <span className="text-2xl">{item.icon}</span>
                    <p className="text-gray-300">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">
            6 specialized AI agents work in parallel — you get a complete picture in under 40 minutes
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '📄', title: 'SEC Filing Extraction', desc: '10-K and 10-Q documents parsed and structured automatically. Key financial figures extracted with precision.' },
              { icon: '🎙️', title: 'Transcript Analysis', desc: 'Earnings call tone, management language, and key metrics analyzed. Detects hedging, confidence, and forward guidance signals.' },
              { icon: '📊', title: 'Consensus Comparison', desc: 'Actual results vs Wall Street estimates. EPS surprise %, revenue beat/miss, and guidance vs consensus.' },
              { icon: '💭', title: 'Sentiment Aggregation', desc: 'Market tone across news, social, and analyst reports. Bullish, bearish, or neutral scoring with confidence.' },
              { icon: '👔', title: 'Insider Tracking', desc: 'Form 4 filings analyzed. Executive buy/sell patterns over 90 days — a leading indicator institutions track.' },
              { icon: '🎯', title: 'Investment Thesis', desc: 'AI-generated summary synthesizing all 5 agents. Signal strength score 0-100 with actionable recommendation.' },
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

      {/* Pricing */}
      <section className="bg-slate-900/50 border-t border-slate-800 py-20" id="pricing">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">Simple Pricing</h2>
          <p className="text-center text-gray-400 mb-16">Pay per dataset. No subscriptions. No hidden fees.</p>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { name: 'Data Lite', price: '$29', desc: 'Quick summary for rapid decisions', features: ['CSV dataset download', 'EPS & Revenue surprise %', 'Guidance analysis', 'Delivery in 30-40 min'] },
              { name: 'Data Premium', price: '$99', desc: 'Complete analysis for serious traders', features: ['Full JSON dataset', 'Detailed analysis report', 'Sentiment analysis', 'Insider tracking', 'Investment thesis', 'Delivery in 30-40 min'], highlight: true },
              { name: 'Data Pro', price: '$199', desc: 'Full service with expert consultation', features: ['Everything in Premium', '30-min Zoom consultation', 'Custom analysis request', 'Priority delivery', 'Direct support'] },
            ].map((tier, i) => (
              <div key={i} className={`rounded-lg p-8 border ${tier.highlight ? 'border-cyan-500 bg-cyan-500/5 shadow-lg shadow-cyan-500/20' : 'border-slate-700 bg-slate-800/50'}`}>
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
                      <span className="text-cyan-400 mr-3">✓</span>{f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20" id="faq">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              { q: 'How long does analysis take?', a: 'Most analyses are delivered in 30-40 minutes. Complex requests may take up to 60 minutes.' },
              { q: 'What companies can you analyze?', a: 'Any publicly traded US company that files with the SEC and holds earnings calls. S&P 500, NASDAQ, and NYSE listed companies.' },
              { q: 'Is this investment advice?', a: 'No. NodeSwift Data provides educational analysis only. Always consult a licensed financial advisor before making investment decisions.' },
              { q: 'What format is the data delivered in?', a: 'Data Lite delivers CSV. Data Premium and Pro deliver full JSON datasets plus a formatted PDF report.' },
              { q: 'How do I receive my analysis?', a: 'You receive an email with your download link within 30-40 minutes of your order.' },
              { q: 'Can I request a refund?', a: 'If your analysis is not delivered within 60 minutes, we offer a full refund. Contact support.' },
            ].map((item, i) => (
              <div key={i} className="border border-slate-700 rounded-lg p-6 bg-slate-800/30">
                <h3 className="font-bold text-lg mb-2">{item.q}</h3>
                <p className="text-gray-400">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-slate-900/50 border-t border-slate-800 py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6">Ready to Get the Edge?</h2>
          <p className="text-xl text-gray-300 mb-8">Start with Data Lite for $29. Full analysis in 30-40 minutes.</p>
          <Link href="/pricing" className="inline-block bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-10 rounded-lg text-lg transition">
            Get Data Now →
          </Link>
          <p className="text-gray-500 text-sm mt-6">⚠️ Educational analysis only. Not investment advice.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <p className="font-bold text-white mb-2">NodeSwift Data</p>
          <p>© 2026 NodeSwift Data. All rights reserved.</p>
          <p className="mt-4">⚠️ Educational analysis only. Not investment advice. Always consult a financial advisor.</p>
        </div>
      </footer>
    </main>
  )
}
