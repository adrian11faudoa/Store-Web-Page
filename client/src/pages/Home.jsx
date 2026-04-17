import { Link } from 'react-router-dom'
import { Splide, SplideSlide } from '@splidejs/react-splide'
import '@splidejs/splide/dist/css/splide.min.css'
import { useProducts } from '../hooks/useProducts.js'
import ProductCard from '../components/ProductCard.jsx'
import MixMatch from '../components/MixMatch.jsx'
import { t, useLang } from '../store/lang.js'

export default function Home() {
  const lang = useLang(state => state.lang)
  const { products, loading } = useProducts({ limit: 8, sort: 'newest' })

  const ageCards = [
    { label: t(lang, 'baby'), sub: t(lang, 'sizes024m'), emoji: '🍼', age: 'baby', bg: '#FAEEDA' },
    { label: t(lang, 'boys'), sub: '2-16', emoji: '👦', age: 'boys', bg: '#EEEDFE', gender: 'boy' },
    { label: t(lang, 'girls'), sub: '2-16', emoji: '👧', age: 'girls', bg: '#E1F5EE', gender: 'girl' },
  ]

  const banners = [
    { tag: t(lang, 'newCollection'), title: t(lang, 'springPastels'), bg: '#EEEDFE', color: '#26215C', emoji: '🌸', cta: t(lang, 'shopNow'), to: '/shop?badge=new', btnBg: '#3C3489' },
    { tag: t(lang, 'upTo40'), title: t(lang, 'summerSale'), bg: '#E1F5EE', color: '#085041', emoji: '☀️', cta: t(lang, 'viewSale'), to: '/shop?badge=sale', btnBg: '#0F6E56' },
    { tag: t(lang, 'footwearDrop'), title: t(lang, 'shoesBuilt'), bg: '#FAECE7', color: '#4A1B0C', emoji: '👟', cta: t(lang, 'shopFootwear'), to: '/shop?category=footwear', btnBg: '#D85A30' },
  ]

  const trustItems = [
    { icon: '🚚', title: t(lang, 'trustDelivery'), sub: t(lang, 'trustDeliverySub') },
    { icon: '↩', title: t(lang, 'trustReturns'), sub: t(lang, 'trustReturnsSub') },
    { icon: '🌱', title: t(lang, 'trustSustainable'), sub: t(lang, 'trustSustainableSub') },
    { icon: '📦', title: t(lang, 'trustTracked'), sub: t(lang, 'trustTrackedSub') },
  ]

  return (
    <>
      <section className="hero hero-section">
        <div className="hero__text">
          <div className="hero__eyebrow">{t(lang, 'springSummer')}</div>
          <h1 className="hero__title">{t(lang, 'heroTitle')}</h1>
          <p className="hero__sub">{t(lang, 'heroSub')}</p>
          <div className="hero__actions">
            <Link to="/shop" className="btn btn--primary">{t(lang, 'shopNewArrivals')} →</Link>
            <Link to="/shop?badge=sale" className="btn btn--outline">{t(lang, 'viewSale')}</Link>
          </div>
        </div>
        <div className="hero__visual">
          <div className="hero__card-stack">
            <div className="hero__card">🧥</div>
            <div className="hero__card">👗</div>
            <div className="hero__card">👟</div>
          </div>
          <div className="hero__badge">
            <div className="hero__badge-icon">✓</div>
            <div>
              <strong>{t(lang, 'freeReturns')}</strong><br />
              <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-muted)' }}>{t(lang, 'noQuestionsAsked')}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="age-strip">
        {ageCards.map(card => (
          <Link key={card.age} to={card.gender ? `/shop?ageGroup=${card.age}&gender=${card.gender}` : `/shop?ageGroup=${card.age}`} className="age-card" style={{ background: card.bg }}>
            <span className="age-card__emoji">{card.emoji}</span>
            <span className="age-card__label">{card.label}</span>
            <span className="age-card__sub">{card.sub}</span>
          </Link>
        ))}
      </div>

      <div className="section">
        <Splide options={{ type: 'loop', autoplay: true, interval: 4500, arrows: true, pagination: true, speed: 600 }}>
          {banners.map(banner => (
            <SplideSlide key={banner.tag}>
              <div className="banner-slide" style={{ background: banner.bg, color: banner.color }}>
                <div className="banner-slide__text">
                  <div className="banner-slide__tag">{banner.tag}</div>
                  <div className="banner-slide__title" style={{ whiteSpace: 'pre-line' }}>{banner.title}</div>
                  <Link to={banner.to} className="btn" style={{ background: banner.btnBg, color: '#fff', fontSize: 13, padding: '10px 22px' }}>
                    {banner.cta} →
                  </Link>
                </div>
                <div className="banner-slide__emoji">{banner.emoji}</div>
              </div>
            </SplideSlide>
          ))}
        </Splide>
      </div>

      <section className="section section--gray">
        <div className="section__header">
          <h2 className="section__title">{t(lang, 'newThisWeek')}</h2>
          <Link to="/shop" className="section__link">{t(lang, 'seeAll')} →</Link>
        </div>
        {loading ? (
          <div className="loading-grid">
            {Array.from({ length: 8 }).map((_, index) => <div key={index} className="product-card skeleton" />)}
          </div>
        ) : (
          <div className="product-grid">
            {products.map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </section>

      <div className="section">
        <MixMatch />
      </div>

      <div className="trust-strip">
        {trustItems.map(item => (
          <div key={item.title} className="trust-item">
            <div className="trust-item__icon">{item.icon}</div>
            <div className="trust-item__text"><strong>{item.title}</strong><span>{item.sub}</span></div>
          </div>
        ))}
      </div>
    </>
  )
}
