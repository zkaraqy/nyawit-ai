import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import type * as schema from '../database/schema'

declare module 'h3' {
  interface H3EventContext {
    db: PostgresJsDatabase<typeof schema>
    user?: {
      id: number
      email: string
      fullName: string
    }
  }
}

interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

interface JWTPayload {
  userId: number
  email: string
  fullName: string
  iat?: number
  exp?: number
}

declare module 'midtrans-client' {
  export class Snap {
    constructor(options: { isProduction: boolean; serverKey?: string; clientKey?: string })
    createTransaction(parameter: any): Promise<{ token: string; redirect_url: string }>
  }
}