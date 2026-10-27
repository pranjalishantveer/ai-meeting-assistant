import { Router } from 'express'
import { prisma } from './prisma.js'
import { upload } from './upload.js'
import { transcribeAudio } from './groq.js'
import { translateSegments } from './translate.js'
import { isSupportedLanguage, languageLabel } from './languages.js'

export const meetingsRouter = Router()

// Runs after upload, without making the client wait for transcription to finish.
// Updates the meeting's status as it progresses so the dashboard can reflect it.
async function processMeeting(meetingId: string, filename: string, language: string) {
  try {
    console.log(`[${meetingId}] Starting transcription for ${filename} (target language: ${language})`)
    await prisma.meeting.update({ where: { id: meetingId }, data: { status: 'transcribing' } })

    console.log(`[${meetingId}] Calling Groq...`)
    let { segments } = await transcribeAudio(filename)
    console.log(`[${meetingId}] Groq responded with ${segments.length} segment(s)`)

    // Whisper gives English. For Hindi or Kannada, run the extra translation step.
    if (language !== 'en') {
      console.log(`[${meetingId}] Translating to ${languageLabel(language)}...`)
      try {
        segments = await translateSegments(segments, languageLabel(language))
      } catch (err) {
        console.error(`[${meetingId}] Translation failed, keeping English text:`, err)
      }
    }

    await prisma.transcriptSegment.createMany({
      data: segments.map((s) => ({
        meetingId,
        text: s.text,
        startMs: s.startMs,
      })),
    })

    await prisma.meeting.update({ where: { id: meetingId }, data: { status: 'done' } })
    console.log(`[${meetingId}] Done`)
  } catch (err) {
    console.error(`Transcription failed for meeting ${meetingId}:`, err)
    await prisma.meeting
      .update({ where: { id: meetingId }, data: { status: 'failed' } })
      .catch(() => {})
  }
}

// Upload a recorded/exported audio file and create a meeting record for it.
// Expects multipart/form-data with an "audio" file field, plus optional
// "title" and "language" text fields. Language defaults to English.
meetingsRouter.post('/', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No audio file uploaded. Expected a multipart field named "audio".',
      })
    }

    const language = ((req.body.language as string | undefined) || 'en').trim().toLowerCase()
    if (!isSupportedLanguage(language)) {
      return res.status(400).json({
        status: 'error',
        message: `Unsupported language "${language}".`,
      })
    }

    const title = (req.body.title as string | undefined)?.trim() || req.file.originalname

    const meeting = await prisma.meeting.create({
      data: {
        title,
        status: 'pending',
        audioPath: req.file.filename,
      },
    })

    res.status(201).json(meeting)

    // Intentionally not awaited -- the client gets an instant response and
    // polls /api/meetings for status updates as transcription progresses.
    void processMeeting(meeting.id, meeting.audioPath, language)
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err instanceof Error ? err.message : 'Upload failed',
    })
  }
})

// List all meetings, most recent first, for the dashboard.
meetingsRouter.get('/', async (_req, res) => {
  try {
    const meetings = await prisma.meeting.findMany({
      orderBy: { createdAt: 'desc' },
    })
    res.json(meetings)
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err instanceof Error ? err.message : 'Failed to fetch meetings',
    })
  }
})

// Get a single meeting with its transcript, summary, and action items.
// Summary and action items stay empty until Phases 5-6 are built.
meetingsRouter.get('/:id', async (req, res) => {
  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id: req.params.id },
      include: { segments: true, summary: true, actionItems: true },
    })

    if (!meeting) {
      return res.status(404).json({ status: 'error', message: 'Meeting not found' })
    }

    res.json(meeting)
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err instanceof Error ? err.message : 'Failed to fetch meeting',
    })
  }
})