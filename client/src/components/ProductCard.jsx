import { Link } from 'react-router-dom'
import { useState } from 'react'
import { formatCurrency, formatLabel } from '../assets/js/utils/format.js'

const PRODUCT_IMAGE = `${import.meta.env.BASE_URL}assets/images/product-placeholder.svg`

export default function ProductCard({ product, onAddToCart }) {
  const [size, setSize] = useState(product.sizes[0] || '')
  const [message, setMessage] = useState('')

  function handleAddToCart() {
    onAddToCart(product, size)
    setMessage('Added to cart')
    window.setTimeout(() => setMessage(''), 1600)
  }

  return (
    <article className="product-card">
      <div
        className="product-card__visual"
        style={{ background: `linear-gradient(135deg, ${product.palette[0]}, ${product.palette[1]})` }}
      >
        <img src={PRODUCT_IMAGE} alt={product.name} loading="lazy" width="320" height="240" />
        {product.badge && <span className="pill">{product.badge}</span>}
      </div>
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
          <strong>{formatCurrency(product.price)}</strong>
          <div className="product-card__actions">
            <Link className="button button--ghost" to={`/product/${product.id}`}>
              Details
            </Link>
            <button type="button" className="button" onClick={handleAddToCart}>
              Add
            </button>
          </div>
        </div>
        <p className="product-card__status" aria-live="polite">{message}</p>
      </div>
    </article>
  )
}
