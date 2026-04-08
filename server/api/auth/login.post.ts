import { users, wallets } from '../../database/schema'
import { verifyPassword, generateToken } from '../../utils/auth'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      message: 'Email dan password harus diisi',
    })
  }

  const db = event.context.db

  // Find user by email
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Email atau password salah',
    })
  }

  // Verify password
  const isValid = await verifyPassword(password, user.passwordHash)
  if (!isValid) {
    throw createError({
      statusCode: 401,
      message: 'Email atau password salah',
    })
  }

  // Get wallet balance
  const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, user.id)).limit(1)

  // Generate JWT
  const token = generateToken({
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
  })

  return {
    success: true,
    message: 'Login berhasil',
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        companyName: user.companyName,
      },
      balance: wallet?.balance ?? 0,
    },
  }
})
