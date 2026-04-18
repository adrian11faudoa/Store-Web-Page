export const API_PREFIX = '/api/v1'

export const COOKIE_NAMES = {
  accessToken: 'sp_at',
  refreshToken: 'sp_rt',
  csrf: 'sp_csrf',
  guestCart: 'sp_gc',
}

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
}

export const TOKEN_TTLS = {
  access: '15m',
  refresh: '7d',
}
