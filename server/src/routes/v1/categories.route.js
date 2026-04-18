import { Router } from 'express'
import { asyncHandler } from '../../middleware/async-handler.js'
import { listCategories } from '../../controllers/category.controller.js'

const router = Router()

router.get('/', asyncHandler(listCategories))

export default router
