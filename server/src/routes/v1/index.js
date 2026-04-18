import { Router } from 'express'
import productsRouter from './products.route.js'
import categoriesRouter from './categories.route.js'
import authRouter from './auth.route.js'
import cartRouter from './cart.route.js'
import adminRouter from './admin.route.js'

const router = Router()

router.use('/products', productsRouter)
router.use('/catalog', categoriesRouter)
router.use('/auth', authRouter)
router.use('/cart', cartRouter)
router.use('/admin', adminRouter)

export default router
