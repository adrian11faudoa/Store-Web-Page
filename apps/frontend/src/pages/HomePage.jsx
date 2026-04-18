import { useAppStore } from '../store/useAppStore.js'
import { ProductCard } from '../components/ProductCard.jsx'

export function HomePage() {
  const products = useAppStore(state => state.catalog.products.slice(0, 3))
  const addToCart = useAppStore(state => state.addToCart)

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
        {products.map(product => (
          <ProductCard key={product.id} product={product} onAddToCart={variantId => addToCart(variantId)} />
        ))}
      </div>
    </section>
  )
}
