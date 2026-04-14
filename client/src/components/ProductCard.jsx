// client/src/components/ProductCard.jsx
import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../store/index.js'

// ─────────────────────────────────────────────────────────────────────────────
// SVG ICONS — one per category slug.
// Shown automatically when the Pexels photo fails to load (network error,
// removed photo, slow connection) or when image_url is null.
// Clean, minimal line-art style that works on any background colour.
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORY_ICONS = {
  tops: (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width="72" height="72">
      <path d="M28 12 L18 24 L8 20 L14 44 H66 L72 20 L62 24 L52 12 C50 18 44 22 40 22 C36 22 30 18 28 12Z"
        stroke="currentColor" strokeWidth="3" strokeLinejoin="round" fill="none"/>
      <path d="M14 44 V68 H66 V44" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" fill="none"/>
    </svg>
  ),
  bottoms: (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width="72" height="72">
      <path d="M14 14 H66 L58 46 L52 68 H40 L38 52 L36 68 H28 L22 46 Z"
        stroke="currentColor" strokeWidth="3" strokeLinejoin="round" fill="none"/>
      <line x1="14" y1="14" x2="66" y2="14" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      <line x1="38" y1="14" x2="38" y2="52" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  ),
  dresses: (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width="72" height="72">
      <path d="M32 10 C32 16 28 20 24 22 L16 28 L22 36 H58 L64 28 L56 22 C52 20 48 16 48 10"
        stroke="currentColor" strokeWidth="3" strokeLinejoin="round" fill="none"/>
      <path d="M32 10 H48" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      <path d="M22 36 L12 70 H68 L58 36" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" fill="none"/>
    </svg>
  ),
  outerwear: (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width="72" height="72">
      <path d="M30 10 L18 22 L8 18 L12 42 H24 V70 H56 V42 H68 L72 18 L62 22 L50 10 C48 16 42 20 40 20 C38 20 32 16 30 10Z"
        stroke="currentColor" strokeWidth="3" strokeLinejoin="round" fill="none"/>
      <line x1="40" y1="20" x2="40" y2="70" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 3"/>
    </svg>
  ),
  swimwear: (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width="72" height="72">
      <path d="M24 14 C24 14 28 22 40 22 C52 22 56 14 56 14"
        stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M24 14 L16 22 L24 44 H56 L64 22 L56 14"
        stroke="currentColor" strokeWidth="3" strokeLinejoin="round" fill="none"/>
      <path d="M24 44 L20 66 H36 L40 54 L44 66 H60 L56 44"
        stroke="currentColor" strokeWidth="3" strokeLinejoin="round" fill="none"/>
    </svg>
  ),
  footwear: (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width="72" height="72">
      <path d="M12 52 C12 46 16 36 24 32 L28 20 H46 L48 32 C54 34 68 40 68 52 V58 C68 60 66 62 64 62 H16 C14 62 12 60 12 58Z"
        stroke="currentColor" strokeWidth="3" strokeLinejoin="round" fill="none"/>
      <path d="M28 20 C28 20 32 28 38 28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M12 54 H68" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  accessories: (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width="72" height="72">
      {/* Cap */}
      <path d="M16 42 C16 30 26 22 40 22 C54 22 64 30 64 42"
        stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M8 42 H72" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      <path d="M40 22 V16" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="40" cy="14" r="3" stroke="currentColor" strokeWidth="2.5" fill="none"/>
      <path d="M16 42 C16 50 22 56 40 56 C58 56 64 50 64 42"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" strokeDasharray="4 3"/>
    </svg>
  ),
  sleepwear: (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width="72" height="72">
      {/* Onesie / pyjama */}
      <path d="M30 10 L20 22 L10 18 L14 38 H24 V68 H56 V38 H66 L70 18 L60 22 L50 10"
        stroke="currentColor" strokeWidth="3" strokeLinejoin="round" fill="none"/>
      <path d="M30 10 Q40 16 50 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none"/>
      {/* Stars */}
      <text x="34" y="54" fontSize="14" fill="currentColor" opacity="0.5">✦</text>
    </svg>
  ),
  sets: (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width="72" height="72">
      {/* Top half */}
      <path d="M24 10 L16 20 L10 17 L13 32 H36 V10"
        stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
      <path d="M36 10 L44 10 L52 20 L58 17 L61 32 H36"
        stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
      {/* Bottom half */}
      <path d="M13 38 H61 L56 56 L52 70 H44 L42 58 L40 70 H32 L28 56 Z"
        stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
      <line x1="13" y1="38" x2="13" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="61" y1="38" x2="61" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
}

// Default fallback if category is unknown
const DEFAULT_ICON = (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width="72" height="72">
    <rect x="14" y="14" width="52" height="52" rx="6" stroke="currentColor" strokeWidth="3"/>
    <path d="M28 40 H52 M40 28 V52" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
  </svg>
)

function CategoryIcon({ category, color }) {
  const icon = CATEGORY_ICONS[category] || DEFAULT_ICON
  return (
    <div style={{
      color: color || '#9b8ec4',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 6,
      opacity: 0.7,
    }}>
      {icon}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default function ProductCard({ product: p }) {
  const add  = useCart(s => s.add)
  const [added,     setAdded]     = useState(false)
  const [wished,    setWished]    = useState(false)
  const [imgErr,    setImgErr]    = useState(false)
  const [sizeOpen,  setSizeOpen]  = useState(false)
  const [selSize,   setSelSize]   = useState(null)
  const pickerRef = useRef(null)

  const discount = p.old_price
    ? Math.round((1 - p.price / p.old_price) * 100)
    : null

  const hasSizes = p.sizes && p.sizes.length > 0

  // Close size picker on outside click
  useEffect(() => {
    if (!sizeOpen) return
    function handle(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) setSizeOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [sizeOpen])

  function handleAddClick(e) {
    e.preventDefault()
    if (hasSizes && !selSize) { setSizeOpen(o => !o); return }
    add({ ...p, selectedSize: selSize })
    setAdded(true)
    setSizeOpen(false)
    setTimeout(() => setAdded(false), 1800)
  }

  function handleSizePick(e, size) {
    e.preventDefault()
    setSelSize(size)
    setSizeOpen(false)
    add({ ...p, selectedSize: size })
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  // Show icon fallback if: no image URL, or image failed to load
  const showIcon = !p.image_url || imgErr

  return (
    <Link to={`/product/${p.id}`} className="product-card">
      <div className="product-card__img" style={{ background: p.fallback_bg }}>
        {p.badge && (
          <span className={`badge badge--${p.badge}`}>
            {p.badge === 'new' ? 'New' : discount ? `−${discount}%` : 'Sale'}
          </span>
        )}
        <button
          className={`product-card__wishlist${wished ? ' active' : ''}`}
          onClick={e => { e.preventDefault(); setWished(w => !w) }}
          aria-label="Wishlist"
        >
          {wished ? '❤️' : '🤍'}
        </button>

        {showIcon ? (
          // ── SVG icon fallback (category-specific, styled) ──────────────────
          <CategoryIcon category={p.category} color="#7c6fad" />
        ) : (
          // ── Real Pexels photo ──────────────────────────────────────────────
          <img
            src={p.image_url}
            alt={p.name}
            loading="lazy"
            onError={() => setImgErr(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
          />
        )}
      </div>

      <div className="product-card__body">
        <div className="product-card__name">{p.name}</div>
        <div className="product-card__meta">{p.age_range}</div>
        <div className="product-card__rating">
          {'★'.repeat(Math.round(p.rating))}{'☆'.repeat(5 - Math.round(p.rating))}
          <span>({p.reviews})</span>
        </div>
        <div className="size-row">
          {(p.sizes || []).slice(0, 4).map(s => (
            <span key={s} className={`size-tag${selSize === s ? ' active' : ''}`}>{s}</span>
          ))}
          {(p.sizes || []).length > 4 && (
            <span className="size-tag">+{p.sizes.length - 4}</span>
          )}
        </div>

        <div className="product-card__footer" style={{ position: 'relative' }}>
          <span className="price">
            ${p.price}
            {p.old_price && <span className="price__old">${p.old_price}</span>}
          </span>

          <div ref={pickerRef} style={{ position: 'relative' }}>
            <button
              className={`add-to-cart${added ? ' added' : ''}${sizeOpen ? ' open' : ''}`}
              onClick={handleAddClick}
              title={hasSizes && !selSize ? 'Pick a size' : 'Add to bag'}
            >
              {added ? '✓ Added' : hasSizes && !selSize ? '📐 Size' : '+ Add'}
            </button>

            {sizeOpen && hasSizes && (
              <div className="size-picker-popup" onClick={e => e.preventDefault()}>
                <div className="size-picker-popup__label">Select size</div>
                <div className="size-picker-popup__grid">
                  {p.sizes.map(s => (
                    <button
                      key={s}
                      className={`size-picker-btn${selSize === s ? ' active' : ''}`}
                      onClick={e => handleSizePick(e, s)}
                    >{s}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
