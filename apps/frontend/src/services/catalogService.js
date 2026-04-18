import { apiClient } from './apiClient.js'

export const catalogService = {
  listCategories() {
    return apiClient.get('/catalog/categories')
  },
  listProducts(filters) {
    const query = new URLSearchParams(
      Object.entries(filters).filter(([, value]) => value !== '' && value !== undefined),
    )

    return apiClient.get(`/catalog/products?${query.toString()}`)
  },
  getProduct(slug) {
    return apiClient.get(`/catalog/products/${slug}`)
  },
}
