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

export async function requestPhoneCode(req, res) {
  const result = await authService.requestPhoneCode(req.validated.body)
  return sendSuccess(res, result)
}

export async function verifyPhoneCode(req, res) {
  const result = await authService.verifyPhoneCode(req.validated.body, getRequestMeta(req))
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
