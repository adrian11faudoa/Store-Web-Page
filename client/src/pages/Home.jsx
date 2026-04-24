import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import TrustStrip from '../components/TrustStrip.jsx'
import WaveDivider from '../components/WaveDivider.jsx'
import ProductSkeleton from '../components/ProductSkeleton.jsx'
import { useLocale } from '../locale/LocaleProvider.jsx'

const HERO_IMAGE = `${import.meta.env.BASE_URL}assets/images/catalog-hero.svg`

export default function Home({ featuredProducts, cart, loading, error, openCart }) {
  const { currency, t } = useLocale()
  const threshold = currency === 'MXN' ? '$2,400 MXN' : '$120 USD'
  const categoryHighlights = [
    {
      title: t('homeHighlightsBabyTitle'),
      emoji: '🍼',
      description: t('homeHighlightsBabyDesc'),
      query: 'baby',
      color: 'var(--brand-baby)',
    },
    {
      title: t('homeHighlightsGirlsTitle'),
      emoji: '🌸',
      description: t('homeHighlightsGirlsDesc'),
      query: 'girls',
      color: 'var(--brand-soft)',
    },
    {
      title: t('homeHighlightsBoysTitle'),
      emoji: '🚀',
      description: t('homeHighlightsBoysDesc'),
      query: 'boys',
      color: 'var(--brand-cool)',
    },
  ]

  return (
    <>
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__content">
            <p className="eyebrow">{t('homeEyebrow')}</p>
            <h1>{t('homeTitle')}</h1>
            <p className="hero__copy">{t('homeBody', { amount: threshold })}</p>
            <div className="hero__actions">
              <Link className="button" to="/shop">{t('homeShopNow')}</Link>
              <button type="button" className="button button--ghost" onClick={openCart}>
                {t('homeViewCart')} ({cart.itemCount})
              </button>
            </div>
            <dl className="hero__stats">
              <div><dt>200+</dt><dd>{t('homeStyles')}</dd></div>
              <div><dt>{t('shippingFree')}</dt><dd>{t('homeShipping', { amount: threshold })}</dd></div>
              <div><dt>4.8★</dt><dd>{t('homeAverageRating')}</dd></div>
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
              <p className="eyebrow">{t('homePersonalityEyebrow')}</p>
              <h2>{t('homePersonalityTitle')}</h2>
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
                  {t('homeShopNow')} →
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
              <p className="eyebrow">{t('homeFeaturedEyebrow')}</p>
              <h2>{t('homeFeaturedTitle')}</h2>
            </div>
            <Link className="text-link" to="/shop">{t('homeSeeCatalog')}</Link>
          </div>

          {loading ? (
            <ProductSkeleton count={4} />
          ) : error ? (
            <div className="empty-state">
              <h3>{t('homeRackBreak')}</h3>
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
