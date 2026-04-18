import { AppError } from '../utils/app-error.js'
import { logger } from '../utils/logger.js'
import { sendError } from '../utils/api-response.js'

export function notFoundHandler(req, res) {
  return sendError(res, 404, `Route ${req.method} ${req.originalUrl} not found`)
}

export function errorHandler(error, req, res, _next) {
  void _next
  const statusCode = error instanceof AppError ? error.statusCode : 500
  const message = error instanceof AppError ? error.message : 'Internal server error'
  const details = error instanceof AppError ? error.details : null

  logger.error(
    {
      err: error,
      requestId: req.requestId,
      path: req.originalUrl,
      method: req.method,
    },
    'Unhandled request failure',
  )

  return sendError(res, statusCode, message, details)
}
