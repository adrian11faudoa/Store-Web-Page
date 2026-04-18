import { Route, Routes } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import Home from './pages/Home.jsx'
import Shop from './pages/Shop.jsx'
import Product from './pages/Product.jsx'
import Checkout from './pages/Checkout.jsx'
import { useTheme } from './hooks/useTheme.js'
import { getFeaturedProducts, getProductById, getRelatedProducts } from './assets/js/utils/products.js'
import { useAppStore } from './store/useAppStore.js'

export default function App() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const products = useAppStore(state => state.products)
  const productsMeta = useAppStore(state => state.productsMeta)
  const loading = useAppStore(state => state.loadingProducts)
  const error = useAppStore(state => state.error)
  const loadProducts = useAppStore(state => state.loadProducts)
  const loadCart = useAppStore(state => state.loadCart)
  const cartItems = useAppStore(state => state.cartItems)
  const updateCart = useAppStore(state => state.updateCart)
  const addToCart = useAppStore(state => state.addToCart)

  useEffect(() => {
    loadProducts()
    loadCart()
  }, [loadProducts, loadCart])

  const featuredProducts = useMemo(() => getFeaturedProducts(products, 4), [products])
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = cartItems.length > 0 && subtotal < 120 ? 12 : 0
  const tax = subtotal * 0.08

  const cart = {
    items: cartItems,
    itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    totals: { subtotal, shipping, tax, total: subtotal + shipping + tax },
    addItem: (product, size, quantity = 1) => addToCart(product.id, quantity),
    updateQuantity: (productId, size, quantity) => updateCart(productId, quantity),
    removeItem: (productId, size) => updateCart(productId, 0),
    clearCart: async () => {
      await Promise.all(cartItems.map(item => updateCart(item.productId, 0)))
    },
  }

  const sharedProps = {
    loading,
    error,
    products,
    productsMeta,
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
