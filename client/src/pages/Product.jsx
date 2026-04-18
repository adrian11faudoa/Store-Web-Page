import { Link, useParams } from 'react-router-dom'
import { useMemo, useState } from 'react'
import ProductCard from '../components/ProductCard.jsx'
import { formatCurrency, formatLabel } from '../assets/js/utils/format.js'
import { getProductImageFallback } from '../assets/js/utils/products.js'

export default function Product({ cart, findProduct, getRelated }) {
  const { productId } = useParams()
  const product = findProduct(productId)
  const [selectedSize, setSelectedSize] = useState(product?.sizes.length > 1 ? '' : (product?.sizes[0] || ''))
  const [quantity, setQuantity] = useState(1)
  const [message, setMessage] = useState('')
  const relatedProducts = useMemo(() => getRelated(product), [getRelated, product])

  if (!product) {
    return (
      <section className="section">
        <div className="container empty-state">
          <h1>Product not found</h1>
          <p>That style may have skipped out to the playground. Try another favorite.</p>
          <Link className="button" to="/shop">Return to shop</Link>
        </div>
      </section>
    )
  }

  const imageSrc = product.image_url || getProductImageFallback(product)

  function handleAddToCart() {
    if (product.sizes.length > 1 && !selectedSize) {
      setMessage('Please select a size first')
      return
    }

    cart.addItem(product, selectedSize, quantity)
    setMessage('Added to cart ✓')
  }

  return (
    <>
      <section className="section">
        <div className="container product-layout">
          <div className="product-hero">
            <img src={imageSrc} alt={product.name} loading="eager" width="560" height="420" />
          </div>

          <div className="product-panel">
            <p className="eyebrow">{formatLabel(product.category)}</p>
            <h1>{product.name}</h1>
            <p className="product-panel__copy">{product.description}</p>
            <div className="product-panel__facts">
              <span>{formatLabel(product.gender)}</span>
              <span>{formatLabel(product.ageGroup)}</span>
              <span>{product.rating.toFixed(1)} rating</span>
            </div>
            <div className="product-panel__price">
              <strong>{formatCurrency(product.price)}</strong>
              {product.old_price > product.price && <s>{formatCurrency(product.old_price)}</s>}
            </div>

            <fieldset className="product-panel__sizes">
              <legend>Size</legend>
              <div className="product-card__sizes">
                {product.sizes.map(option => (
                  <button
                    key={option}
                    type="button"
                    className={option === selectedSize ? 'size-chip is-active' : 'size-chip'}
                    onClick={() => setSelectedSize(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="product-panel__actions">
              <label>
                Quantity
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={event => setQuantity(Number(event.target.value) || 1)}
                />
              </label>
              <button type="button" className="button" onClick={handleAddToCart}>
                Add to cart
              </button>
            </div>
            <p className={message.includes('select') ? 'product-card__status is-error' : 'product-card__status'} aria-live="polite">{message}</p>
            <Link className="text-link" to="/checkout">Go to checkout</Link>
          </div>
        </div>
      </section>

      <section className="section section--muted">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">More to love</p>
              <h2>Related picks</h2>
            </div>
          </div>
          <div className="product-grid">
            {relatedProducts.map(item => (
              <ProductCard key={item.id} product={item} onAddToCart={cart.addItem} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
