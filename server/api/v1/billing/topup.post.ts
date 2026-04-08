import midtransClient from 'midtrans-client'
import { transactions } from '../../../database/schema'
import { randomUUID } from 'node:crypto'

// Initialize Midtrans Snap
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
})

export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const db = event.context.db
  const body = await readBody(event)

  const packageCount = Number(body.packageCount) || 1
  if (packageCount < 1) {
    throw createError({ statusCode: 400, message: 'Minimal top up 1 paket' })
  }

  // Define pricing: 1 package = 10 tokens = Rp 50.000
  const TOKEN_PER_PACKAGE = 10
  const PRICE_PER_PACKAGE = 50000

  const tokensToAdd = packageCount * TOKEN_PER_PACKAGE
  const grossAmount = packageCount * PRICE_PER_PACKAGE
  const orderId = `NYA-${Date.now()}-${randomUUID().substring(0, 8)}`

  // Insert a pending transaction in database
  await db.insert(transactions).values({
    userId: user.id,
    amount: tokensToAdd,
    type: 'topup',
    status: 'pending',
    description: `Top up ${tokensToAdd} Token Analisis`,
    midtransOrderId: orderId
  })

  // Create Midtrans Transaction
  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: grossAmount
    },
    customer_details: {
      first_name: user.fullName,
      email: user.email
    },
    item_details: [{
      id: "TOKEN_ANALISIS",
      price: PRICE_PER_PACKAGE,
      quantity: packageCount,
      name: `Paket ${TOKEN_PER_PACKAGE} Token Analisis NyawitAI`
    }]
  }

  try {
    const snapTransaction = await snap.createTransaction(parameter)
    
    return {
      success: true,
      data: {
        snapToken: snapTransaction.token,
        redirectUrl: snapTransaction.redirect_url
      }
    }
  } catch (error: any) {
    console.error('Midtrans Error:', error)
    throw createError({
      statusCode: 500,
      message: 'Gagal membuat transaksi dengan Midtrans'
    })
  }
})
