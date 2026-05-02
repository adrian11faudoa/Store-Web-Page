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
      <path d="M7 8V7a5 5 0 0 1 10 0v1h2a1 1 0 0 1 1 1l-1 10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 9a1 1 0 0 1 1-1h2zm2 0h6V7a3 3 0 0 0-6 0v1z" />
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
      <path d="M12 13a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0 2c4.42 0 8 2.58 8 5.75a1 1 0 1 1-2 0C18 18.84 15.31 17 12 17s-6 1.84-6 3.75a1 1 0 1 1-2 0C4 17.58 7.58 15 12 15Z" />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2 3a1 1 0 0 1 1-1h2.1a1 1 0 0 1 .96.72l.44 1.53h14a1 1 0 0 1 .97 1.25l-1.7 6.5a2 2 0 0 1-1.94 1.5H8.37l.34 1.2a.4.4 0 0 0 .38.3h10.41a1 1 0 1 1 0 2H9.09a2.4 2.4 0 0 1-2.31-1.74L4.34 4H3a1 1 0 0 1-1-1Zm6.5 18a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm10 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" />
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
              <NavLink className="header-icon-link" to="/signin" aria-label={currentUser ? currentUser.name : 'Iniciar sesion'}>
                <UserIcon />
              </NavLink>
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
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
            </Routes>
          </main>

          <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
        </ErrorBoundary>
      </div>
    </LocaleProvider>
  )
}
