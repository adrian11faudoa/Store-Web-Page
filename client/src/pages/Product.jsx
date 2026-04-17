import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProduct } from '../hooks/useProducts.js'
import { useCart } from '../store/index.js'
import ProductCard from '../components/ProductCard.jsx'
import { t, useLang } from '../store/lang.js'
import { useMoney } from '../lib/money.js'

export default function Product() {
  const { id } = useParams()
  const lang = useLang(state => state.lang)
  const { formatMoney } = useMoney()
  const { product: p, related, loading, error } = useProduct(id)
  const add = useCart(state => state.add)
  const [added, setAdded] = useState(false)
  const [selSize, setSelSize] = useState(null)
  const [imgErr, setImgErr] = useState(false)

  if (loading) return <div className="product-detail-loading">{t(lang, 'loading')}</div>
  if (error || !p) return <div className="product-detail-loading">{t(lang, 'productNotFound')}</div>

  const discount = p.old_price ? Math.round((1 - p.price / p.old_price) * 100) : null

  function handleAdd() {
    if (!selSize && p.sizes?.length) {
      alert(t(lang, 'pleaseSelectSize'))
      return
    }

    add({ ...p, selectedSize: selSize })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <>
      <div className="product-detail">
        <div className="breadcrumb">
          <Link to="/">{t(lang, 'home')}</Link> / <Link to="/shop">{t(lang, 'shop')}</Link> /
          <Link to={`/shop?category=${p.category}`}>{p.category_label}</Link> /
          <span>{p.name}</span>
        </div>

        <div className="product-detail__grid">
          <div className="product-detail__img" style={{ background: p.fallback_bg }}>
            {p.badge && (
              <span className={`badge badge--${p.badge}`} style={{ fontSize: 13, padding: '5px 14px' }}>
                {p.badge === 'new' ? t(lang, 'newIn') : `-${discount}% ${t(lang, 'sale')}`}
              </span>
            )}
            {imgErr ? (
              <span style={{ fontSize: 100 }}>{t(lang, 'productNotFound')}</span>
            ) : (
              <img
                src={p.image_url}
                alt={p.name}
                onError={() => setImgErr(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
              />
            )}
          </div>

          <div className="product-detail__info">
            <div className="product-detail__category">{p.category_label} · {p.age_range}</div>
            <h1 className="product-detail__name">{p.name}</h1>

            <div className="product-detail__rating">
              {'★'.repeat(Math.round(p.rating))}{'☆'.repeat(5 - Math.round(p.rating))}
              <span>{p.rating} ({p.reviews} {t(lang, 'reviews')})</span>
            </div>

            <div className="product-detail__price">
              {formatMoney(p.price)}
              {p.old_price && <span className="price__old">{formatMoney(p.old_price)}</span>}
              {discount && <span className="price__discount">-{discount}%</span>}
            </div>

            {p.sizes?.length > 0 && (
              <div className="product-detail__sizes">
                <div className="product-detail__sizes-label">
                  {t(lang, 'size')} <span>{selSize || t(lang, 'selectSize')}</span>
                </div>
                <div className="size-selector">
                  {p.sizes.map(size => (
                    <button
                      key={size}
                      className={`size-btn${selSize === size ? ' active' : ''}`}
                      onClick={() => setSelSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              className={`btn btn--primary product-detail__add${added ? ' added' : ''}`}
              onClick={handleAdd}
              style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem' }}
            >
              {added ? t(lang, 'addedToBag') : `+ ${t(lang, 'addToBag')}`}
            </button>

            <div className="product-detail__meta-list">
              <div>{t(lang, 'freeDelivery50')}</div>
              <div>{t(lang, 'freeReturns30')}</div>
              <div>{t(lang, 'madeWithCotton')}</div>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section section--gray">
          <div className="section__header">
            <h2 className="section__title">{t(lang, 'youMightAlsoLike')}</h2>
            <Link to={`/shop?category=${p.category}`} className="section__link">
              {t(lang, 'seeAllCategory')} {p.category_label} →
            </Link>
          </div>
          <div className="product-grid">
            {related.slice(0, 4).map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        </section>
      )}
    </>
  )
}
