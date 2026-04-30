import { analysisHistory, transactions, wallets } from '../../../database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const db = event.context.db
  const body = await readBody(event)

  const province = body.province || 'Unknown'
  const sizeHectares = Number(body.sizeHectares) || 1
  const config = useRuntimeConfig()

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

    // 2. Setup Koordinat (Bounding Box) untuk setiap Provinsi Sawit
    let latMin = -3.38, latMax = -3.27, lonMin = 114.54, lonMax = 114.65; // Default Kalimantan Selatan
    
    switch (province) {
      case 'Aceh':
        latMin = 4.0; latMax = 4.5; lonMin = 96.0; lonMax = 96.5; break;
      case 'Sumatera Utara':
        latMin = 2.0; latMax = 2.5; lonMin = 99.0; lonMax = 99.5; break;
      case 'Sumatera Barat':
        latMin = -1.0; latMax = -0.5; lonMin = 100.0; lonMax = 100.5; break;
      case 'Riau':
        latMin = 0.0; latMax = 0.5; lonMin = 101.5; lonMax = 102.0; break;
      case 'Jambi':
        latMin = -1.5; latMax = -1.0; lonMin = 103.0; lonMax = 103.5; break;
      case 'Sumatera Selatan':
        latMin = -3.0; latMax = -2.5; lonMin = 104.0; lonMax = 104.5; break;
      case 'Bengkulu':
        latMin = -3.5; latMax = -3.0; lonMin = 102.0; lonMax = 102.5; break;
      case 'Lampung':
        latMin = -5.0; latMax = -4.5; lonMin = 105.0; lonMax = 105.5; break;
      case 'Kepulauan Bangka Belitung':
        latMin = -2.5; latMax = -2.0; lonMin = 106.0; lonMax = 106.5; break;
      case 'Kepulauan Riau':
        latMin = 1.0; latMax = 1.5; lonMin = 104.0; lonMax = 104.5; break;
      case 'Kalimantan Barat':
        latMin = 0.0; latMax = 0.5; lonMin = 110.0; lonMax = 110.5; break;
      case 'Kalimantan Tengah':
        latMin = -1.5; latMax = -1.0; lonMin = 113.0; lonMax = 113.5; break;
      case 'Kalimantan Selatan':
        latMin = -3.38; latMax = -3.27; lonMin = 114.54; lonMax = 114.65; break;
      case 'Kalimantan Timur':
        latMin = 0.5; latMax = 1.0; lonMin = 116.5; lonMax = 117.0; break;
      case 'Kalimantan Utara':
        latMin = 3.0; latMax = 3.5; lonMin = 116.5; lonMax = 117.0; break;
      case 'Papua':
        latMin = -4.0; latMax = -3.5; lonMin = 138.0; lonMax = 138.5; break;
      case 'Papua Barat':
        latMin = -1.0; latMax = -0.5; lonMin = 132.0; lonMax = 132.5; break;
    }

    const shouldMockMl =
      process.env.NUXT_E2E_MOCK_ML === 'true' ||
      process.env.NUXT_E2E_MOCK_ML === '1'

    const mlResponse: any = shouldMockMl
      ? {
          suitabilityScore: 87,
          geojsondata: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: { score: 87 },
                geometry: {
                  type: 'Polygon',
                  coordinates: [
                    [
                      [lonMin, latMin],
                      [lonMax, latMin],
                      [lonMax, latMax],
                      [lonMin, latMax],
                      [lonMin, latMin],
                    ],
                  ],
                },
              },
            ],
          },
          total_points: 25,
          risks: [
            { type: 'Kelerengan', probability: 'Sedang' },
            { type: 'Curah Hujan', probability: 'Rendah' },
          ],
          soilType: 'Latosol',
          elevationRange: '0–200 mdpl',
          precipitationMs: 2400,
          recommendedCrops: ['Kelapa Sawit'],
        }
      : await $fetch((config as any).mlEngineUrl || 'https://nyawit-ai-ml-656502826232.asia-southeast2.run.app/api/scan', {
          method: 'POST',
          body: {
            lat_min: latMin,
            lat_max: latMax,
            lon_min: lonMin,
            lon_max: lonMax,
            grid_size: 5, // untuk produksi sebaiknya lebih tinggi
          },
        })

    // 3. Simpan hasil Python ke Database PostgreSQL (tabel analysisHistory)
    const scanResult = await tx.insert(analysisHistory).values({
      userId: user.id,
      province: province,
      sizeHectares: sizeHectares,
      suitabilityScore: mlResponse.suitabilityScore, // Didapat dari Python!
      resultMetadata: {
        geoJsonData: mlResponse.geojsondata, // <--- Sudah diganti mengikuti format python baru!
        totalPointsScanned: mlResponse.total_points,
        risks: mlResponse.risks,
        soilType: mlResponse.soilType,
        elevationRange: mlResponse.elevationRange,
        precipitationMs: mlResponse.precipitationMs,
        recommendedCrops: mlResponse.recommendedCrops
      }
    }).returning()

    return scanResult[0]
  })

  return {
    success: true,
    data: analysisRecord
  }
})
