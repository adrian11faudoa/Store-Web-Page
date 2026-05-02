import { findUserByEmail, findUserById, createLocalUser, listUsers } from '../repositories/user.repository.js'
import { createRefreshSession, findRefreshSession, revokeRefreshSession } from '../repositories/session.repository.js'
import { createAccessToken, createRefreshToken, hashToken, verifyRefreshToken } from '../utils/tokens.js'
import { AppError } from '../utils/app-error.js'
import { createPhoneOtpChallenge, verifyPhoneOtpChallenge } from './phone-otp.service.js'
import { sendWhatsappVerificationCode } from './whatsapp.service.js'

const INTERNAL_PHONE_EMAIL_DOMAIN = 'phone.saharakids.local'

function normalizePhone(phone) {
  const raw = String(phone || '').trim()

  if (!raw) {
    throw new AppError(422, 'Phone number is required')
  }

  const normalized = raw
    .replace(/[()\s-]/g, '')
    .replace(/^00/, '+')

  const digits = normalized.replace(/\D/g, '')
  const asE164 = `+${digits}`

  if (!/^\+[1-9]\d{9,14}$/.test(asE164)) {
    throw new AppError(422, 'Invalid phone number')
  }

  return asE164
}

function phoneToInternalEmail(phone) {
  const digits = phone.replace(/\D/g, '')
  return `wa-${digits}@${INTERNAL_PHONE_EMAIL_DOMAIN}`
}

function phoneFromInternalEmail(email) {
  const match = String(email || '').match(/^wa-(\d+)@phone\.saharakids\.local$/)
  return match ? `+${match[1]}` : null
}

function sanitizeUser(user) {
  const phone = phoneFromInternalEmail(user.email)
  return {
    id: user.id,
    email: phone ? null : user.email,
    phone,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl,
    emailVerified: user.emailVerified,
  }
}

async function persistRefreshToken(user, refreshToken, tokenId, metadata) {
  await createRefreshSession({
    userId: user.id,
    tokenId,
    tokenHash: hashToken(refreshToken),
    userAgent: metadata.userAgent,
    ipAddress: metadata.ipAddress,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  })
}

function buildTokens(user) {
  const accessToken = createAccessToken(user)
  const { token, tokenId } = createRefreshToken(user)
  return { accessToken, refreshToken: token, tokenId }
}

function verifyRefreshTokenSafely(refreshToken) {
  try {
    return verifyRefreshToken(refreshToken)
  } catch {
    throw new AppError(401, 'Refresh token is invalid')
  }
}

export async function requestPhoneCode(data) {
  const phone = normalizePhone(data.phone)
  const challenge = createPhoneOtpChallenge(phone)
  const ttlMinutes = Math.max(1, Math.round(challenge.expiresInSeconds / 60))

  await sendWhatsappVerificationCode({
    phone,
    code: challenge.code,
    ttlMinutes,
  })

  return {
    challengeId: challenge.challengeId,
    phone,
    expiresInSeconds: challenge.expiresInSeconds,
  }
}

export async function verifyPhoneCode(data, metadata) {
  const phone = normalizePhone(data.phone)
  verifyPhoneOtpChallenge({
    challengeId: data.challengeId,
    phone,
    code: data.code,
  })

  const internalEmail = phoneToInternalEmail(phone)
  let user = await findUserByEmail(internalEmail)

  if (!user) {
    const fallbackName = `Cliente ${phone.slice(-4)}`
    user = await createLocalUser({
      email: internalEmail,
      name: data.name?.trim() || fallbackName,
      passwordHash: null,
      emailVerified: true,
    })
  }

  const tokens = buildTokens(user)
  await persistRefreshToken(user, tokens.refreshToken, tokens.tokenId, metadata)

  return {
    user: sanitizeUser(user),
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  }
}

export async function refreshSession(refreshToken, metadata) {
  if (!refreshToken) {
    throw new AppError(401, 'Refresh token is required')
  }

  const payload = verifyRefreshTokenSafely(refreshToken)
  const session = await findRefreshSession(payload.jti, hashToken(refreshToken))

  if (!session) {
    throw new AppError(401, 'Refresh token is invalid')
  }

  await revokeRefreshSession(payload.jti, hashToken(refreshToken))
  const tokens = buildTokens(session.user)
  await persistRefreshToken(session.user, tokens.refreshToken, tokens.tokenId, metadata)

  return {
    user: sanitizeUser(session.user),
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  }
}

export async function logout(refreshToken) {
  if (!refreshToken) {
    return
  }

  try {
    const payload = verifyRefreshTokenSafely(refreshToken)
    await revokeRefreshSession(payload.jti, hashToken(refreshToken))
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 401) {
      return
    }

    throw error
  }
}

export async function getCurrentUser(userId) {
  const user = await findUserById(userId)

  if (!user) {
    throw new AppError(404, 'User not found')
  }

  return sanitizeUser(user)
}

export function getAdminUsers() {
  return listUsers()
}
