import * as Sentry from '@sentry/node'
import { env } from './env.js'

export function setupSentry() {
  if (!env.sentryDsn) {
    return false
  }

  Sentry.init({
    dsn: env.sentryDsn,
    environment: env.nodeEnv,
    tracesSampleRate: env.isProduction ? 0.1 : 1,
  })

  return true
}
