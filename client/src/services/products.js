import { apiRequest } from './api/client.js'

export async function fetchProducts(params = {}) {
  const search = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value != null && value !== '' && value !== 'all')
  )

  return apiRequest(`/products?${search.toString()}`)
}

export async function fetchProduct(productId) {
  return apiRequest(`/products/${productId}`)
}
