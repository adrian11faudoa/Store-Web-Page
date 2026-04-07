// server/routes/auth.js
import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../db/pool.js'
import { rateLimit } from 'express-rate-limit'

const router = Router()

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  message: { error: 'Too many attempts. Try again in 15 minutes.' },
})

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

// POST /api/auth/register
router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const { email, password, name } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
    if (password.length < 8)  return res.status(400).json({ error: 'Password must be at least 8 characters' })

    const existing = await pool.query('SELECT id FROM users WHERE email=$1', [email.toLowerCase()])
    if (existing.rows.length) return res.status(409).json({ error: 'Email already registered' })

    const hash = await bcrypt.hash(password, 12)
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1,$2,$3) RETURNING id, email, name',
      [email.toLowerCase(), hash, name || null]
    )
    const user = result.rows[0]
    res.status(201).json({ token: signToken(user), user: { id: user.id, email: user.email, name: user.name } })
  } catch (err) {
    next(err)
  }
})

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email.toLowerCase()])
    const user = result.rows[0]
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

    res.json({ token: signToken(user), user: { id: user.id, email: user.email, name: user.name } })
  } catch (err) {
    next(err)
  }
})

export default router
