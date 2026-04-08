import { analysisHistory } from '../../../database/schema'
import { eq, desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const db = event.context.db

  const history = await db.select()
    .from(analysisHistory)
    .where(eq(analysisHistory.userId, user.id))
    .orderBy(desc(analysisHistory.createdAt))
    .limit(50)

  return {
    success: true,
    data: history
  }
})
