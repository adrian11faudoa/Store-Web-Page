import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'

const HERO_IMAGE = `${import.meta.env.BASE_URL}assets/images/catalog-hero.svg`

const categoryHighlights = [
  { title: 'Play-ready sets', description: 'Soft coordinates that make busy mornings easier.', query: 'set' },
  { title: 'Denim staples', description: 'Durable layers designed for school days and weekends.', query: 'denim' },
  { title: 'Occasion outfits', description: 'Polished looks for parties, portraits, and milestones.', query: 'dress' },
]

export default function Home({ featuredProducts, cart, loading, error, openCart }) {
  return (
    <>
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__content">
            <p className="eyebrow">Portfolio-ready storefront</p>
            <h1>Children&apos;s fashion presented like a modern product team would ship it.</h1>
            <p className="hero__copy">
              Dynamic catalog data, polished filtering, accessible interactions,
              persistent cart behavior, and GitHub Pages-ready deployment.
            </p>
            <div className="hero__actions">
              <Link className="button" to="/shop">Browse catalog</Link>
              <button type="button" className="button button--ghost" onClick={openCart}>
                Open cart ({cart.itemCount})
              </button>
            </div>
            <dl className="hero__stats">
              <div><dt>12</dt><dd>Curated products</dd></div>
              <div><dt>4</dt><dd>Core categories</dd></div>
              <div><dt>100%</dt><dd>Client-side deployable</dd></div>
            </dl>
          </div>
          <div className="hero__media">
            <img src={HERO_IMAGE} alt="Illustrated kids storefront display" width="560" height="420" />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Why this rebuild works</p>
              <h2>Cleaner structure, stronger UX, easier maintenance</h2>
            </div>
          </div>
          <div className="highlight-grid">
            {categoryHighlights.map(item => (
              <article key={item.title} className="highlight-card">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <Link to={`/shop?q=${item.query}`}>Explore</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--muted">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Featured products</p>
              <h2>Built from JSON data, not hardcoded markup</h2>
            </div>
            <Link className="text-link" to="/shop">See full catalog</Link>
          </div>

          {loading ? (
            <div className="empty-state">
              <p>Loading featured products...</p>
            </div>
          ) : error ? (
            <div className="empty-state">
              <h3>Catalog unavailable</h3>
              <p>{error}</p>
            </div>
          ) : (
            <div className="product-grid">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} onAddToCart={cart.addItem} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
