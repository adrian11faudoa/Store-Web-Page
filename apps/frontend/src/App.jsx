import { useEffect } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage.jsx'
import { CatalogPage } from './pages/CatalogPage.jsx'
import { ProductPage } from './pages/ProductPage.jsx'
import { CheckoutPage } from './pages/CheckoutPage.jsx'
import { SignInPage } from './pages/SignInPage.jsx'
import { AuthCallbackPage } from './pages/AuthCallbackPage.jsx'
import { CartSidebar } from './components/CartSidebar.jsx'
import { useAppStore } from './store/useAppStore.js'

export default function App() {
  const bootstrap = useAppStore(state => state.bootstrap)
  const cartOpen = useAppStore(state => state.ui.cartOpen)
  const setCartOpen = useAppStore(state => state.setCartOpen)
  const pendingRequests = useAppStore(state => state.ui.pendingRequests)
  const currentUser = useAppStore(state => state.auth.user)
  const cartItems = useAppStore(state => state.cart.cart?.items || [])
  const lastError = useAppStore(state => state.ui.lastError)

  useEffect(() => {
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
    </div>
  )
}
