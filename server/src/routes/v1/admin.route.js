import { Router } from 'express'
import { asyncHandler } from '../../middleware/async-handler.js'
import { requireAuth, requireRole } from '../../middleware/auth.js'
import { getOverview } from '../../controllers/admin.controller.js'

const router = Router()

router.get('/overview', requireAuth, requireRole(['admin']), asyncHandler(getOverview))

export default router
