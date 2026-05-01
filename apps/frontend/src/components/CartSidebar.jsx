import { Link } from 'react-router-dom'
import { useLocale } from '../context/localeContext.jsx'
import { useAppStore } from '../store/useAppStore.js'

export function CartSidebar({ isOpen, onClose }) {
  const store = useAppStore()
  const { formatMoney } = useLocale()
  const cart = store.cart.cart
  const updateCartItem = store.updateCartItem
  const items = Array.isArray(cart?.items) ? cart.items : []
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0)

  return (
    <div className={isOpen ? 'drawer is-open' : 'drawer'}>
      <button type="button" className="drawer__backdrop" onClick={onClose} aria-label="Cerrar carrito" />
      <aside className="drawer__panel">
        <div className="drawer__header">
          <div>
            <strong>Carrito</strong>
            <p>{items.length} articulo(s)</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose}>Cerrar</button>
        </div>

        <div className="cart-list">
          {items.length === 0 ? <p className="empty-copy">Tu carrito esta vacio.</p> : null}
          {items.map(item => (
            <div className="cart-item" key={item.id}>
              <div
                className="cart-item__media"
                style={{ background: `linear-gradient(135deg, ${item.product.palette?.[0] || '#ffd0c7'}, ${item.product.palette?.[1] || '#a8e6cf'})` }}
              >
                {item.product?.imageUrl ? (
                  <img src={item.product.imageUrl} alt={item.product?.name || 'Producto'} loading="lazy" />
                ) : null}
              </div>
              <div className="cart-item__body">
                <div className="cart-item__heading">
                  <strong>{item.product?.name || 'Producto desconocido'}</strong>
                  <strong>{formatMoney(item.lineTotal)}</strong>
                </div>
                <p>Talla {item.variant?.size || 'Default'}</p>
                <div className="cart-item__controls">
                  <button type="button" className="link-button" onClick={() => updateCartItem(item.variant.id, Math.max(0, item.quantity - 1))}>-</button>
                  <span>{item.quantity}</span>
                  <button type="button" className="link-button" onClick={() => updateCartItem(item.variant.id, item.quantity + 1)}>+</button>
                  <button
                    type="button"
                    className="link-button cart-item__remove"
                    onClick={() => updateCartItem(item.variant.id, 0)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="drawer__summary">
          <div>
            <span>Subtotal</span>
            <strong>{formatMoney(subtotal)}</strong>
          </div>
          <div className="drawer__actions">
            <Link className="button button--ghost" to="/checkout" onClick={onClose}>Pagar</Link>
          </div>
        </div>
      </aside>
    </div>
  )
}
