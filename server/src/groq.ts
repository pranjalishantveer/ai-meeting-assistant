import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
import { uploadsDir } from './upload.js'

// Groq hosts Whisper and exposes an OpenAI-compatible API, so the official
// OpenAI SDK works here too -- just point it at Groq's base URL and use a Groq key.
//
// Built lazily (not at module load time) because ES module imports are all
// evaluated before any top-level code in index.ts runs -- including
// dotenv.config(). Building this eagerly would read process.env.GROQ_API_KEY
// before the .env file had actually been loaded into it.
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

export type TranscriptSegmentResult = {
  text: string
  startMs: number
}

export type TranscriptionResult = {
  fullText: string
  segments: TranscriptSegmentResult[]
}

type VerboseTranscription = {
  text: string
  segments?: { text: string; start: number }[]
}

// Always produces English text, regardless of the spoken language -- this is
// the base step every upload goes through. If the person picked a different
// target language, src/translate.ts takes this English output and translates
// it in a second pass.
export async function transcribeAudio(filename: string): Promise<TranscriptionResult> {
  const filePath = path.join(uploadsDir, filename)

  const response = await getGroqClient().audio.translations.create({
    file: fs.createReadStream(filePath),
    model: 'whisper-large-v3',
    response_format: 'verbose_json',
  })

  const raw = response as unknown as VerboseTranscription

  const segments: TranscriptSegmentResult[] = (raw.segments ?? []).map((s) => ({
    text: s.text.trim(),
    startMs: Math.round(s.start * 1000),
  }))

  if (segments.length === 0 && raw.text) {
    segments.push({ text: raw.text.trim(), startMs: 0 })
  }

  return { fullText: raw.text, segments }
}