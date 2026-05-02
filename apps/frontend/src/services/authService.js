import { apiClient } from './apiClient.js'

export const authService = {
  ensureCsrf() {
    const healthUrl = import.meta.env.VITE_API_URL
      ? `${import.meta.env.VITE_API_URL.replace('/api/v1', '')}/health`
      : '/health'

    return fetch(healthUrl, { credentials: 'include' })
  },
  requestPhoneCode(payload) {
    return apiClient.post('/auth/phone/request-code', payload)
  },
  verifyPhoneCode(payload) {
    return apiClient.post('/auth/phone/verify-code', payload)
  },
  logout() {
    return apiClient.post('/auth/logout')
  },
  getSession() {
    return apiClient.get('/auth/me')
  },
}
