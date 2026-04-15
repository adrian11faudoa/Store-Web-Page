// client/src/components/ProductCard.jsx
import { useState, useEffect, useCallback } from 'react'
import { useCart } from '../store/index.js'
import { products as productsApi } from '../api.js'
import { Link } from 'react-router-dom'

// ── Category SVG icons (fallback when no photo) ───────────────────────────────
const CATEGORY_ICONS = {
  tops: (<svg viewBox="0 0 80 80" fill="none" width="72" height="72"><path d="M28 12 L18 24 L8 20 L14 44 H66 L72 20 L62 24 L52 12 C50 18 44 22 40 22 C36 22 30 18 28 12Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/><path d="M14 44 V68 H66 V44" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/></svg>),
  bottoms: (<svg viewBox="0 0 80 80" fill="none" width="72" height="72"><path d="M14 14 H66 L58 46 L52 68 H40 L38 52 L36 68 H28 L22 46 Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/><line x1="14" y1="14" x2="66" y2="14" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/><line x1="38" y1="14" x2="38" y2="52" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>),
  dresses: (<svg viewBox="0 0 80 80" fill="none" width="72" height="72"><path d="M32 10 C32 16 28 20 24 22 L16 28 L22 36 H58 L64 28 L56 22 C52 20 48 16 48 10" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/><path d="M32 10 H48" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/><path d="M22 36 L12 70 H68 L58 36" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/></svg>),
  footwear: (<svg viewBox="0 0 80 80" fill="none" width="72" height="72"><path d="M12 52 C12 46 16 36 24 32 L28 20 H46 L48 32 C54 34 68 40 68 52 V58 C68 60 66 62 64 62 H16 C14 62 12 60 12 58Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/><path d="M28 20 C28 20 32 28 38 28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/><path d="M12 54 H68" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>),
  sleepwear: (<svg viewBox="0 0 80 80" fill="none" width="72" height="72"><path d="M30 10 L20 22 L10 18 L14 38 H24 V68 H56 V38 H66 L70 18 L60 22 L50 10" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/><path d="M30 10 Q40 16 50 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>),
}
const DEFAULT_ICON = (<svg viewBox="0 0 80 80" fill="none" width="72" height="72"><rect x="14" y="14" width="52" height="52" rx="6" stroke="currentColor" strokeWidth="3"/><path d="M28 40 H52 M40 28 V52" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>)

function ImgWithFallback({ src, alt, category, bg }) {
  const [err, setErr] = useState(false)
  if (!src || err) return (
    <div style={{ color:'#9b8ec4', display:'flex', alignItems:'center', justifyContent:'center', width:'100%', height:'100%' }}>
      {CATEGORY_ICONS[category] || DEFAULT_ICON}
    </div>
  )
  return <img src={src} alt={alt} loading="lazy" onError={() => setErr(true)}
    style={{ width:'100%', height:'100%', objectFit:'cover', position:'absolute', inset:0 }} />
}

// ── Color swatch dots (rendered from fallback_bg or a colors array) ───────────
function ColorSwatches({ product, selectedColor, onSelect }) {
  const colors = product.colors || (product.fallback_bg ? [product.fallback_bg] : [])
  if (!colors.length) return null
  return (
    <div className="pc-swatches">
      {colors.map((c, i) => (
        <button key={i} className={`pc-swatch${selectedColor === i ? ' pc-swatch--active' : ''}`}
          style={{ background: c }} onClick={e => { e.preventDefault(); onSelect(i) }} />
      ))}
    </div>
  )
}

// ── Stars ─────────────────────────────────────────────────────────────────────
function Stars({ rating, reviews }) {
  const r = Math.round(rating || 0)
  return (
    <div className="pc-stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= r ? '#e6a817' : '#ddd', fontSize:13 }}>★</span>
      ))}
      {reviews > 0 && <span className="pc-stars__count">{reviews}</span>}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// QUICK VIEW PANEL (slides in from right, like screenshot 2 & 3)
// ─────────────────────────────────────────────────────────────────────────────
function QuickView({ product: p, onClose }) {
  const add = useCart(s => s.add)
  const [detail,     setDetail]     = useState(null)
  const [imgIdx,     setImgIdx]     = useState(0)
  const [selSize,    setSelSize]    = useState(null)
  const [selColor,   setSelColor]   = useState(0)
  const [qty,        setQty]        = useState(1)
  const [added,      setAdded]      = useState(false)
  const [sizeError,  setSizeError]  = useState(false)

  // Load full product detail for multiple images / richer data
  useEffect(() => {
    productsApi.get(p.id).then(setDetail).catch(() => setDetail(p))
  }, [p.id])

  const prod   = detail || p
  const hasSizes = prod.sizes && prod.sizes.length > 0
  const images = prod.images?.length ? prod.images : (prod.image_url ? [prod.image_url] : [])
  const colors = prod.colors || (prod.fallback_bg ? [prod.fallback_bg] : [])

  // Close on Escape
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  function handleAdd(e) {
    e.preventDefault()
    if (hasSizes && !selSize) { setSizeError(true); return }
    setSizeError(false)
    for (let i = 0; i < qty; i++) add({ ...prod, selectedSize: selSize })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  function prevImg(e) { e.preventDefault(); setImgIdx(i => (i - 1 + images.length) % images.length) }
  function nextImg(e) { e.preventDefault(); setImgIdx(i => (i + 1) % images.length) }

  const discount = prod.old_price ? Math.round((1 - prod.price / prod.old_price) * 100) : null

  return (
    <>
      {/* Backdrop */}
      <div className="qv-backdrop" onClick={onClose} />

      {/* Panel */}
      <div className="qv-panel" role="dialog" aria-modal="true" aria-label={prod.name}>
        {/* Header */}
        <div className="qv-header">
          <h2 className="qv-header__title">{prod.name}</h2>
          <button className="qv-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="qv-body">
          {/* Image viewer */}
          <div className="qv-image-wrap">
            <div className="qv-image-box" style={{ background: prod.fallback_bg || '#f5f5f5' }}>
              {images.length > 0 ? (
                <img src={images[imgIdx]} alt={prod.name}
                  style={{ width:'100%', height:'100%', objectFit:'contain' }} />
              ) : (
                <div style={{ color:'#9b8ec4', display:'flex', alignItems:'center', justifyContent:'center', height:'100%' }}>
                  {CATEGORY_ICONS[prod.category] || DEFAULT_ICON}
                </div>
              )}
            </div>
            {images.length > 1 && (
              <>
                <button className="qv-arrow qv-arrow--left"  onClick={prevImg}>‹</button>
                <button className="qv-arrow qv-arrow--right" onClick={nextImg}>›</button>
              </>
            )}
          </div>

          {/* Info */}
          <div className="qv-info">
            {/* Price */}
            <div className="qv-price-row">
              <span className="qv-price">${prod.price}</span>
              {prod.old_price && <>
                <span className="qv-old-price">${prod.old_price}</span>
                <span className="qv-discount">{discount}% OFF</span>
              </>}
            </div>

            <Stars rating={prod.rating} reviews={prod.reviews} />

            {/* Colors */}
            {colors.length > 1 && (
              <div className="qv-section">
                <div className="qv-section__label">
                  COLOR: <strong>{prod.color_name || 'Select color'}</strong>
                </div>
                <div className="qv-color-row">
                  {colors.map((c, i) => (
                    <button key={i}
                      className={`qv-color-swatch${selColor === i ? ' qv-color-swatch--active' : ''}`}
                      style={{ background: c }}
                      onClick={e => { e.preventDefault(); setSelColor(i) }}
                    >
                      {/* Show product image thumbnail if available */}
                      {prod.images?.[i] && (
                        <img src={prod.images[i]} alt="" style={{ width:'100%',height:'100%',objectFit:'cover',borderRadius:4,opacity:selColor===i?1:0.75 }} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {hasSizes && (
              <div className="qv-section">
                <div className="qv-section__label-row">
                  <span className="qv-section__label">SIZE</span>
                  <a href="#" className="qv-size-guide" onClick={e => e.preventDefault()}>
                    📏 Size Guide
                  </a>
                </div>
                <div className={`qv-size-grid${sizeError ? ' qv-size-grid--error' : ''}`}>
                  {prod.sizes.map(s => (
                    <button key={s}
                      className={`qv-size-btn${selSize === s ? ' qv-size-btn--active' : ''}${sizeError ? ' qv-size-btn--error' : ''}`}
                      onClick={e => { e.preventDefault(); setSelSize(s); setSizeError(false) }}
                    >{s}</button>
                  ))}
                </div>
                {sizeError && (
                  <div className="qv-size-error">
                    <span>ⓘ</span> Please select a size.
                  </div>
                )}
              </div>
            )}

            {/* View full details link */}
            <div className="qv-view-full">
              <Link to={`/product/${prod.id}`} onClick={onClose} className="qv-view-full__link">
                View Full Product Details
              </Link>
            </div>
          </div>
        </div>

        {/* Footer: qty + add to bag */}
        <div className="qv-footer">
          <div className="qv-qty">
            <button className="qv-qty__btn" onClick={e => { e.preventDefault(); setQty(q => Math.max(1, q-1)) }}>−</button>
            <span className="qv-qty__val">{qty}</span>
            <button className="qv-qty__btn" onClick={e => { e.preventDefault(); setQty(q => q+1) }}>+</button>
          </div>
          <button className={`qv-add-btn${added ? ' qv-add-btn--added' : ''}`} onClick={handleAdd}>
            {added ? '✓ ADDED TO BAG' : 'ADD TO BAG'}
          </button>
        </div>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT CARD — screenshot 1 style
// ─────────────────────────────────────────────────────────────────────────────
export default function ProductCard({ product: p }) {
  const add = useCart(s => s.add)
  const [wished,    setWished]    = useState(false)
  const [added,     setAdded]     = useState(false)
  const [qvOpen,    setQvOpen]    = useState(false)

  const discount = p.old_price ? Math.round((1 - p.price / p.old_price) * 100) : null
  const colors   = p.colors || (p.fallback_bg ? [p.fallback_bg] : [])

  function handleAddClick(e) {
    e.preventDefault()
    setQvOpen(true)
  }

  function handleWish(e) {
    e.preventDefault()
    setWished(w => !w)
  }

  return (
    <>
      <Link to={`/product/${p.id}`} className="pc-card">
        {/* Image */}
        <div className="pc-img" style={{ background: p.fallback_bg || '#f5f5f5' }}>
          {p.badge && (
            <span className={`badge badge--${p.badge}`}>
              {p.badge === 'new' ? 'New' : discount ? `−${discount}%` : 'Sale'}
            </span>
          )}
          <button className={`pc-wishlist${wished ? ' pc-wishlist--active' : ''}`}
            onClick={handleWish} aria-label="Wishlist">
            {wished
              ? <svg width="18" height="18" viewBox="0 0 24 24" fill="#e53e3e"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            }
          </button>
          <ImgWithFallback src={p.image_url} alt={p.name} category={p.category} bg={p.fallback_bg} />
        </div>

        {/* Body */}
        <div className="pc-body">
          {/* Color swatches */}
          {colors.length > 0 && (
            <ColorSwatches product={p} selectedColor={0} onSelect={() => {}} />
          )}

          {/* Price */}
          <div className="pc-price-row">
            <span className="pc-price">${parseFloat(p.price).toFixed(2)}</span>
            {p.old_price && (
              <>
                <span className="pc-old-price">${p.old_price}</span>
                <span className="pc-pct-off">{discount}% OFF</span>
              </>
            )}
          </div>

          {/* Name */}
          <div className="pc-name">{p.name}</div>

          {/* Stars */}
          <Stars rating={p.rating} reviews={p.reviews} />

          {/* ADD TO BAG button */}
          <button
            className={`pc-add-btn${added ? ' pc-add-btn--added' : ''}`}
            onClick={handleAddClick}
          >
            {added ? '✓ ADDED TO BAG' : 'ADD TO BAG'}
          </button>
        </div>
      </Link>

      {/* Quick view panel */}
      {qvOpen && <QuickView product={p} onClose={() => setQvOpen(false)} />}
    </>
  )
}
