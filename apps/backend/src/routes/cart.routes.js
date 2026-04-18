import { Router } from 'express'
import { cartItemSchema, updateCartItemSchema } from '@store/types'
import * as cartController from '../controllers/cart.controller.js'
import { optionalAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

const router = Router()

router.use(optionalAuth)
router.get('/', cartController.getCart)
router.post('/items', validate(cartItemSchema), cartController.addCartItem)
router.patch('/items/:variantId', validate(updateCartItemSchema), cartController.updateCartItem)

export default router
