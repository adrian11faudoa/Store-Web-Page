import { Link } from 'react-router-dom'
import { formatCurrency } from '@store/utils'

export function ProductCard({ product, onAddToCart }) {
  const primaryVariant = product.variants?.[0] || null

  return (
    <article className="card">
      {product.imageUrl ? (
        <img className="product-art" src={product.imageUrl} alt={product.name} loading="lazy" />
      ) : (
        <div
          className="product-art"
          style={{ background: `linear-gradient(135deg, ${product.palette?.[0] || '#f5ead8'}, ${product.palette?.[1] || '#ffffff'})` }}
        />
      )}
      <div className="card-body">
        <p className="eyebrow">{product.category?.name || 'Catalog item'}</p>
        <div className="card-row">
          <h3>{product.name}</h3>
          <strong>{formatCurrency(product.price)}</strong>
        </div>
        <p>{product.description}</p>
        <div className="card-row">
          <Link className="button ghost" to={`/catalog/${product.slug}`}>View</Link>
          <button className="button" type="button" disabled={!primaryVariant} onClick={() => primaryVariant && onAddToCart(primaryVariant.id)}>
            {primaryVariant ? `Add size ${primaryVariant.size}` : 'Unavailable'}
          </button>
        </div>
      </div>
    </article>
  )
}
