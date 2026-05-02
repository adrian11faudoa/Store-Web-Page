import { config as loadEnv } from 'dotenv'
import { resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { API_PREFIX, COOKIE_NAMES, TOKEN_TTLS } from '@store/config'

const nodeEnv = process.env.NODE_ENV || 'development'
const candidatePaths = [
  resolve(process.cwd(), `.env.${nodeEnv}`),
  resolve(process.cwd(), '.env'),
  resolve(process.cwd(), '..', '..', `.env.${nodeEnv}`),
  resolve(process.cwd(), '..', '..', '.env'),
]

for (const path of candidatePaths) {
  if (existsSync(path)) {
    loadEnv({ path, override: true })
    break
  }
}

const parseCsv = value => (value || '').split(',').map(item => item.trim()).filter(Boolean)

export const env = {
  nodeEnv,
  isProduction: nodeEnv === 'production',
  port: Number(process.env.PORT || 4000),
  appUrl: process.env.APP_URL || `http://localhost:${process.env.PORT || 4000}`,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  corsOrigins: parseCsv(process.env.CORS_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:5173'),
  databaseUrl: process.env.DATABASE_URL || '',
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || 'development-access-secret',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'development-refresh-secret',
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL || TOKEN_TTLS.access,
  refreshTokenTtl: process.env.REFRESH_TOKEN_TTL || TOKEN_TTLS.refresh,
  sentryDsn: process.env.SENTRY_DSN || '',
  whatsappAccessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
  whatsappPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
  whatsappApiVersion: process.env.WHATSAPP_API_VERSION || 'v23.0',
  whatsappTemplateName: process.env.WHATSAPP_TEMPLATE_NAME || '',
  whatsappTemplateLanguage: process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'es_MX',
  cookieDomain: process.env.COOKIE_DOMAIN || '',
  apiPrefix: API_PREFIX,
  cookieNames: COOKIE_NAMES,
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: env.isProduction,
  path: '/',
  ...(env.cookieDomain ? { domain: env.cookieDomain } : {}),
}
