import { randomUUID } from 'crypto'

export function requestContext(req, res, next) {
  req.id = req.headers['x-request-id'] || randomUUID()
  res.setHeader('x-request-id', req.id)
  next()
}
