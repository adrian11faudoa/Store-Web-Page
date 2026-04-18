import { Link } from 'react-router-dom'
import { useState } from 'react'
import { formatCurrency, formatLabel } from '../assets/js/utils/format.js'
import { getProductImageFallback } from '../assets/js/utils/products.js'

function getBadgeClassName(badge) {
  return badge.toLowerCase().replace(/\s+/g, '-')
}

export default function ProductCard({ product, onAddToCart }) {
  const [size, setSize] = useState(product.sizes.length > 1 ? '' : (product.sizes[0] || ''))
  const [message, setMessage] = useState('')
  const [wished, setWished] = useState(false)
  const imageSrc = product.image_url || getProductImageFallback(product)
  const badge = product.old_price > product.price ? 'sale' : product.badge

  function handleAddToCart() {
    if (product.sizes.length > 1 && !size) {
      setMessage('Please select a size first')
      return
    }

    onAddToCart(product, size)
    setMessage('Added to cart ✓')
    window.setTimeout(() => setMessage(''), 2000)
  }

  return (
    <article className="product-card">
      <div
        className="product-card__visual"
        style={{ background: `linear-gradient(135deg, ${product.palette[0]}, ${product.palette[1]})` }}
      >
        <button
          type="button"
          className={wished ? 'wishlist-btn is-wished' : 'wishlist-btn'}
          onClick={event => {
            event.preventDefault()
            setWished(wish => !wish)
          }}
          aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {wished ? '❤️' : '🤍'}
        </button>
        <img src={imageSrc} alt={product.name} loading="lazy" width="320" height="400" />
        {badge && <span className={`pill pill--${getBadgeClassName(badge)}`}>{badge}</span>}
      </div>
      <svg className="product-card__wave" viewBox="0 0 320 24" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 12C32 22 64 22 96 12S160 2 192 12s64 10 128 0v12H0z" />
      </svg>
      <div className="product-card__body">
        <div className="product-card__meta">
          <span>{formatLabel(product.category)}</span>
          <span>{product.rating.toFixed(1)} / 5</span>
        </div>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="product-card__meta">
          <span>{formatLabel(product.gender)}</span>
          <span>{formatLabel(product.ageGroup)}</span>
        </div>
        <div className="product-card__sizes" aria-label="Available sizes">
          {product.sizes.map(option => (
            <button
              key={option}
              type="button"
              className={option === size ? 'size-chip is-active' : 'size-chip'}
              onClick={() => setSize(option)}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="product-card__footer">
          <div className="product-card__pricing">
            <strong className="product-card__price">{formatCurrency(product.price)}</strong>
            {product.old_price > product.price && (
              <s className="product-card__old-price">{formatCurrency(product.old_price)}</s>
            )}
          </div>
          <div className="product-card__actions">
            <Link className="button button--ghost" to={`/product/${product.id}`}>
              Details
            </Link>
            <button type="button" className="button" onClick={handleAddToCart}>
              Add
            </button>
          </div>
        </div>
        <p className={message.includes('select') ? 'product-card__status is-error' : 'product-card__status'} aria-live="polite">{message}</p>
      </div>
    </article>
  )
}
