// client/src/store/index.js
import { create } from 'zustand'
import { cart as cartApi, auth as authApi } from '../api.js'

// ── Cookie helpers ────────────────────────────────────────────────────────────
function setCookie(name, value, days) {
  const expires = days
    ? `; expires=${new Date(Date.now() + days * 864e5).toUTCString()}`
    : ''
  document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Lax`
}

function getCookie(name) {
  const v = document.cookie.match(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`)
  return v ? decodeURIComponent(v[2]) : null
}

function deleteCookie(name) {
  document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`
}

function getCartCookie() {
  const raw = getCookie('tf_cart')
  if (!raw) return []
  try { return JSON.parse(raw) } catch { return [] }
}

function saveCartCookie(items, isLoggedIn) {
  if (items.length === 0) { deleteCookie('tf_cart'); return }
  const value = JSON.stringify(items)
  if (isLoggedIn) {
    // No expiry for logged-in users
    setCookie('tf_cart', value, null)
  } else {
    // 1 day for guests
    setCookie('tf_cart', value, 1)
  }
}

// ── Cart store ────────────────────────────────────────────────────────────────
export const useCart = create((set, get) => ({
  items: getCartCookie(),
  loading: false,

  async fetch() {
    try {
      const data = await cartApi.get()
      const items = data.items || []
      set({ items })
      const isLoggedIn = !!localStorage.getItem('tf_token')
      saveCartCookie(items, isLoggedIn)
    } catch {}
  },

  async add(product) {
    const isLoggedIn = !!localStorage.getItem('tf_token')
    set(s => {
      const existing = s.items.find(i => i.product_id === product.id)
      let items
      if (existing) {
        items = s.items.map(i => i.product_id === product.id ? { ...i, qty: i.qty + 1 } : i)
      } else {
        items = [...s.items, {
          product_id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          fallback_bg: product.fallback_bg,
          qty: 1
        }]
      }
      saveCartCookie(items, isLoggedIn)
      return { items }
    })
    try { await cartApi.add(product.id) } catch {}
  },

  async remove(productId) {
    const isLoggedIn = !!localStorage.getItem('tf_token')
    // Find the item to get the DB id for the API call
    const item = get().items.find(i => i.product_id === productId || i.id === productId)
    const dbId = item?.id

    // Optimistic: remove by product_id
    set(s => {
      const items = s.items.filter(i => i.product_id !== productId && i.id !== productId)
      saveCartCookie(items, isLoggedIn)
      return { items }
    })

    if (dbId) {
      try { await cartApi.remove(dbId) } catch {}
    }
  },

  clearCart() {
    deleteCookie('tf_cart')
    set({ items: [] })
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
      // Fetch server cart and merge, then resave cookie without expiry
      try {
        const data = await import('../api.js').then(m => m.cart.get())
        const items = data.items || []
        if (items.length > 0) {
          useCart.setState({ items })
          saveCartCookie(items, true)
        }
      } catch {}
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
    // Clear the persistent (no-expiry) cart and switch to guest cookie (1 day)
    const currentItems = useCart.getState().items
    deleteCookie('tf_cart')
    if (currentItems.length > 0) {
      saveCartCookie(currentItems, false) // re-save with 1-day expiry
    }
    set({ user: null, error: null })
  },
}))
