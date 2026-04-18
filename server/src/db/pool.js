import pg from 'pg'
import { env } from '../config/env.js'
import { logger } from '../lib/logger.js'

const { Pool } = pg

const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: env.isProd ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

pool.on('error', error => {
  logger.error({ err: error }, 'Unexpected PostgreSQL pool error')
})

export async function query(text, params) {
  return pool.query(text, params)
}

export async function withTransaction(handler) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    const result = await handler(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function testConnection() {
  await pool.query('SELECT 1')
}

export default pool
