import { useLocale } from '../context/localeContext.jsx'
import { useAppStore } from '../store/useAppStore.js'

export function CheckoutPage() {
  const { formatMoney } = useLocale()
  const cart = useAppStore().cart.cart
  const items = Array.isArray(cart?.items) ? cart.items : []
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0)
  const shipping = items.length > 0 && subtotal < 120 ? 12 : 0
  const total = subtotal + shipping

  return (
    <section className="section">
      <div className="container checkout-layout">
        <div className="checkout-card">
          <p className="eyebrow">Pago rapido</p>
          <h1>Casi listo para entrega</h1>
          <p>Revisa tus prendas y continua construyendo el flujo de tienda con tu catalogo real importado.</p>
        </div>

        <div className="checkout-card">
          <h2>Resumen del pedido</h2>
          <ul className="checkout-list">
            {items.map(item => (
              <li key={item.id}>
                <span>{item.product.name} · {item.variant.size} · {item.quantity}</span>
                <strong>{formatMoney(item.lineTotal)}</strong>
              </li>
            ))}
            <li>
              <span>Envio</span>
              <strong>{formatMoney(shipping)}</strong>
            </li>
            <li>
              <span>Total</span>
              <strong>{formatMoney(total)}</strong>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
