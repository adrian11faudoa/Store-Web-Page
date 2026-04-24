import { useLocale } from '../locale/LocaleProvider.jsx'

export default function TrustStrip() {
  const { currency, t } = useLocale()
  const threshold = currency === 'MXN' ? '$2,400 MXN' : '$120 USD'
  const badges = [
    { icon: '🚚', label: t('trustFreeShipping'), sub: t('trustFreeShippingSub', { amount: threshold }) },
    { icon: '↩️', label: t('trustEasyReturns'), sub: t('trustEasyReturnsSub') },
    { icon: '🛡️', label: t('trustSafeCheckout'), sub: t('trustSafeCheckoutSub') },
    { icon: '🌱', label: t('trustEcoPackaging'), sub: t('trustEcoPackagingSub') },
  ]

  return (
    <div className="trust-strip">
      <div className="container">
        <ul className="trust-strip__list">
          {badges.map(badge => (
            <li key={badge.label} className="trust-strip__item">
              <span className="trust-strip__icon">{badge.icon}</span>
              <div>
                <strong>{badge.label}</strong>
                <p>{badge.sub}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
