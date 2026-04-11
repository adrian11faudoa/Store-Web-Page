// client/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Shop from './pages/Shop.jsx'
import Product from './pages/Product.jsx'
import { useCart } from './store/index.js'

export default function App() {
  const fetchCart = useCart(s => s.fetch)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchCart() }, [])

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/shop"      element={<Shop />} />
        <Route path="/product/:id" element={<Product />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}
