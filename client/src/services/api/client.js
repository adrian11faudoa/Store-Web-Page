const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'
const SESSION_KEY = 'sahara-kids-session-id'

let accessToken = null
let authFailureHandler = () => {}

function getSessionId() {
  const existing = localStorage.getItem(SESSION_KEY)
  if (existing) return existing

  const next = crypto.randomUUID()
  localStorage.setItem(SESSION_KEY, next)
  return next
}

function buildHeaders(headers = {}) {
  return {
    'Content-Type': 'application/json',
    'x-session-id': getSessionId(),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...headers,
  }
}

async function rawRequest(path, options = {}) {
  return fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: buildHeaders(options.headers),
    ...options,
  })
}

export function setAccessToken(token) {
  accessToken = token || null
}

export function setAuthFailureHandler(handler) {
  authFailureHandler = handler
}

export async function apiRequest(path, options = {}) {
  const response = await rawRequest(path, options)

  if (response.status === 401 && !options.skipRefresh && !path.startsWith('/auth/refresh')) {
    const refreshResponse = await rawRequest('/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => null)

    if (refreshResponse?.ok) {
      const refreshPayload = await refreshResponse.json()
      setAccessToken(refreshPayload.data.accessToken)
      return apiRequest(path, { ...options, skipRefresh: true })
    }

    setAccessToken(null)
    authFailureHandler()
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: { message: 'Request failed' } }))
    throw new Error(payload.error?.message || 'Request failed')
  }

  if (response.status === 204) return null
  return response.json()
}

export { API_BASE_URL }
