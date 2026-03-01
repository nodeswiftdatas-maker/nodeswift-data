'use client'

import Link from 'next/link'

export default function SuccessPage() {
  return (
    <main className="bg-slate-950 text-white min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <h1 className="text-4xl font-bold mb-4">✅ Payment Successful</h1>
        <p className="text-gray-300 mb-6">
          Thank you! Your order has been received. Check your email for details.
        </p>
        <p className="text-gray-400 mb-8">
          Your analysis will be ready in 30-40 minutes.
        </p>
        <Link href="/" className="inline-block bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg">
          Back to Home
        </Link>
      </div>
    </main>
  )
}