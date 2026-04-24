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

export async function createProduct(req, res) {
  const product = await productService.createProduct(req.validated.body)
  res.status(201).json({ data: product })
}

export async function updateProduct(req, res) {
  const product = await productService.updateProduct(req.validated.params.id, req.validated.body)
  res.json({ data: product })
}

export async function deleteProduct(req, res) {
  await productService.deleteProduct(req.validated.params.id)
  res.status(204).send()
}

export async function exportProducts(req, res) {
  const csv = await productService.exportProductsCsv()
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="products-${new Date().toISOString().slice(0, 10)}.csv"`)
  res.send(csv)
}

export async function importProducts(req, res) {
  const content = typeof req.body === 'string' ? req.body : ''
  const result = await productService.importProductsCsv(content)
  res.status(201).json({ data: result })
}
