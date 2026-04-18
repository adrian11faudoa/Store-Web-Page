import { Router } from 'express'
import passport from '../../utils/passport.js'
import { appConfig, env } from '../../config/env.js'
import { createAccessToken, createRefreshToken } from '../../lib/tokens.js'
import { query } from '../../db/pool.js'

const router = Router()

if (env.googleClientId && env.googleClientSecret) {
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }))

  router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${env.clientUrl}/signin?error=oauth_failed` }),
    async (req, res, next) => {
      try {
        const accessToken = createAccessToken(req.user)
        const { tokenId, token: refreshToken } = createRefreshToken(req.user)

        await query(
          `INSERT INTO refresh_tokens (user_id, token_id, token_hash, expires_at)
           VALUES ($1, $2, encode(digest($3, 'sha256'), 'hex'), NOW() + interval '7 day')`,
          [req.user.id, tokenId, refreshToken]
        )

        res.cookie(appConfig.cookie.refreshToken, refreshToken, {
          ...appConfig.cookie.options,
          maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        res.redirect(`${env.clientUrl}/#/oauth/success?token=${encodeURIComponent(accessToken)}`)
      } catch (error) {
        next(error)
      }
    }
  )
}

export default router
