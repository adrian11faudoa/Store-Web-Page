import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import TrustStrip from '../components/TrustStrip.jsx'
import WaveDivider from '../components/WaveDivider.jsx'
import ProductSkeleton from '../components/ProductSkeleton.jsx'

const HERO_IMAGE = `${import.meta.env.BASE_URL}assets/images/catalog-hero.svg`

const categoryHighlights = [
  {
    title: 'Baby essentials',
    emoji: '🍼',
    description: 'Soft rompers, knit sets, and overalls for 0–24 months.',
    query: 'baby',
    color: 'var(--brand-baby)',
  },
  {
    title: 'Girls\' favourites',
    emoji: '🌸',
    description: 'Dresses, sets, and skirts in vibrant prints for every occasion.',
    query: 'girls',
    color: 'var(--brand-soft)',
  },
  {
    title: 'Boys\' picks',
    emoji: '🚀',
    description: 'Jackets, cargo shorts, tees — built for non-stop play.',
    query: 'boys',
    color: 'var(--brand-cool)',
  },
]

export default function Home({ featuredProducts, cart, loading, error, openCart }) {
  return (
    <>
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__content">
            <p className="eyebrow">New arrivals just landed ✨</p>
            <h1>Dress them for every adventure</h1>
            <p className="hero__copy">
              Soft fabrics, playful colours, and styles that keep up with kids.
              Free shipping on orders over $120.
            </p>
            <div className="hero__actions">
              <Link className="button" to="/shop">Shop now</Link>
              <button type="button" className="button button--ghost" onClick={openCart}>
                View cart ({cart.itemCount})
              </button>
            </div>
            <dl className="hero__stats">
              <div><dt>200+</dt><dd>Styles available</dd></div>
              <div><dt>Free</dt><dd>Shipping over $120</dd></div>
              <div><dt>4.8★</dt><dd>Average rating</dd></div>
            </dl>
          </div>
          <div className="hero__media">
            <img src={HERO_IMAGE} alt="Colorful clothes hanging on a sunny clothesline" width="560" height="420" />
          </div>
        </div>
      </section>

      <TrustStrip />
      <WaveDivider />

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Shop by little personality</p>
              <h2>Find favourites for every stage</h2>
            </div>
          </div>
          <div className="highlight-grid">
            {categoryHighlights.map(item => (
              <article
                key={item.title}
                className="highlight-card"
                style={{ background: `color-mix(in srgb, ${item.color} 15%, var(--surface))` }}
              >
                <span className="highlight-card__emoji">{item.emoji}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <Link to={`/shop?q=${item.query}`} className="highlight-card__link">
                  Shop now →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <WaveDivider flip />

      <section className="section section--muted">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">This week&apos;s picks</p>
              <h2>Kids love these right now</h2>
            </div>
            <Link className="text-link" to="/shop">See full catalog</Link>
          </div>

          {loading ? (
            <ProductSkeleton count={4} />
          ) : error ? (
            <div className="empty-state">
              <h3>Our rack is taking a quick break</h3>
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
