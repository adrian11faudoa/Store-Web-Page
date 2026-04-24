import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import { HomePage } from './pages/HomePage.jsx'
import { CatalogPage } from './pages/CatalogPage.jsx'
import { ProductPage } from './pages/ProductPage.jsx'
import { CheckoutPage } from './pages/CheckoutPage.jsx'
import { SignInPage } from './pages/SignInPage.jsx'
import { AuthCallbackPage } from './pages/AuthCallbackPage.jsx'
import { CartSidebar } from './components/CartSidebar.jsx'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'
import { useAppStore } from './store/useAppStore.js'

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

export default function App() {
  const bootstrappedRef = useRef(false)
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [language, setLanguage] = useState('English')
  const [currency, setCurrency] = useState('US Dollars')
  const [theme, setTheme] = useState('light')
  const store = useAppStore()
  const bootstrap = store.bootstrap
  const cartOpen = store.ui.cartOpen
  const setCartOpen = store.setCartOpen
  const pendingRequests = store.ui.pendingRequests
  const currentUser = store.auth.user
  const cart = store.cart.cart
  const lastError = store.ui.lastError
  const cartItems = useMemo(() => (Array.isArray(cart?.items) ? cart.items : []), [cart])

  useEffect(() => {
    if (bootstrappedRef.current) {
      return
    }

    bootstrappedRef.current = true
    void bootstrap()
  }, [bootstrap])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  function handleSearchSubmit(event) {
    event.preventDefault()
    const params = new URLSearchParams()

    if (search.trim()) {
      params.set('q', search.trim())
    }

    navigate(`/shop${params.toString() ? `?${params.toString()}` : ''}`)
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container header-row">
          <NavLink className="brand" to="/">
            <span className="brand__icon">
              <SparkleIcon />
            </span>
            <span className="brand__text">
              <span className="brand__wordmark">Sahara Kids</span>
              <small className="brand__tagline">Little style, big smiles</small>
            </span>
          </NavLink>

          <nav className="main-nav" aria-label="Primary">
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/shop">Shop</NavLink>
            <NavLink to="/checkout">Checkout</NavLink>
          </nav>

          <form className="header-search" onSubmit={handleSearchSubmit} role="search">
            <input
              type="search"
              placeholder="Search rompers, dresses, jackets..."
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
            <button className="button button--ghost" type="submit">Search</button>
          </form>

          <div className="header-actions">
            <label className="locale-select">
              <span>Language</span>
              <select value={language} onChange={event => setLanguage(event.target.value)}>
                <option>English</option>
                <option>Spanish</option>
              </select>
            </label>
            <label className="locale-select">
              <span>Currency</span>
              <select value={currency} onChange={event => setCurrency(event.target.value)}>
                <option>US Dollars</option>
              </select>
            </label>
            <button
              className="icon-button"
              type="button"
              onClick={() => setTheme(current => current === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
            <NavLink className="button button--ghost" to="/signin">
              {currentUser ? currentUser.name : 'Sign in'}
            </NavLink>
            <button className="icon-button icon-button--cart" type="button" onClick={() => setCartOpen(!cartOpen)}>
              <BagIcon />
              <span>Cart ({cartItems.length})</span>
            </button>
          </div>
        </div>
      </header>

      {pendingRequests > 0 ? <div className="status-banner">Syncing live data...</div> : null}
      {lastError ? <div className="error-banner">{lastError}</div> : null}

      <ErrorBoundary>
        <main id="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<CatalogPage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/shop/:slug" element={<ProductPage />} />
            <Route path="/catalog/:slug" element={<ProductPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
          </Routes>
        </main>

        <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      </ErrorBoundary>
    </div>
  )
}
