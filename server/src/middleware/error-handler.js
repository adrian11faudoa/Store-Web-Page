import { ZodError } from 'zod'
import { ApiError } from '../lib/errors.js'
import { logger } from '../lib/logger.js'
import { env } from '../config/env.js'

export function notFoundHandler(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`))
}

export function errorHandler(error, req, res, next) {
  const statusCode = error instanceof ApiError ? error.statusCode : 500
  const details = error instanceof ZodError ? error.flatten() : error.details

  logger.error({
    err: error,
    statusCode,
    requestId: req.id,
    method: req.method,
    path: req.originalUrl,
  }, 'Unhandled request error')

  res.status(statusCode).json({
    error: {
      message: statusCode >= 500 && env.isProd ? 'Internal server error' : error.message,
      details: statusCode >= 500 && env.isProd ? undefined : details,
      requestId: req.id,
    },
  })
}
