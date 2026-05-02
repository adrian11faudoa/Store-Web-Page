import { createHash, randomInt, randomUUID } from 'node:crypto'
import { AppError } from '../utils/app-error.js'
import { env } from '../config/env.js'

const OTP_TTL_MS = 5 * 60 * 1000
const MAX_ATTEMPTS = 5
const DEV_FIXED_OTP_CODE = '123456'
const challengesByPhone = new Map()

function hashCode(code) {
  return createHash('sha256').update(String(code)).digest('hex')
}

function clearExpired(phone) {
  const challenge = challengesByPhone.get(phone)

  if (challenge && challenge.expiresAt <= Date.now()) {
    challengesByPhone.delete(phone)
  }
}

export function createPhoneOtpChallenge(phone) {
  clearExpired(phone)
  const challengeId = randomUUID()
  const code = env.isProduction ? String(randomInt(100000, 1000000)) : DEV_FIXED_OTP_CODE

  challengesByPhone.set(phone, {
    id: challengeId,
    codeHash: hashCode(code),
    attempts: 0,
    createdAt: Date.now(),
    expiresAt: Date.now() + OTP_TTL_MS,
  })

  return {
    challengeId,
    code,
    expiresInSeconds: Math.floor(OTP_TTL_MS / 1000),
  }
}

export function verifyPhoneOtpChallenge({ challengeId, phone, code }) {
  clearExpired(phone)
  const challenge = challengesByPhone.get(phone)

  if (!challenge || challenge.id !== challengeId) {
    throw new AppError(401, 'Verification session expired')
  }

  if (challenge.attempts >= MAX_ATTEMPTS) {
    challengesByPhone.delete(phone)
    throw new AppError(429, 'Too many attempts, request a new code')
  }

  if (challenge.codeHash !== hashCode(code)) {
    challenge.attempts += 1
    throw new AppError(401, 'Invalid verification code')
  }

  challengesByPhone.delete(phone)
}
