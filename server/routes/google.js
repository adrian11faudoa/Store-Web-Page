// server/routes/google.js
// Google OAuth 2.0 — passport-google-oauth20
// Requires env vars: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, CLIENT_URL
import { Router } from 'express'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import jwt from 'jsonwebtoken'
import pool from '../db/pool.js'

const router = Router()

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

// ── Configure strategy ───────────────────────────────────────────────────────
passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  `${process.env.SERVER_URL || 'http://localhost:4000'}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email     = profile.emails?.[0]?.value?.toLowerCase()
        const googleId  = profile.id
        const name      = profile.displayName || profile.name?.givenName || ''
        const avatarUrl = profile.photos?.[0]?.value || null

        if (!email) return done(new Error('No email from Google'), null)

        // 1. Look up by google_id first
        let res = await pool.query('SELECT * FROM users WHERE google_id=$1', [googleId])
        if (res.rows.length) return done(null, res.rows[0])

        // 2. Look up by email — link google_id to existing account
        res = await pool.query('SELECT * FROM users WHERE email=$1', [email])
        if (res.rows.length) {
          const user = res.rows[0]
          await pool.query(
            'UPDATE users SET google_id=$1, avatar_url=$2 WHERE id=$3',
            [googleId, avatarUrl, user.id]
          )
          return done(null, { ...user, google_id: googleId, avatar_url: avatarUrl })
        }

        // 3. New user — create account (no password)
        const insert = await pool.query(
          'INSERT INTO users (email, name, google_id, avatar_url) VALUES ($1,$2,$3,$4) RETURNING *',
          [email, name, googleId, avatarUrl]
        )
        return done(null, insert.rows[0])
      } catch (err) {
        return done(err, null)
      }
    }
  )
)

// passport needs serialize/deserialize even though we use JWT (stateless)
passport.serializeUser((user, done) => done(null, user.id))
passport.deserializeUser((id, done) => done(null, { id }))

// ── Routes ────────────────────────────────────────────────────────────────────

// GET /api/auth/google  — redirect to Google consent screen
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
)

// GET /api/auth/google/callback  — Google redirects here after consent
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:3000'}/?auth=error` }),
  (req, res) => {
    const user  = req.user
    const token = signToken(user)
    const payload = encodeURIComponent(JSON.stringify({
      token,
      user: { id: user.id, email: user.email, name: user.name, avatar_url: user.avatar_url },
    }))
    // Redirect to frontend with token in query param — frontend reads & stores it
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/?auth=google&data=${payload}`)
  }
)

export { passport }
export default router
