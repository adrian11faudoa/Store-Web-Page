import { Link } from 'react-router-dom'
import { formatCurrency } from '@store/utils'

export function ProductCard({ product, onAddToCart }) {
  const primaryVariant = product.variants[0]

  return (
    <article className="card">
      <div
        className="product-art"
        style={{ background: `linear-gradient(135deg, ${product.palette[0]}, ${product.palette[1]})` }}
      />
      <div className="card-body">
        <p className="eyebrow">{product.category.name}</p>
        <div className="card-row">
          <h3>{product.name}</h3>
          <strong>{formatCurrency(product.price)}</strong>
        </div>
        <p>{product.description}</p>
        <div className="card-row">
          <Link className="button ghost" to={`/catalog/${product.slug}`}>View</Link>
          <button className="button" type="button" onClick={() => onAddToCart(primaryVariant.id)}>
            Add size {primaryVariant.size}
          </button>
        </div>
      </div>
    </article>
  )
}
