import bcrypt from 'bcryptjs'
import { createHash } from 'crypto'
import { query, withTransaction } from '../db/pool.js'
import { ApiError } from '../lib/errors.js'
import { createAccessToken, createRefreshToken, verifyRefreshToken } from '../lib/tokens.js'

function hashToken(value) {
  return createHash('sha256').update(value).digest('hex')
}

function sanitizeUser(row) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    emailVerified: row.email_verified,
  }
}

async function persistRefreshToken(client, { userId, tokenId, refreshToken, userAgent, ipAddress }) {
  const tokenHash = hashToken(refreshToken)

  await client.query(
    `INSERT INTO refresh_tokens (user_id, token_id, token_hash, user_agent, ip_address, expires_at)
     VALUES ($1, $2, $3, $4, $5, NOW() + interval '7 day')`,
    [userId, tokenId, tokenHash, userAgent, ipAddress]
  )
}

function issueTokens(user) {
  const accessToken = createAccessToken(user)
  const { tokenId, token: refreshToken } = createRefreshToken(user)
  return { accessToken, refreshToken, tokenId }
}

export async function registerUser({ email, password, name, userAgent, ipAddress }) {
  return withTransaction(async client => {
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()])
    if (existing.rows.length) throw new ApiError(409, 'Account already exists')

    const passwordHash = await bcrypt.hash(password, 12)
    const result = await client.query(
      `INSERT INTO users (email, password_hash, name, role, email_verified)
       VALUES ($1, $2, $3, 'customer', TRUE)
       RETURNING id, email, name, role, email_verified`,
      [email.toLowerCase(), passwordHash, name]
    )

    const user = result.rows[0]
    const tokens = issueTokens(user)
    await persistRefreshToken(client, { userId: user.id, tokenId: tokens.tokenId, refreshToken: tokens.refreshToken, userAgent, ipAddress })

    return { user: sanitizeUser(user), accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }
  })
}

export async function loginUser({ email, password, userAgent, ipAddress }) {
  return withTransaction(async client => {
    const result = await client.query(
      'SELECT id, email, name, role, email_verified, password_hash FROM users WHERE email = $1',
      [email.toLowerCase()]
    )

    if (!result.rows.length) throw new ApiError(401, 'Invalid credentials')

    const user = result.rows[0]
    const validPassword = await bcrypt.compare(password, user.password_hash || '')
    if (!validPassword) throw new ApiError(401, 'Invalid credentials')

    const tokens = issueTokens(user)
    await persistRefreshToken(client, { userId: user.id, tokenId: tokens.tokenId, refreshToken: tokens.refreshToken, userAgent, ipAddress })

    return { user: sanitizeUser(user), accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }
  })
}

export async function rotateRefreshToken({ refreshToken, userAgent, ipAddress }) {
  return withTransaction(async client => {
    const payload = verifyRefreshToken(refreshToken)
    const tokenHash = hashToken(refreshToken)

    const tokenResult = await client.query(
      `SELECT rt.id, rt.user_id, rt.revoked_at, u.email, u.name, u.role, u.email_verified
       FROM refresh_tokens rt
       JOIN users u ON u.id = rt.user_id
       WHERE rt.token_id = $1 AND rt.token_hash = $2`,
      [payload.jti, tokenHash]
    )

    if (!tokenResult.rows.length || tokenResult.rows[0].revoked_at) {
      throw new ApiError(401, 'Refresh token is invalid')
    }

    await client.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1', [tokenResult.rows[0].id])

    const user = tokenResult.rows[0]
    const tokens = issueTokens(user)
    await persistRefreshToken(client, { userId: user.user_id, tokenId: tokens.tokenId, refreshToken: tokens.refreshToken, userAgent, ipAddress })

    return {
      user: sanitizeUser({ ...user, id: user.user_id }),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    }
  })
}

export async function revokeRefreshToken(refreshToken) {
  const payload = verifyRefreshToken(refreshToken)
  const tokenHash = hashToken(refreshToken)

  await query(
    'UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_id = $1 AND token_hash = $2',
    [payload.jti, tokenHash]
  )
}
