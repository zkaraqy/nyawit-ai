import { waitlists } from "~~/server/database/schema"
import { ApiResponse } from "~~/server/types"
import { db } from "~~/server/database/db"

export default defineEventHandler(async (event): Promise<ApiResponse<typeof waitlists.$inferSelect | null>> => {
  const payload = await readBody(event)

  if (!payload.email) {
    return {
      data: null,
      message: "Email is required.",
      success: false,
    }
  }

  const { email } = payload

  const createdWaitlistEntry = await db.insert(waitlists).values({ email }).returning()

  return {
    data: createdWaitlistEntry[0],
    message: "Successfully added to waitlist.",
    success: true,
  }
})
