// server/middleware/errorHandler.js
export function errorHandler(err, req, res, next) {
  const status = err.status || 500
  const message = process.env.NODE_ENV === 'production'
    ? (status < 500 ? err.message : 'Internal server error')
    : err.message

  if (status >= 500) {
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, err)
  }

  res.status(status).json({ error: message })
}
