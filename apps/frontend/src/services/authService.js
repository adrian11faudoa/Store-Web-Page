import { apiClient } from './apiClient.js'

export const authService = {
  ensureCsrf() {
    const healthUrl = import.meta.env.VITE_API_URL
      ? `${import.meta.env.VITE_API_URL.replace('/api/v1', '')}/health`
      : '/health'

    return fetch(healthUrl, { credentials: 'include' })
  },
  register(payload) {
    return apiClient.post('/auth/register', payload)
  },
  login(payload) {
    return apiClient.post('/auth/login', payload)
  },
  logout() {
    return apiClient.post('/auth/logout', {})
  },
  getSession() {
    return apiClient.get('/auth/me')
  },
}
