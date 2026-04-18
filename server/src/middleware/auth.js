import { ApiError } from '../lib/errors.js'
import { verifyAccessToken } from '../lib/tokens.js'

function extractToken(req) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return null
  return authHeader.slice('Bearer '.length)
}

export function optionalAuth(req, res, next) {
  const token = extractToken(req)

  if (!token) return next()

  try {
    req.auth = verifyAccessToken(token)
  } catch {}

  return next()
}

export function requireAuth(req, res, next) {
  const token = extractToken(req)

  if (!token) {
    return next(new ApiError(401, 'Authentication required'))
  }

  try {
    req.auth = verifyAccessToken(token)
    return next()
  } catch {
    return next(new ApiError(401, 'Invalid or expired access token'))
  }
}

export function requireRole(roles) {
  return (req, res, next) => {
    if (!req.auth) return next(new ApiError(401, 'Authentication required'))
    if (!roles.includes(req.auth.role)) return next(new ApiError(403, 'Insufficient permissions'))
    return next()
  }
}
