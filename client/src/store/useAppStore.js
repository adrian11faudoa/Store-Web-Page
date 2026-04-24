import { create } from 'zustand'
import { apiRequest, setAccessToken, setAuthFailureHandler } from '../services/api/client.js'
import { addCartItem, fetchCart, updateCartItem } from '../services/cart.js'
import { fetchProducts } from '../services/products.js'

function normalizeProduct(product) {
  const imagenes = Array.isArray(product.imagenes)
    ? product.imagenes.filter(Boolean)
    : (product.image_url ? [product.image_url] : [])
  const talla = Array.isArray(product.talla)
    ? product.talla
    : (typeof product.talla === 'string' && product.talla ? [product.talla] : [])
  const sizes = talla.length ? talla : (product.sizes?.length ? product.sizes : ['One Size'])
  const primaryColor = product.colorPrimario || product.color_primario || product.fallback_bg || '#FF8E9E'
  const secondaryColor = product.colorSecundario || product.color_secundario || product.palette?.[1] || '#ffffff'
  const nombre = product.nombre || product.name
  const genero = product.genero || product.gender || 'unisex'
  const tipoPrenda = product.tipoPrenda || product.tipo_prenda || product.category_label || product.category || 'general'
  const temporada = product.temporada || 'general'

  return {
    ...product,
    id: String(product.id),
    temporada,
    nombre,
    genero,
    colorPrimario: primaryColor,
    colorSecundario: secondaryColor,
    estampado: product.estampado || 'sin estampado',
    talla: sizes,
    precio: Number(product.precio ?? product.price ?? 0),
    existencia: Number(product.existencia ?? 0),
    tipoPrenda,
    imagenes,
    category: product.category || tipoPrenda || 'uncategorized',
    ageGroup: product.age_range || product.age_group || 'all ages',
    badge: product.badge || '',
    description: product.description || `${temporada} ${tipoPrenda} con ${product.estampado || 'acabado limpio'} para ${genero}.`,
    palette: product.palette?.length ? product.palette : [primaryColor, secondaryColor],
    sizes,
    featured: product.badge === 'featured',
    old_price: Number(product.old_price || 0),
    price: Number(product.precio ?? product.price ?? 0),
    rating: Number(product.rating || 4.5),
    releaseDate: product.release_date || product.releaseDate || new Date().toISOString(),
    image_url: imagenes[0] || product.image_url || '',
    tags: product.tags || [],
    name: nombre,
    gender: genero,
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
    authInitialized: false,
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
        set({
          user: res.data.user,
          accessToken: res.data.accessToken,
          authLoading: false,
          authInitialized: true,
        })
        return res.data.user
      } catch (err) {
        set({ authError: err.message, authLoading: false, authInitialized: true })
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
        set({
          user: res.data.user,
          accessToken: res.data.accessToken,
          authLoading: false,
          authInitialized: true,
        })
        return res.data.user
      } catch (err) {
        set({ authError: err.message, authLoading: false, authInitialized: true })
        return null
      }
    },

    async logout() {
      await apiRequest('/auth/logout', { method: 'POST', skipRefresh: true }).catch(() => {})
      setAccessToken(null)
      set({ user: null, accessToken: null, authError: '', authInitialized: true })
    },

    async loadCurrentUser() {
      try {
        const refreshed = await apiRequest('/auth/refresh', { method: 'POST', skipRefresh: true })
        setAccessToken(refreshed.data.accessToken)
        const res = await apiRequest('/auth/me')
        set({
          user: res.data,
          accessToken: refreshed.data.accessToken,
          authInitialized: true,
        })
      } catch {
        setAccessToken(null)
        set({ user: null, accessToken: null, authInitialized: true })
      }
    },

    getProductById(productId) {
      return get().products.find(product => product.id === String(productId)) || null
    },
  }
})
