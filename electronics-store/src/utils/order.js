// ============================================================
// ORDER LOGIC (pure functions, no React)
//
// An order is a SNAPSHOT: it copies product names and prices at the
// moment of purchase. Later price or stock changes (or a deleted product)
// never alter an order that has already been placed.
// ============================================================

import { STORE_CONFIG } from '../config/store'
import { getCartSubtotal } from './cart'

export const PAYMENT_METHOD = 'Cash on Delivery'

// The status names live here so no component ever types them by hand.
export const ORDER_STATUS = {
  PENDING_WHATSAPP: 'Pending WhatsApp Confirmation',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

// In the order the admin dropdown will show them.
export const ORDER_STATUS_LIST = Object.values(ORDER_STATUS)

// Letters and digits without look-alikes (no 0/O, 1/I/L).
const ID_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const ID_SUFFIX_LENGTH = 5

function randomSuffix() {
  const bytes = new Uint8Array(ID_SUFFIX_LENGTH)

  if (window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(bytes)
  } else {
    bytes.forEach((_, index) => {
      bytes[index] = Math.floor(Math.random() * 256)
    })
  }

  return Array.from(bytes, (byte) => ID_ALPHABET[byte % ID_ALPHABET.length]).join('')
}

// Creates an ID like "ORD-20261027-K7M2Q".
// existingIds is a list of IDs already in use, so we can guarantee uniqueness.
export function generateOrderId(existingIds = [], now = new Date()) {
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const used = new Set(existingIds)

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = `ORD-${year}${month}${day}-${randomSuffix()}`
    if (!used.has(candidate)) return candidate
  }

  // Practically unreachable, but guarantees we always return something unique.
  return `ORD-${year}${month}${day}-${Date.now().toString(36).toUpperCase()}`
}

// Checks the RAW cart (not the cleaned-up lines) against current product data.
// Returns a list of human-readable problems. An empty list means "OK to order".
//
// We use the raw cart on purpose: getCartLines() quietly lowers quantities
// to the stock, which is right for display, but at checkout we want to
// STOP and tell the customer instead of silently changing their order.
export function validateCartForCheckout(items, products) {
  if (!items || items.length === 0) {
    return ['Your cart is empty.']
  }

  const problems = []

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId)

    if (!product) {
      problems.push('An item in your cart is no longer available.')
      continue
    }
    if (!Number.isFinite(product.price) || product.price <= 0) {
      problems.push(`${product.name} has an invalid price and cannot be ordered.`)
      continue
    }
    if (product.stock <= 0) {
      problems.push(`${product.name} is out of stock.`)
      continue
    }
    if (item.quantity > product.stock) {
      problems.push(
        `Only ${product.stock} of ${product.name} available (you have ${item.quantity} in your cart).`,
      )
    }
  }

  return problems
}

// Subtotal + delivery fee = grand total.
// The delivery fee comes from STORE_CONFIG, the one place it is defined.
export function calculateOrderTotals(lines, deliveryFee = STORE_CONFIG.deliveryFee) {
  const subtotal = getCartSubtotal(lines)
  const fee = lines.length > 0 ? deliveryFee : 0

  return {
    subtotal,
    deliveryFee: fee,
    grandTotal: subtotal + fee,
  }
}

// Builds the complete order object that gets saved and later turned into
// the WhatsApp message.
//
//   lines    - from getCartLines(): [{ product, quantity, lineTotal }]
//   customer - { name, phone, address, notes } (already validated)
//   user     - the logged-in user { id, email } the order belongs to
//   orderId  - from generateOrderId()
export function buildOrder({ orderId, user, customer, lines, now = new Date() }) {
  if (!lines || lines.length === 0) {
    throw new Error('Cannot create an order from an empty cart.')
  }

  const totals = calculateOrderTotals(lines)

  return {
    id: orderId,
    userId: user.id,
    userEmail: user.email,
    createdAt: now.toISOString(),

    customer: {
      name: customer.name.trim(),
      phone: customer.phone,
      address: customer.address.trim(),
      notes: (customer.notes ?? '').trim(),
    },

    // Snapshot of each product as it was when the order was placed.
    items: lines.map(({ product, quantity, lineTotal }) => ({
      productId: product.id,
      name: product.name,
      unitPrice: product.price,
      quantity,
      lineTotal,
    })),

    subtotal: totals.subtotal,
    deliveryFee: totals.deliveryFee,
    grandTotal: totals.grandTotal,

    paymentMethod: PAYMENT_METHOD,

    // Never "Confirmed" at creation. Only the seller can confirm it, and
    // this app cannot verify that the WhatsApp message was ever sent.
    status: ORDER_STATUS.PENDING_WHATSAPP,
  }
}