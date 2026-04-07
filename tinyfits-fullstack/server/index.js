// server/index.js
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '..', '.env') })

// Dynamic import ensures pool.js loads AFTER dotenv has run
const { default: pool } = await import('./db/pool.js')

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import path from 'path'

import productsRouter from './routes/products.js'
import categoriesRouter from './routes/categories.js'
import authRouter from './routes/auth.js'
import cartRouter from './routes/cart.js'
import { errorHandler } from './middleware/errorHandler.js'
import { testConnection } from './db/pool.js'

const app = express()
const PORT = process.env.PORT || 4000

// ── Security & middleware ────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // handled by frontend
}))
app.use(compression())
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json())

// ── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/products',   productsRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/auth',       authRouter)
app.use('/api/cart',       cartRouter)

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV, time: new Date() })
})

// ── Serve frontend in production ─────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '..', 'client', 'dist')
  app.use(express.static(clientDist))
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'))
  })
}

// ── Error handler ─────────────────────────────────────────────────────────────
app.use(errorHandler)

// ── Start ────────────────────────────────────────────────────────────────────
async function start() {
  await testConnection()
  app.listen(PORT, () => {
    console.log(`\n🚀 tiny.fits server running on port ${PORT}`)
    console.log(`   ENV: ${process.env.NODE_ENV || 'development'}`)
    console.log(`   DB:  ${process.env.DATABASE_URL ? '✓ connected' : '✗ no DATABASE_URL'}\n`)
  })
}

start()
