import { createContext, useContext, useEffect, useState } from 'react'
import { readStorage, writeStorage, fullKey, STORAGE_KEYS } from '../utils/storage'
import {
  ORDER_STATUS_LIST,
  buildOrder,
  generateOrderId,
} from '../utils/order'

const OrderContext = createContext(null)

// Does this saved value look like a real order? localStorage can be edited
// or corrupted, so anything that doesn't pass is thrown away on load.
function isValidOrder(order) {
  return Boolean(
    order &&
      typeof order.id === 'string' &&
      typeof order.userId === 'string' &&
      typeof order.createdAt === 'string' &&
      typeof order.status === 'string' &&
      order.customer &&
      typeof order.customer === 'object' &&
      Array.isArray(order.items) &&
      Number.isFinite(order.subtotal) &&
      Number.isFinite(order.deliveryFee) &&
      Number.isFinite(order.grandTotal),
  )
}

function loadOrders() {
  const saved = readStorage(STORAGE_KEYS.orders, [])
  return Array.isArray(saved) ? saved.filter(isValidOrder) : []
}

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState(loadOrders)

  // Keep this tab in sync when ANOTHER tab creates or updates an order.
  useEffect(() => {
    const ordersKey = fullKey(STORAGE_KEYS.orders)

    function handleStorageChange(event) {
      if (event.key === null || event.key === ordersKey) {
        setOrders(loadOrders())
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Creates and SAVES an order.
  //   user     - the logged-in user { id, email }
  //   customer - { name, phone, address, notes } (already validated)
  //   lines    - cart lines from useCart()
  // Returns { success: true, order } or { success: false, message }.
  //
  // The order is written to localStorage right here, during the click,
  // instead of waiting for an effect. That guarantees it is stored BEFORE
  // checkout tries to open WhatsApp.
  function createOrder({ user, customer, lines }) {
    if (!user) {
      return { success: false, message: 'You must be logged in to place an order.' }
    }

    // Read the freshest saved orders (another tab may have just added one).
    const saved = loadOrders()
    const orderId = generateOrderId(saved.map((order) => order.id))

    let order
    try {
      order = buildOrder({ orderId, user, customer, lines })
    } catch (error) {
      return { success: false, message: error.message }
    }

    const nextOrders = [...saved, order]
    if (!writeStorage(STORAGE_KEYS.orders, nextOrders)) {
      return {
        success: false,
        message: 'Could not save your order. Your browser storage may be full or blocked.',
      }
    }

    setOrders(nextOrders)
    return { success: true, order }
  }

  // Changes an order's status (used by the admin dashboard in Phase 9).
  function updateOrderStatus(orderId, status) {
    if (!ORDER_STATUS_LIST.includes(status)) {
      return { success: false, message: 'Unknown order status.' }
    }

    const saved = loadOrders()
    if (!saved.some((order) => order.id === orderId)) {
      return { success: false, message: 'Order not found.' }
    }

    const nextOrders = saved.map((order) =>
      order.id === orderId ? { ...order, status } : order,
    )
    if (!writeStorage(STORAGE_KEYS.orders, nextOrders)) {
      return { success: false, message: 'Could not save the change.' }
    }

    setOrders(nextOrders)
    return { success: true }
  }

  // All orders belonging to one customer, newest first.
  function getOrdersForUser(userId) {
    return orders
      .filter((order) => order.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  // One order, but ONLY if it belongs to this customer (otherwise null).
  // Customer pages use this so nobody can open another customer's order
  // just by typing its ID in the address bar.
  function getOrderForUser(orderId, userId) {
    return orders.find((order) => order.id === orderId && order.userId === userId) ?? null
  }

  const value = {
    orders, // every order; for the admin dashboard
    createOrder,
    updateOrderStatus,
    getOrdersForUser,
    getOrderForUser,
  }

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useOrders() {
  const context = useContext(OrderContext)
  if (context === null) {
    throw new Error('useOrders must be used inside <OrderProvider>')
  }
  return context
}