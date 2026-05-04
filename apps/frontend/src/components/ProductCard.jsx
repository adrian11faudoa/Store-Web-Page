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

const SEASON_LABELS_ES = {
  fall: 'Otoño',
  winter: 'Invierno',
  spring: 'Primavera',
  summer: 'Verano',
  christmas: 'Navidad',
  halloween: 'Halloween',
  'todo-el-ano': 'Todo el año',
  'todo el ano': 'Todo el año',
  'todo-el-año': 'Todo el año',
  'todo el año': 'Todo el año',
}

function seasonLabelEs(value) {
  const key = String(value || '').toLowerCase()
  return SEASON_LABELS_ES[key] || titleCase(value)
}

const GENDER_LABELS_ES = {
  girls: 'Niñas',
  boys: 'Niños',
  unisex: 'Unisex',
}

const CATEGORY_LABELS_ES = {
  tops: 'Playeras',
  bottoms: 'Pantalones',
  dresses: 'Vestidos',
  rompers: 'Mamelucos',
  sleepwear: 'Pijamas',
}

const SIZE_ORDER = {
  xxs: 1,
  xs: 2,
  s: 3,
  m: 4,
  l: 5,
  xl: 6,
  xxl: 7,
}

function genderLabelEs(value) {
  const key = String(value || '').toLowerCase()
  return GENDER_LABELS_ES[key] || titleCase(value)
}

function categoryLabelEs(value) {
  const key = String(value || '').toLowerCase()
  return CATEGORY_LABELS_ES[key] || titleCase(value)
}

function compareSizes(left, right) {
  const a = String(left || '').trim()
  const b = String(right || '').trim()
  const aNum = Number.parseFloat(a)
  const bNum = Number.parseFloat(b)
  const aIsNum = Number.isFinite(aNum)
  const bIsNum = Number.isFinite(bNum)

  if (aIsNum && bIsNum) return aNum - bNum
  if (aIsNum) return -1
  if (bIsNum) return 1

  const aOrder = SIZE_ORDER[a.toLowerCase()]
  const bOrder = SIZE_ORDER[b.toLowerCase()]
  if (aOrder && bOrder) return aOrder - bOrder
  if (aOrder) return -1
  if (bOrder) return 1

  return a.localeCompare(b, 'es', { numeric: true })
}

function sortVariantsBySize(variants) {
  return (Array.isArray(variants) ? [...variants] : []).sort((left, right) => compareSizes(left.size, right.size))
}

export function ProductCard({ product, onAddToCart }) {
  const navigate = useNavigate()
  const { formatMoney } = useLocale()
  const [selectedSize, setSelectedSize] = useState(() => sortVariantsBySize(product.variants)[0]?.size || '')
  const [message, setMessage] = useState('')
  const variants = sortVariantsBySize(product.variants)
  const activeVariant = variants.find(variant => variant.size === selectedSize) || variants[0] || null
  const seasons = Array.isArray(product.seasons) ? product.seasons.filter(Boolean).slice(0, 2) : []
  const seasonBadges = seasons.map((season, index) => ({
    key: `${season}-${index}`,
    label: seasonLabelEs(season),
    className: `pill--season-${badgeClassName(season)}`,
  }))
  const fallbackBadge = !seasonBadges.length
    ? product.badge || (product.isFeatured ? 'featured' : null)
    : null
  const badges = seasonBadges.length
    ? seasonBadges
    : (fallbackBadge ? [{
      key: 'fallback',
      label: fallbackBadge,
      className: `pill--${badgeClassName(fallbackBadge)}`,
    }] : [])

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
      <div className="product-card__visual">
        {product.imageUrl ? <img src={product.imageUrl} alt={product.name} loading="lazy" /> : null}
        {badges.length > 0 ? (
          <div className="product-card__badges">
            {badges.map(badge => (
              <span key={badge.key} className={`pill ${badge.className}`}>{badge.label}</span>
            ))}
          </div>
        ) : null}
      </div>
      <svg className="product-card__wave" viewBox="0 0 320 24" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 12C32 22 64 22 96 12S160 2 192 12s64 10 128 0v12H0z" />
      </svg>
      <div className="product-card__body">
        <div className="product-card__meta">
          <span>{categoryLabelEs(product.category?.slug || product.category?.name || 'catalogo')}</span>
          <span>{genderLabelEs(product.gender)}</span>
        </div>
        <h3>{product.name}</h3>
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
