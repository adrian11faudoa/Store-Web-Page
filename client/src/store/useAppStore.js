import { create } from 'zustand'
import { apiRequest, setAccessToken, setAuthFailureHandler } from '../services/api/client.js'
import { addCartItem, fetchCart, updateCartItem } from '../services/cart.js'
import { fetchProducts } from '../services/products.js'

function normalizeProduct(product) {
  return {
    ...product,
    id: String(product.id),
    category: product.category || 'uncategorized',
    ageGroup: product.age_range || product.age_group || 'all ages',
    badge: product.badge || '',
    description: product.description || `${product.category_label || 'Collection'} picks made for everyday adventures.`,
    palette: product.palette?.length ? product.palette : [product.fallback_bg || '#FF8E9E', '#ffffff'],
    sizes: product.sizes?.length ? product.sizes : ['One Size'],
    featured: product.badge === 'featured',
    old_price: Number(product.old_price || 0),
    price: Number(product.price),
    rating: Number(product.rating || 4.5),
    releaseDate: product.release_date || product.releaseDate || new Date().toISOString(),
    image_url: product.image_url || '',
    tags: product.tags || [],
  }
}

function normalizeCartItem(item) {
  return {
    productId: item.product_id,
    name: item.name,
    price: Number(item.price),
    quantity: Number(item.quantity),
    size: item.size || '',
    palette: item.palette?.length ? item.palette : [item.fallback_bg || '#FF8E9E', '#ffffff'],
  }
}

export const useAppStore = create((set, get) => {
  setAuthFailureHandler(() => set({ user: null, accessToken: null, authError: '' }))

  return {
    products: [],
    productsMeta: { page: 1, limit: 24, total: 0, totalPages: 1 },
    cartItems: [],
    loadingProducts: false,
    loadingCart: false,
    error: '',
    user: null,
    accessToken: null,
    authLoading: false,
    authError: '',

    clearAuthError() {
      set({ authError: '' })
    },

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

    async addToCart(productId, size = '', quantity = 1) {
      const response = await addCartItem(Number(productId), quantity, size)
      set({ cartItems: response.data.map(normalizeCartItem) })
    },

    async updateCart(productId, size = '', quantity) {
      const response = await updateCartItem(Number(productId), quantity, size)
      set({ cartItems: response.data.map(normalizeCartItem) })
    },

    async login(email, password) {
      set({ authLoading: true, authError: '' })
      try {
        const res = await apiRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
          skipRefresh: true,
        })
        setAccessToken(res.data.accessToken)
        set({ user: res.data.user, accessToken: res.data.accessToken, authLoading: false })
        return res.data.user
      } catch (err) {
        set({ authError: err.message, authLoading: false })
        return null
      }
    },

    async register(email, password, name) {
      set({ authLoading: true, authError: '' })
      try {
        const res = await apiRequest('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ email, password, name }),
          skipRefresh: true,
        })
        setAccessToken(res.data.accessToken)
        set({ user: res.data.user, accessToken: res.data.accessToken, authLoading: false })
        return res.data.user
      } catch (err) {
        set({ authError: err.message, authLoading: false })
        return null
      }
    },

    async logout() {
      await apiRequest('/auth/logout', { method: 'POST', skipRefresh: true }).catch(() => {})
      setAccessToken(null)
      set({ user: null, accessToken: null, authError: '' })
    },

    async loadCurrentUser() {
      try {
        const refreshed = await apiRequest('/auth/refresh', { method: 'POST', skipRefresh: true })
        setAccessToken(refreshed.data.accessToken)
        const res = await apiRequest('/auth/me')
        set({
          user: res.data,
          accessToken: refreshed.data.accessToken,
        })
      } catch {
        setAccessToken(null)
        set({ user: null, accessToken: null })
      }
    },

    getProductById(productId) {
      return get().products.find(product => product.id === String(productId)) || null
    },
  }
})
