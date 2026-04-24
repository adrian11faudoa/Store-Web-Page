import { Link } from 'react-router-dom'
import CartLineItem from './CartLineItem.jsx'
import { formatCurrency } from '../assets/js/utils/format.js'
import { useLocale } from '../locale/LocaleProvider.jsx'

export default function CartDrawer({ isOpen, onClose, cart }) {
  const { currency, locale, t } = useLocale()

  return (
    <div className={isOpen ? 'drawer is-open' : 'drawer'} aria-hidden={!isOpen}>
      <button
        type="button"
        className={isOpen ? 'drawer__backdrop is-open' : 'drawer__backdrop'}
        onClick={onClose}
        aria-label={t('drawerClose')}
      />
      <aside className="drawer__panel" aria-label={t('drawerEyebrow')}>
        <div className="drawer__header">
          <div>
            <p className="eyebrow">{t('drawerEyebrow')}</p>
            <h2>{t('drawerTitle')}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>{t('drawerClose')}</button>
        </div>

        {cart.items.length === 0 ? (
          <div className="empty-state">
            <h3>{t('drawerEmptyTitle')}</h3>
            <p>{t('drawerEmptyCopy')}</p>
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
              <div><span>{t('drawerSubtotal')}</span><strong>{formatCurrency(cart.totals.subtotal, { locale, currency })}</strong></div>
              <div><span>{t('drawerShipping')}</span><strong>{cart.totals.shipping === 0 ? t('shippingFree') : formatCurrency(cart.totals.shipping, { locale, currency })}</strong></div>
              <div><span>{t('drawerTax')}</span><strong>{formatCurrency(cart.totals.tax, { locale, currency })}</strong></div>
              <div className="drawer__summary-total">
                <span>{t('drawerTotal')}</span>
                <strong>{formatCurrency(cart.totals.total, { locale, currency })}</strong>
              </div>
            </div>

            <div className="drawer__actions">
              <Link className="button button--full" to="/checkout" onClick={onClose}>
                {t('drawerGoCheckout')}
              </Link>
              <button type="button" className="button button--ghost button--full" onClick={cart.clearCart}>
                {t('drawerClearCart')}
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
