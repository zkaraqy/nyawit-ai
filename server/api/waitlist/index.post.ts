import { Waitlist } from "~~/server/models"
import { ApiResponse } from "~~/server/types";

export default defineEventHandler(async (event): Promise<ApiResponse<Waitlist | null>> => {
  const payload = await readBody(event)

  if (!payload.email) {
    return {
      data: null,
      message: "Email is required.",
      success: false,
    }
  }

  const { email } = payload;

  const createdWaitlistEntry = await Waitlist.create({ email }, { returning: true });

  return {
    data: createdWaitlistEntry,
    message: "Successfully added to waitlist.",
    success: true,
  }
})
