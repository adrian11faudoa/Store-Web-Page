import { appConfig } from '../config/env.js'
import * as authService from '../services/auth.service.js'

function setRefreshCookie(res, refreshToken) {
  res.cookie(appConfig.cookie.refreshToken, refreshToken, {
    ...appConfig.cookie.options,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
}

function clearRefreshCookie(res) {
  res.clearCookie(appConfig.cookie.refreshToken, appConfig.cookie.options)
}

function buildSessionMeta(req) {
  return {
    userAgent: req.headers['user-agent'] || 'unknown',
    ipAddress: req.ip,
  }
}

export async function register(req, res) {
  const result = await authService.registerUser({ ...req.validated.body, ...buildSessionMeta(req) })
  setRefreshCookie(res, result.refreshToken)
  res.status(201).json({ data: { user: result.user, accessToken: result.accessToken } })
}

export async function login(req, res) {
  const result = await authService.loginUser({ ...req.validated.body, ...buildSessionMeta(req) })
  setRefreshCookie(res, result.refreshToken)
  res.json({ data: { user: result.user, accessToken: result.accessToken } })
}

export async function forgotPassword(req, res) {
  await authService.requestPasswordReset({ email: req.validated.body.email })
  res.json({ data: { message: 'If an account exists, a code has been sent.' } })
}

export async function resetPassword(req, res) {
  const { email, code, newPassword } = req.validated.body
  await authService.resetPasswordWithCode({ email, code, newPassword })
  res.json({ data: { message: 'Password updated successfully.' } })
}

export async function refresh(req, res) {
  const result = await authService.rotateRefreshToken({
    refreshToken: req.cookies[appConfig.cookie.refreshToken],
    ...buildSessionMeta(req),
  })
  setRefreshCookie(res, result.refreshToken)
  res.json({ data: { user: result.user, accessToken: result.accessToken } })
}

export async function logout(req, res) {
  const refreshToken = req.cookies[appConfig.cookie.refreshToken]
  if (refreshToken) {
    await authService.revokeRefreshToken(refreshToken)
  }
  clearRefreshCookie(res)
  res.status(204).send()
}

export async function getCurrentUser(req, res) {
  const user = await authService.getUserById(Number(req.auth.sub))
  res.json({ data: user })
}
