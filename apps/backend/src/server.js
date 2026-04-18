import { createApp } from './app.js'
import { env } from './config/env.js'
import { prisma } from './db/client.js'
import { logger } from './utils/logger.js'

const app = createApp()

async function start() {
  await prisma.$connect()
  app.listen(env.port, () => {
    logger.info({ port: env.port, apiPrefix: env.apiPrefix }, 'Backend listening')
  })
}

start().catch(error => {
  logger.fatal({ err: error }, 'Backend failed to start')
  process.exit(1)
})
