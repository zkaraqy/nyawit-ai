import { wallets } from '../../../database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const db = event.context.db

  const userWallet = await db.select().from(wallets).where(eq(wallets.userId, user.id)).limit(1)

  if (!userWallet.length) {
    throw createError({
      statusCode: 404,
      message: 'Wallet tidak ditemukan'
    })
  }

  return {
    success: true,
    data: {
      balance: userWallet[0]?.balance || 0
    }
  }
})
