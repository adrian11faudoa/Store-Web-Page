import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useLocale } from '../context/localeContext.jsx'
import { useAppStore } from '../store/useAppStore.js'

function titleCase(value) {
  return String(value || '')
    .split(/[-\s]+/)
    .filter(Boolean)
    .map(part => part[0].toUpperCase() + part.slice(1))
    .join(' ')
}

export function ProductPage() {
  const { slug } = useParams()
  const store = useAppStore()
  const product = store.catalog.selectedProduct
  const loadProduct = store.loadProduct
  const addToCart = store.addToCart
  const { formatMoney } = useLocale()
  const [selectedVariant, setSelectedVariant] = useState('')

  useEffect(() => {
    void loadProduct(slug)
  }, [loadProduct, slug])

  useEffect(() => {
    if (product?.variants?.length) {
      setSelectedVariant(product.variants[0].id)
    }
  }, [product])

  if (!product) {
    return (
      <section className="section">
        <div className="container empty-state">
          <h2>Cargando producto...</h2>
        </div>
      </section>
    )
  }

  return (
    <section className="section">
      <div className="container product-layout">
        <div className="product-hero">
          <img src={product.imageUrl} alt={product.name} className="product-detail-art" />
        </div>

        <div className="product-panel">
          <p className="eyebrow">{product.category.name}</p>
          <h1>{product.name}</h1>
          <p className="product-panel__copy">{product.description}</p>
          <div className="product-panel__facts">
            <span>{titleCase(product.gender)}</span>
            <span>{product.ageGroup}</span>
            {(product.seasons || []).map(season => <span key={season}>{titleCase(season)}</span>)}
          </div>
          <div className="product-panel__price">
            <strong>{formatMoney(product.price)}</strong>
            {product.sourcePriceMxn ? <s>{product.sourcePriceMxn} MXN</s> : null}
          </div>
          <fieldset className="product-panel__sizes">
            <legend>Elige una talla</legend>
            <div className="product-card__sizes">
              {product.variants.map(variant => (
                <button
                  key={variant.id}
                  type="button"
                  className={variant.id === selectedVariant ? 'size-chip is-active' : 'size-chip'}
                  onClick={() => setSelectedVariant(variant.id)}
                >
                  {variant.size}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="product-panel__actions">
            <button className="button" type="button" onClick={() => addToCart(selectedVariant)} disabled={!selectedVariant}>
              Agregar al carrito
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
