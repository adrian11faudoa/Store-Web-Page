const CART_STORAGE_KEY = 'sahara-kids-cart'

export function readCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function writeCart(items) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
}

export function getCartItemKey(productId, size) {
  return `${productId}::${size || 'default'}`
}

export function calculateCartTotals(items) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = items.length > 0 && subtotal < 120 ? 12 : 0
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  return { subtotal, shipping, tax, total }
}
