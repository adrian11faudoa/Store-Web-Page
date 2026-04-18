import { create } from 'zustand'
import { authService } from '../services/authService.js'
import { catalogService } from '../services/catalogService.js'
import { cartService } from '../services/cartService.js'

export const useAppStore = create((set, get) => ({
  auth: {
    user: null,
  },
  catalog: {
    categories: [],
    products: [],
    pagination: { page: 1, limit: 12, total: 0, totalPages: 1 },
    selectedProduct: null,
    filters: {
      page: 1,
      limit: 12,
      category: '',
      q: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    },
  },
  cart: {
    cart: { items: [] },
  },
  ui: {
    cartOpen: false,
    pendingRequests: 0,
    lastError: '',
  },

  setCartOpen(value) {
    set(state => ({ ui: { ...state.ui, cartOpen: value } }))
  },

  beginRequest() {
    set(state => ({
      ui: {
        ...state.ui,
        pendingRequests: state.ui.pendingRequests + 1,
      },
    }))
  },

  endRequest() {
    set(state => ({
      ui: {
        ...state.ui,
        pendingRequests: Math.max(0, state.ui.pendingRequests - 1),
      },
    }))
  },

  setError(message) {
    set(state => ({
      ui: {
        ...state.ui,
        lastError: message,
      },
    }))
  },

  clearError() {
    set(state => ({
      ui: {
        ...state.ui,
        lastError: '',
      },
    }))
  },

  async runTracked(task) {
    const { beginRequest, endRequest, setError, clearError } = get()
    beginRequest()
    try {
      clearError()
      return await task()
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      endRequest()
    }
  },

  async bootstrap() {
    const { runTracked, loadCatalog, loadCategories, loadCart, loadSession } = get()
    await runTracked(async () => {
      await authService.ensureCsrf()
      await Promise.all([loadSession(), loadCategories(), loadCatalog(), loadCart()])
    })
  },

  async loadSession() {
    try {
      const response = await authService.getSession()
      set(state => ({
        auth: {
          ...state.auth,
          user: response.user,
        },
      }))
    } catch {
      set(state => ({
        auth: {
          ...state.auth,
          user: null,
        },
      }))
    }
  },

  async register(payload) {
    const { runTracked, loadSession } = get()
    return runTracked(async () => {
      await authService.register(payload)
      await loadSession()
    })
  },

  async login(payload) {
    const { runTracked, loadSession } = get()
    return runTracked(async () => {
      await authService.login(payload)
      await loadSession()
    })
  },

  async logout() {
    const { runTracked } = get()
    return runTracked(async () => {
      await authService.logout()
      set(state => ({
        auth: {
          ...state.auth,
          user: null,
        },
      }))
    })
  },

  async loadCategories() {
    const { runTracked } = get()
    return runTracked(async () => {
      const response = await catalogService.listCategories()
      set(state => ({
        catalog: {
          ...state.catalog,
          categories: response.items,
        },
      }))
    })
  },

  async loadCatalog(overrides = {}) {
    const { runTracked } = get()
    return runTracked(async () => {
      const filters = { ...get().catalog.filters, ...overrides }
      const response = await catalogService.listProducts(filters)
      set(state => ({
        catalog: {
          ...state.catalog,
          filters,
          products: response.items,
          pagination: response.pagination,
        },
      }))
    })
  },

  async loadProduct(slug) {
    const { runTracked } = get()
    return runTracked(async () => {
      const response = await catalogService.getProduct(slug)
      set(state => ({
        catalog: {
          ...state.catalog,
          selectedProduct: response.product,
        },
      }))
    })
  },

  async loadCart() {
    const { runTracked } = get()
    return runTracked(async () => {
      const response = await cartService.getCart()
      set(state => ({
        cart: {
          ...state.cart,
          cart: response.cart,
        },
      }))
    })
  },

  async addToCart(variantId, quantity = 1) {
    const { runTracked } = get()
    return runTracked(async () => {
      const response = await cartService.addItem({ variantId, quantity })
      set(state => ({
        cart: {
          ...state.cart,
          cart: response.cart,
        },
        ui: {
          ...state.ui,
          cartOpen: true,
        },
      }))
    })
  },

  async updateCartItem(variantId, quantity) {
    const { runTracked } = get()
    return runTracked(async () => {
      const response = await cartService.updateItem(variantId, { quantity })
      set(state => ({
        cart: {
          ...state.cart,
          cart: response.cart,
        },
      }))
    })
  },
}))
