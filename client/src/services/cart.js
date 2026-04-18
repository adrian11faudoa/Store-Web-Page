import { apiRequest } from './api/client.js'

export function fetchCart() {
  return apiRequest('/cart')
}

export function addCartItem(productId, quantity = 1, size = '') {
  return apiRequest('/cart/items', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity, size }),
  })
}

export function updateCartItem(productId, quantity, size = '') {
  return apiRequest(`/cart/items/${productId}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity, size }),
  })
}
