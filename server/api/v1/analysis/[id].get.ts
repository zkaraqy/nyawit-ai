import { analysisHistory } from '../../../database/schema'
import { and, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const db = event.context.db
  const idStr = getRouterParam(event, 'id')
  if (!idStr) throw createError({ statusCode: 400, message: 'Missing ID' })

  const id = parseInt(idStr, 10)
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'Invalid ID' })

  const results = await db.select()
    .from(analysisHistory)
    .where(and(
      eq(analysisHistory.id, id),
      eq(analysisHistory.userId, user.id)
    ))
    .limit(1)

  if (!results.length) {
    throw createError({ statusCode: 404, message: 'Analisis tidak ditemukan' })
  }

  return {
    success: true,
    data: results[0]
  }
})
