import { Router } from 'express'
import { asyncHandler } from '../../middleware/async-handler.js'
import { requireAuth } from '../../middleware/auth.js'
import { authRateLimit } from '../../middleware/rate-limit.js'
import { validate } from '../../middleware/validate.js'
import {
  forgotPasswordSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  resetPasswordSchema,
} from '../../schemas/auth.schema.js'
import {
  forgotPassword,
  getCurrentUser,
  login,
  logout,
  refresh,
  register,
  resetPassword,
} from '../../controllers/auth.controller.js'
import googleRouter from './google.route.js'

const router = Router()

router.post('/register', authRateLimit, validate(registerSchema), asyncHandler(register))
router.post('/login', authRateLimit, validate(loginSchema), asyncHandler(login))
router.post('/forgot-password', authRateLimit, validate(forgotPasswordSchema), asyncHandler(forgotPassword))
router.post('/reset-password', authRateLimit, validate(resetPasswordSchema), asyncHandler(resetPassword))
router.post('/refresh', validate(refreshSchema), asyncHandler(refresh))
router.post('/logout', asyncHandler(logout))
router.get('/me', requireAuth, asyncHandler(getCurrentUser))
router.use('/', googleRouter)

export default router
