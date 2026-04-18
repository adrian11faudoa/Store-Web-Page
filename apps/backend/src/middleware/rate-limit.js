import rateLimit from 'express-rate-limit'
import { sendError } from '../utils/api-response.js'

function buildRateLimit({ windowMs, limit }) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => sendError(res, 429, 'Too many requests'),
  })
}

export const globalRateLimit = buildRateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 250,
})

export const authRateLimit = buildRateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
})
