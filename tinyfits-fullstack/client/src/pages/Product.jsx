// client/src/pages/Product.jsx
import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProduct } from '../hooks/useProducts.js'
import { useCart } from '../store/index.js'
import ProductCard from '../components/ProductCard.jsx'

export default function Product() {
  const { id }     = useParams()
  const { product: p, related, loading, error } = useProduct(id)
  const add        = useCart(s => s.add)
  const [added, setAdded]       = useState(false)
  const [selSize, setSelSize]   = useState(null)
  const [imgErr, setImgErr]     = useState(false)

  if (loading) return <div className="product-detail-loading">Loading…</div>
  if (error || !p) return <div className="product-detail-loading">Product not found.</div>

  const discount = p.old_price ? Math.round((1 - p.price / p.old_price) * 100) : null

  function handleAdd() {
    if (!selSize && p.sizes?.length) return alert('Please select a size')
    add(p)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <>
      <div className="product-detail">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> /
          <Link to={`/shop?category=${p.category}`}>{p.category_label}</Link> /
          <span>{p.name}</span>
        </div>

        <div className="product-detail__grid">
          {/* Image */}
          <div className="product-detail__img" style={{background: p.fallback_bg}}>
            {p.badge && (
              <span className={`badge badge--${p.badge}`} style={{fontSize:13,padding:'5px 14px'}}>
                {p.badge === 'new' ? 'New in' : `−${discount}% Sale`}
              </span>
            )}
            {imgErr ? (
              <span style={{fontSize:100}}>👕</span>
            ) : (
              <img src={p.image_url} alt={p.name}
                onError={() => setImgErr(true)}
                style={{width:'100%',height:'100%',objectFit:'cover',position:'absolute',inset:0}} />
            )}
          </div>

          {/* Info */}
          <div className="product-detail__info">
            <div className="product-detail__category">{p.category_label} · {p.age_range}</div>
            <h1 className="product-detail__name">{p.name}</h1>

            <div className="product-detail__rating">
              {'★'.repeat(Math.round(p.rating))}{'☆'.repeat(5-Math.round(p.rating))}
              <span>{p.rating} ({p.reviews} reviews)</span>
            </div>

            <div className="product-detail__price">
              ${p.price}
              {p.old_price && <span className="price__old">${p.old_price}</span>}
              {discount && <span className="price__discount">−{discount}%</span>}
            </div>

            {/* Size selector */}
            {p.sizes?.length > 0 && (
              <div className="product-detail__sizes">
                <div className="product-detail__sizes-label">
                  Size <span>{selSize || 'Select a size'}</span>
                </div>
                <div className="size-selector">
                  {p.sizes.map(s => (
                    <button key={s}
                      className={`size-btn${selSize === s ? ' active' : ''}`}
                      onClick={() => setSelSize(s)}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            <button className={`btn btn--primary product-detail__add${added ? ' added' : ''}`}
              onClick={handleAdd} style={{width:'100%',justifyContent:'center',marginTop:'1.5rem'}}>
              {added ? '✓ Added to bag!' : '+ Add to bag'}
            </button>

            <div className="product-detail__meta-list">
              <div>🚚 Free delivery on orders over $50</div>
              <div>↩️ Free returns within 30 days</div>
              <div>🌱 Made with GOTS certified cotton</div>
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="section section--gray">
          <div className="section__header">
            <h2 className="section__title">You might also like</h2>
            <Link to={`/shop?category=${p.category}`} className="section__link">
              See all {p.category_label} →
            </Link>
          </div>
          <div className="product-grid">
            {related.slice(0,4).map(r => <ProductCard key={r.id} product={r} />)}
          </div>
        </section>
      )}
    </>
  )
}
