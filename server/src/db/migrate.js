import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import pool from './pool.js'
import { logger } from '../lib/logger.js'

const migrationsDir = join(process.cwd(), 'src', 'db', 'migrations')

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
}

async function getAppliedVersions() {
  const result = await pool.query('SELECT version FROM schema_migrations')
  return new Set(result.rows.map(row => row.version))
}

async function migrate() {
  await ensureMigrationsTable()
  const appliedVersions = await getAppliedVersions()
  const files = (await readdir(migrationsDir)).filter(file => file.endsWith('.sql')).sort()

  for (const file of files) {
    if (appliedVersions.has(file)) continue

    const sql = await readFile(join(migrationsDir, file), 'utf8')
    await pool.query('BEGIN')
    try {
      await pool.query(sql)
      await pool.query('INSERT INTO schema_migrations (version) VALUES ($1)', [file])
      await pool.query('COMMIT')
      logger.info({ migration: file }, 'Applied migration')
    } catch (error) {
      await pool.query('ROLLBACK')
      throw error
    }
  }
}

migrate()
  .then(async () => {
    logger.info('Migrations complete')
    await pool.end()
  })
  .catch(async error => {
    logger.error({ err: error }, 'Migration failed')
    await pool.end()
    process.exit(1)
  })
