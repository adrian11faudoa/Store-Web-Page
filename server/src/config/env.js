import { config as loadEnv } from 'dotenv'
import { existsSync } from 'fs'
import { resolve } from 'path'

const nodeEnv = process.env.NODE_ENV || 'development'
const envFileMap = {
  development: '.env.dev',
  production: '.env.prod',
  test: '.env.test',
}

const preferredEnvFile = resolve(process.cwd(), envFileMap[nodeEnv] || '.env')
const fallbackEnvFile = resolve(process.cwd(), '.env')

if (existsSync(preferredEnvFile)) {
  loadEnv({ path: preferredEnvFile, override: true })
} else if (existsSync(fallbackEnvFile)) {
  loadEnv({ path: fallbackEnvFile, override: false })
}

const splitCsv = value => value ? value.split(',').map(item => item.trim()).filter(Boolean) : []

export const env = {
  nodeEnv,
  isProd: nodeEnv === 'production',
  isDev: nodeEnv === 'development',
  port: Number(process.env.PORT || 4000),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  apiBasePath: process.env.API_BASE_PATH || '/api/v1',
  databaseUrl: process.env.DATABASE_URL || '',
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || 'dev-access-secret',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET || 'dev-refresh-secret',
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL || '15m',
  refreshTokenTtl: process.env.REFRESH_TOKEN_TTL || '7d',
  cookieDomain: process.env.COOKIE_DOMAIN || '',
  corsOrigins: splitCsv(process.env.CORS_ORIGINS || process.env.CLIENT_URL || 'http://localhost:3000'),
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  serverUrl: process.env.SERVER_URL || `http://localhost:${process.env.PORT || 4000}`,
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  smtpFrom: process.env.SMTP_FROM || '"Sahara Kids" <no-reply@saharakids.local>',
  sentryDsn: process.env.SENTRY_DSN || '',
}

export const appConfig = {
  cookie: {
    refreshToken: 'sk_rt',
    sessionId: 'sk_sid',
    options: {
      httpOnly: true,
      sameSite: 'lax',
      secure: env.isProd,
      path: '/',
      ...(env.cookieDomain ? { domain: env.cookieDomain } : {}),
    },
  },
}
