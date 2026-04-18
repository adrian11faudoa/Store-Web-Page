import { formatCurrency } from '../assets/js/utils/format.js'

export default function CartLineItem({ item, onDecrease, onIncrease, onRemove }) {
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
          <span>{formatCurrency(item.price)}</span>
        </div>
        <p>{item.size ? `Size ${item.size}` : 'One size'}</p>
        <div className="cart-item__controls">
          <button type="button" onClick={onDecrease} aria-label={`Decrease quantity of ${item.name}`}>-</button>
          <span>{item.quantity}</span>
          <button type="button" onClick={onIncrease} aria-label={`Increase quantity of ${item.name}`}>+</button>
          <button type="button" className="link-button" onClick={onRemove}>Remove</button>
        </div>
      </div>
    </li>
  )
}
