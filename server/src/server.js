import { createApp } from './app.js'
import { env } from './config/env.js'
import { logger } from './lib/logger.js'
import { testConnection } from './db/pool.js'

const app = createApp()

async function start() {
  await testConnection()
  app.listen(env.port, () => {
    logger.info({ port: env.port, env: env.nodeEnv, apiBasePath: env.apiBasePath }, 'Server started')
  })
}

start().catch(error => {
  logger.fatal({ err: error }, 'Failed to start server')
  process.exit(1)
})
