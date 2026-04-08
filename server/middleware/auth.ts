import { extractBearerToken, verifyToken } from '../utils/auth'

export default defineEventHandler((event) => {
  // Only protect /api/v1/* routes
  const url = getRequestURL(event)
  if (!url.pathname.startsWith('/api/v1')) {
    return
  }

  // Skip the Midtrans notification webhook (it uses its own auth)
  if (url.pathname === '/api/v1/billing/notification') {
    return
  }

  const authHeader = getRequestHeader(event, 'authorization')
  const token = extractBearerToken(authHeader)

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Token autentikasi diperlukan',
    })
  }

  const payload = verifyToken(token)
  if (!payload) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Token tidak valid atau sudah kadaluarsa',
    })
  }

  // Inject user context for downstream handlers
  event.context.user = {
    id: payload.userId,
    email: payload.email,
    fullName: payload.fullName,
  }
})
