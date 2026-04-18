import passport from '../config/passport.js'
import { env } from '../config/env.js'
import { issueAuthCookies, clearAuthCookies } from '../utils/cookies.js'
import { sendSuccess } from '../utils/api-response.js'
import * as authService from '../services/auth.service.js'

function getRequestMeta(req) {
  return {
    userAgent: req.headers['user-agent'] || 'unknown',
    ipAddress: req.ip,
  }
}

export async function register(req, res) {
  const result = await authService.register(req.validated.body, getRequestMeta(req))
  issueAuthCookies(res, result.accessToken, result.refreshToken)
  return sendSuccess(res, { user: result.user }, 201)
}

export async function login(req, res) {
  const result = await authService.login(req.validated.body, getRequestMeta(req))
  issueAuthCookies(res, result.accessToken, result.refreshToken)
  return sendSuccess(res, { user: result.user })
}

export async function refresh(req, res) {
  const result = await authService.refreshSession(req.cookies[env.cookieNames.refreshToken], getRequestMeta(req))
  issueAuthCookies(res, result.accessToken, result.refreshToken)
  return sendSuccess(res, { user: result.user })
}

export async function logout(req, res) {
  await authService.logout(req.cookies[env.cookieNames.refreshToken])
  clearAuthCookies(res)
  return res.status(204).send()
}

export async function me(req, res) {
  if (!req.auth?.sub) {
    return sendSuccess(res, { user: null })
  }

  const user = await authService.getCurrentUser(req.auth.sub)
  return sendSuccess(res, { user })
}

export function googleAuth(req, res, next) {
  return passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next)
}

export function googleCallback(req, res, next) {
  return passport.authenticate('google', { session: false, failureRedirect: `${env.frontendUrl}/signin?oauth=failed` })(
    req,
    res,
    async error => {
      if (error) {
        return next(error)
      }

      try {
        const result = await authService.createOauthSession(req.user, getRequestMeta(req))
        issueAuthCookies(res, result.accessToken, result.refreshToken)
        res.redirect(`${env.frontendUrl}/auth/callback?status=success`)
      } catch (callbackError) {
        next(callbackError)
      }
    },
  )
}
