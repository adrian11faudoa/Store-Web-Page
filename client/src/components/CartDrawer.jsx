import { Link } from 'react-router-dom'
import CartLineItem from './CartLineItem.jsx'
import { formatCurrency } from '../assets/js/utils/format.js'

export default function CartDrawer({ isOpen, onClose, cart }) {
  return (
    <div className={isOpen ? 'drawer is-open' : 'drawer'} aria-hidden={!isOpen}>
      <button
        type="button"
        className={isOpen ? 'drawer__backdrop is-open' : 'drawer__backdrop'}
        onClick={onClose}
        aria-label="Close cart"
      />
      <aside className="drawer__panel" aria-label="Shopping cart">
        <div className="drawer__header">
          <div>
            <p className="eyebrow">Shopping cart</p>
            <h2>Your picks</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>Close</button>
        </div>

        {cart.items.length === 0 ? (
          <div className="empty-state">
            <h3>Your cart is empty</h3>
            <p>Add a few pieces from the catalog to see totals and checkout details.</p>
          </div>
        ) : (
          <>
            <ul className="cart-list">
              {cart.items.map(item => (
                <CartLineItem
                  key={`${item.productId}-${item.size || 'default'}`}
                  item={item}
                  onDecrease={() => cart.updateQuantity(item.productId, item.size, item.quantity - 1)}
                  onIncrease={() => cart.updateQuantity(item.productId, item.size, item.quantity + 1)}
                  onRemove={() => cart.removeItem(item.productId, item.size)}
                />
              ))}
            </ul>

            <div className="drawer__summary">
              <div><span>Subtotal</span><strong>{formatCurrency(cart.totals.subtotal)}</strong></div>
              <div><span>Shipping</span><strong>{cart.totals.shipping === 0 ? 'Free' : formatCurrency(cart.totals.shipping)}</strong></div>
              <div><span>Tax</span><strong>{formatCurrency(cart.totals.tax)}</strong></div>
              <div className="drawer__summary-total">
                <span>Total</span>
                <strong>{formatCurrency(cart.totals.total)}</strong>
              </div>
            </div>

            <div className="drawer__actions">
              <Link className="button button--full" to="/checkout" onClick={onClose}>
                Go to checkout
              </Link>
              <button type="button" className="button button--ghost button--full" onClick={cart.clearCart}>
                Clear cart
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
