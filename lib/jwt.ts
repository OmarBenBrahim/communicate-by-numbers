import jwt from 'jsonwebtoken'
import { AuthPayload } from './types'

const SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production'

export function createToken(payload: AuthPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, SECRET) as AuthPayload
  } catch {
    return null
  }
}

export function getTokenFromRequest(req: any): string | null {
  const auth = req.headers.authorization || ''
  return auth.replace('Bearer ', '')
}
