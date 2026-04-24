import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import heroImage from '../assets/catalog-hero.svg'
import { useAppStore } from '../store/useAppStore.js'
import { ProductCard } from '../components/ProductCard.jsx'

export function HomePage() {
  const store = useAppStore()
  const products = store.catalog.products
  const addToCart = store.addToCart
  const cart = store.cart.cart
  const itemCount = Array.isArray(cart?.items) ? cart.items.length : 0
  const featuredProducts = useMemo(() => products.filter(product => product.isFeatured).slice(0, 4), [products])

  return (
    <>
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__content">
            <p className="eyebrow">New arrivals just landed</p>
            <h1>Dress them for every adventure</h1>
            <p className="hero__copy">
              Soft fabrics, playful colours, and styles that keep up with kids. Your imported catalog is now live with
              the real articles from your inventory.
            </p>
            <div className="hero__actions">
              <Link className="button" to="/shop">Shop now</Link>
              <Link className="button button--ghost" to="/checkout">View cart ({itemCount})</Link>
            </div>
            <dl className="hero__stats">
              <div><dt>{products.length}+</dt><dd>real items live</dd></div>
              <div><dt>Free</dt><dd>seeded catalog on local dev</dd></div>
              <div><dt>4.8★</dt><dd>shop-ready styling</dd></div>
            </dl>
          </div>
          <div className="hero__media">
            <img src={heroImage} alt="Playful kids storefront illustration" />
          </div>
        </div>
      </section>

      <section className="section section--muted">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Fresh picks for every playdate</p>
              <h2>Featured pieces from your imported catalog</h2>
            </div>
            <Link className="text-link" to="/shop">See full shop</Link>
          </div>

          <div className="product-grid">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} onAddToCart={variantId => addToCart(variantId)} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
