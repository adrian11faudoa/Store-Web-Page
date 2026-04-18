const badges = [
  { icon: '🚚', label: 'Free shipping', sub: 'On orders over $120' },
  { icon: '↩️', label: 'Easy returns', sub: '30-day free returns' },
  { icon: '🛡️', label: 'Safe checkout', sub: 'SSL-secured payments' },
  { icon: '🌱', label: 'Eco packaging', sub: '100% recycled boxes' },
]

export default function TrustStrip() {
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
