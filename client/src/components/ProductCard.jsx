// client/src/components/ProductCard.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../store/index.js'

export default function ProductCard({ product: p }) {
  const add      = useCart(s => s.add)
  const navigate = useNavigate()
  const [added,  setAdded]  = useState(false)
  const [wished, setWished] = useState(false)
  const [imgErr, setImgErr] = useState(false)

  const discount = p.old_price
    ? Math.round((1 - p.price / p.old_price) * 100)
    : null

  const hasSizes = p.sizes && p.sizes.length > 0

  function handleAdd(e) {
    e.preventDefault()
    // If product has sizes, redirect to product page to select one
    if (hasSizes) {
      navigate(`/product/${p.id}`)
      return
    }
    add(p)
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
            <span key={s} className="size-tag">{s}</span>
          ))}
          {(p.sizes || []).length > 4 && (
            <span className="size-tag">+{p.sizes.length - 4}</span>
          )}
        </div>
        <div className="product-card__footer">
          <span className="price">
            ${p.price}
            {p.old_price && <span className="price__old">${p.old_price}</span>}
          </span>
          <button
            className={`add-to-cart${added ? ' added' : ''}`}
            onClick={handleAdd}
            title={hasSizes ? 'Select a size first' : 'Add to bag'}
          >
            {hasSizes ? '👕 Select size' : (added ? '✓ Added' : '+ Add')}
          </button>
        </div>
      </div>
    </Link>
  )
}
