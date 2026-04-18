import { Link } from 'react-router-dom'
import { formatCurrency } from '../assets/js/utils/format.js'

export default function Checkout({ cart }) {
  if (cart.items.length === 0) {
    return (
      <section className="section">
        <div className="container empty-state">
          <h1>Your cart is empty</h1>
          <p>Add products from the catalog to preview checkout totals and cart persistence.</p>
          <Link className="button" to="/shop">Browse products</Link>
        </div>
      </section>
    )
  }

  return (
    <section className="section">
      <div className="container checkout-layout">
        <div className="checkout-card">
          <p className="eyebrow">Customer information</p>
          <h1>Checkout</h1>
          <form className="checkout-form">
            <label>
              Full name
              <input type="text" placeholder="Ava Johnson" />
            </label>
            <label>
              Email address
              <input type="email" placeholder="ava@example.com" />
            </label>
            <label>
              Shipping address
              <input type="text" placeholder="123 Palm Street" />
            </label>
            <label>
              City
              <input type="text" placeholder="Austin" />
            </label>
            <label>
              Postal code
              <input type="text" placeholder="78701" />
            </label>
            <label>
              Country
              <input type="text" placeholder="United States" />
            </label>
          </form>
        </div>

        <aside className="checkout-card">
          <p className="eyebrow">Order summary</p>
          <h2>{cart.itemCount} items</h2>
          <ul className="checkout-list">
            {cart.items.map(item => (
              <li key={`${item.productId}-${item.size || 'default'}`}>
                <span>{item.name} {item.size ? `(${item.size})` : ''} x {item.quantity}</span>
                <strong>{formatCurrency(item.price * item.quantity)}</strong>
              </li>
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
          <button type="button" className="button button--full">Place order</button>
          <Link className="button button--ghost button--full" to="/shop">Continue shopping</Link>
        </aside>
      </div>
    </section>
  )
}
