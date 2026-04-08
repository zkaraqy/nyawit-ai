import { transactions, wallets } from '../../../database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const db = event.context.db
  const body = await readBody(event)

  const amount = Number(body.amount) || 1
  if (amount < 1) {
    throw createError({ statusCode: 400, message: 'Minimal token untuk deduksi adalah 1' })
  }

  // Deduct in a transaction
  return await db.transaction(async (tx) => {
    // 1. Get current wallet inside transaction
    const walletList = await tx.select().from(wallets).where(eq(wallets.userId, user.id)).limit(1)
    if (!walletList.length) {
      throw createError({ statusCode: 404, message: 'Wallet tidak ditemukan' })
    }

    const wallet = walletList[0]

    if(!wallet) {
      throw createError({ statusCode: 404, message: 'Wallet tidak ditemukan' })
    }

    // 2. Check balance
    if (wallet.balance < amount) {
      throw createError({ statusCode: 400, message: 'Saldo token tidak mencukupi' })
    }

    // 3. Deduct balance
    const newBalance = wallet.balance - amount
    await tx.update(wallets).set({ balance: newBalance }).where(eq(wallets.id, wallet.id))

    // 4. Record transaction log
    await tx.insert(transactions).values({
      userId: user.id,
      amount: amount,
      type: 'deduct',
      status: 'success',
      description: body.description || `Penggunaan ${amount} Token`
    })

    return {
      success: true,
      message: `${amount} Token berhasil digunakan`,
      data: {
        newBalance
      }
    }
  })
})
