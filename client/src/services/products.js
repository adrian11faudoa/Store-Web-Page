import { API_BASE_URL, apiRequest } from './api/client.js'

export async function fetchProducts(params = {}) {
  const search = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value != null && value !== '' && value !== 'all')
  )

  return apiRequest(`/products?${search.toString()}`)
}

export async function fetchProduct(productId) {
  return apiRequest(`/products/${productId}`)
}

export async function createProduct(product) {
  return apiRequest('/products', {
    method: 'POST',
    body: JSON.stringify(product),
  })
}

export async function updateProduct(productId, product) {
  return apiRequest(`/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  })
}

export async function deleteProduct(productId) {
  return apiRequest(`/products/${productId}`, {
    method: 'DELETE',
  })
}

export async function exportProductsCsv() {
  const response = await fetch(`${API_BASE_URL}/products/export`)

  if (!response.ok) {
    throw new Error('Unable to export products')
  }

  return response.blob()
}

export async function importProductsCsv(file) {
  const csvText = await file.text()
  const response = await fetch(`${API_BASE_URL}/products/import`, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/csv',
    },
    body: csvText,
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: { message: 'Unable to import products' } }))
    throw new Error(payload.error?.message || 'Unable to import products')
  }

  return response.json()
}
