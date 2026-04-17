// client/src/hooks/useProducts.js
import { useState, useEffect, useCallback } from 'react'
import { products as productsApi } from '../api.js'
import { DEFAULT_PRODUCT_FILTERS, buildProductParams } from '../lib/productFilters.js'

export function useProducts(initialFilters = {}) {
  const [filters, setFilters] = useState({ ...DEFAULT_PRODUCT_FILTERS, ...initialFilters })

  const [state, setState] = useState({
    products: [],
    total: 0,
    totalPages: 0,
    loading: true,
    error: null,
  })

  const fetchProducts = useCallback(async (f, signal) => {
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const data = await productsApi.list(buildProductParams(f), { signal })
      setState({ products: data.products, total: data.total, totalPages: data.totalPages, loading: false, error: null })
    } catch (err) {
      if (err.name === 'AbortError') return
      setState(s => ({ ...s, loading: false, error: err.message }))
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const debounce = setTimeout(() => fetchProducts(filters, controller.signal), filters.q ? 300 : 0)
    return () => {
      clearTimeout(debounce)
      controller.abort()
    }
  }, [filters, fetchProducts])

  function update(patch) {
    setFilters(f => ({ ...f, ...patch, page: patch.page ?? 1 }))
  }

  function setPage(page) {
    setFilters(f => ({ ...f, page }))
  }

  return { ...state, filters, update, setPage }
}

export function useProduct(id) {
  const [state, setState] = useState({ product: null, related: [], loading: true, error: null })

  useEffect(() => {
    if (!id) return
    const controller = new AbortController()
    setState({ product: null, related: [], loading: true, error: null })
    Promise.all([
      productsApi.get(id, { signal: controller.signal }),
      productsApi.related(id, { signal: controller.signal }),
    ])
      .then(([product, related]) => setState({ product, related, loading: false, error: null }))
      .catch(err => {
        if (err.name === 'AbortError') return
        setState(s => ({ ...s, loading: false, error: err.message }))
      })
    return () => controller.abort()
  }, [id])

  return state
}
