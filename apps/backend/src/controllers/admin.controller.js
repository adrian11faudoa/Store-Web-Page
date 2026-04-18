import { sendSuccess } from '../utils/api-response.js'
import { getAdminUsers } from '../services/auth.service.js'

export async function listUsers(_req, res) {
  const users = await getAdminUsers()
  return sendSuccess(res, { items: users })
}
