// server/routes/auth.js
import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../db/pool.js'
import { rateLimit } from 'express-rate-limit'
import { requireAuth } from '../middleware/auth.js'
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendGoogleAccountResetEmail,
} from '../utils/mailer.js'

const router = Router()

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  message: { error: 'Too many attempts. Try again in 15 minutes.' },
})
const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 5,
  message: { error: 'Too many reset attempts. Try again in 15 minutes.' },
})

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// ── POST /api/auth/register ───────────────────────────────────────────────────
// Creates an UNVERIFIED account and sends a verification email.
router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const { email, password, name } = req.body
    if (!email || !password)     return res.status(400).json({ error: 'Email and password required' })
    if (password.length < 8)     return res.status(400).json({ error: 'Password must be at least 8 characters' })

    const existing = await pool.query('SELECT id, email_verified FROM users WHERE email=$1', [email.toLowerCase()])

    if (existing.rows.length) {
      const u = existing.rows[0]
      if (u.email_verified) return res.status(409).json({ error: 'Email already registered' })
      // Unverified account — resend code instead of creating a duplicate
      const code = generateCode()
      const exp  = new Date(Date.now() + 30 * 60 * 1000)
      await pool.query('UPDATE email_verification_codes SET used=TRUE WHERE user_id=$1', [u.id])
      await pool.query('INSERT INTO email_verification_codes (user_id,code,expires_at) VALUES ($1,$2,$3)', [u.id, code, exp])
      await sendVerificationEmail({ to: email.toLowerCase(), name: name || null, code })
      return res.status(202).json({ pending: true, message: 'Verification code resent' })
    }

    const hash = await bcrypt.hash(password, 12)
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name, email_verified) VALUES ($1,$2,$3,FALSE) RETURNING id,email,name',
      [email.toLowerCase(), hash, name || null]
    )
    const user = result.rows[0]

    const code = generateCode()
    const exp  = new Date(Date.now() + 30 * 60 * 1000)
    await pool.query('INSERT INTO email_verification_codes (user_id,code,expires_at) VALUES ($1,$2,$3)', [user.id, code, exp])
    await sendVerificationEmail({ to: user.email, name: user.name, code })

    res.status(201).json({ pending: true, message: 'Account created — please verify your email' })
  } catch (err) { next(err) }
})

// ── POST /api/auth/verify-email ───────────────────────────────────────────────
router.post('/verify-email', authLimiter, async (req, res, next) => {
  try {
    const { email, code } = req.body
    if (!email || !code) return res.status(400).json({ error: 'Email and code required' })

    const userRes = await pool.query('SELECT id,email,name FROM users WHERE email=$1', [email.toLowerCase()])
    if (!userRes.rows.length) return res.status(400).json({ error: 'Invalid code' })
    const user = userRes.rows[0]

    const codeRes = await pool.query(
      'SELECT id FROM email_verification_codes WHERE user_id=$1 AND code=$2 AND used=FALSE AND expires_at > NOW()',
      [user.id, code]
    )
    if (!codeRes.rows.length) return res.status(400).json({ error: 'Invalid or expired code' })

    await pool.query('UPDATE email_verification_codes SET used=TRUE WHERE id=$1', [codeRes.rows[0].id])
    await pool.query('UPDATE users SET email_verified=TRUE WHERE id=$1', [user.id])

    res.json({ token: signToken(user), user: { id: user.id, email: user.email, name: user.name } })
  } catch (err) { next(err) }
})

// ── POST /api/auth/resend-verification ───────────────────────────────────────
router.post('/resend-verification', authLimiter, async (req, res, next) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Email required' })

    const userRes = await pool.query('SELECT id,name,email_verified FROM users WHERE email=$1', [email.toLowerCase()])
    if (!userRes.rows.length || userRes.rows[0].email_verified) return res.json({ ok: true }) // silent

    const user = userRes.rows[0]
    const code = generateCode()
    const exp  = new Date(Date.now() + 30 * 60 * 1000)
    await pool.query('UPDATE email_verification_codes SET used=TRUE WHERE user_id=$1', [user.id])
    await pool.query('INSERT INTO email_verification_codes (user_id,code,expires_at) VALUES ($1,$2,$3)', [user.id, code, exp])
    await sendVerificationEmail({ to: email.toLowerCase(), name: user.name, code })
    res.json({ ok: true })
  } catch (err) { next(err) }
})

// ── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email.toLowerCase()])
    const user   = result.rows[0]
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    // Google-only account
    if (!user.password_hash) return res.status(401).json({ error: 'This account uses Google Sign-In. Use the Google button to log in.' })

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

    if (!user.email_verified) return res.status(403).json({ error: 'Please verify your email before signing in.', unverified: true })

    res.json({ token: signToken(user), user: { id: user.id, email: user.email, name: user.name } })
  } catch (err) { next(err) }
})

// ── POST /api/auth/change-password ───────────────────────────────────────────
router.post('/change-password', requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'All fields required' })
    if (newPassword.length < 8)           return res.status(400).json({ error: 'New password must be at least 8 characters' })

    const result = await pool.query('SELECT * FROM users WHERE id=$1', [req.user.id])
    const user   = result.rows[0]
    if (!user) return res.status(404).json({ error: 'User not found' })
    if (!user.password_hash) return res.status(400).json({ error: 'Google account — no password to change' })

    const valid = await bcrypt.compare(currentPassword, user.password_hash)
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' })

    const hash = await bcrypt.hash(newPassword, 12)
    await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2', [hash, user.id])
    res.json({ ok: true })
  } catch (err) { next(err) }
})

// ── POST /api/auth/forgot-password ───────────────────────────────────────────
router.post('/forgot-password', resetLimiter, async (req, res, next) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Email required' })

    const result = await pool.query('SELECT id,name,google_id,password_hash FROM users WHERE email=$1', [email.toLowerCase()])
    if (!result.rows.length) return res.json({ ok: true }) // avoid enumeration

    const user = result.rows[0]

    // Google-only account — send a special email instead of a reset code
    if (user.google_id && !user.password_hash) {
      await sendGoogleAccountResetEmail({ to: email.toLowerCase(), name: user.name })
      return res.json({ ok: true, googleAccount: true })
    }

    const code     = generateCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await pool.query('UPDATE password_reset_codes SET used=TRUE WHERE user_id=$1', [user.id])
    await pool.query('INSERT INTO password_reset_codes (user_id,code,expires_at) VALUES ($1,$2,$3)', [user.id, code, expiresAt])
    await sendPasswordResetEmail({ to: email.toLowerCase(), code })

    res.json({ ok: true })
  } catch (err) { next(err) }
})

// ── POST /api/auth/reset-password ────────────────────────────────────────────
router.post('/reset-password', resetLimiter, async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body
    if (!email || !code || !newPassword) return res.status(400).json({ error: 'All fields required' })
    if (newPassword.length < 8)          return res.status(400).json({ error: 'Password must be at least 8 characters' })

    const userRes = await pool.query('SELECT id FROM users WHERE email=$1', [email.toLowerCase()])
    if (!userRes.rows.length) return res.status(400).json({ error: 'Invalid code' })
    const userId = userRes.rows[0].id

    const codeRes = await pool.query(
      'SELECT id FROM password_reset_codes WHERE user_id=$1 AND code=$2 AND used=FALSE AND expires_at > NOW()',
      [userId, code]
    )
    if (!codeRes.rows.length) return res.status(400).json({ error: 'Invalid or expired code' })

    await pool.query('UPDATE password_reset_codes SET used=TRUE WHERE id=$1', [codeRes.rows[0].id])
    const hash = await bcrypt.hash(newPassword, 12)
    await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2', [hash, userId])

    res.json({ ok: true })
  } catch (err) { next(err) }
})

export default router
