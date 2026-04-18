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
  res.json({
    data: {
      id: Number(req.auth.sub),
      email: req.auth.email,
      role: req.auth.role,
    },
  })
}
