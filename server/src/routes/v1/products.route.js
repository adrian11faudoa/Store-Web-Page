import { Router } from 'express'
import { asyncHandler } from '../../middleware/async-handler.js'
import { validate } from '../../middleware/validate.js'
import { getProduct, listProducts } from '../../controllers/product.controller.js'
import { productIdSchema, productListSchema } from '../../schemas/product.schema.js'

const router = Router()

router.get('/', validate(productListSchema), asyncHandler(listProducts))
router.get('/:id', validate(productIdSchema), asyncHandler(getProduct))

export default router
