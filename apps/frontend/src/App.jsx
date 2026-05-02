import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import { HomePage } from './pages/HomePage.jsx'
import { CatalogPage } from './pages/CatalogPage.jsx'
import { ProductPage } from './pages/ProductPage.jsx'
import { CheckoutPage } from './pages/CheckoutPage.jsx'
import { SignInPage } from './pages/SignInPage.jsx'
import { CartSidebar } from './components/CartSidebar.jsx'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'
import { LocaleProvider } from './context/localeContext.jsx'
import { useAppStore } from './store/useAppStore.js'

const UI_TEXT = {
  tagline: 'Pequeno estilo, grandes sonrisas',
  shop: 'Tienda',
  searchPlaceholder: 'Busca mamelucos, vestidos, chamarras...',
  syncing: 'Sincronizando datos...',
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M32 6l5.5 14.5L52 26l-14.5 5.5L32 46l-5.5-14.5L12 26l14.5-5.5L32 6zm16 30l2.2 5.8L56 44l-5.8 2.2L48 52l-2.2-5.8L40 44l5.8-2.2L48 36zM17 37l2.6 6.9L26.5 46l-6.9 2.1L17 55l-2.6-6.9L7.5 46l6.9-2.1L17 37z" />
    </svg>
  )
}

function ShopIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.2 8.7h11.6l-1 10.2H7.2L6.2 8.7Z" fill="#ffffff" stroke="#111111" strokeWidth="1.9" strokeLinejoin="round" />
      <path d="M9 10.2V7.4a3 3 0 1 1 6 0v2.8" fill="none" stroke="#111111" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10 3a7 7 0 1 1-4.95 11.95A7 7 0 0 1 10 3Zm0 2a5 5 0 1 0 3.54 1.46A4.97 4.97 0 0 0 10 5Zm10.71 14.29a1 1 0 0 1-1.42 1.42l-3.82-3.82a1 1 0 1 1 1.42-1.42l3.82 3.82Z" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="7.5" r="3.9" fill="#ffffff" stroke="#111111" strokeWidth="1.9" />
      <path d="M4 20c0-3.6 3.6-6.5 8-6.5s8 2.9 8 6.5" fill="none" stroke="#111111" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.8 5.3h2.6l1.2 7.4h10.4l1.5-5.2H7.2" fill="#ffffff" stroke="#111111" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.5 15.4h9.3" fill="none" stroke="#111111" strokeWidth="1.85" strokeLinecap="round" />
      <circle cx="9.9" cy="18.4" r="1.55" fill="#ffffff" stroke="#111111" strokeWidth="1.85" />
      <circle cx="16.8" cy="18.4" r="1.55" fill="#ffffff" stroke="#111111" strokeWidth="1.85" />
    </svg>
  )
}

export default function App() {
  const bootstrappedRef = useRef(false)
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const store = useAppStore()
  const bootstrap = store.bootstrap
  const cartOpen = store.ui.cartOpen
  const setCartOpen = store.setCartOpen
  const pendingRequests = store.ui.pendingRequests
  const currentUser = store.auth.user
  const cart = store.cart.cart
  const lastError = store.ui.lastError
  const cartItems = useMemo(() => (Array.isArray(cart?.items) ? cart.items : []), [cart])
  const cartItemQuantity = useMemo(
    () => cartItems.reduce((total, item) => total + Number(item.quantity || 0), 0),
    [cartItems]
  )

  useEffect(() => {
    if (bootstrappedRef.current) {
      return
    }

    bootstrappedRef.current = true
    void bootstrap()
  }, [bootstrap])

  const localeValue = useMemo(() => ({
    language: 'es',
    currency: 'MXN',
    labels: UI_TEXT,
    formatMoney(value) {
      const numeric = Number(value || 0)
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        maximumFractionDigits: 2,
      }).format(numeric)
    },
  }), [])

  function handleSearchSubmit(event) {
    event.preventDefault()
    const params = new URLSearchParams()

    if (search.trim()) {
      params.set('q', search.trim())
    }

    navigate(`/shop${params.toString() ? `?${params.toString()}` : ''}`)
  }

  function handleOpenSignIn() {
    navigate('/signin', { state: { resetAuthAt: Date.now() } })
  }

  return (
    <LocaleProvider value={localeValue}>
      <div className="app-shell">
        <header className="site-header">
          <div className="container header-row">
            <NavLink className="brand" to="/">
              <span className="brand__icon">
                <SparkleIcon />
              </span>
              <span className="brand__text">
                <span className="brand__wordmark">Sahara Kids</span>
                <small className="brand__tagline">{UI_TEXT.tagline}</small>
              </span>
            </NavLink>

            <nav className="main-nav" aria-label="Primary">
              <NavLink to="/shop" className="main-nav__shop">
                <ShopIcon />
                <span>{UI_TEXT.shop}</span>
              </NavLink>
            </nav>

            <form className="header-search" onSubmit={handleSearchSubmit} role="search">
              <button className="header-search__button" type="submit" aria-label="Buscar">
                <SearchIcon />
              </button>
              <input
                type="search"
                placeholder={UI_TEXT.searchPlaceholder}
                value={search}
                onChange={event => setSearch(event.target.value)}
              />
            </form>

            <div className="header-actions">
              <button
                type="button"
                className="header-icon-link"
                onClick={handleOpenSignIn}
                aria-label={currentUser ? currentUser.name : 'Iniciar sesión'}
              >
                <UserIcon />
              </button>
              <button
                className="header-icon-link header-cart-button"
                type="button"
                onClick={() => setCartOpen(!cartOpen)}
                aria-label={`Abrir carrito (${cartItemQuantity})`}
              >
                <CartIcon />
                <span className="header-cart-count">{cartItemQuantity}</span>
              </button>
            </div>
          </div>
        </header>

        {pendingRequests > 0 ? <div className="status-banner">{UI_TEXT.syncing}</div> : null}
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
            </Routes>
          </main>

          <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
        </ErrorBoundary>
      </div>
    </LocaleProvider>
  )
}
