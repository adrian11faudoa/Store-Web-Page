import { AppError } from '../utils/app-error.js'
import { env } from '../config/env.js'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

export function requireCsrf(req, _res, next) {
  if (SAFE_METHODS.has(req.method)) {
    return next()
  }

  const cookieToken = req.cookies[env.cookieNames.csrf]
  const headerToken = req.headers['x-csrf-token']

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return next(new AppError(403, 'Invalid CSRF token'))
  }

  return next()
}
