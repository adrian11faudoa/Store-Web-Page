import bcrypt from 'bcryptjs'
import { findUserByEmail, findUserById, createLocalUser, upsertGoogleAccount, listUsers } from '../repositories/user.repository.js'
import { createRefreshSession, findRefreshSession, revokeRefreshSession } from '../repositories/session.repository.js'
import { createAccessToken, createRefreshToken, hashToken, verifyRefreshToken } from '../utils/tokens.js'
import { AppError } from '../utils/app-error.js'

function sanitizeUser(user) {
  return {
    id: user.id,
    email: user.email,
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

export async function register(data, metadata) {
  const existing = await findUserByEmail(data.email)

  if (existing) {
    throw new AppError(409, 'Account already exists')
  }

  const user = await createLocalUser({
    email: data.email.toLowerCase(),
    name: data.name,
    passwordHash: await bcrypt.hash(data.password, 12),
    emailVerified: true,
  })

  const tokens = buildTokens(user)
  await persistRefreshToken(user, tokens.refreshToken, tokens.tokenId, metadata)

  return {
    user: sanitizeUser(user),
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  }
}

export async function login(data, metadata) {
  const user = await findUserByEmail(data.email)

  if (!user?.passwordHash) {
    throw new AppError(401, 'Invalid credentials')
  }

  const isValid = await bcrypt.compare(data.password, user.passwordHash)

  if (!isValid) {
    throw new AppError(401, 'Invalid credentials')
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

  const payload = verifyRefreshToken(refreshToken)
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

  const payload = verifyRefreshToken(refreshToken)
  await revokeRefreshSession(payload.jti, hashToken(refreshToken))
}

export async function getCurrentUser(userId) {
  const user = await findUserById(userId)

  if (!user) {
    throw new AppError(404, 'User not found')
  }

  return sanitizeUser(user)
}

export async function findOrCreateGoogleUser(profile) {
  const email = profile.emails?.[0]?.value?.toLowerCase()

  if (!email) {
    throw new AppError(422, 'Google account did not return an email')
  }

  return upsertGoogleAccount({
    email,
    name: profile.displayName || 'Google User',
    avatarUrl: profile.photos?.[0]?.value || null,
    providerAccountId: profile.id,
  })
}

export async function createOauthSession(user, metadata) {
  const tokens = buildTokens(user)
  await persistRefreshToken(user, tokens.refreshToken, tokens.tokenId, metadata)

  return {
    user: sanitizeUser(user),
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  }
}

export function getAdminUsers() {
  return listUsers()
}
