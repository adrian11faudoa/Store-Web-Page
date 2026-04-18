import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { formatCurrency } from '@store/utils'
import { useAppStore } from '../store/useAppStore.js'

export function ProductPage() {
  const { slug } = useParams()
  const product = useAppStore(state => state.catalog.selectedProduct)
  const loadProduct = useAppStore(state => state.loadProduct)
  const addToCart = useAppStore(state => state.addToCart)
  const [selectedVariant, setSelectedVariant] = useState('')

  useEffect(() => {
    loadProduct(slug)
  }, [loadProduct, slug])

  useEffect(() => {
    if (product?.variants?.length) {
      setSelectedVariant(product.variants[0].id)
    }
  }, [product])

  if (!product) {
    return <section className="section-stack"><p>Loading product...</p></section>
  }

  return (
    <section className="product-detail">
      <div
        className="product-detail-art"
        style={{ background: `linear-gradient(135deg, ${product.palette[0]}, ${product.palette[1]})` }}
      />
      <div className="section-stack">
        <p className="eyebrow">{product.category.name}</p>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        <strong>{formatCurrency(product.price)}</strong>
        <select className="input" value={selectedVariant} onChange={event => setSelectedVariant(event.target.value)}>
          {product.variants.map(variant => (
            <option key={variant.id} value={variant.id}>
              {variant.size} · {variant.stock > 0 ? `${variant.stock} in stock` : 'Out of stock'}
            </option>
          ))}
        </select>
        <button className="button" type="button" onClick={() => addToCart(selectedVariant)}>
          Add to cart
        </button>
      </div>
    </section>
  )
}
