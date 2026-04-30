import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { JWTPayload } from '../types/index.d.ts'

const SALT_ROUNDS = 10

/**
 * Hash a plain text password
 */
export async function hashPw(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Verify a plain text password against a hash
 */
export async function verifyPw(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  const config = useRuntimeConfig()
  return jwt.sign(payload, config.sessionSecret, {
    expiresIn: '7d',
  })
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const config = useRuntimeConfig()
    return jwt.verify(token, config.sessionSecret) as JWTPayload
  } catch {
    return null
  }
}

/**
 * Extract bearer token from Authorization header
 */
export function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.slice(7)
}
