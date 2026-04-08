import { users, wallets } from '../../database/schema'
import { extractBearerToken, verifyToken } from '../../utils/auth'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const authHeader = getRequestHeader(event, 'authorization')
  const token = extractBearerToken(authHeader)

  if (!token) {
    throw createError({ statusCode: 401, message: 'Token diperlukan' })
  }

  const payload = verifyToken(token)
  if (!payload) {
    throw createError({ statusCode: 401, message: 'Token tidak valid' })
  }

  const db = event.context.db

  const [user] = await db.select().from(users).where(eq(users.id, payload.userId)).limit(1)
  if (!user) {
    throw createError({ statusCode: 404, message: 'User tidak ditemukan' })
  }

  const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, user.id)).limit(1)

  return {
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        companyName: user.companyName,
        createdAt: user.createdAt,
      },
      balance: wallet?.balance ?? 0,
    },
  }
})
