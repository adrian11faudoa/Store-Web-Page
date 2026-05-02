import { Router } from 'express'
import { phoneCodeRequestSchema, phoneCodeVerifySchema } from '@store/types'
import * as authController from '../controllers/auth.controller.js'
import { authRateLimit } from '../middleware/rate-limit.js'
import { optionalAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

const router = Router()

router.post('/phone/request-code', authRateLimit, validate(phoneCodeRequestSchema), authController.requestPhoneCode)
router.post('/phone/verify-code', authRateLimit, validate(phoneCodeVerifySchema), authController.verifyPhoneCode)
router.post('/refresh', authController.refresh)
router.post('/logout', authController.logout)
router.get('/me', optionalAuth, authController.me)

export default router
