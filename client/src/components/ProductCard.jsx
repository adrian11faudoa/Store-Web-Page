// client/src/components/ProductCard.jsx
import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../store/index.js'

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
        {imgErr ? (
          <span style={{ fontSize: 64 }}>👕</span>
        ) : (
          <img
            src={p.image_url}
            alt={p.name}
            loading="lazy"
            onError={() => setImgErr(true)}
            style={{ width:'100%', height:'100%', objectFit:'cover', position:'absolute', inset:0 }}
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

            {/* Inline size picker flyup */}
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
