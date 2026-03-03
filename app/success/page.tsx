'use client'

import Link from 'next/link'

export default function SuccessPage() {
  return (
    <main className="bg-slate-950 text-white min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">✓</div>
        <h1 className="text-4xl font-bold mb-4">Payment Successful</h1>
        <p className="text-gray-300 mb-3">
          Thank you! Your order has been received and your analysis is being prepared.
        </p>
        <p className="text-gray-400 mb-8 text-sm">
          You&apos;ll receive a confirmation email shortly. Your analysis will be ready in 30–40 minutes.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="inline-block bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            Track My Order
          </Link>
          <Link
            href="/"
            className="inline-block text-gray-400 hover:text-gray-300 py-2 transition text-sm"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}
