// server/routes/auth.js
import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../db/pool.js'
import { rateLimit } from 'express-rate-limit'
import { optionalAuth, requireAuth } from '../middleware/auth.js'

const router = Router()

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many attempts. Try again in 15 minutes.' },
})

const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many reset attempts. Try again in 15 minutes.' },
})

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
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

// POST /api/auth/change-password  (requires auth)
router.post('/change-password', requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'All fields required' })
    if (newPassword.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters' })

    const result = await pool.query('SELECT * FROM users WHERE id=$1', [req.user.id])
    const user = result.rows[0]
    if (!user) return res.status(404).json({ error: 'User not found' })

    const valid = await bcrypt.compare(currentPassword, user.password_hash)
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' })

    const hash = await bcrypt.hash(newPassword, 12)
    await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2', [hash, user.id])
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

// POST /api/auth/forgot-password  — sends reset code to email
router.post('/forgot-password', resetLimiter, async (req, res, next) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Email required' })

    const result = await pool.query('SELECT id FROM users WHERE email=$1', [email.toLowerCase()])
    // Always return ok to avoid email enumeration
    if (!result.rows.length) return res.json({ ok: true })

    const userId = result.rows[0].id
    const code = generateCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Invalidate old codes for this user
    await pool.query('UPDATE password_reset_codes SET used=TRUE WHERE user_id=$1', [userId])

    await pool.query(
      'INSERT INTO password_reset_codes (user_id, code, expires_at) VALUES ($1,$2,$3)',
      [userId, code, expiresAt]
    )

    // In a real app, send an email here. For now, log the code.
    // TODO: integrate nodemailer or similar
    console.log(`[PASSWORD RESET] Code for ${email}: ${code} (expires ${expiresAt.toISOString()})`)

    // If email transport is configured, send it
    if (process.env.SMTP_HOST) {
      try {
        const nodemailer = await import('nodemailer')
        const transporter = nodemailer.default.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        })
        await transporter.sendMail({
          from: process.env.SMTP_FROM || 'no-reply@tinyfits.com',
          to: email,
          subject: 'Your tiny.fits password reset code',
          text: `Your password reset code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, ignore this email.`,
          html: `<p>Your password reset code is: <strong style="font-size:24px;letter-spacing:4px">${code}</strong></p><p>This code expires in 10 minutes.</p><p>If you didn't request this, ignore this email.</p>`,
        })
      } catch (mailErr) {
        console.error('Email send failed:', mailErr.message)
      }
    }

    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

// POST /api/auth/reset-password  — verify code and set new password
router.post('/reset-password', resetLimiter, async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body
    if (!email || !code || !newPassword) return res.status(400).json({ error: 'All fields required' })
    if (newPassword.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' })

    const userRes = await pool.query('SELECT id FROM users WHERE email=$1', [email.toLowerCase()])
    if (!userRes.rows.length) return res.status(400).json({ error: 'Invalid code' })
    const userId = userRes.rows[0].id

    const codeRes = await pool.query(
      'SELECT id FROM password_reset_codes WHERE user_id=$1 AND code=$2 AND used=FALSE AND expires_at > NOW()',
      [userId, code]
    )
    if (!codeRes.rows.length) return res.status(400).json({ error: 'Invalid or expired code' })

    // Mark used
    await pool.query('UPDATE password_reset_codes SET used=TRUE WHERE id=$1', [codeRes.rows[0].id])

    const hash = await bcrypt.hash(newPassword, 12)
    await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2', [hash, userId])

    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

export default router
