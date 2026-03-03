export async function GET() {
  const apiKey = process.env.KIMI_API_KEY

  if (!apiKey) {
    return Response.json({ error: 'KIMI_API_KEY not set' }, { status: 500 })
  }

  const keyPreview = apiKey.slice(0, 10) + '...' + apiKey.slice(-6)

  try {
    const response = await fetch('https://api.moonshot.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'moonshot-v1-8k',
        messages: [{ role: 'user', content: 'Reply with exactly the word: WORKING' }],
        max_tokens: 10,
        temperature: 0,
      }),
    })

    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content ?? null

    return Response.json({
      http_status: response.status,
      key_preview: keyPreview,
      success: response.ok,
      content,
      error: data?.error ?? null,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return Response.json({ key_preview: keyPreview, network_error: msg }, { status: 500 })
  }
}
