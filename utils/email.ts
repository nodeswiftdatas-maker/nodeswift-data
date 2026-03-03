import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '')

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nodeswift-data.vercel.app'
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'nodeswiftdatas@gmail.com'

interface OrderConfirmationData {
  order_id: string
  tier: string
  amount: number
}

interface AnalysisCompleteData {
  ticker: string
  company: string
  eps_beat: number
  sentiment: string
  confidence: number
}

export async function sendOrderConfirmationEmail(email: string, data: OrderConfirmationData) {
  const tierNames: Record<string, string> = {
    lite: 'Data Lite ($29)',
    premium: 'Data Premium ($99)',
    pro: 'Data Pro ($199)',
  }

  await sgMail.send({
    to: email,
    from: FROM_EMAIL,
    subject: '✅ Your Earnings Analysis Order is Confirmed',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background:#0f172a; color:#e2e8f0; padding:32px; border-radius:12px;">
        <h1 style="color:#22d3ee; margin-bottom:8px;">Order Confirmed</h1>
        <p style="color:#94a3b8;">Thank you for your purchase!</p>

        <div style="background:#1e293b; padding:20px; border-radius:8px; margin:24px 0; border:1px solid #334155;">
          <p><strong>Order ID:</strong> <span style="font-family:monospace;color:#94a3b8;">${data.order_id?.slice(0,8)}...</span></p>
          <p><strong>Package:</strong> ${tierNames[data.tier] || data.tier}</p>
          <p><strong>Amount:</strong> $${data.amount.toFixed(2)}</p>
        </div>

        <p>Your AI analysis is being processed. You&apos;ll receive the results within 30–40 minutes.</p>

        <a href="${APP_URL}/dashboard" style="display:inline-block;background:#22d3ee;color:#0f172a;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;margin-top:16px;">
          Track My Order
        </a>

        <p style="font-size:12px;color:#475569;margin-top:32px;">
          ⚠️ Educational analysis only. Not investment advice.
        </p>
      </div>
    `,
  })
  console.log('[EMAIL] Confirmation sent to:', email)
}

export async function sendAnalysisCompleteEmail(email: string, data: AnalysisCompleteData) {
  await sgMail.send({
    to: email,
    from: FROM_EMAIL,
    subject: `📊 Your ${data.ticker} Analysis is Ready`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background:#0f172a; color:#e2e8f0; padding:32px; border-radius:12px;">
        <h1 style="color:#22d3ee; margin-bottom:8px;">Analysis Complete ✅</h1>
        <p style="color:#94a3b8;">Your earnings analysis for <strong style="color:white;">${data.ticker}</strong> is ready.</p>

        <div style="background:#1e293b; padding:20px; border-radius:8px; margin:24px 0; border:1px solid #334155;">
          <p style="font-size:18px;font-weight:bold;">${data.company}</p>
          <p><strong>EPS Beat:</strong> <span style="color:${data.eps_beat >= 0 ? '#22c55e' : '#ef4444'}">${data.eps_beat >= 0 ? '+' : ''}${data.eps_beat}%</span></p>
          <p><strong>Sentiment:</strong> ${data.sentiment}</p>
          <p><strong>Signal Strength:</strong> ${data.confidence}/100</p>
        </div>

        <a href="${APP_URL}/dashboard" style="display:inline-block;background:#22d3ee;color:#0f172a;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;">
          View Full Analysis
        </a>

        <p style="font-size:12px;color:#475569;margin-top:32px;">
          ⚠️ Educational analysis only. Not investment advice.
        </p>
      </div>
    `,
  })
  console.log('[EMAIL] Analysis sent to:', email)
}
