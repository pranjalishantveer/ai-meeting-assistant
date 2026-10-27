import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { randomUUID } from 'crypto'

export const uploadsDir = path.join(process.cwd(), 'uploads')

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.mp3'
    cb(null, `${randomUUID()}${ext}`)
  },
})

const ALLOWED_EXTENSIONS = new Set([
  '.flac',
  '.mp3',
  '.mp4',
  '.mpeg',
  '.mpga',
  '.m4a',
  '.ogg',
  '.opus',
  '.wav',
  '.webm',
])

export const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (ALLOWED_EXTENSIONS.has(ext)) {
      cb(null, true)
    } else {
      cb(new Error(`Unsupported file type: ${ext || 'unknown'}`))
    }
  },
})
