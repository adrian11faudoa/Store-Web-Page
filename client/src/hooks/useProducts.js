// client/src/hooks/useProducts.js
import { useState, useEffect, useCallback } from 'react'
import { products as productsApi } from '../api.js'

export function useProducts(initialFilters = {}) {
  const [filters, setFilters] = useState({
    category: 'all',
    ageGroup: 'all',
    gender:   'all',
    maxPrice: 70,
    badge: '',
    q: '',
    sort: 'featured',
    page: 1,
    limit: 48,
    ...initialFilters,
  })

  const [state, setState] = useState({
    products: [],
    total: 0,
    totalPages: 0,
    loading: true,
    error: null,
  })

  const fetchProducts = useCallback(async (f) => {
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const params = {
        ...(f.category && f.category !== 'all' ? { category: f.category } : {}),
        ...(f.ageGroup && f.ageGroup !== 'all' ? { ageGroup: f.ageGroup } : {}),
        ...(f.gender && f.gender !== 'all' ? { gender: f.gender } : {}),
        maxPrice: f.maxPrice,
        ...(f.badge ? { badge: f.badge } : {}),
        ...(f.q ? { q: f.q } : {}),
        sort: f.sort,
        page: f.page,
        limit: f.limit,
      }
      const data = await productsApi.list(params)
      setState({ products: data.products, total: data.total, totalPages: data.totalPages, loading: false, error: null })
    } catch (err) {
      setState(s => ({ ...s, loading: false, error: err.message }))
    }
  }, [])

  useEffect(() => {
    const debounce = setTimeout(() => fetchProducts(filters), filters.q ? 300 : 0)
    return () => clearTimeout(debounce)
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
    setState({ product: null, related: [], loading: true, error: null })
    Promise.all([
      productsApi.get(id),
      productsApi.related(id),
    ])
      .then(([product, related]) => setState({ product, related, loading: false, error: null }))
      .catch(err => setState(s => ({ ...s, loading: false, error: err.message })))
  }, [id])

  return state
}
