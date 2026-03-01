import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '')

interface OrderConfirmationData {
  order_id: string
  tier: string
  amount: number
}

export async function sendOrderConfirmationEmail(
  email: string,
  data: OrderConfirmationData
) {
  const tierNames = {
    lite: 'Data Lite ($29)',
    premium: 'Data Premium ($99)',
    pro: 'Data Pro ($199)',
  }

  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL || 'orders@nodeswiftdata.com',
    subject: '✅ Your Earnings Analysis Order is Confirmed',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #00d4ff;">Order Confirmed</h1>
        
        <p>Thank you for your purchase!</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Order ID:</strong> ${data.order_id}</p>
          <p><strong>Package:</strong> ${tierNames[data.tier as keyof typeof tierNames] || 'Data Lite'}</p>
          <p><strong>Amount:</strong> $${data.amount.toFixed(2)}</p>
        </div>

        <p>Your analysis is being processed by our AI agents. You'll receive your results within 30-40 minutes.</p>

        <p>Download your data from your dashboard: <a href="https://nodeswiftdata.com/dashboard">View Dashboard</a></p>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        
        <p style="font-size: 12px; color: #666;">
          ⚠️ <strong>Disclaimer:</strong> This is educational analysis only. Not investment advice. 
          Always consult a financial advisor before trading.
        </p>
      </div>
    `,
  }

  try {
    await sgMail.send(msg)
    console.log('Order confirmation email sent to:', email)
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

export async function sendAnalysisCompleteEmail(
  email: string,
  analysisData: any
) {
  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL || 'orders@nodeswiftdata.com',
    subject: '📊 Your Earnings Analysis is Ready',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #00d4ff;">Analysis Complete ✅</h1>
        
        <p>Your earnings analysis for <strong>${analysisData.ticker}</strong> is ready!</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>${analysisData.company}</h3>
          <p><strong>EPS Beat:</strong> ${analysisData.eps_beat}%</p>
          <p><strong>Sentiment:</strong> ${analysisData.sentiment}</p>
          <p><strong>Confidence Score:</strong> ${analysisData.confidence}%</p>
        </div>

        <p><a href="https://nodeswiftdata.com/dashboard" style="background: #00d4ff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
          View Full Analysis
        </a></p>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 12px; color: #666;">
          ⚠️ Educational use only. Not investment advice.
        </p>
      </div>
    `,
  }

  try {
    await sgMail.send(msg)
    console.log('Analysis email sent to:', email)
  } catch (error) {
    console.error('Error sending analysis email:', error)
    throw error
  }
}