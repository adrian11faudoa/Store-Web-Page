import { apiRequest } from './api/client.js'

export function fetchCart() {
  return apiRequest('/cart')
}

export function addCartItem(productId, quantity = 1) {
  return apiRequest('/cart/items', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  })
}

export function updateCartItem(productId, quantity) {
  return apiRequest(`/cart/items/${productId}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  })
}
