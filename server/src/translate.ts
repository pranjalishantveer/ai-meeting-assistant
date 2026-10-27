import OpenAI from 'openai'
import type { TranscriptSegmentResult } from './groq.js'

// Same lazy-init pattern as groq.ts -- must not read process.env at module
// load time, since dotenv.config() hasn't run yet at that point.
let groqClient: OpenAI | null = null

function getGroqClient(): OpenAI {
  if (!groqClient) {
    groqClient = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    })
  }
  return groqClient
}

// Whisper's translate mode only ever outputs English. To get a transcript in
// any other target language, we take the English segments Whisper already
// produced and run them through an LLM in one batch request, asking it to
// translate each line while preserving order -- much cheaper and faster than
// one request per segment, and keeps every segment's timestamp intact.
export async function translateSegments(
  segments: TranscriptSegmentResult[],
  targetLanguageLabel: string,
): Promise<TranscriptSegmentResult[]> {
  if (segments.length === 0) return segments

  const numbered = segments.map((s, i) => `${i + 1}. ${s.text}`).join('\n')

  const prompt = `Translate each numbered line below into ${targetLanguageLabel}. Keep the same number of lines, in the same order, one translation per line, with no numbering in your output and no extra commentary. Respond with strict JSON only, in this exact shape: {"lines": ["translation 1", "translation 2", ...]}

${numbered}`

  const response = await getGroqClient().chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.2,
  })

  const raw = response.choices[0]?.message?.content ?? '{}'

  let lines: string[] = []
  try {
    const parsed = JSON.parse(raw) as { lines?: unknown }
    if (Array.isArray(parsed.lines)) {
      lines = parsed.lines.map((l) => String(l))
    }
  } catch {
    // fall through -- lines stays empty, handled below
  }

  if (lines.length !== segments.length) {
    console.error(
      `Translation line count mismatch: expected ${segments.length}, got ${lines.length}. Keeping English text.`,
    )
    return segments
  }

  return segments.map((s, i) => ({ ...s, text: lines[i].trim() }))
}