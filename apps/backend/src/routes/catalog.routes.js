import { Router } from 'express'
import { productFiltersSchema } from '@store/types'
import * as catalogController from '../controllers/catalog.controller.js'
import { validate } from '../middleware/validate.js'

const router = Router()

router.get('/categories', catalogController.listCategories)
router.get('/products', validate(productFiltersSchema, 'query'), catalogController.listProducts)
router.get('/products/:slug', catalogController.getProduct)

export default router
