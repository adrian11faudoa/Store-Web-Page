import { useEffect, useMemo, useState } from 'react'
import {
  calculateCartTotals,
  getCartItemKey,
  readCart,
  writeCart,
} from '../assets/js/utils/cart.js'

function normalizeCartItem(savedItem, products) {
  const product = products.find(item => item.id === savedItem.productId)
  if (!product) return null

  return {
    productId: product.id,
    name: product.name,
    price: product.price,
    size: savedItem.size || '',
    quantity: savedItem.quantity,
    palette: product.palette,
  }
}

export function useCart(products) {
  const [items, setItems] = useState([])

  useEffect(() => {
    const restoredItems = readCart()
      .map(item => normalizeCartItem(item, products))
      .filter(Boolean)

    if (products.length > 0) {
      setItems(restoredItems)
    }
  }, [products])

  useEffect(() => {
    writeCart(items)
  }, [items])

  function addItem(product, size, quantity = 1) {
    const itemSize = size || ''

    setItems(currentItems => {
      const key = getCartItemKey(product.id, itemSize)
      const existingItem = currentItems.find(item => getCartItemKey(item.productId, item.size) === key)

      if (existingItem) {
        return currentItems.map(item => (
          getCartItemKey(item.productId, item.size) === key
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ))
      }

      return [
        ...currentItems,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          size: itemSize,
          quantity,
          palette: product.palette,
        },
      ]
    })
  }

  function updateQuantity(productId, size, quantity) {
    if (quantity <= 0) {
      removeItem(productId, size)
      return
    }

    setItems(currentItems => currentItems.map(item => (
      getCartItemKey(item.productId, item.size) === getCartItemKey(productId, size)
        ? { ...item, quantity }
        : item
    )))
  }

  function removeItem(productId, size) {
    setItems(currentItems => currentItems.filter(item => (
      getCartItemKey(item.productId, item.size) !== getCartItemKey(productId, size)
    )))
  }

  function clearCart() {
    setItems([])
  }

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  )

  const totals = useMemo(() => calculateCartTotals(items), [items])

  return {
    items,
    itemCount,
    totals,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  }
}
