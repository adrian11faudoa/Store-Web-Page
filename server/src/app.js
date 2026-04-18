import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import pinoHttp from 'pino-http'
import * as Sentry from '@sentry/node'
import { env } from './config/env.js'
import { logger } from './lib/logger.js'
import { requestContext } from './middleware/request-context.js'
import { errorHandler, notFoundHandler } from './middleware/error-handler.js'
import { globalRateLimit } from './middleware/rate-limit.js'
import apiRouter from './routes/index.js'
import passport from './utils/passport.js'

if (env.sentryDsn) {
  Sentry.init({ dsn: env.sentryDsn, environment: env.nodeEnv })
}

export function createApp() {
  const app = express()

  app.disable('x-powered-by')
  app.use(requestContext)
  app.use(pinoHttp({ logger }))
  app.use(helmet())
  app.use(compression())
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || env.corsOrigins.includes(origin)) return callback(null, true)
      return callback(new Error('Origin not allowed by CORS'))
    },
    credentials: true,
  }))
  app.use(cookieParser())
  app.use(express.json({ limit: '1mb' }))
  app.use(express.urlencoded({ extended: true }))
  app.use(globalRateLimit)
  app.use(passport.initialize())

  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      env: env.nodeEnv,
      uptime: process.uptime(),
      time: new Date().toISOString(),
    })
  })

  app.use(env.apiBasePath, apiRouter)
  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
