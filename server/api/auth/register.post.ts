import { users, wallets } from '../../database/schema'
import { hashPw, generateToken } from '../../utils/auth'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validate input
  const { email, password, fullName, companyName } = body

  if (!email || !password || !fullName) {
    throw createError({
      statusCode: 400,
      message: 'Email, password, dan nama lengkap harus diisi',
    })
  }

  if (password.length < 8) {
    throw createError({
      statusCode: 400,
      message: 'Password minimal 8 karakter',
    })
  }

  const db = event.context.db

  // Check if email already exists
  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (existingUser.length > 0) {
    throw createError({
      statusCode: 409,
      message: 'Email sudah terdaftar',
    })
  }

  // Hash password and create user
  const passwordHash = await hashPw(password)

  const [newUser] = await db.insert(users).values({
    email,
    fullName,
    companyName: companyName || null,
    passwordHash,
  }).returning()

  if (!newUser) {
    throw createError({
      statusCode: 500,
      message: 'Gagal membuat akun, silakan coba lagi',
    })
  }

  // Create wallet with 3 initial tokens
  await db.insert(wallets).values({
    userId: newUser.id,
    balance: 3,
  })

  // Generate JWT
  const token = generateToken({
    userId: newUser.id,
    email: newUser.email,
    fullName: newUser.fullName,
  })

  return {
    success: true,
    message: 'Registrasi berhasil',
    data: {
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        companyName: newUser.companyName,
      },
    },
  }
})
