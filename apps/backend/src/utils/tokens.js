import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export function createAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    env.accessTokenSecret,
    { expiresIn: env.accessTokenTtl },
  )
}

export function createRefreshToken(user) {
  const tokenId = crypto.randomUUID()
  const token = jwt.sign(
    {
      sub: user.id,
      type: 'refresh',
      jti: tokenId,
    },
    env.refreshTokenSecret,
    { expiresIn: env.refreshTokenTtl },
  )

  return { tokenId, token }
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.accessTokenSecret)
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.refreshTokenSecret)
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}
