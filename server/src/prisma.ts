import { PrismaClient } from '@prisma/client'

// A single shared Prisma instance, reused across the app instead of
// creating a new database connection pool on every import.
export const prisma = new PrismaClient()
