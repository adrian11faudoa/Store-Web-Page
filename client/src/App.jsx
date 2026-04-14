// client/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Shop from './pages/Shop.jsx'
import Product from './pages/Product.jsx'
import SignIn from './pages/SignIn.jsx'
import { useCart, useAuth } from './store/index.js'

export default function App() {
  const fetchCart     = useCart(s => s.fetch)
  const setGoogleUser = useAuth(s => s.setGoogleUser)

  useEffect(() => {
    // Handle Google OAuth redirect — server sends ?auth=google&data=<encoded-payload>
    const params = new URLSearchParams(window.location.search)
    if (params.get('auth') === 'google') {
      try {
        const raw = params.get('data')
        if (raw) {
          const { token, user } = JSON.parse(decodeURIComponent(raw))
          setGoogleUser(token, user)
        }
      } catch (e) {
        console.error('Google auth parse error', e)
      }
      // Remove auth params from URL so refresh doesn't re-trigger
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [setGoogleUser])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchCart() }, [])

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"            element={<Home />} />
        <Route path="/shop"        element={<Shop />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/signin"      element={<SignIn />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}
