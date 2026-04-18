import { Router } from 'express'
import authRoutes from './auth.routes.js'
import catalogRoutes from './catalog.routes.js'
import cartRoutes from './cart.routes.js'
import adminRoutes from './admin.routes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/catalog', catalogRoutes)
router.use('/cart', cartRoutes)
router.use('/admin', adminRoutes)

export default router
