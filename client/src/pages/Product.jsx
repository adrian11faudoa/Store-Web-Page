import { Link, useParams } from 'react-router-dom'
import { useMemo, useState } from 'react'
import ProductCard from '../components/ProductCard.jsx'
import { formatCurrency, formatLabel } from '../assets/js/utils/format.js'

const PRODUCT_IMAGE = `${import.meta.env.BASE_URL}assets/images/product-placeholder.svg`

export default function Product({ cart, findProduct, getRelated }) {
  const { productId } = useParams()
  const product = findProduct(productId)
  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] || '')
  const [quantity, setQuantity] = useState(1)
  const [message, setMessage] = useState('')
  const relatedProducts = useMemo(() => getRelated(product), [getRelated, product])

  if (!product) {
    return (
      <section className="section">
        <div className="container empty-state">
          <h1>Product not found</h1>
          <p>The requested product could not be found in the local catalog.</p>
          <Link className="button" to="/shop">Return to shop</Link>
        </div>
      </section>
    )
  }

  function handleAddToCart() {
    cart.addItem(product, selectedSize, quantity)
    setMessage('Product added to cart')
  }

  return (
    <>
      <section className="section">
        <div className="container product-layout">
          <div
            className="product-hero"
            style={{ background: `linear-gradient(135deg, ${product.palette[0]}, ${product.palette[1]})` }}
          >
            <img src={PRODUCT_IMAGE} alt={product.name} loading="eager" width="560" height="420" />
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
            <div className="product-panel__price">{formatCurrency(product.price)}</div>

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
            <p className="product-card__status" aria-live="polite">{message}</p>
            <Link className="text-link" to="/checkout">Go to checkout</Link>
          </div>
        </div>
      </section>

      <section className="section section--muted">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">More to explore</p>
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
