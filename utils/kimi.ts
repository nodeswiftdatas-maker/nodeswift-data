interface KimiAnalysisRequest {
  ticker: string
  company: string
  earningsDate: string
  analysisType: 'lite' | 'premium' | 'pro'
}

export async function analyzeEarningsWithKimi(request: KimiAnalysisRequest) {
  const apiKey = process.env.KIMI_API_KEY
  const model = process.env.KIMI_MODEL || 'moonshot-v1-8k'

  if (!apiKey) {
    throw new Error('KIMI_API_KEY not configured')
  }

  const prompt = buildAnalysisPrompt(request)

  // 40-second timeout to stay within Vercel function limits
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 40000)

  try {
    const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 800,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}))
      const errorMsg = errorBody?.error?.message || errorBody?.message || `HTTP ${response.status}`
      console.error('[KIMI] API error:', response.status, errorMsg)
      throw new Error(`Kimi API error ${response.status}: ${errorMsg}`)
    }

    const data = await response.json()
    const analysisText: string = data?.choices?.[0]?.message?.content || ''

    if (!analysisText) {
      throw new Error('Empty response from Kimi API')
    }

    console.log('[KIMI] Raw response length:', analysisText.length)
    return parseAnalysisResponse(analysisText, request)

  } catch (error: unknown) {
    clearTimeout(timeout)
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[KIMI] Request failed:', msg)
    throw new Error(msg)
  }
}

function buildAnalysisPrompt(request: KimiAnalysisRequest): string {
  return `You are a financial analyst. For ${request.company} (${request.ticker}) earnings on ${request.earningsDate}, provide a ${request.analysisType} analysis.

Respond ONLY with this JSON, no other text:
{
  "eps_beat": <number between -20 and 20>,
  "revenue_beat": <number between -10 and 10>,
  "guidance": "raised" | "lowered" | "inline",
  "management_tone": "bullish" | "neutral" | "bearish",
  "key_catalysts": ["<string>", "<string>"],
  "insider_activity": "<one sentence>",
  "thesis": "<two sentences max>",
  "signal_strength": <number 0-100>
}`
}

function parseAnalysisResponse(response: string, request: KimiAnalysisRequest) {
  // Try to extract JSON block from response
  const jsonMatch = response.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    console.error('[KIMI] No JSON in response. Raw:', response.slice(0, 200))
    throw new Error('No JSON found in Kimi response')
  }

  let analysis: Record<string, unknown>
  try {
    analysis = JSON.parse(jsonMatch[0])
  } catch {
    console.error('[KIMI] JSON parse failed. Raw:', jsonMatch[0].slice(0, 200))
    throw new Error('Failed to parse Kimi JSON response')
  }

  return {
    ticker: request.ticker,
    company: request.company,
    eps_beat: Number(analysis.eps_beat) || 0,
    revenue_beat: Number(analysis.revenue_beat) || 0,
    guidance: String(analysis.guidance || 'inline'),
    management_tone: String(analysis.management_tone || 'neutral'),
    key_catalysts: Array.isArray(analysis.key_catalysts) ? analysis.key_catalysts as string[] : [],
    insider_activity: String(analysis.insider_activity || 'N/A'),
    thesis: String(analysis.thesis || ''),
    signal_strength: Number(analysis.signal_strength) || 50,
  }
}
