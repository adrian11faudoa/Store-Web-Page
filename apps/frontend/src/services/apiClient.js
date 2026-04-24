import { API_PREFIX, COOKIE_NAMES } from '@store/config'

const API_URL = import.meta.env.VITE_API_URL || API_PREFIX

function getCookie(name) {
  const parts = document.cookie.split('; ').find(row => row.startsWith(`${name}=`))
  return parts ? decodeURIComponent(parts.split('=')[1]) : ''
}

async function request(path, options = {}) {
  const isMutation = !['GET', 'HEAD'].includes((options.method || 'GET').toUpperCase())
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(isMutation ? { 'x-csrf-token': getCookie(COOKIE_NAMES.csrf) } : {}),
      ...(options.headers || {}),
    },
    ...options,
  })

  if (response.status === 204) {
    return null
  }

  const payload = await response.json()

  if (!response.ok || payload.success === false) {
    throw new Error(payload.error?.message || 'Request failed')
  }

  return payload.data
}

export const apiClient = {
  get: path => request(path),
  post: (path, body) => request(path, { method: 'POST', ...(body === undefined ? {} : { body: JSON.stringify(body) }) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
}
