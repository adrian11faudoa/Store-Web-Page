import { Link } from 'react-router-dom'
import { useState } from 'react'
import { formatCurrency } from '@store/utils'

function badgeClassName(badge) {
  return String(badge || '').toLowerCase().replace(/\s+/g, '-')
}

function titleCase(value) {
  return String(value || '')
    .split(/[-\s]+/)
    .filter(Boolean)
    .map(part => part[0].toUpperCase() + part.slice(1))
    .join(' ')
}

export function ProductCard({ product, onAddToCart }) {
  const [selectedSize, setSelectedSize] = useState(product.variants?.[0]?.size || '')
  const [wished, setWished] = useState(false)
  const [message, setMessage] = useState('')
  const variants = Array.isArray(product.variants) ? product.variants : []
  const activeVariant = variants.find(variant => variant.size === selectedSize) || variants[0] || null
  const badge = product.badge || (product.isFeatured ? 'featured' : null)

  function handleAddToCart() {
    if (!activeVariant) {
      setMessage('Unavailable')
      return
    }

    onAddToCart(activeVariant.id)
    setMessage('Added to cart')
    window.setTimeout(() => setMessage(''), 1800)
  }

  return (
    <article className="product-card">
      <div className="product-card__visual" style={{ background: `linear-gradient(135deg, ${product.palette[0]}, ${product.palette[1]})` }}>
        <button
          type="button"
          className={wished ? 'wishlist-btn is-wished' : 'wishlist-btn'}
          onClick={event => {
            event.preventDefault()
            setWished(current => !current)
          }}
          aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {wished ? '♥' : '♡'}
        </button>
        {product.imageUrl ? <img src={product.imageUrl} alt={product.name} loading="lazy" /> : null}
        {badge ? <span className={`pill pill--${badgeClassName(badge)}`}>{badge}</span> : null}
      </div>
      <svg className="product-card__wave" viewBox="0 0 320 24" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 12C32 22 64 22 96 12S160 2 192 12s64 10 128 0v12H0z" />
      </svg>
      <div className="product-card__body">
        <div className="product-card__meta">
          <span>{product.category?.name || 'Catalog'}</span>
          <span>{product.rating?.toFixed(1) || '4.5'} / 5</span>
        </div>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="product-card__meta">
          <span>{titleCase(product.gender)}</span>
          <span>{titleCase(product.seasons?.[0] || product.ageGroup)}</span>
        </div>
        <div className="product-card__sizes" aria-label="Available sizes">
          {variants.map(variant => (
            <button
              key={variant.id}
              type="button"
              className={variant.size === selectedSize ? 'size-chip is-active' : 'size-chip'}
              onClick={() => setSelectedSize(variant.size)}
            >
              {variant.size}
            </button>
          ))}
        </div>
        <div className="product-card__footer">
          <div className="product-card__pricing">
            <strong className="product-card__price">{formatCurrency(product.price)}</strong>
          </div>
          <div className="product-card__actions">
            <Link className="button button--ghost" to={`/shop/${product.slug}`}>Details</Link>
            <button type="button" className="button" onClick={handleAddToCart}>Add</button>
          </div>
        </div>
        <p className="product-card__status" aria-live="polite">{message}</p>
      </div>
    </article>
  )
}
