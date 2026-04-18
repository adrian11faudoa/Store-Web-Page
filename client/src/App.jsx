import { Route, Routes } from 'react-router-dom'
import { useMemo, useState } from 'react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import Home from './pages/Home.jsx'
import Shop from './pages/Shop.jsx'
import Product from './pages/Product.jsx'
import Checkout from './pages/Checkout.jsx'
import { useProducts } from './hooks/useProducts.js'
import { useCart } from './hooks/useCart.js'
import { useTheme } from './hooks/useTheme.js'
import { getFeaturedProducts, getProductById, getRelatedProducts } from './assets/js/utils/products.js'

export default function App() {
  const { products, loading, error } = useProducts()
  const cart = useCart(products)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const featuredProducts = useMemo(() => getFeaturedProducts(products, 4), [products])

  const sharedProps = {
    loading,
    error,
    products,
    featuredProducts,
    cart,
    openCart: () => setIsCartOpen(true),
  }

  return (
    <div className="app-shell">
      <Header
        cartCount={cart.itemCount}
        onOpenCart={() => setIsCartOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <main id="main-content">
        <Routes>
          <Route path="/" element={<Home {...sharedProps} />} />
          <Route path="/shop" element={<Shop {...sharedProps} />} />
          <Route
            path="/product/:productId"
            element={
              <Product
                {...sharedProps}
                findProduct={productId => getProductById(products, productId)}
                getRelated={product => getRelatedProducts(products, product, 3)}
              />
            }
          />
          <Route path="/checkout" element={<Checkout cart={cart} />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cart={cart} />
    </div>
  )
}
