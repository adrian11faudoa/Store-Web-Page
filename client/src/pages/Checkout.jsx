import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../assets/js/utils/format.js'
import { useLocale } from '../locale/LocaleProvider.jsx'

export default function Checkout({ cart }) {
  const { currency, locale, t } = useLocale()
  const [submitted, setSubmitted] = useState(false)
  const [formError, setFormError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const form = event.target
    const required = ['name', 'email', 'address', 'city', 'postal', 'country']
    const missing = required.filter(field => !form[field]?.value.trim())

    if (missing.length) {
      setFormError(t('checkoutFillRequired'))
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
          <h1>{t('checkoutPlaced')}</h1>
          <p>{t('checkoutPlacedCopy')}</p>
          <Link className="button" to="/shop">{t('checkoutContinueShopping')}</Link>
        </div>
      </section>
    )
  }

  if (cart.items.length === 0) {
    return (
      <section className="section">
        <div className="container empty-state">
          <h1>{t('checkoutEmptyTitle')}</h1>
          <p>{t('checkoutEmptyCopy')}</p>
          <Link className="button" to="/shop">{t('checkoutBrowse')}</Link>
        </div>
      </section>
    )
  }

  return (
    <section className="section">
      <div className="container checkout-layout">
        <div className="checkout-card">
          <p className="eyebrow">{t('checkoutCustomerInfo')}</p>
          <h1>{t('checkoutTitle')}</h1>
          <form className="checkout-form" onSubmit={handleSubmit}>
            <label>
              {t('checkoutName')}
              <input name="name" type="text" placeholder="Ava Johnson" />
            </label>
            <label>
              {t('checkoutEmail')}
              <input name="email" type="email" placeholder="ava@example.com" />
            </label>
            <label>
              {t('checkoutAddress')}
              <input name="address" type="text" placeholder="123 Palm Street" />
            </label>
            <label>
              {t('checkoutCity')}
              <input name="city" type="text" placeholder="Austin" />
            </label>
            <label>
              {t('checkoutPostal')}
              <input name="postal" type="text" placeholder="78701" />
            </label>
            <label>
              {t('checkoutCountry')}
              <input name="country" type="text" placeholder="United States" />
            </label>
            {formError && <div className="auth-error">{formError}</div>}
            <button type="submit" className="button button--full">{t('checkoutPlaceOrder')}</button>
          </form>
        </div>

        <aside className="checkout-card">
          <p className="eyebrow">{t('checkoutSummary')}</p>
          <h2>{t('checkoutItems', { count: cart.itemCount })}</h2>
          <ul className="checkout-list">
            {cart.items.map(item => (
              <li key={`${item.productId}-${item.size || 'default'}`}>
                <span>{item.name} {item.size ? `(${item.size})` : ''} x {item.quantity}</span>
                <strong>{formatCurrency(item.price * item.quantity, { locale, currency })}</strong>
              </li>
            ))}
          </ul>
          <div className="drawer__summary">
            <div><span>{t('drawerSubtotal')}</span><strong>{formatCurrency(cart.totals.subtotal, { locale, currency })}</strong></div>
            <div><span>{t('drawerShipping')}</span><strong>{cart.totals.shipping === 0 ? t('shippingFree') : formatCurrency(cart.totals.shipping, { locale, currency })}</strong></div>
            <div><span>{t('drawerTax')}</span><strong>{formatCurrency(cart.totals.tax, { locale, currency })}</strong></div>
            <div className="drawer__summary-total">
              <span>{t('drawerTotal')}</span>
              <strong>{formatCurrency(cart.totals.total, { locale, currency })}</strong>
            </div>
          </div>
          <Link className="button button--ghost button--full" to="/shop">{t('checkoutContinue')}</Link>
        </aside>
      </div>
    </section>
  )
}
