import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../store/index.js'
import { t, useLang } from '../store/lang.js'
import { useMoney } from '../lib/money.js'

const inputStyle = {
  width: '100%',
  padding: '0.85rem 0.95rem',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--color-surface)',
  font: 'inherit',
}

export default function Checkout() {
  const navigate = useNavigate()
  const lang = useLang(state => state.lang)
  const { formatMoney } = useMoney()
  const items = useCart(state => state.items)
  const setQuantity = useCart(state => state.setQuantity)
  const removeItem = useCart(state => state.removeItem)
  const loading = useCart(state => state.loading)

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0)
  const shipping = items.length > 0 ? (subtotal >= 50 ? 0 : 6.9) : 0
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  if (items.length === 0) {
    return (
      <section className="section">
        <div className="empty-state">
          <h3>{t(lang, 'yourBagEmpty')}</h3>
          <p>{t(lang, 'emptyCheckout')}</p>
          <button className="btn btn--primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/shop')}>
            {t(lang, 'continueShopping')}
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="section">
      <div className="breadcrumb" style={{ marginBottom: '1.25rem' }}>
        <Link to="/">{t(lang, 'home')}</Link> / <Link to="/shop">{t(lang, 'shop')}</Link> / <span>{t(lang, 'checkout')}</span>
      </div>

      <div className="checkout-layout">
        <div className="checkout-main">
          <div className="checkout-card">
            <div className="checkout-card__header">
              <div>
                <p className="checkout-kicker">{t(lang, 'checkout')}</p>
                <h1 className="checkout-title">{t(lang, 'readyToPlaceOrder')}</h1>
              </div>
              <span className="checkout-pill">{items.length} {t(lang, 'lines')}</span>
            </div>

            <div className="checkout-grid">
              <div className="checkout-form-section">
                <h2>{t(lang, 'contactSection')}</h2>
                <div className="checkout-form-grid">
                  <input style={inputStyle} placeholder={t(lang, 'emailAddress')} />
                  <input style={inputStyle} placeholder={t(lang, 'phoneNumber')} />
                </div>
              </div>

              <div className="checkout-form-section">
                <h2>{t(lang, 'shippingAddress')}</h2>
                <div className="checkout-form-grid">
                  <input style={inputStyle} placeholder={t(lang, 'firstName')} />
                  <input style={inputStyle} placeholder={t(lang, 'lastName')} />
                  <input style={{ ...inputStyle, gridColumn: '1 / -1' }} placeholder={t(lang, 'streetAddress')} />
                  <input style={inputStyle} placeholder={t(lang, 'city')} />
                  <input style={inputStyle} placeholder={t(lang, 'state')} />
                  <input style={inputStyle} placeholder={t(lang, 'zipCode')} />
                  <select style={inputStyle} defaultValue="Mexico">
                    <option>Mexico</option>
                    <option>United States</option>
                    <option>Canada</option>
                  </select>
                </div>
              </div>

              <div className="checkout-form-section">
                <h2>{t(lang, 'payment')}</h2>
                <div className="checkout-form-grid">
                  <input style={{ ...inputStyle, gridColumn: '1 / -1' }} placeholder={t(lang, 'cardNumber')} />
                  <input style={inputStyle} placeholder={t(lang, 'cardExpiry')} />
                  <input style={inputStyle} placeholder={t(lang, 'cardCvv')} />
                  <input style={{ ...inputStyle, gridColumn: '1 / -1' }} placeholder={t(lang, 'nameOnCard')} />
                </div>
              </div>
            </div>
          </div>

          <div className="checkout-card">
            <div className="checkout-card__header">
              <div>
                <p className="checkout-kicker">{t(lang, 'bag')}</p>
                <h2 className="checkout-subtitle">{t(lang, 'reviewItems')}</h2>
              </div>
            </div>

            <div className="checkout-items">
              {items.map(item => (
                <div key={`${item.id ?? item.product_id}-${item.size || 'default'}`} className="checkout-item">
                  <div className="checkout-item__media" style={{ background: item.fallback_bg || '#EEEDFE' }}>
                    {item.image_url ? <img src={item.image_url} alt={item.name} /> : <span>{t(lang, 'bag')}</span>}
                  </div>

                  <div className="checkout-item__info">
                    <div className="checkout-item__name">{item.name}</div>
                    <div className="checkout-item__meta">
                      {item.size ? `${t(lang, 'size')} ${item.size} · ` : ''}
                      {formatMoney(item.price)} {t(lang, 'each')}
                    </div>
                    <div className="checkout-item__actions">
                      <button
                        className="cart-item__remove"
                        onClick={() => (
                          item.qty <= 1
                            ? removeItem(item.id, item.product_id, item.size)
                            : setQuantity(item.product_id, item.qty - 1, item.size)
                        )}
                      >
                        -
                      </button>
                      <span>Qty {item.qty}</span>
                      <button
                        className="cart-item__remove"
                        onClick={() => setQuantity(item.product_id, item.qty + 1, item.size)}
                      >
                        +
                      </button>
                      <button
                        className="cart-item__remove"
                        onClick={() => removeItem(item.id, item.product_id, item.size)}
                      >
                        {t(lang, 'remove')}
                      </button>
                    </div>
                  </div>

                  <div className="checkout-item__price">{formatMoney(item.price * item.qty)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="checkout-summary">
          <div className="checkout-card">
            <p className="checkout-kicker">{t(lang, 'summary')}</p>
            <h2 className="checkout-subtitle">{t(lang, 'orderTotals')}</h2>

            <div className="checkout-summary__rows">
              <div><span>{t(lang, 'subtotal')}</span><strong>{formatMoney(subtotal)}</strong></div>
              <div><span>{t(lang, 'shipping')}</span><strong>{shipping === 0 ? t(lang, 'free') : formatMoney(shipping)}</strong></div>
              <div><span>{t(lang, 'estimatedTax')}</span><strong>{formatMoney(tax)}</strong></div>
              <div className="checkout-summary__total"><span>{t(lang, 'total')}</span><strong>{formatMoney(total)}</strong></div>
            </div>

            <div className="checkout-note">
              {subtotal >= 50 ? t(lang, 'unlockedFreeShipping') : t(lang, 'addMoreForFreeShipping')}
            </div>

            <button className="btn btn--primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
              {loading ? t(lang, 'updatingOrder') : t(lang, 'placeOrder')}
            </button>
            <button
              className="btn btn--outline"
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem' }}
              onClick={() => navigate('/shop')}
            >
              {t(lang, 'continueShopping')}
            </button>
          </div>
        </aside>
      </div>
    </section>
  )
}
