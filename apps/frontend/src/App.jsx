import { useEffect, useMemo, useRef } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage.jsx'
import { CatalogPage } from './pages/CatalogPage.jsx'
import { ProductPage } from './pages/ProductPage.jsx'
import { CheckoutPage } from './pages/CheckoutPage.jsx'
import { SignInPage } from './pages/SignInPage.jsx'
import { AuthCallbackPage } from './pages/AuthCallbackPage.jsx'
import { CartSidebar } from './components/CartSidebar.jsx'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'
import { useAppStore } from './store/useAppStore.js'

export default function App() {
  const bootstrappedRef = useRef(false)
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
    bootstrap()
  }, [bootstrap])

  return (
    <div className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Production-grade storefront</p>
          <NavLink className="brand" to="/">Store Platform</NavLink>
        </div>
        <nav className="nav">
          <NavLink to="/catalog">Catalog</NavLink>
          <NavLink to="/checkout">Checkout</NavLink>
          <NavLink to="/signin">{currentUser ? currentUser.name : 'Sign in'}</NavLink>
          <button className="button ghost" type="button" onClick={() => setCartOpen(!cartOpen)}>
            Cart ({cartItems.length})
          </button>
        </nav>
      </header>

      {pendingRequests > 0 ? <div className="status-banner">Syncing live data...</div> : null}
      {lastError ? <div className="error-banner">{lastError}</div> : null}

      <ErrorBoundary>
        <main className="page-shell">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalog" element={<CatalogPage />} />
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
