const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'
const SESSION_KEY = 'sahara-kids-session-id'

function getSessionId() {
  const existing = localStorage.getItem(SESSION_KEY)
  if (existing) return existing

  const next = crypto.randomUUID()
  localStorage.setItem(SESSION_KEY, next)
  return next
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': getSessionId(),
      ...(options.headers || {}),
    },
    ...options,
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: { message: 'Request failed' } }))
    throw new Error(payload.error?.message || 'Request failed')
  }

  if (response.status === 204) return null
  return response.json()
}
