import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import heroImage from '../assets/catalog-hero.svg'
import { useAppStore } from '../store/useAppStore.js'
import { ProductCard } from '../components/ProductCard.jsx'

export function HomePage() {
  const store = useAppStore()
  const products = store.catalog.products
  const addToCart = store.addToCart
  const cart = store.cart.cart
  const itemCount = Array.isArray(cart?.items) ? cart.items.length : 0
  const featuredProducts = useMemo(() => products.filter(product => product.isFeatured).slice(0, 4), [products])

  return (
    <>
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__content">
            <p className="eyebrow">Nuevos ingresos recien llegados</p>
            <h1>Vistelos para cada aventura</h1>
            <p className="hero__copy">
              Telas suaves, colores alegres y estilos que siguen el ritmo de los peques. Tu catalogo importado ya esta
              en vivo con los articulos reales de tu inventario.
            </p>
            <div className="hero__actions">
              <Link className="button" to="/shop">Comprar ahora</Link>
              <Link className="button button--ghost" to="/checkout">Ver carrito ({itemCount})</Link>
            </div>
            <dl className="hero__stats">
              <div><dt>{products.length}+</dt><dd>articulos reales en linea</dd></div>
              <div><dt>Gratis</dt><dd>catalogo sembrado en local</dd></div>
              <div><dt>4.8★</dt><dd>estilo listo para tienda</dd></div>
            </dl>
          </div>
          <div className="hero__media">
            <img src={heroImage} alt="Ilustracion de tienda infantil" />
          </div>
        </div>
      </section>

      <section className="section section--muted">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Selecciones frescas para cada dia de juego</p>
              <h2>Piezas destacadas de tu catalogo importado</h2>
            </div>
            <Link className="text-link" to="/shop">Ver tienda completa</Link>
          </div>

          <div className="product-grid">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} onAddToCart={variantId => addToCart(variantId)} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
