import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useLocale } from '../locale/LocaleProvider.jsx'
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

export default function Header({ cartCount, onOpenCart, theme, onToggleTheme }) {
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const user = useAppStore(state => state.user)
  const logout = useAppStore(state => state.logout)
  const { currency, language, setCurrency, setLanguage, t } = useLocale()
  const isAuthenticated = Boolean(user)
  const role = user?.role || 'user'

  function handleSubmit(event) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (search.trim()) params.set('q', search.trim())
    navigate(`/shop?${params.toString()}`)
  }

  async function handleLogout() {
    await logout()
    navigate('/', { replace: true })
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
          <NavLink to="/">{t('home')}</NavLink>
          <NavLink to="/shop">{t('shop')}</NavLink>
          {role === 'admin' && <NavLink to="/admin/products">{t('admin')}</NavLink>}
          <NavLink to="/checkout">{t('checkout')}</NavLink>
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
          <button type="submit" className="button button--ghost">{t('search')}</button>
        </form>

        <div className="header-actions">
          <label className="locale-select">
            <span>{t('language')}</span>
            <select value={language} onChange={event => setLanguage(event.target.value)}>
              <option value="en">{t('english')}</option>
              <option value="es">{t('spanish')}</option>
            </select>
          </label>
          <label className="locale-select">
            <span>{t('currency')}</span>
            <select value={currency} onChange={event => setCurrency(event.target.value)}>
              <option value="USD">{t('usd')}</option>
              <option value="MXN">{t('mxn')}</option>
            </select>
          </label>
          <button type="button" className="icon-button" onClick={onToggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>

          {isAuthenticated ? (
            <div className="user-menu">
              <p className="user-menu__name">{user?.name || 'Signed in'}</p>
              <p className="user-menu__email">{role === 'admin' ? 'Administrator' : 'Store user'}</p>
              <hr />
              <button type="button" onClick={handleLogout}>{t('signout')}</button>
            </div>
          ) : (
            <button type="button" className="button button--ghost" onClick={() => navigate('/login')}>{t('signin')}</button>
          )}

          <button type="button" className="icon-button icon-button--cart" onClick={onOpenCart}>
            <BagIcon />
            <span aria-live="polite">{t('cart')} ({cartCount})</span>
          </button>
        </div>
      </div>
    </header>
  )
}
