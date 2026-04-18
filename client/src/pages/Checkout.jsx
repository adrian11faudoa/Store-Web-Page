import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../assets/js/utils/format.js'

export default function Checkout({ cart }) {
  const [submitted, setSubmitted] = useState(false)
  const [formError, setFormError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const form = event.target
    const required = ['name', 'email', 'address', 'city', 'postal', 'country']
    const missing = required.filter(field => !form[field]?.value.trim())

    if (missing.length) {
      setFormError('Please fill in all required fields.')
      return
    }

    setFormError('')
    setSubmitted(true)
    cart.clearCart()
  }

  if (submitted) {
    return (
      <section className="section">
        <div className="container empty-state">
          <div className="empty-state__illustration">🎉</div>
          <h1>Order placed!</h1>
          <p>Thanks for shopping with Sahara Kids. You&apos;ll hear from us soon.</p>
          <Link className="button" to="/shop">Continue shopping</Link>
        </div>
      </section>
    )
  }

  if (cart.items.length === 0) {
    return (
      <section className="section">
        <div className="container empty-state">
          <h1>Your cart is empty</h1>
          <p>Add a few favorite pieces and come back when you&apos;re ready.</p>
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
          <form className="checkout-form" onSubmit={handleSubmit}>
            <label>
              Full name
              <input name="name" type="text" placeholder="Ava Johnson" />
            </label>
            <label>
              Email address
              <input name="email" type="email" placeholder="ava@example.com" />
            </label>
            <label>
              Shipping address
              <input name="address" type="text" placeholder="123 Palm Street" />
            </label>
            <label>
              City
              <input name="city" type="text" placeholder="Austin" />
            </label>
            <label>
              Postal code
              <input name="postal" type="text" placeholder="78701" />
            </label>
            <label>
              Country
              <input name="country" type="text" placeholder="United States" />
            </label>
            {formError && <div className="auth-error">{formError}</div>}
            <button type="submit" className="button button--full">Place order</button>
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
          <Link className="button button--ghost button--full" to="/shop">Continue shopping</Link>
        </aside>
      </div>
    </section>
  )
}
