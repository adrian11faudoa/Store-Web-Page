// client/src/components/Navbar.jsx
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useCart, useAuth } from '../store/index.js'
import CartDrawer from './CartDrawer.jsx'
import AuthModal from './AuthModal.jsx'

export default function Navbar() {
  const items  = useCart(s => s.items)
  const count  = items.reduce((s, i) => s + i.qty, 0)
  const user   = useAuth(s => s.user)
  const logout = useAuth(s => s.logout)

  const [cartOpen,   setCartOpen]   = useState(false)
  const [authOpen,   setAuthOpen]   = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQ,    setSearchQ]    = useState('')
  const searchRef = useRef(null)
  const navigate  = useNavigate()
  const location  = useLocation()

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus()
  }, [searchOpen])

  // Close search whenever the route changes
  useEffect(() => {
    setSearchOpen(false)
    setSearchQ('')
  }, [location.pathname + location.search])

  function handleSearchSubmit(e) {
    e.preventDefault()
    if (!searchQ.trim()) return
    navigate(`/shop?q=${encodeURIComponent(searchQ.trim())}`)
    setSearchOpen(false)
    setSearchQ('')
  }

  // navigate() works from any page — this is what was broken with <Link>
  function navTo(params) {
    navigate(`/shop?${params}`)
  }

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar__logo">tiny<span>.</span>fits</Link>

        <ul className="navbar__links">
          <li><button className="nav-link-btn" onClick={() => navTo('badge=new')}>New in</button></li>
          <li><button className="nav-link-btn" onClick={() => navTo('category=tops')}>Boys</button></li>
          <li><button className="nav-link-btn" onClick={() => navTo('category=dresses')}>Girls</button></li>
          <li><button className="nav-link-btn" onClick={() => navTo('ageGroup=baby')}>Baby</button></li>
          <li><button className="nav-link-btn accent" onClick={() => navTo('badge=sale')}>Sale</button></li>
        </ul>

        <div className="navbar__actions">
          <button
            className={`nav-icon-btn${searchOpen ? ' active' : ''}`}
            onClick={() => setSearchOpen(o => !o)}
          >
            🔍 Search
          </button>

          {user
            ? <button className="nav-icon-btn" onClick={logout}>
                👋 {user.name?.split(' ')[0] || 'Log out'}
              </button>
            : <button className="nav-icon-btn" onClick={() => setAuthOpen(true)}>
                👤 Sign in
              </button>
          }

          <button className="cart-btn" onClick={() => setCartOpen(true)}>
            🛍 Bag <span className="cart-count">{count}</span>
          </button>
        </div>
      </nav>

      {/* Inline search bar — slides in below navbar, no page navigation */}
      <div className={`search-bar-expanded${searchOpen ? ' open' : ''}`}>
        <form className="search-bar-form" onSubmit={handleSearchSubmit}>
          <span className="search-bar-icon">🔍</span>
          <input
            ref={searchRef}
            type="text"
            placeholder="Search 900+ products… press Enter or click Search"
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            className="search-bar-input"
          />
          {searchQ && (
            <button type="button" className="search-bar-clear" onClick={() => setSearchQ('')}>✕</button>
          )}
          <button type="submit" className="search-bar-submit">Search</button>
          <button type="button" className="search-bar-close" onClick={() => setSearchOpen(false)}>✕ Close</button>
        </form>
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <AuthModal  open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  )
}
