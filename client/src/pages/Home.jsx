// client/src/pages/Home.jsx
import { Link } from 'react-router-dom'
import { Splide, SplideSlide } from '@splidejs/react-splide'
import '@splidejs/splide/dist/css/splide.min.css'
import { useProducts } from '../hooks/useProducts.js'
import ProductCard from '../components/ProductCard.jsx'
import MixMatch from '../components/MixMatch.jsx'

const AGE_CARDS = [
  { label:'Bebé',        sub:'3M–24M',    emoji:'🍼', age:'baby',  bg:'#FAEEDA' },
  { label:'Niños',       sub:'2–16 años', emoji:'👦', age:'boys',  bg:'#EEEDFE', gender:'boy'  },
  { label:'Niñas',       sub:'2–16 años', emoji:'👧', age:'girls', bg:'#E1F5EE', gender:'girl' },
]

const BANNERS = [
  { tag:'New collection', title:'Spring pastels\nare here',      bg:'#EEEDFE', color:'#26215C', emoji:'🌸', cta:'Shop now',     to:'/shop?badge=new',            btnBg:'#3C3489' },
  { tag:'Up to 40% off',  title:'Summer sale\nstarts now',       bg:'#E1F5EE', color:'#085041', emoji:'☀️', cta:'View sale',    to:'/shop?badge=sale',           btnBg:'#0F6E56' },
  { tag:'Footwear drop',  title:'Shoes built\nto be destroyed',  bg:'#FAECE7', color:'#4A1B0C', emoji:'👟', cta:'Shop footwear',to:'/shop?category=footwear',    btnBg:'#D85A30' },
]

export default function Home() {
  const { products, loading } = useProducts({ limit: 8, sort: 'newest' })

  return (
    <>
      {/* HERO */}
      <section className="hero hero-section">
        <div className="hero__text">
          <div className="hero__eyebrow">Spring / Summer 2026</div>
          <h1 className="hero__title">Clothes they'll actually want to wear</h1>
          <p className="hero__sub">Comfy, durable, and ridiculously fun — for ages 0–14.<br />Free returns, always.</p>
          <div className="hero__actions">
            <Link to="/shop" className="btn btn--primary">Shop new arrivals →</Link>
            <Link to="/shop?badge=sale" className="btn btn--outline">View sale</Link>
          </div>
        </div>
        <div className="hero__visual">
          <div className="hero__card-stack">
            <div className="hero__card">🧥</div>
            <div className="hero__card">👗</div>
            <div className="hero__card">👟</div>
          </div>
          <div className="hero__badge">
            <div className="hero__badge-icon">✅</div>
            <div>
              <strong>Free returns</strong><br />
              <span style={{fontSize:11,fontWeight:500,color:'var(--color-text-muted)'}}>No questions asked</span>
            </div>
          </div>
        </div>
      </section>

      {/* AGE CARDS */}
      <div className="age-strip">
        {AGE_CARDS.map(a => (
          <Link key={a.age} to={a.gender ? `/shop?ageGroup=${a.age}&gender=${a.gender}` : `/shop?ageGroup=${a.age}`} className="age-card" style={{background:a.bg}}>
            <span className="age-card__emoji">{a.emoji}</span>
            <span className="age-card__label">{a.label}</span>
            <span className="age-card__sub">{a.sub}</span>
          </Link>
        ))}
      </div>

      {/* BANNER CAROUSEL */}
      <div className="section">
        <Splide options={{type:'loop',autoplay:true,interval:4500,arrows:true,pagination:true,speed:600}}>
          {BANNERS.map(b => (
            <SplideSlide key={b.tag}>
              <div className="banner-slide" style={{background:b.bg,color:b.color}}>
                <div className="banner-slide__text">
                  <div className="banner-slide__tag">{b.tag}</div>
                  <div className="banner-slide__title" style={{whiteSpace:'pre-line'}}>{b.title}</div>
                  <Link to={b.to} className="btn" style={{background:b.btnBg,color:'#fff',fontSize:13,padding:'10px 22px'}}>
                    {b.cta} →
                  </Link>
                </div>
                <div className="banner-slide__emoji">{b.emoji}</div>
              </div>
            </SplideSlide>
          ))}
        </Splide>
      </div>

      {/* FEATURED */}
      <section className="section section--gray">
        <div className="section__header">
          <h2 className="section__title">New in this week</h2>
          <Link to="/shop" className="section__link">See all 900+ →</Link>
        </div>
        {loading ? (
          <div className="loading-grid">
            {Array.from({length:8}).map((_,i) => <div key={i} className="product-card skeleton" />)}
          </div>
        ) : (
          <div className="product-grid">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* MIX & MATCH */}
      <div className="section">
        <MixMatch />
      </div>

      {/* TRUST STRIP */}
      <div className="trust-strip">
        {[
          {icon:'🚚', title:'Free next-day delivery', sub:'On orders over $50'},
          {icon:'↩️', title:'Free returns',           sub:'No questions asked'},
          {icon:'🌱', title:'Sustainable materials',  sub:'GOTS certified cotton'},
          {icon:'📦', title:'Tracked shipping',       sub:'Know exactly where it is'},
        ].map(t => (
          <div key={t.title} className="trust-item">
            <div className="trust-item__icon">{t.icon}</div>
            <div className="trust-item__text"><strong>{t.title}</strong><span>{t.sub}</span></div>
          </div>
        ))}
      </div>
    </>
  )
}
