import { STORE_CONFIG } from '../config/store'
import { ORDER_STATUS } from './order'

// Calculates the numbers shown on the admin dashboard.
// A pure function: the same products and orders always give the same result.
export function getDashboardStats(products, orders) {
  // "Low stock" means some units left, but not many. Products with zero
  // units are counted separately as "out of stock".
  const lowStockCount = products.filter(
    (product) => product.stock > 0 && product.stock <= STORE_CONFIG.lowStockLimit,
  ).length
  const outOfStockCount = products.filter((product) => product.stock <= 0).length

  // The recorded value skips cancelled orders: money that will never be
  // collected should not inflate the total.
  const recordedValue = orders
    .filter((order) => order.status !== ORDER_STATUS.CANCELLED)
    .reduce((total, order) => total + order.grandTotal, 0)

  const pendingOrderCount = orders.filter(
    (order) => order.status === ORDER_STATUS.PENDING_WHATSAPP,
  ).length

  return {
    totalProducts: products.length,
    totalOrders: orders.length,
    recordedValue,
    lowStockCount,
    outOfStockCount,
    pendingOrderCount,
  }
}
