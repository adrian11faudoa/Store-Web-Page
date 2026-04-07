// server/db/pool.js
import pg from 'pg'
import 'dotenv/config'

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }  // Render uses self-signed certs
    : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

pool.on('error', (err) => {
  console.error('Unexpected DB pool error:', err)
})

export async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW()')
    console.log('✓ PostgreSQL connected:', res.rows[0].now)
  } catch (err) {
    console.error('✗ PostgreSQL connection failed:', err.message)
    process.exit(1)
  }
}

// Helper: tagged template for safe queries
// Usage: await query`SELECT * FROM products WHERE id = ${id}`
export async function query(strings, ...values) {
  const text = strings.reduce((acc, str, i) =>
    acc + str + (i < values.length ? `$${i + 1}` : ''), '')
  const res = await pool.query(text, values)
  return res
}

export default pool
