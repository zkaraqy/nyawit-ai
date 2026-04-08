import { analysisHistory, transactions, wallets } from '../../../database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const db = event.context.db
  const body = await readBody(event)

  const province = body.province || 'Unknown'
  const sizeHectares = Number(body.sizeHectares) || 1

  // 1. Transaction to guarantee atomic deduction
  const analysisRecord = await db.transaction(async (tx) => {
    
    // Check balance
    const walletList = await tx.select().from(wallets).where(eq(wallets.userId, user.id)).limit(1)
    if (!walletList.length) throw createError({ statusCode: 404, message: 'Wallet not found' })
    const wallet = walletList[0]! // fix typed inferred possible undefined

    if (wallet.balance < 1) {
      throw createError({ statusCode: 400, message: 'Saldo token tidak mencukupi untuk melakukan analisis' })
    }

    // Deduct token
    await tx.update(wallets).set({ balance: wallet.balance - 1 }).where(eq(wallets.id, wallet.id))

    // Record token usage
    await tx.insert(transactions).values({
      userId: user.id,
      amount: 1,
      type: 'deduct',
      status: 'success',
      description: `Analisis Lahan: ${province} (${sizeHectares} Ha)`
    })

    // 2. Generate Mock AI Engine Results
    // In actual app, we would process GeoJSON polys -> external Python microservice
    
    // Random metrics to mock AI analysis confidence and suitability
    const suitabilityScore = Math.floor(Math.random() * (95 - 40 + 1) + 40) // 40-95
    
    const mockMetadata = {
      soilType: ['Andosol', 'Latosol', 'Ultisol', 'Grumusol'][Math.floor(Math.random() * 4)],
      precipitationMs: Math.floor(Math.random() * 3000 + 1000), // 1000-4000 mm/year
      elevationRange: `${Math.floor(Math.random() * 50 + 10)}m - ${Math.floor(Math.random() * 400 + 200)}m`,
      recommendedCrops: ['Kelapa Sawit', 'Karet', 'Kopi', 'Cengkeh'].sort(() => 0.5 - Math.random()).slice(0, 2),
      risks: [
        { type: 'Banjir', probability: Math.random() < 0.3 ? 'Tinggi' : 'Rendah' },
        { type: 'Longsor', probability: Math.random() < 0.2 ? 'Sedang' : 'Rendah' }
      ]
    }

    // Insert analysis
    const inserted = await tx.insert(analysisHistory).values({
      userId: user.id,
      province,
      sizeHectares,
      suitabilityScore,
      resultMetadata: mockMetadata
    }).returning()

    return inserted[0]
  })

  return {
    success: true,
    data: analysisRecord
  }
})
