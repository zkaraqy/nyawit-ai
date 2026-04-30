import { users } from '../../database/schema'
import { extractBearerToken, verifyToken, hashPw } from '../../utils/auth'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const authHeader = getRequestHeader(event, 'authorization')
  const token = extractBearerToken(authHeader)

  if (!token) {
    throw createError({ statusCode: 401, message: 'Token diperlukan' })
  }

  const payload = verifyToken(token)
  if (!payload || !payload.userId) {
    throw createError({ statusCode: 401, message: 'Token tidak valid' })
  }

  const body = await readBody(event)
  const { fullName, companyName, password } = body

  // Validasi input
  if (!fullName || typeof fullName !== 'string' || fullName.trim() === '') {
    throw createError({
      statusCode: 400,
      message: 'Nama lengkap wajib diisi',
    })
  }

  const db = event.context.db

  const updateData: any = {
    fullName: fullName.trim(),
    updatedAt: new Date()
  }

  if (companyName !== undefined) {
    updateData.companyName = companyName?.trim() || null
  }

//   // Jika user menyertakan password baru dan memenuhi syarat
//   if (password && password.length >= 8) {
//     updateData.passwordHash = await hashPassword(password)
//   } else if (password && password.length < 8) {
//     throw createError({
//       statusCode: 400,
//       message: 'Password baru minimal 8 karakter',
//     })
//   }

  try {
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, payload.userId))
      .returning()

    if (!updatedUser) {
      throw createError({
        statusCode: 404,
        message: 'Pengguna tidak ditemukan',
      })
    }

    return {
      message: 'Profil berhasil diperbarui',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        companyName: updatedUser.companyName,
      }
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || 'Gagal memperbarui profil',
    })
  }
})
