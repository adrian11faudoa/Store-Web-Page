import { useMemo } from 'react'
import { useAppStore } from '../store/useAppStore.js'
import { ProductCard } from '../components/ProductCard.jsx'

export function HomePage() {
  const store = useAppStore()
  const products = store.catalog.products
  const addToCart = store.addToCart
  const featuredProducts = useMemo(() => products.slice(0, 3), [products])

  return (
    <section className="hero-grid">
      <div className="hero-panel">
        <p className="eyebrow">SaaS storefront foundation</p>
        <h1>Merchandised catalog, hardened auth, and deployable infrastructure.</h1>
        <p>
          This frontend now runs on a centralized API layer, secure cookie auth, versioned backend APIs,
          and a normalized PostgreSQL data model.
        </p>
      </div>
      <div className="product-grid">
        {featuredProducts.map(product => (
          <ProductCard key={product.id} product={product} onAddToCart={variantId => addToCart(variantId)} />
        ))}
      </div>
    </section>
  )
}
