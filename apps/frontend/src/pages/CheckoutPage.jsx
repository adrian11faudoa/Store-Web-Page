import { useLocale } from '../context/localeContext.jsx'
import { useAppStore } from '../store/useAppStore.js'

export function CheckoutPage() {
  const { formatMoney } = useLocale()
  const store = useAppStore()
  const cart = store.cart.cart
  const updateCartItem = store.updateCartItem
  const items = Array.isArray(cart?.items) ? cart.items : []
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0)
  const shipping = items.length > 0 && subtotal < 120 ? 12 : 0
  const total = subtotal + shipping

  function changeQuantity(variantId, quantity) {
    updateCartItem(variantId, Math.max(0, quantity))
  }

  return (
    <section className="section">
      <div className="container checkout-layout">
        <div className="checkout-card">
          <p className="eyebrow">Pago rapido</p>
          <h1>Casi listo para entrega</h1>
          <p>Revisa tus prendas y continua construyendo el flujo de tienda con tu catalogo real importado.</p>

          {items.length === 0 ? (
            <p className="empty-copy">Tu carrito esta vacio.</p>
          ) : (
            <ul className="checkout-items">
              {items.map(item => (
                <li key={item.id} className="checkout-item">
                  <div
                    className="checkout-item__media"
                    style={{ background: `linear-gradient(135deg, ${item.product.palette?.[0] || '#ffd0c7'}, ${item.product.palette?.[1] || '#a8e6cf'})` }}
                  >
                    {item.product?.imageUrl ? (
                      <img src={item.product.imageUrl} alt={item.product?.name || 'Producto'} loading="lazy" />
                    ) : null}
                  </div>

                  <div className="checkout-item__body">
                    <div className="checkout-item__heading">
                      <strong>{item.product?.name || 'Producto desconocido'}</strong>
                      <strong>{formatMoney(item.lineTotal)}</strong>
                    </div>
                    <p className="checkout-item__meta">Talla {item.variant?.size || 'Default'}</p>
                    <div className="checkout-item__controls">
                      <button
                        type="button"
                        className="link-button"
                        onClick={() => changeQuantity(item.variant.id, item.quantity - 1)}
                        aria-label={`Disminuir cantidad de ${item.product?.name || 'producto'}`}
                      >
                        -
                      </button>
                      <span className="checkout-item__qty">{item.quantity}</span>
                      <button
                        type="button"
                        className="link-button"
                        onClick={() => changeQuantity(item.variant.id, item.quantity + 1)}
                        aria-label={`Aumentar cantidad de ${item.product?.name || 'producto'}`}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className="link-button checkout-item__remove"
                        onClick={() => changeQuantity(item.variant.id, 0)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="checkout-card">
          <h2>Resumen del pedido</h2>
          <ul className="checkout-list">
            {items.map(item => (
              <li key={item.id}>
                <span>{item.product.name} - {item.variant.size} - x{item.quantity}</span>
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
