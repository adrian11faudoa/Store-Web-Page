import * as productService from '../services/product.service.js'

export async function listProducts(req, res) {
  const { query } = req.validated
  const result = await productService.listProducts(query)
  res.json(result)
}

export async function getProduct(req, res) {
  const product = await productService.getProductById(req.validated.params.id)
  res.json({ data: product })
}
