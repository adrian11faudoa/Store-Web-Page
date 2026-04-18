import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAppStore } from '../store/useAppStore.js'

function SparkleIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M32 6l5.5 14.5L52 26l-14.5 5.5L32 46l-5.5-14.5L12 26l14.5-5.5L32 6zm16 30l2.2 5.8L56 44l-5.8 2.2L48 52l-2.2-5.8L40 44l5.8-2.2L48 36zM17 37l2.6 6.9L26.5 46l-6.9 2.1L17 55l-2.6-6.9L7.5 46l6.9-2.1L17 37z" />
    </svg>
  )
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 8V7a5 5 0 0 1 10 0v1h2a1 1 0 0 1 1 1l-1 10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 9a1 1 0 0 1 1-1h2zm2 0h6V7a3 3 0 0 0-6 0v1z" />
    </svg>
  )
}

export default function Header({ cartCount, onOpenCart, onOpenAuth, theme, onToggleTheme }) {
  const [search, setSearch] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const navigate = useNavigate()
  const user = useAppStore(state => state.user)
  const logout = useAppStore(state => state.logout)

  function handleSubmit(event) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (search.trim()) params.set('q', search.trim())
    navigate(`/shop?${params.toString()}`)
  }

  async function handleLogout() {
    await logout()
    setShowUserMenu(false)
  }

  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="container header-row">
        <Link className="brand" to="/">
          <span className="brand__icon">
            <SparkleIcon />
          </span>
          <span className="brand__text">
            <span className="brand__wordmark">Sahara Kids</span>
            <small className="brand__tagline">Little style, big smiles</small>
          </span>
        </Link>

        <nav className="main-nav" aria-label="Primary">
          <NavLink to="/">🏠 Home</NavLink>
          <NavLink to="/shop">👕 Shop</NavLink>
          <NavLink to="/checkout">🛒 Checkout</NavLink>
        </nav>

        <form className="header-search" onSubmit={handleSubmit} role="search">
          <label className="sr-only" htmlFor="site-search">Search products</label>
          <input
            id="site-search"
            type="search"
            placeholder="Search rompers, dresses, jackets..."
            value={search}
            onChange={event => setSearch(event.target.value)}
          />
          <button type="submit" className="button button--ghost">Search</button>
        </form>

        <div className="header-actions">
          <button type="button" className="icon-button" onClick={onToggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {user ? (
            <div className="user-menu-wrapper">
              <button
                type="button"
                className="user-avatar-btn"
                onClick={() => setShowUserMenu(menu => !menu)}
                aria-label="Account menu"
              >
                {user.name.slice(0, 2).toUpperCase()}
              </button>
              {showUserMenu && (
                <div className="user-menu">
                  <p className="user-menu__name">{user.name}</p>
                  <p className="user-menu__email">{user.email}</p>
                  <hr />
                  <button type="button" onClick={handleLogout}>Sign out</button>
                </div>
              )}
            </div>
          ) : (
            <button type="button" className="button button--ghost" onClick={onOpenAuth}>
              Sign in
            </button>
          )}

          <button type="button" className="icon-button icon-button--cart" onClick={onOpenCart}>
            <BagIcon />
            <span aria-live="polite">{cartCount}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
