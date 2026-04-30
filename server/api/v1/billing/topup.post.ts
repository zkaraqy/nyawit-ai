import midtransClient from 'midtrans-client'
import { transactions } from '../../../database/schema'
import { randomUUID } from 'node:crypto'
import { packages } from '~~/shared/package'


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

  const pkgId = Number(body.pkgId) || 1
  if (pkgId < 1) {
    throw createError({ statusCode: 400, message: 'Minimal top up 1 paket' })
  }

  const pkg = packages.find((p) => p.id === pkgId)
  if (!pkg) {
    throw createError({ statusCode: 400, message: 'Paket tidak ditemukan' })
  }

  // Define pricing: 1 package = 10 tokens = Rp 50.000
  const TOKEN_PER_PACKAGE = pkg.tokens
  const PRICE_PER_PACKAGE = pkg.price

  const tokensToAdd = TOKEN_PER_PACKAGE
  const grossAmount = PRICE_PER_PACKAGE
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
      quantity: 1,
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
