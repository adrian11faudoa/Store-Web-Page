import { Router } from 'express'
import { asyncHandler } from '../../middleware/async-handler.js'
import { optionalAuth } from '../../middleware/auth.js'
import { validate } from '../../middleware/validate.js'
import { addCartItem, getCart, updateCartItem } from '../../controllers/cart.controller.js'
import { addCartItemSchema, updateCartItemSchema } from '../../schemas/cart.schema.js'

const router = Router()

router.use(optionalAuth)
router.get('/', asyncHandler(getCart))
router.post('/items', validate(addCartItemSchema), asyncHandler(addCartItem))
router.patch('/items/:productId', validate(updateCartItemSchema), asyncHandler(updateCartItem))

export default router
