import { transactions, wallets } from '../../../database/schema'
import { eq } from 'drizzle-orm'
import * as crypto from 'node:crypto'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const db = event.context.db

  // Midtrans sends notification payload
  const {
    order_id,
    status_code,
    gross_amount,
    signature_key,
    transaction_status,
    fraud_status
  } = body

  // Verify signature
  const serverKey = process.env.MIDTRANS_SERVER_KEY || ''
  const expectedSignature = crypto.createHash('sha512').update(`${order_id}${status_code}${gross_amount}${serverKey}`).digest('hex')

  if (signature_key !== expectedSignature) {
    throw createError({ statusCode: 400, message: 'Invalid signature' })
  }

  // Find transaction
  const txList = await db.select().from(transactions).where(eq(transactions.midtransOrderId, order_id)).limit(1)
  if (!txList.length) {
    return { success: true, message: 'Transaction not found, ignored.' } // Respond 200 OK to midtrans
  }
  const tx = txList[0]

  if (tx?.status !== 'pending') {
    return { success: true, message: 'Transaction already processed' }
  }

  // Determine final status
  let finalStatus: 'success' | 'failed' | 'pending' = 'pending'

  if (transaction_status === 'capture') {
    if (fraud_status === 'challenge') {
      finalStatus = 'pending'
    } else if (fraud_status === 'accept') {
      finalStatus = 'success'
    }
  } else if (transaction_status === 'settlement') {
    finalStatus = 'success'
  } else if (transaction_status === 'cancel' || transaction_status === 'deny' || transaction_status === 'expire') {
    finalStatus = 'failed'
  } else if (transaction_status === 'pending') {
    finalStatus = 'pending'
  }

  // If success, top up user wallet
  if (finalStatus === 'success') {
    await db.transaction(async (txDb) => {
      // 1. Update transaction status
      await txDb.update(transactions).set({ status: 'success' }).where(eq(transactions.id, tx.id))
      
      // 2. Fetch user wallet
      const walletList = await txDb.select().from(wallets).where(eq(wallets.userId, tx.userId)).limit(1)
      if (walletList.length) {
        const wallet = walletList[0]
        if (wallet) {
          await txDb.update(wallets).set({ balance: wallet.balance + tx.amount }).where(eq(wallets.id, wallet.id))
        } else {
          // If wallet not found, create one
          await txDb.insert(wallets).values({
            userId: tx.userId,
            balance: tx.amount
          })
        }
      }
    })
  } else if (finalStatus === 'failed') {
    await db.update(transactions).set({ status: 'failed' }).where(eq(transactions.id, tx.id))
  }

  return { success: true, message: 'Notification processed' }
})
