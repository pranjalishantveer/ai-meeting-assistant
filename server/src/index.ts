import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import { prisma } from './prisma.js'
import { meetingsRouter } from './meetings.js'
import { authRouter } from './auth.js'
import { uploadsDir } from './upload.js'
import { SUPPORTED_LANGUAGES } from './languages.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())
app.use(cookieParser())

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  })
})

app.get('/api/db-health', async (_req, res) => {
  try {
    const meetingCount = await prisma.meeting.count()
    res.json({
      status: 'ok',
      message: 'Database connection is working',
      meetingCount,
    })
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err instanceof Error ? err.message : 'Unknown database error',
    })
  }
})

app.get('/api/languages', (_req, res) => {
  res.json(SUPPORTED_LANGUAGES)
})

app.use('/api/auth', authRouter)

app.use('/api/meetings', meetingsRouter)

app.use('/uploads', express.static(uploadsDir))

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  res.status(500).json({ status: 'error', message: err.message || 'Unexpected server error' })
})

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})