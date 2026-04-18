import { formatCurrency } from '@store/utils'
import { useAppStore } from '../store/useAppStore.js'

export function CheckoutPage() {
  const cart = useAppStore(state => state.cart.cart)
  const subtotal = (cart.items || []).reduce((sum, item) => sum + item.lineTotal, 0)

  return (
    <section className="checkout-grid">
      <div className="panel">
        <p className="eyebrow">Operational next step</p>
        <h1>Checkout pipeline</h1>
        <p>
          The cart is backed by the API and database. Payment orchestration can now be layered in without rewriting
          state management, auth, or product contracts.
        </p>
      </div>
      <div className="panel">
        <h2>Order summary</h2>
        {(cart.items || []).map(item => (
          <div className="summary-row" key={item.id}>
            <span>{item.product.name} · {item.variant.size} · {item.quantity}</span>
            <strong>{formatCurrency(item.lineTotal)}</strong>
          </div>
        ))}
        <div className="summary-row">
          <span>Total</span>
          <strong>{formatCurrency(subtotal)}</strong>
        </div>
      </div>
    </section>
  )
}
