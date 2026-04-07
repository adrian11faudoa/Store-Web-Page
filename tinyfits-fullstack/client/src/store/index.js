// client/src/store/index.js
import { create } from 'zustand'
import { cart as cartApi, auth as authApi } from '../api.js'

// ── Cart store ────────────────────────────────────────────────────────────────
export const useCart = create((set, get) => ({
  items: [],
  loading: false,

  async fetch() {
    try {
      const data = await cartApi.get()
      set({ items: data.items })
    } catch {}
  },

  async add(product) {
    // Optimistic local update
    set(s => {
      const existing = s.items.find(i => i.product_id === product.id)
      if (existing) {
        return { items: s.items.map(i => i.product_id === product.id ? { ...i, qty: i.qty + 1 } : i) }
      }
      return { items: [...s.items, { product_id: product.id, name: product.name, price: product.price, image_url: product.image_url, fallback_bg: product.fallback_bg, qty: 1 }] }
    })
    try { await cartApi.add(product.id) } catch {}
  },

  async remove(itemId) {
    set(s => ({ items: s.items.filter(i => i.id !== itemId) }))
    try { await cartApi.remove(itemId) } catch {}
  },

  get count() { return get().items.reduce((s, i) => s + i.qty, 0) },
  get total()  { return get().items.reduce((s, i) => s + i.price * i.qty, 0) },
}))

// ── Auth store ────────────────────────────────────────────────────────────────
export const useAuth = create((set) => ({
  user: JSON.parse(localStorage.getItem('tf_user') || 'null'),
  loading: false,
  error: null,

  async login(email, password) {
    set({ loading: true, error: null })
    try {
      const { token, user } = await authApi.login({ email, password })
      localStorage.setItem('tf_token', token)
      localStorage.setItem('tf_user', JSON.stringify(user))
      set({ user, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  async register(email, password, name) {
    set({ loading: true, error: null })
    try {
      const { token, user } = await authApi.register({ email, password, name })
      localStorage.setItem('tf_token', token)
      localStorage.setItem('tf_user', JSON.stringify(user))
      set({ user, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  logout() {
    localStorage.removeItem('tf_token')
    localStorage.removeItem('tf_user')
    set({ user: null })
  },
}))
