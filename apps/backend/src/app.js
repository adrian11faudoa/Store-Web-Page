import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import pinoHttp from 'pino-http'
import { env } from './config/env.js'
import { setupSentry } from './config/sentry.js'
import './config/passport.js'
import apiRoutes from './routes/index.js'
import { requestContext } from './middleware/request-context.js'
import { ensureCsrfCookie } from './utils/cookies.js'
import { requireCsrf } from './middleware/csrf.js'
import { globalRateLimit } from './middleware/rate-limit.js'
import { errorHandler, notFoundHandler } from './middleware/error-handler.js'
import { logger } from './utils/logger.js'
import { getHealth } from './controllers/health.controller.js'

setupSentry()

export function createApp() {
  const app = express()

  app.disable('x-powered-by')
  app.set('trust proxy', 1)
  app.use(requestContext)
  app.use(
    pinoHttp({
      logger,
      customProps: req => ({ requestId: req.requestId }),
    }),
  )
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || env.corsOrigins.includes(origin)) {
          return callback(null, true)
        }
        return callback(new Error('Origin not allowed'))
      },
      credentials: true,
    }),
  )
  app.use(helmet())
  app.use(compression())
  app.use(cookieParser())
  app.use(express.json({ limit: '1mb' }))
  app.use(express.urlencoded({ extended: true }))
  app.use(ensureCsrfCookie)
  app.use(globalRateLimit)

  app.get('/health', getHealth)
  app.use(env.apiPrefix, requireCsrf, apiRoutes)
  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
