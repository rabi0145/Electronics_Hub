import { createContext, useContext, useEffect, useState } from 'react'
import { useProducts } from './ProductContext'
import {
  readStorage,
  writeStorage,
  fullKey,
  STORAGE_KEYS,
} from '../utils/storage'
import {
  addToCartItems,
  setItemQuantity,
  removeItem,
  getCartLines,
  getCartSubtotal,
  getCartCount,
} from '../utils/cart'

const CartContext = createContext(null)

// Reads the saved cart and throws away anything that does not look like
// a valid cart item. localStorage can be edited or corrupted by the user,
// so we never trust it blindly.
function loadSavedCart() {
  const saved = readStorage(STORAGE_KEYS.cart, [])
  if (!Array.isArray(saved)) return []

  return saved.filter(
    (item) =>
      item &&
      typeof item.productId === 'string' &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0,
  )
}

export function CartProvider({ children }) {
      const { products } = useProducts()
  // Passing a function (not its result) means it only runs once,
  // on the very first render, instead of on every render.
  const [items, setItems] = useState(loadSavedCart)

  // Save the cart every time it changes.
  useEffect(() => {
    writeStorage(STORAGE_KEYS.cart, items)
  }, [items])

  // Keep this tab in sync when ANOTHER tab changes the cart.
  // The browser fires the "storage" event only in the other tabs,
  // never in the tab that made the change, so this cannot loop forever.
  useEffect(() => {
    const cartKey = fullKey(STORAGE_KEYS.cart)

    function handleStorageChange(event) {
      // event.key is null when localStorage.clear() was called.
      if (event.key !== null && event.key !== cartKey) return
      setItems(loadSavedCart())
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Derived data: calculated from `items`, never stored separately.
  // TEMPORARY: reads the static PRODUCTS list. In Phase 9, when the admin
  // can edit products, this will read from ProductContext instead.
  const lines = getCartLines(items, products)
  const subtotal = getCartSubtotal(lines)
  const itemCount = getCartCount(lines)

  // Adds a product. Returns { items, wasLimited } so the caller can show
  // a message such as "Only 3 available" when the stock limit was hit.
  function addToCart(product, quantity = 1) {
    const result = addToCartItems(items, product, quantity)
    setItems(result.items)
    return result
  }

  function updateQuantity(productId, quantity) {
    const product = products.find((item) => item.id === productId)
    if (!product) return
    setItems((current) => setItemQuantity(current, product, quantity))
  }

  function removeFromCart(productId) {
    setItems((current) => removeItem(current, productId))
  }

  function clearCart() {
    setItems([])
  }

  // How many of this product are already in the cart (0 if none).
  function getQuantityInCart(productId) {
    const line = lines.find((item) => item.product.id === productId)
    return line ? line.quantity : 0
  }

  const value = {
    items,
    lines,
    subtotal,
    itemCount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getQuantityInCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// A small custom hook so components write `useCart()` instead of
// `useContext(CartContext)`. It also gives a clear error if we forget
// to wrap the app in <CartProvider>.
// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const context = useContext(CartContext)
  if (context === null) {
    throw new Error('useCart must be used inside <CartProvider>')
  }
  return context
}