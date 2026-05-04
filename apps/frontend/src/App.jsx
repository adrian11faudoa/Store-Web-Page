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
  cart: 'Carrito',
  account: 'Cuenta',
  searchPlaceholder: 'Busca mamelucos, vestidos, chamarras...',
  syncing: 'Sincronizando datos...',
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
  const searchInputRef = useRef(null)
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')
  const store = useAppStore()
  const bootstrap = store.bootstrap
  const cartOpen = store.ui.cartOpen
  const setCartOpen = store.setCartOpen
  const pendingRequests = store.ui.pendingRequests
  const currentUser = store.auth.user
  const catalogProducts = store.catalog.products
  const catalogCategories = store.catalog.categories
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

  useEffect(() => {
    if (!searchOpen) {
      document.body.classList.remove('search-overlay-open')
      return
    }

    document.body.classList.add('search-overlay-open')

    const timerId = window.setTimeout(() => {
      searchInputRef.current?.focus()
      searchInputRef.current?.select()
    }, 30)

    function handleEscapeKey(event) {
      if (event.key === 'Escape') {
        setSearchOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscapeKey)

    return () => {
      window.clearTimeout(timerId)
      document.removeEventListener('keydown', handleEscapeKey)
      document.body.classList.remove('search-overlay-open')
    }
  }, [searchOpen])

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

  const searchSuggestions = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return []

    const values = []
    for (const product of catalogProducts) {
      values.push(product.name)
      values.push(product.category?.name)
      values.push(product.category?.slug?.replaceAll('-', ' '))
      values.push(product.gender)
      values.push(product.ageGroup)
      values.push(...(product.seasons || []))
      values.push(...(product.ageTags || []))
    }

    for (const category of catalogCategories) {
      values.push(category.name)
      values.push(category.slug?.replaceAll('-', ' '))
    }

    const deduped = []
    const seen = new Set()
    for (const value of values) {
      const cleanValue = String(value || '').trim()
      if (!cleanValue) continue
      const key = cleanValue.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      deduped.push(cleanValue)
    }

    return deduped
      .filter(value => value.toLowerCase().includes(query))
      .sort((left, right) => {
        const leftStarts = left.toLowerCase().startsWith(query)
        const rightStarts = right.toLowerCase().startsWith(query)
        if (leftStarts !== rightStarts) {
          return leftStarts ? -1 : 1
        }
        return left.localeCompare(right)
      })
      .slice(0, 10)
  }, [catalogCategories, catalogProducts, search])

  function runSearch(value = search) {
    const params = new URLSearchParams()
    const cleaned = String(value || '').trim()

    if (cleaned) {
      params.set('q', cleaned)
    }

    navigate(`/shop${params.toString() ? `?${params.toString()}` : ''}`)
    setSearchOpen(false)
  }

  function handleSearchSubmit(event) {
    event.preventDefault()
    runSearch(search)
  }

  function handleOpenSignIn() {
    navigate('/signin', { state: { resetAuthAt: Date.now() } })
  }

  function handleSearchButton() {
    setSearchOpen(previous => {
      const next = !previous
      if (next) {
        setCartOpen(false)
      }
      return next
    })
  }

  function handleCartButton() {
    if (searchOpen) {
      setSearchOpen(false)
      setCartOpen(true)
      return
    }

    setCartOpen(!cartOpen)
  }

  return (
    <LocaleProvider value={localeValue}>
      <div className="app-shell">
        <header className="site-header">
          <div className="header-row">
            <NavLink className="brand" to="/">
              <span className="brand__text">
                <span className="brand__wordmark" aria-label="Sahara Kids">
                  <span className="brand__wordmark-sahara">Sahara</span>{' '}
                  <span className="brand__wordmark-kids">Kids</span>
                </span>
                <small className="brand__tagline">{UI_TEXT.tagline}</small>
              </span>
            </NavLink>

            <nav className="main-nav" aria-label="Primary">
              <NavLink to="/shop" className="main-nav__shop">
                <span className="header-icon-link__art">
                  <ShopIcon />
                </span>
                <span className="header-icon-link__label">{UI_TEXT.shop}</span>
              </NavLink>
            </nav>

            <button
              className="header-search-trigger"
              type="button"
              aria-label="Abrir busqueda"
              onClick={handleSearchButton}
            >
              <SearchIcon />
            </button>

            <div className="header-actions">
              <button
                type="button"
                className="header-icon-link"
                onClick={handleOpenSignIn}
                aria-label={currentUser ? currentUser.name : 'Iniciar sesion'}
              >
                <span className="header-icon-link__art">
                  <UserIcon />
                </span>
                <span className="header-icon-link__label">{UI_TEXT.account}</span>
              </button>
              <button
                className="header-icon-link header-cart-button"
                type="button"
                onClick={handleCartButton}
                aria-label={`Abrir carrito (${cartItemQuantity})`}
              >
                <span className="header-icon-link__art">
                  <CartIcon />
                </span>
                <span className="header-icon-link__label">{UI_TEXT.cart}</span>
                {cartItemQuantity > 0 ? <span className="header-cart-count">{cartItemQuantity}</span> : null}
              </button>
            </div>
          </div>
        </header>

        <section
          className={searchOpen ? 'search-overlay is-open' : 'search-overlay'}
          role="dialog"
          aria-modal="true"
          aria-label="Busqueda de productos"
          aria-hidden={!searchOpen}
        >
          <button
            type="button"
            className="search-overlay__backdrop"
            aria-label="Cerrar busqueda"
            onClick={() => setSearchOpen(false)}
          />
          <div className="search-overlay__panel">
            <div className="search-overlay__header">
              <div>
                <strong>Busqueda</strong>
                <p>
                  {search.trim()
                    ? `${searchSuggestions.length} coincidencia(s)`
                    : 'Explora tu catalogo por nombre, categoria o temporada'}
                </p>
              </div>
              <button
                type="button"
                className="icon-button search-overlay__dismiss"
                onClick={() => setSearchOpen(false)}
              >
                Cerrar
              </button>
            </div>

            <form className="search-overlay__form" onSubmit={handleSearchSubmit} role="search">
              <span className="search-overlay__icon" aria-hidden="true">
                <SearchIcon />
              </span>
              <input
                ref={searchInputRef}
                type="search"
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Buscar"
              />
              <button
                type="button"
                className="search-overlay__clear"
                onClick={() => setSearch('')}
              >
                BORRAR
              </button>
            </form>

            <ul className="search-overlay__results" aria-label="Sugerencias de busqueda">
              {searchSuggestions.map(suggestion => (
                <li key={suggestion}>
                  <button type="button" onClick={() => runSearch(suggestion)}>
                    {suggestion.toUpperCase()}
                  </button>
                </li>
              ))}
              {search.trim() && searchSuggestions.length === 0 ? (
                <li className="search-overlay__empty">Sin coincidencias</li>
              ) : null}
            </ul>
          </div>
        </section>

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
