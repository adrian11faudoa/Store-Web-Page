import express from 'express'
import { Router } from 'express'
import { asyncHandler } from '../../middleware/async-handler.js'
import { validate } from '../../middleware/validate.js'
import {
  createProduct,
  deleteProduct,
  exportProducts,
  getProduct,
  importProducts,
  listProducts,
  updateProduct,
} from '../../controllers/product.controller.js'
import {
  createProductSchema,
  productIdSchema,
  productListSchema,
  updateProductSchema,
} from '../../schemas/product.schema.js'

const router = Router()

router.get('/', validate(productListSchema), asyncHandler(listProducts))
router.get('/export', asyncHandler(exportProducts))
router.post('/import', express.text({ type: ['text/csv', 'application/csv', 'text/plain'], limit: '2mb' }), asyncHandler(importProducts))
router.post('/', validate(createProductSchema), asyncHandler(createProduct))
router.get('/:id', validate(productIdSchema), asyncHandler(getProduct))
router.put('/:id', validate(updateProductSchema), asyncHandler(updateProduct))
router.delete('/:id', validate(productIdSchema), asyncHandler(deleteProduct))

export default router
