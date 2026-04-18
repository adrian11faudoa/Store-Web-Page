import { apiClient } from './apiClient.js'

export const cartService = {
  getCart() {
    return apiClient.get('/cart')
  },
  addItem(payload) {
    return apiClient.post('/cart/items', payload)
  },
  updateItem(variantId, payload) {
    return apiClient.patch(`/cart/items/${variantId}`, payload)
  },
}
