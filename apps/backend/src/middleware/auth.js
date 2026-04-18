import { USER_ROLES } from '@store/config'
import { verifyAccessToken } from '../utils/tokens.js'
import { AppError } from '../utils/app-error.js'
import { env } from '../config/env.js'

function getAccessToken(req) {
  return req.cookies[env.cookieNames.accessToken]
}

export function optionalAuth(req, _res, next) {
  const token = getAccessToken(req)

  if (!token) {
    return next()
  }

  try {
    req.auth = verifyAccessToken(token)
  } catch {
    req.auth = null
  }

  return next()
}

export function requireAuth(req, _res, next) {
  const token = getAccessToken(req)

  if (!token) {
    return next(new AppError(401, 'Authentication required'))
  }

  try {
    req.auth = verifyAccessToken(token)
    return next()
  } catch {
    return next(new AppError(401, 'Session is invalid or expired'))
  }
}

export function requireRole(role = USER_ROLES.ADMIN) {
  return (req, _res, next) => {
    if (!req.auth) {
      return next(new AppError(401, 'Authentication required'))
    }

    if (req.auth.role !== role) {
      return next(new AppError(403, 'Insufficient permissions'))
    }

    return next()
  }
}
