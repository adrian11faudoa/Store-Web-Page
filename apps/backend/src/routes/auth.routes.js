import { Router } from 'express'
import { loginSchema, registerSchema } from '@store/types'
import { env } from '../config/env.js'
import * as authController from '../controllers/auth.controller.js'
import { authRateLimit } from '../middleware/rate-limit.js'
import { optionalAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

const router = Router()

router.post('/register', authRateLimit, validate(registerSchema), authController.register)
router.post('/login', authRateLimit, validate(loginSchema), authController.login)
router.post('/refresh', authController.refresh)
router.post('/logout', authController.logout)
router.get('/me', optionalAuth, authController.me)

if (env.googleClientId && env.googleClientSecret) {
  router.get('/google', authController.googleAuth)
  router.get('/google/callback', authController.googleCallback)
}

export default router
