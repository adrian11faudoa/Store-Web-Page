// client/src/components/CartDrawer.jsx
import { useEffect } from 'react'
import { useCart } from '../store/index.js'

export default function CartDrawer({ open, onClose }) {
  const items  = useCart(s => s.items)
  const remove = useCart(s => s.remove)
  const total  = items.reduce((s, i) => s + i.price * i.qty, 0)
  const count  = items.reduce((s, i) => s + i.qty, 0)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <>
      <div
        className={`drawer-backdrop${open ? ' open' : ''}`}
        onClick={onClose}
      />

      <div className={`cart-drawer${open ? ' open' : ''}`} role="dialog" aria-label="Shopping bag">
        <div className="cart-drawer__header">
          <div>
            <span className="cart-drawer__title">Your bag</span>
            <span className="cart-drawer__count">{count} item{count !== 1 ? 's' : ''}</span>
          </div>
          <button className="cart-drawer__close" onClick={onClose}>✕</button>
        </div>

        <div className="cart-drawer__body">
          {items.length === 0 ? (
            <div className="cart-drawer__empty">
              <div style={{ fontSize: 48, marginBottom: '1rem' }}>🛍</div>
              <p>Your bag is empty</p>
              <button className="btn btn--primary" style={{ marginTop: '1rem' }} onClick={onClose}>
                Continue shopping
              </button>
            </div>
          ) : (
            <ul className="cart-drawer__list">
              {items.map((item, idx) => (
                <li key={item.product_id ?? idx} className="cart-item">
                  <div
                    className="cart-item__img"
                    style={{ background: item.fallback_bg || '#EEEDFE' }}
                  >
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        onError={e => { e.target.style.display = 'none' }}
                      />
                    ) : (
                      <span style={{ fontSize: 24 }}>👕</span>
                    )}
                  </div>

                  <div className="cart-item__info">
                    <div className="cart-item__name">{item.name}</div>
                    <div className="cart-item__meta">
                      Qty: {item.qty} · ${(item.price * item.qty).toFixed(2)}
                    </div>
                  </div>

                  {/* Remove by product_id — matches store.remove() */}
                  <button
                    className="cart-item__remove"
                    onClick={() => remove(item.product_id)}
                    aria-label="Remove item"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-drawer__footer">
            <div className="cart-drawer__total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <button className="btn btn--primary" style={{ width: '100%', justifyContent: 'center' }}>
              Checkout
            </button>
            <button
              className="btn btn--outline"
              style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
              onClick={onClose}
            >
              Continue shopping
            </button>
          </div>
        )}
      </div>
    </>
  )
}
