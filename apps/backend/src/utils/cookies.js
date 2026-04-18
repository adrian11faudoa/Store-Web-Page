import crypto from 'node:crypto'
import { cookieOptions, env } from '../config/env.js'

export function issueAuthCookies(res, accessToken, refreshToken) {
  res.cookie(env.cookieNames.accessToken, accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  })

  res.cookie(env.cookieNames.refreshToken, refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
}

export function clearAuthCookies(res) {
  res.clearCookie(env.cookieNames.accessToken, cookieOptions)
  res.clearCookie(env.cookieNames.refreshToken, cookieOptions)
}

export function ensureCsrfCookie(req, res, next) {
  if (!req.cookies[env.cookieNames.csrf]) {
    res.cookie(env.cookieNames.csrf, crypto.randomBytes(24).toString('hex'), {
      sameSite: 'lax',
      secure: env.isProduction,
      httpOnly: false,
      path: '/',
      ...(env.cookieDomain ? { domain: env.cookieDomain } : {}),
    })
  }

  if (!req.cookies[env.cookieNames.guestCart]) {
    res.cookie(env.cookieNames.guestCart, crypto.randomUUID(), {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    })
  }

  next()
}
