import { Router } from 'express'
import { USER_ROLES } from '@store/config'
import * as adminController from '../controllers/admin.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth, requireRole(USER_ROLES.ADMIN))
router.get('/users', adminController.listUsers)

export default router
