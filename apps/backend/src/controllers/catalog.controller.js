import { sendSuccess } from '../utils/api-response.js'
import * as catalogService from '../services/catalog.service.js'

export async function listCategories(_req, res) {
  const categories = await catalogService.getCategories()
  return sendSuccess(res, { items: categories })
}

export async function listProducts(req, res) {
  const products = await catalogService.getProducts(req.validated.query)
  return sendSuccess(res, products)
}

export async function getProduct(req, res) {
  const product = await catalogService.getProduct(req.params.slug)
  return sendSuccess(res, { product })
}
