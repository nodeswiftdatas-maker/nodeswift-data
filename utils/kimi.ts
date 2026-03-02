interface KimiMessage {
  role: 'user' | 'assistant'
  content: string
}

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

  try {
    const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Kimi API error:', error)
      throw new Error(`Kimi API error: ${error.message}`)
    }

    const data = await response.json()
    const analysisText = data.choices[0].message.content

    return parseAnalysisResponse(analysisText, request)
  } catch (error) {
    console.error('Error calling Kimi API:', error)
    throw error
  }
}

function buildAnalysisPrompt(request: KimiAnalysisRequest): string {
  return `
Analyze the earnings for ${request.company} (${request.ticker}) on ${request.earningsDate}.

Generate a ${request.analysisType} level analysis with:
1. EPS Surprise (% beat or miss vs consensus)
2. Revenue Surprise (% beat or miss vs consensus)
3. Guidance Assessment (raised, lowered, inline)
4. Management Tone (bullish, neutral, bearish)
5. Key Catalysts
6. Insider Activity Summary
7. Investment Thesis
8. Signal Strength (0-100)

Format the response as JSON with these exact fields:
{
  "ticker": "${request.ticker}",
  "company": "${request.company}",
  "eps_beat": <number>,
  "revenue_beat": <number>,
  "guidance": "<string>",
  "management_tone": "<string>",
  "key_catalysts": ["<string>"],
  "insider_activity": "<string>",
  "thesis": "<string>",
  "signal_strength": <number>
}
`
}

function parseAnalysisResponse(response: string, request: KimiAnalysisRequest) {
  try {
    // Extract JSON from response (in case there's extra text)
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const analysis = JSON.parse(jsonMatch[0])

    return {
      ticker: request.ticker,
      company: request.company,
      eps_beat: analysis.eps_beat || 0,
      revenue_beat: analysis.revenue_beat || 0,
      guidance: analysis.guidance || 'N/A',
      management_tone: analysis.management_tone || 'neutral',
      key_catalysts: analysis.key_catalysts || [],
      insider_activity: analysis.insider_activity || 'N/A',
      thesis: analysis.thesis || '',
      signal_strength: analysis.signal_strength || 0,
      analysis_data: analysis,
    }
  } catch (error) {
    console.error('Error parsing Kimi response:', error)
    throw error
  }
}