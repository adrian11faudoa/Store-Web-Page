import { create } from 'zustand'
import { cart as cartApi, auth as authApi } from '../api.js'

function setCookie(name, value, days) {
  const expires = days
    ? `; expires=${new Date(Date.now() + days * 864e5).toUTCString()}`
    : ''
  document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Lax`
}

function getCookie(name) {
  const value = document.cookie.match(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`)
  return value ? decodeURIComponent(value[2]) : null
}

function deleteCookie(name) {
  document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`
}

function isLoggedIn() {
  return !!localStorage.getItem('tf_token')
}

function normalizeCartItem(item) {
  return {
    ...item,
    product_id: Number(item.product_id ?? item.productId),
    qty: Number(item.qty) || 0,
    size: item.size || null,
  }
}

function getCartCookie() {
  const raw = getCookie('tf_cart')
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map(normalizeCartItem).filter(item => item.qty > 0) : []
  } catch {
    return []
  }
}

function saveCartCookie(items, loggedIn) {
  if (items.length === 0) {
    deleteCookie('tf_cart')
    return
  }

  const value = JSON.stringify(items.map(item => ({
    ...item,
    size: item.size || null,
  })))

  if (loggedIn) {
    setCookie('tf_cart', value, null)
  } else {
    setCookie('tf_cart', value, 1)
  }
}

function getCartItemKey(productId, size = null) {
  return `${productId}::${size || ''}`
}

function hydrateCart(items) {
  const normalized = items.map(normalizeCartItem)
  saveCartCookie(normalized, isLoggedIn())
  return normalized
}

async function runCartMutation(set, action, rollbackItems, keepOptimistic = false) {
  set({ loading: true })
  try {
    const data = await action()
    set({ items: hydrateCart(data.items || []), loading: false })
  } catch {
    if (!keepOptimistic && rollbackItems) {
      saveCartCookie(rollbackItems, isLoggedIn())
      set({ items: rollbackItems, loading: false })
      return
    }
    set({ loading: false })
  }
}

export const useCart = create((set, get) => ({
  items: getCartCookie(),
  loading: false,

  async fetch() {
    const cookieItems = getCartCookie()
    set({ loading: true })

    try {
      let data = await cartApi.get()
      let items = data.items || []

      if (cookieItems.length > 0) {
        const serverKeys = new Set(items.map(item => getCartItemKey(item.product_id, item.size)))
        const hasMissingCookieItems = cookieItems.some(
          item => !serverKeys.has(getCartItemKey(item.product_id, item.size))
        )

        if (items.length === 0 || hasMissingCookieItems) {
          data = await cartApi.sync(cookieItems)
          items = data.items || []
        }
      }

      set({ items: hydrateCart(items), loading: false })
    } catch {
      set({ items: cookieItems, loading: false })
      saveCartCookie(cookieItems, isLoggedIn())
    }
  },

  async add(product) {
    const size = product.selectedSize || null
    const previousItems = get().items

    set(state => {
      const existing = state.items.find(item => (
        getCartItemKey(item.product_id, item.size) === getCartItemKey(product.id, size)
      ))

      const items = existing
        ? state.items.map(item => (
            getCartItemKey(item.product_id, item.size) === getCartItemKey(product.id, size)
              ? { ...item, qty: item.qty + 1 }
              : item
          ))
        : [
            ...state.items,
            {
              product_id: product.id,
              name: product.name,
              price: product.price,
              image_url: product.image_url,
              fallback_bg: product.fallback_bg,
              qty: 1,
              size,
            },
          ]

      saveCartCookie(items, isLoggedIn())
      return { items }
    })

    await runCartMutation(set, () => cartApi.add(product.id, 1, size), previousItems, true)
  },

  async setQuantity(productId, qty, size = null) {
    const previousItems = get().items
    const nextQty = Math.max(0, Number(qty) || 0)

    set(state => {
      const items = nextQty === 0
        ? state.items.filter(item => (
            getCartItemKey(item.product_id, item.size) !== getCartItemKey(productId, size)
          ))
        : state.items.map(item => (
            getCartItemKey(item.product_id, item.size) === getCartItemKey(productId, size)
              ? { ...item, qty: nextQty }
              : item
          ))

      saveCartCookie(items, isLoggedIn())
      return { items }
    })

    await runCartMutation(set, () => cartApi.setQuantity(productId, nextQty, size), previousItems, true)
  },

  async remove(productId, size = null) {
    return get().setQuantity(productId, 0, size)
  },

  async removeItem(itemId, fallbackProductId = null, fallbackSize = null) {
    const previousItems = get().items
    const items = previousItems.filter(item => {
      if (itemId != null && item.id != null) return item.id !== itemId
      return getCartItemKey(item.product_id, item.size) !== getCartItemKey(fallbackProductId, fallbackSize)
    })

    saveCartCookie(items, isLoggedIn())
    set({ items, loading: true })

    if (itemId == null) {
      try {
        await cartApi.removeByProduct(fallbackProductId, fallbackSize)
      } catch {}
      set({ loading: false })
      return
    }

    await runCartMutation(
      set,
      async () => {
        try {
          return await cartApi.remove(itemId)
        } catch {
          return cartApi.removeByProduct(fallbackProductId, fallbackSize)
        }
      },
      previousItems,
      true
    )
  },

  clearCart() {
    deleteCookie('tf_cart')
    set({ items: [] })
  },
}))

async function syncCartAfterAuth() {
  const cookieItems = getCartCookie()

  if (cookieItems.length > 0) {
    const data = await cartApi.sync(cookieItems)
    const items = data.items || []
    useCart.setState({ items: hydrateCart(items) })
    return
  }

  const data = await cartApi.get()
  const items = data.items || []
  useCart.setState({ items: hydrateCart(items) })
}

export const useAuth = create(set => ({
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

      try {
        await syncCartAfterAuth()
      } catch {}
    } catch (err) {
      set({ error: err.message, loading: false })
      throw err
    }
  },

  async register(email, password, name) {
    set({ loading: true, error: null })
    try {
      await authApi.register({ email, password, name })
      set({ loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
      throw err
    }
  },

  setGoogleUser(token, user) {
    localStorage.setItem('tf_token', token)
    localStorage.setItem('tf_user', JSON.stringify(user))
    set({ user, error: null, loading: false })

    syncCartAfterAuth().catch(() => {})
  },

  logout() {
    localStorage.removeItem('tf_token')
    localStorage.removeItem('tf_user')

    const currentItems = useCart.getState().items
    deleteCookie('tf_cart')
    if (currentItems.length > 0) {
      saveCartCookie(currentItems, false)
    }

    set({ user: null, error: null })
  },
}))
