// client/src/components/Navbar.jsx
import { Link } from 'react-router-dom'
import { useCart, useAuth } from '../store/index.js'

export default function Navbar() {
  const items  = useCart(s => s.items)
  const count  = items.reduce((s, i) => s + i.qty, 0)
  const user   = useAuth(s => s.user)
  const logout = useAuth(s => s.logout)

  return (
    <nav className="navbar">
      <Link to="/" className="navbar__logo">tiny<span>.</span>fits</Link>
      <ul className="navbar__links">
        <li><Link to="/shop?badge=new">New in</Link></li>
        <li><Link to="/shop?category=tops">Boys</Link></li>
        <li><Link to="/shop?category=dresses">Girls</Link></li>
        <li><Link to="/shop?ageGroup=baby">Baby</Link></li>
        <li><Link to="/shop?badge=sale" style={{color:'var(--color-accent)'}}>Sale</Link></li>
      </ul>
      <div className="navbar__actions">
        <Link to="/shop" className="nav-icon-btn">🔍 Search</Link>
        {user
          ? <button className="nav-icon-btn" onClick={logout}>👋 {user.name || 'Log out'}</button>
          : <Link to="/shop" className="nav-icon-btn">👤 Sign in</Link>
        }
        <Link to="/shop" className="cart-btn">
          🛍 Bag <span className="cart-count">{count}</span>
        </Link>
      </div>
    </nav>
  )
}
