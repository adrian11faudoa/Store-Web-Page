import jwt from 'jsonwebtoken'
import { randomUUID } from 'crypto'
import { env } from '../config/env.js'

export function createAccessToken(user) {
  return jwt.sign(
    { sub: String(user.id), email: user.email, role: user.role },
    env.accessTokenSecret,
    { expiresIn: env.accessTokenTtl }
  )
}

export function createRefreshToken(user, tokenId = randomUUID()) {
  return {
    tokenId,
    token: jwt.sign(
      { sub: String(user.id), type: 'refresh', jti: tokenId, role: user.role },
      env.refreshTokenSecret,
      { expiresIn: env.refreshTokenTtl }
    ),
  }
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.accessTokenSecret)
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.refreshTokenSecret)
}
