import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useLocale } from '../context/localeContext.jsx'

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
  const navigate = useNavigate()
  const { formatMoney } = useLocale()
  const [selectedSize, setSelectedSize] = useState(product.variants?.[0]?.size || '')
  const [wished, setWished] = useState(false)
  const [message, setMessage] = useState('')
  const variants = Array.isArray(product.variants) ? product.variants : []
  const activeVariant = variants.find(variant => variant.size === selectedSize) || variants[0] || null
  const badge = product.badge || (product.isFeatured ? 'featured' : null)

  function handleAddToCart() {
    if (!activeVariant) {
      setMessage('No disponible')
      return
    }

    onAddToCart(activeVariant.id)
    setMessage('Agregado al carrito')
    window.setTimeout(() => setMessage(''), 1800)
  }

  return (
    <article
      className="product-card product-card--clickable"
      role="link"
      tabIndex={0}
      onClick={() => navigate(`/shop/${product.slug}`)}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          navigate(`/shop/${product.slug}`)
        }
      }}
    >
      <div className="product-card__visual" style={{ background: `linear-gradient(135deg, ${product.palette[0]}, ${product.palette[1]})` }}>
        <button
          type="button"
          className={wished ? 'wishlist-btn is-wished' : 'wishlist-btn'}
          onClick={event => {
            event.stopPropagation()
            setWished(current => !current)
          }}
          aria-label={wished ? 'Quitar de favoritos' : 'Agregar a favoritos'}
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
          <span>{product.category?.name || 'Catalogo'}</span>
          <span>{product.rating?.toFixed(1) || '4.5'} / 5</span>
        </div>
        <h3>{product.name}</h3>
        <div className="product-card__meta">
          <span>{titleCase(product.gender)}</span>
          <span>{titleCase(product.seasons?.[0] || product.ageGroup)}</span>
        </div>
        <div className="product-card__sizes" aria-label="Tallas disponibles">
          {variants.map(variant => (
            <button
              key={variant.id}
              type="button"
              className={variant.size === selectedSize ? 'size-chip is-active' : 'size-chip'}
              onClick={event => {
                event.stopPropagation()
                setSelectedSize(variant.size)
              }}
            >
              {variant.size}
            </button>
          ))}
        </div>
        <div className="product-card__footer">
          <div className="product-card__pricing">
            <strong className="product-card__price">{formatMoney(product.price)}</strong>
          </div>
          <div className="product-card__actions">
            <button
              type="button"
              className="button"
              onClick={event => {
                event.stopPropagation()
                handleAddToCart()
              }}
            >
              Agregar al carrito
            </button>
          </div>
        </div>
        <p className="product-card__status" aria-live="polite">{message}</p>
      </div>
    </article>
  )
}
