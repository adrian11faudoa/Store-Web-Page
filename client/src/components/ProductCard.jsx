import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../store/index.js'
import { products as productsApi } from '../api.js'
import { t, useLang } from '../store/lang.js'
import { useMoney } from '../lib/money.js'

const CATEGORY_ICONS = {
  tops: (<svg viewBox="0 0 80 80" fill="none" width="72" height="72"><path d="M28 12 L18 24 L8 20 L14 44 H66 L72 20 L62 24 L52 12 C50 18 44 22 40 22 C36 22 30 18 28 12Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/><path d="M14 44 V68 H66 V44" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/></svg>),
  bottoms: (<svg viewBox="0 0 80 80" fill="none" width="72" height="72"><path d="M14 14 H66 L58 46 L52 68 H40 L38 52 L36 68 H28 L22 46 Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/></svg>),
}
const DEFAULT_ICON = (<svg viewBox="0 0 80 80" fill="none" width="72" height="72"><rect x="14" y="14" width="52" height="52" rx="6" stroke="currentColor" strokeWidth="3"/></svg>)

function ImgWithFallback({ src, alt, category }) {
  const [err, setErr] = useState(false)

  useEffect(() => {
    setErr(false)
  }, [src])

  if (!src || err) {
    return (
      <div style={{ color: '#9b8ec4', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
        {CATEGORY_ICONS[category] || DEFAULT_ICON}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setErr(true)}
      style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
    />
  )
}

function Stars({ rating, reviews }) {
  const value = Math.round(rating || 0)
  return (
    <div className="pc-stars">
      {[1, 2, 3, 4, 5].map(index => (
        <span key={index} style={{ color: index <= value ? '#e6a817' : '#ddd', fontSize: 13 }}>★</span>
      ))}
      {reviews > 0 && <span className="pc-stars__count">{reviews}</span>}
    </div>
  )
}

function QuickView({ product, onClose }) {
  const lang = useLang(state => state.lang)
  const { formatMoney } = useMoney()
  const add = useCart(state => state.add)
  const [detail, setDetail] = useState(null)
  const [selSize, setSelSize] = useState(null)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [sizeError, setSizeError] = useState(false)

  useEffect(() => {
    productsApi.get(product.id).then(setDetail).catch(() => setDetail(product))
  }, [product])

  useEffect(() => {
    const handler = event => {
      if (event.key === 'Escape') onClose()
    }
    const openCartHandler = () => onClose()
    document.body.classList.add('overlay-navbar-compact')
    window.addEventListener('keydown', handler)
    window.addEventListener('sk:open-cart', openCartHandler)
    return () => {
      document.body.classList.remove('overlay-navbar-compact')
      window.removeEventListener('keydown', handler)
      window.removeEventListener('sk:open-cart', openCartHandler)
    }
  }, [onClose])

  const current = detail || product
  const discount = current.old_price ? Math.round((1 - current.price / current.old_price) * 100) : null

  function handleAdd(event) {
    event.preventDefault()
    if (current.sizes?.length > 0 && !selSize) {
      setSizeError(true)
      return
    }
    for (let index = 0; index < qty; index += 1) {
      add({ ...current, selectedSize: selSize })
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <>
      <div className="qv-backdrop" onClick={onClose} />
      <div className="qv-panel" role="dialog" aria-modal="true" aria-label={current.name}>
        <div className="qv-header">
          <h2 className="qv-header__title">{current.name}</h2>
          <button className="qv-close" onClick={onClose} aria-label={t(lang, 'close')}>x</button>
        </div>

        <div className="qv-body">
          <div className="qv-image-wrap">
            <div className="qv-image-box" style={{ background: current.fallback_bg || '#f5f5f5' }}>
              <ImgWithFallback src={current.image_url} alt={current.name} category={current.category} />
            </div>
          </div>

          <div className="qv-info">
            <div className="qv-price-row">
              <span className="qv-price">{formatMoney(current.price)}</span>
              {current.old_price && (
                <>
                  <span className="qv-old-price">{formatMoney(current.old_price)}</span>
                  <span className="qv-discount">{discount}% {t(lang, 'off')}</span>
                </>
              )}
            </div>

            <Stars rating={current.rating} reviews={current.reviews} />

            {current.sizes?.length > 0 && (
              <div className="qv-section">
                <div className="qv-section__label-row">
                  <span className="qv-section__label">{t(lang, 'size')}</span>
                  <a href="#" className="qv-size-guide" onClick={event => event.preventDefault()}>{t(lang, 'sizeGuideShort')}</a>
                </div>
                <div className={`qv-size-grid${sizeError ? ' qv-size-grid--error' : ''}`}>
                  {current.sizes.map(size => (
                    <button
                      key={size}
                      className={`qv-size-btn${selSize === size ? ' qv-size-btn--active' : ''}${sizeError ? ' qv-size-btn--error' : ''}`}
                      onClick={event => {
                        event.preventDefault()
                        setSelSize(size)
                        setSizeError(false)
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {sizeError && <div className="qv-size-error">{t(lang, 'pleaseSelectSize')}</div>}
              </div>
            )}

            <div className="qv-view-full">
              <Link to={`/product/${current.id}`} onClick={onClose} className="qv-view-full__link">
                {t(lang, 'viewFullProductDetails')}
              </Link>
            </div>
          </div>
        </div>

        <div className="qv-footer">
          <div className="qv-qty">
            <button className="qv-qty__btn" onClick={event => { event.preventDefault(); setQty(value => Math.max(1, value - 1)) }}>-</button>
            <span className="qv-qty__val">{qty}</span>
            <button className="qv-qty__btn" onClick={event => { event.preventDefault(); setQty(value => value + 1) }}>+</button>
          </div>
          <button className={`qv-add-btn${added ? ' qv-add-btn--added' : ''}`} onClick={handleAdd}>
            {added ? t(lang, 'addedToBagUpper') : t(lang, 'addToBagUpper')}
          </button>
        </div>
      </div>
    </>
  )
}

export default function ProductCard({ product }) {
  const lang = useLang(state => state.lang)
  const { formatMoney } = useMoney()
  const [wished, setWished] = useState(false)
  const [qvOpen, setQvOpen] = useState(false)

  const discount = product.old_price ? Math.round((1 - product.price / product.old_price) * 100) : null
  const colors = product.colors || (product.fallback_bg ? [product.fallback_bg] : [])

  return (
    <>
      <Link to={`/product/${product.id}`} className="pc-card">
        <div className="pc-img" style={{ background: product.fallback_bg || '#f5f5f5' }}>
          {product.badge && (
            <span className={`badge badge--${product.badge}`}>
              {product.badge === 'new' ? t(lang, 'newIn') : discount ? `-${discount}%` : t(lang, 'sale')}
            </span>
          )}
          <button className={`pc-wishlist${wished ? ' pc-wishlist--active' : ''}`} onClick={event => { event.preventDefault(); setWished(value => !value) }} aria-label={t(lang, 'wishlist')}>
            ♥
          </button>
          <ImgWithFallback src={product.image_url} alt={product.name} category={product.category} />
        </div>

        <div className="pc-body">
          {colors.length > 0 && (
            <div className="pc-swatches">
              {colors.map((color, index) => (
                <button key={index} className="pc-swatch" style={{ background: color }} onClick={event => event.preventDefault()} />
              ))}
            </div>
          )}

          <div className="pc-price-row">
            <span className="pc-price">{formatMoney(product.price)}</span>
            {product.old_price && (
              <>
                <span className="pc-old-price">{formatMoney(product.old_price)}</span>
                <span className="pc-pct-off">{discount}% {t(lang, 'off')}</span>
              </>
            )}
          </div>

          <div className="pc-name">{product.name}</div>
          <Stars rating={product.rating} reviews={product.reviews} />

          <button className="pc-add-btn" onClick={event => { event.preventDefault(); setQvOpen(true) }}>
            {t(lang, 'addToBagUpper')}
          </button>
        </div>
      </Link>

      {qvOpen && <QuickView product={product} onClose={() => setQvOpen(false)} />}
    </>
  )
}
