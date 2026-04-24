import { Link, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import ProductCard from '../components/ProductCard.jsx'
import { formatCurrency, formatLabel } from '../assets/js/utils/format.js'
import { getProductImageFallback } from '../assets/js/utils/products.js'
import { useLocale } from '../locale/LocaleProvider.jsx'

export default function Product({ cart, findProduct, getRelated }) {
  const { currency, locale, t } = useLocale()
  const { productId } = useParams()
  const product = findProduct(productId)
  const [selectedSize, setSelectedSize] = useState(product?.sizes.length > 1 ? '' : (product?.sizes[0] || ''))
  const [quantity, setQuantity] = useState(1)
  const [message, setMessage] = useState('')
  const [selectedImage, setSelectedImage] = useState('')
  const relatedProducts = useMemo(() => getRelated(product), [getRelated, product])

  if (!product) {
    return (
      <section className="section">
        <div className="container empty-state">
          <h1>{t('productNotFound')}</h1>
          <p>{t('productNotFoundCopy')}</p>
          <Link className="button" to="/shop">{t('productReturn')}</Link>
        </div>
      </section>
    )
  }

  const galleryImages = product.imagenes?.length ? product.imagenes : [product.image_url || getProductImageFallback(product)]
  const imageSrc = selectedImage || galleryImages[0] || getProductImageFallback(product)
  const attributes = [
    [t('productTemporada'), formatLabel(product.temporada)],
    [t('productGenero'), formatLabel(product.genero || product.gender)],
    [t('productColorPrimario'), product.colorPrimario],
    [t('productColorSecundario'), product.colorSecundario],
    [t('productEstampado'), formatLabel(product.estampado)],
    [t('productTipoPrenda'), formatLabel(product.tipoPrenda || product.category)],
    [t('productExistencia'), String(product.existencia)],
  ]

  function handleAddToCart() {
    if (product.sizes.length > 1 && !selectedSize) {
      setMessage(t('productSelectSize'))
      return
    }

    cart.addItem(product, selectedSize, quantity)
    setMessage(t('productAdded'))
  }

  useEffect(() => {
    setSelectedImage(galleryImages[0] || '')
  }, [product.id])

  useEffect(() => {
    setSelectedSize(product.sizes.length > 1 ? '' : (product.sizes[0] || ''))
  }, [product.id])

  return (
    <>
      <section className="section">
        <div className="container product-layout">
          <div className="product-hero">
            <img src={imageSrc} alt={product.nombre || product.name} loading="eager" width="560" height="420" />
            <div className="product-gallery">
              {galleryImages.map(image => (
                <button
                  key={image}
                  type="button"
                  className={image === imageSrc ? 'product-gallery__thumb is-active' : 'product-gallery__thumb'}
                  onClick={() => setSelectedImage(image)}
                >
                  <img src={image} alt={`${product.nombre || product.name} view`} loading="lazy" />
                </button>
              ))}
            </div>
          </div>

          <div className="product-panel">
            <p className="eyebrow">{formatLabel(product.tipoPrenda || product.category)}</p>
            <h1>{product.nombre || product.name}</h1>
            <p className="product-panel__copy">{product.description}</p>
            <div className="product-panel__facts">
              <span>{formatLabel(product.genero || product.gender)}</span>
              <span>{formatLabel(product.temporada)}</span>
              <span>{t('productRating', { rating: product.rating.toFixed(1) })}</span>
            </div>
            <div className="product-panel__price">
              <strong>{formatCurrency(product.precio ?? product.price, { locale, currency })}</strong>
              {product.old_price > product.price && <s>{formatCurrency(product.old_price, { locale, currency })}</s>}
            </div>

            <dl className="product-attributes">
              {attributes.map(([label, value]) => (
                <div key={label} className="product-attributes__item">
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>

            <fieldset className="product-panel__sizes">
              <legend>{t('productSize')}</legend>
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
                {t('productQuantity')}
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={event => setQuantity(Number(event.target.value) || 1)}
                />
              </label>
              <button type="button" className="button" onClick={handleAddToCart}>
                {t('productAddToCart')}
              </button>
            </div>
            <p className={message.includes(t('productSelectSize')) ? 'product-card__status is-error' : 'product-card__status'} aria-live="polite">{message}</p>
            <Link className="text-link" to="/checkout">{t('productGoCheckout')}</Link>
          </div>
        </div>
      </section>

      <section className="section section--muted">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{t('productRelatedEyebrow')}</p>
              <h2>{t('productRelatedTitle')}</h2>
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
