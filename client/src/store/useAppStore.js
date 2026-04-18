import { create } from 'zustand'
import { addCartItem, fetchCart, updateCartItem } from '../services/cart.js'
import { fetchProducts } from '../services/products.js'

function normalizeProduct(product) {
  return {
    ...product,
    id: String(product.id),
    category: product.category || 'uncategorized',
    ageGroup: product.age_range || product.age_group || 'all ages',
    badge: product.badge || '',
    description: product.description || `${product.category_label || 'Collection'} essential for everyday wear.`,
    palette: [product.fallback_bg || '#EEEDFE', '#ffffff'],
    sizes: product.sizes?.length ? product.sizes : ['One Size'],
    featured: product.badge === 'featured',
  }
}

function normalizeCartItem(item) {
  return {
    productId: item.product_id,
    name: item.name,
    price: Number(item.price),
    quantity: Number(item.quantity),
    size: item.size || '',
    palette: [item.fallback_bg || '#EEEDFE', '#ffffff'],
  }
}

export const useAppStore = create((set, get) => ({
  products: [],
  productsMeta: { page: 1, limit: 24, total: 0, totalPages: 1 },
  cartItems: [],
  loadingProducts: false,
  loadingCart: false,
  error: '',

  async loadProducts(params = {}) {
    set({ loadingProducts: true, error: '' })
    try {
      const response = await fetchProducts(params)
      set({
        products: response.data.map(normalizeProduct),
        productsMeta: response.meta,
        loadingProducts: false,
      })
    } catch (error) {
      set({ loadingProducts: false, error: error.message })
    }
  },

  async loadCart() {
    set({ loadingCart: true, error: '' })
    try {
      const response = await fetchCart()
      set({ cartItems: response.data.map(normalizeCartItem), loadingCart: false })
    } catch (error) {
      set({ loadingCart: false, error: error.message })
    }
  },

  async addToCart(productId, quantity = 1) {
    const response = await addCartItem(Number(productId), quantity)
    set({ cartItems: response.data.map(normalizeCartItem) })
  },

  async updateCart(productId, quantity) {
    const response = await updateCartItem(Number(productId), quantity)
    set({ cartItems: response.data.map(normalizeCartItem) })
  },

  getProductById(productId) {
    return get().products.find(product => product.id === String(productId)) || null
  },
}))
