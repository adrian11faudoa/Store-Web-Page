import { formatCurrency } from '@store/utils'
import { useAppStore } from '../store/useAppStore.js'

export function CheckoutPage() {
  const cart = useAppStore().cart.cart
  const items = Array.isArray(cart?.items) ? cart.items : []
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0)
  const shipping = items.length > 0 && subtotal < 120 ? 12 : 0
  const total = subtotal + shipping

  return (
    <section className="section">
      <div className="container checkout-layout">
        <div className="checkout-card">
          <p className="eyebrow">Quick checkout</p>
          <h1>Almost ready for delivery</h1>
          <p>Review your pieces and continue building the playful storefront flow on top of your real imported catalog.</p>
        </div>

        <div className="checkout-card">
          <h2>Order summary</h2>
          <ul className="checkout-list">
            {items.map(item => (
              <li key={item.id}>
                <span>{item.product.name} · {item.variant.size} · {item.quantity}</span>
                <strong>{formatCurrency(item.lineTotal)}</strong>
              </li>
            ))}
            <li>
              <span>Shipping</span>
              <strong>{formatCurrency(shipping)}</strong>
            </li>
            <li>
              <span>Total</span>
              <strong>{formatCurrency(total)}</strong>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
