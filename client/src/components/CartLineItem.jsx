import { formatCurrency } from '../assets/js/utils/format.js'
import { useLocale } from '../locale/LocaleProvider.jsx'

export default function CartLineItem({ item, onDecrease, onIncrease, onRemove }) {
  const { currency, locale, t } = useLocale()

  return (
    <li className="cart-item">
      <div
        className="cart-item__swatch"
        style={{ background: `linear-gradient(135deg, ${item.palette[0]}, ${item.palette[1]})` }}
        aria-hidden="true"
      />
      <div className="cart-item__body">
        <div className="cart-item__heading">
          <strong>{item.name}</strong>
          <span>{formatCurrency(item.price, { locale, currency })}</span>
        </div>
        <p>{item.size ? t('cartSize', { size: item.size }) : t('cartOneSize')}</p>
        <div className="cart-item__controls">
          <button type="button" onClick={onDecrease} aria-label={`Decrease quantity of ${item.name}`}>-</button>
          <span>{item.quantity}</span>
          <button type="button" onClick={onIncrease} aria-label={`Increase quantity of ${item.name}`}>+</button>
          <button type="button" className="link-button" onClick={onRemove}>{t('cartRemove')}</button>
        </div>
      </div>
    </li>
  )
}
