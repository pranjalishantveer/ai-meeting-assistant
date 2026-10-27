import { Router, type Request, type Response, type NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma.js'

// Lets every route handler read req.userId once requireAuth has run.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string
    }
  }
}

const COOKIE_NAME = 'token'
const TOKEN_TTL = '7d'

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is not set. Add it to server/.env')
  }
  return secret
}

function signToken(userId: string): string {
  return jwt.sign({ userId }, getJwtSecret(), { expiresIn: TOKEN_TTL })
}

function setAuthCookie(res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  })
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE_NAME]
  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Not logged in' })
  }

  try {
    const payload = jwt.verify(token, getJwtSecret()) as { userId: string }
    req.userId = payload.userId
    next()
  } catch {
    return res.status(401).json({ status: 'error', message: 'Session expired, please log in again' })
  }
}

export const authRouter = Router()

authRouter.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body as {
      name?: string
      email?: string
      password?: string
    }

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ status: 'error', message: 'Name, email, and password are all required.' })
    }
    if (password.length < 8) {
      return res.status(400).json({ status: 'error', message: 'Password must be at least 8 characters.' })
    }

    const normalizedEmail = email.trim().toLowerCase()

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existing) {
      return res.status(409).json({ status: 'error', message: 'An account with that email already exists.' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { name: name.trim(), email: normalizedEmail, passwordHash },
    })

    setAuthCookie(res, signToken(user.id))
    res.status(201).json({ id: user.id, name: user.name, email: user.email })
  } catch (err) {
    res.status(500).json({ status: 'error', message: err instanceof Error ? err.message : 'Signup failed' })
  }
})

authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string }

    if (!email?.trim() || !password) {
      return res.status(400).json({ status: 'error', message: 'Email and password are required.' })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })

    const invalid = { status: 'error', message: 'Invalid email or password.' }
    if (!user) return res.status(401).json(invalid)

    const passwordOk = await bcrypt.compare(password, user.passwordHash)
    if (!passwordOk) return res.status(401).json(invalid)

    setAuthCookie(res, signToken(user.id))
    res.json({ id: user.id, name: user.name, email: user.email })
  } catch (err) {
    res.status(500).json({ status: 'error', message: err instanceof Error ? err.message : 'Login failed' })
  }
})

authRouter.post('/logout', (_req, res) => {
  res.clearCookie(COOKIE_NAME, { path: '/' })
  res.json({ status: 'ok' })
})

authRouter.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  if (!user) return res.status(401).json({ status: 'error', message: 'Not logged in' })
  res.json({ id: user.id, name: user.name, email: user.email })
})