import { Link } from 'react-router-dom'
import { formatCurrency } from '@store/utils'
import { useAppStore } from '../store/useAppStore.js'

export function CartSidebar({ isOpen, onClose }) {
  const cart = useAppStore(state => state.cart.cart)
  const updateCartItem = useAppStore(state => state.updateCartItem)
  const subtotal = (cart.items || []).reduce((sum, item) => sum + item.lineTotal, 0)

  return (
    <aside className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="cart-header">
        <h2>Cart</h2>
        <button className="button ghost" type="button" onClick={onClose}>Close</button>
      </div>
      <div className="cart-content">
        {(cart.items || []).map(item => (
          <div className="cart-item" key={item.id}>
            <div>
              <strong>{item.product.name}</strong>
              <p>{item.variant.size}</p>
            </div>
            <div className="cart-actions">
              <span>{formatCurrency(item.lineTotal)}</span>
              <button className="button ghost" type="button" onClick={() => updateCartItem(item.variant.id, Math.max(0, item.quantity - 1))}>-</button>
              <span>{item.quantity}</span>
              <button className="button ghost" type="button" onClick={() => updateCartItem(item.variant.id, item.quantity + 1)}>+</button>
            </div>
          </div>
        ))}
      </div>
      <div className="cart-footer">
        <strong>Subtotal {formatCurrency(subtotal)}</strong>
        <Link className="button" to="/checkout" onClick={onClose}>Checkout</Link>
      </div>
    </aside>
  )
}
