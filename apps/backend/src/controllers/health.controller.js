import { sendSuccess } from '../utils/api-response.js'

export function getHealth(_req, res) {
  return sendSuccess(res, {
    status: 'ok',
    time: new Date().toISOString(),
    uptime: process.uptime(),
  })
}
