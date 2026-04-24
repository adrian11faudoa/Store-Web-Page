import { Link } from 'react-router-dom'
import { formatCurrency } from '@store/utils'
import { useAppStore } from '../store/useAppStore.js'

export function CartSidebar({ isOpen, onClose }) {
  const store = useAppStore()
  const cart = store.cart.cart
  const updateCartItem = store.updateCartItem
  const items = Array.isArray(cart?.items) ? cart.items : []
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0)

  return (
    <div className={isOpen ? 'drawer is-open' : 'drawer'}>
      <button type="button" className="drawer__backdrop" onClick={onClose} aria-label="Close cart" />
      <aside className="drawer__panel">
        <div className="drawer__header">
          <div>
            <strong>Cart</strong>
            <p>{items.length} item(s)</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose}>Close</button>
        </div>

        <div className="cart-list">
          {items.length === 0 ? <p className="empty-copy">Your cart is empty.</p> : null}
          {items.map(item => (
            <div className="cart-item" key={item.id}>
              <div className="cart-item__swatch" style={{ background: `linear-gradient(135deg, ${item.product.palette?.[0] || '#ffd0c7'}, ${item.product.palette?.[1] || '#a8e6cf'})` }} />
              <div className="cart-item__body">
                <div className="cart-item__heading">
                  <strong>{item.product?.name || 'Unknown product'}</strong>
                  <strong>{formatCurrency(item.lineTotal)}</strong>
                </div>
                <p>Size {item.variant?.size || 'Default'}</p>
                <div className="cart-item__controls">
                  <button type="button" className="link-button" onClick={() => updateCartItem(item.variant.id, Math.max(0, item.quantity - 1))}>-</button>
                  <span>{item.quantity}</span>
                  <button type="button" className="link-button" onClick={() => updateCartItem(item.variant.id, item.quantity + 1)}>+</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="drawer__summary">
          <div>
            <span>Subtotal</span>
            <strong>{formatCurrency(subtotal)}</strong>
          </div>
          <div className="drawer__actions">
            <Link className="button button--ghost" to="/checkout" onClick={onClose}>Checkout</Link>
          </div>
        </div>
      </aside>
    </div>
  )
}
