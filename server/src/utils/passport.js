import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { env } from '../config/env.js'
import { query } from '../db/pool.js'

if (env.googleClientId && env.googleClientSecret) {
  passport.use(new GoogleStrategy(
    {
      clientID: env.googleClientId,
      clientSecret: env.googleClientSecret,
      callbackURL: `${env.serverUrl}${env.apiBasePath}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase()
        if (!email) return done(new Error('No email returned by Google'))

        const result = await query(
          `INSERT INTO users (email, name, google_id, avatar_url, role, email_verified)
           VALUES ($1, $2, $3, $4, 'customer', TRUE)
           ON CONFLICT (email)
           DO UPDATE SET google_id = EXCLUDED.google_id, avatar_url = EXCLUDED.avatar_url
           RETURNING id, email, name, role, email_verified`,
          [email, profile.displayName || 'Google User', profile.id, profile.photos?.[0]?.value || null]
        )

        return done(null, result.rows[0])
      } catch (error) {
        return done(error)
      }
    }
  ))
}

export default passport
