import { useEffect, useState } from 'react'
import { fetchProducts } from '../assets/js/api/products.js'

export function useProducts() {
  const [state, setState] = useState({
    products: [],
    loading: true,
    error: '',
  })

  useEffect(() => {
    const controller = new AbortController()

    fetchProducts(controller.signal)
      .then(products => {
        setState({ products, loading: false, error: '' })
      })
      .catch(error => {
        if (error.name === 'AbortError') return
        setState({ products: [], loading: false, error: error.message })
      })

    return () => controller.abort()
  }, [])

  return state
}
