// client/src/api.js
// Central API client — all backend calls go through here

const BASE = '/api'

function getHeaders() {
  const token = localStorage.getItem('tf_token')
  const session = localStorage.getItem('tf_session') || crypto.randomUUID()
  localStorage.setItem('tf_session', session)
  return {
    'Content-Type': 'application/json',
    'x-session-id': session,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...getHeaders(), ...options.headers },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

// ── Products ──────────────────────────────────────────────────────────────────

export const products = {
  list(params = {}) {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
    ).toString()
    return request(`/products${qs ? `?${qs}` : ''}`)
  },
  get(id)         { return request(`/products/${id}`) },
  related(id)     { return request(`/products/${id}/related`) },
}

// ── Categories ────────────────────────────────────────────────────────────────

export const categories = {
  list()      { return request('/categories') },
  ageGroups() { return request('/categories/age-groups') },
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export const auth = {
  register(body) { return request('/auth/register', { method: 'POST', body: JSON.stringify(body) }) },
  login(body)    { return request('/auth/login',    { method: 'POST', body: JSON.stringify(body) }) },
}

// ── Cart ──────────────────────────────────────────────────────────────────────

export const cart = {
  get()              { return request('/cart') },
  add(productId, qty = 1) {
    return request('/cart/add', { method: 'POST', body: JSON.stringify({ productId, qty }) })
  },
  remove(itemId) { return request(`/cart/${itemId}`, { method: 'DELETE' }) },
}
