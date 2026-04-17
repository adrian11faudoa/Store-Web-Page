import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../store/index.js'
import { t, useLang } from '../store/lang.js'
import { useMoney } from '../lib/money.js'

export default function CartDrawer({ open, onClose }) {
  const navigate = useNavigate()
  const lang = useLang(state => state.lang)
  const { formatMoney } = useMoney()
  const items = useCart(state => state.items)
  const removeItem = useCart(state => state.removeItem)
  const setQuantity = useCart(state => state.setQuantity)
  const loading = useCart(state => state.loading)
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0)
  const count = items.reduce((sum, item) => sum + item.qty, 0)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    document.body.classList.toggle('overlay-navbar-compact', open)
    return () => {
      document.body.style.overflow = ''
      document.body.classList.remove('overlay-navbar-compact')
    }
  }, [open])

  useEffect(() => {
    const handler = event => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <>
      <div className={`drawer-backdrop${open ? ' open' : ''}`} onClick={onClose} />

      <div className={`cart-drawer${open ? ' open' : ''}`} role="dialog" aria-label={t(lang, 'bag')} aria-modal="true">
        <div className="cart-drawer__header">
          <div>
            <span className="cart-drawer__title">{t(lang, 'yourBag')}</span>
            <span className="cart-drawer__count">
              {count} {count === 1 ? t(lang, 'item') : t(lang, 'items')}
            </span>
          </div>
          <button className="cart-drawer__close" onClick={onClose} aria-label={t(lang, 'close')}>x</button>
        </div>

        <div className="cart-drawer__body">
          {items.length === 0 ? (
            <div className="cart-drawer__empty">
              <div style={{ fontSize: 48, marginBottom: '1rem' }}>{t(lang, 'bag')}</div>
              <p>{t(lang, 'yourBagEmpty')}</p>
              <button className="btn btn--primary" style={{ marginTop: '1rem' }} onClick={onClose}>
                {t(lang, 'continueShopping')}
              </button>
            </div>
          ) : (
            <ul className="cart-drawer__list">
              {items.map((item, idx) => (
                <li key={`${item.id ?? item.product_id ?? idx}-${item.size || 'default'}`} className="cart-item">
                  <div className="cart-item__img" style={{ background: item.fallback_bg || '#EEEDFE' }}>
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        onError={event => {
                          event.target.style.display = 'none'
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: 24 }}>{t(lang, 'bag')}</span>
                    )}
                  </div>

                  <div className="cart-item__info">
                    <div className="cart-item__name">{item.name}</div>
                    <div className="cart-item__meta">
                      {item.size ? `${t(lang, 'size')} ${item.size} · ` : ''}
                      {formatMoney(item.price)} {t(lang, 'each')}
                    </div>
                    <div className="cart-item__meta">
                      <button
                        className="cart-item__remove"
                        onClick={() => (
                          item.qty <= 1
                            ? removeItem(item.id, item.product_id, item.size)
                            : setQuantity(item.product_id, item.qty - 1, item.size)
                        )}
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        -
                      </button>
                      <span style={{ margin: '0 10px' }}>Qty {item.qty}</span>
                      <button
                        className="cart-item__remove"
                        onClick={() => setQuantity(item.product_id, item.qty + 1, item.size)}
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: 8, justifyItems: 'end' }}>
                    <div className="cart-item__meta">{formatMoney(item.price * item.qty)}</div>
                    <button
                      className="cart-item__remove"
                      onClick={() => removeItem(item.id, item.product_id, item.size)}
                      aria-label={`${t(lang, 'remove')} ${item.name}`}
                    >
                      {t(lang, 'remove')}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-drawer__footer">
            <div className="cart-drawer__total">
              <span>{t(lang, 'total')}</span>
              <span>{formatMoney(total)}</span>
            </div>
            <button
              className="btn btn--primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => {
                onClose()
                navigate('/checkout')
              }}
            >
              {t(lang, 'checkout')}
            </button>
            <button
              className="btn btn--outline"
              style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
              onClick={onClose}
            >
              {loading ? t(lang, 'updatingBag') : t(lang, 'continueShopping')}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
