// ============================================================
// WHATSAPP HELPERS
//
// Turns a saved order into a pre-filled WhatsApp message and a
// click-to-chat link:  https://wa.me/SELLER_NUMBER?text=ENCODED_MESSAGE
//
// Every value in the message comes from the order object (a snapshot taken
// at checkout), so nothing is hardcoded here. This file never opens
// WhatsApp, and it cannot know whether the customer actually sent the message.
// ============================================================

import { STORE_CONFIG } from '../config/store'
import { formatCurrency } from './currency'
import { normalizePhone } from './validation'

// wa.me needs digits only: country code 977 + 10-digit mobile number,
// with no "+", spaces, brackets or hyphens. Example: 9779812345678
const SELLER_NUMBER_PATTERN = /^977\d{10}$/

export function isValidSellerNumber(number) {
  const value = String(number ?? '')
  return SELLER_NUMBER_PATTERN.test(value) && normalizePhone(value) !== null
}

// "27 Oct 2026, 14:30". Falls back to the raw text if the date is invalid.
export function formatOrderDate(isoString) {
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return String(isoString ?? '')

  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

// Builds the readable message text (WhatsApp shows *text* as bold).
export function buildWhatsAppMessage(order, storeConfig = STORE_CONFIG) {
  const productBlocks = order.items.map((item, index) =>
    [
      `${index + 1}. ${item.name}`,
      `   Quantity: ${item.quantity}`,
      `   Unit Price: ${formatCurrency(item.unitPrice)}`,
      `   Line Total: ${formatCurrency(item.lineTotal)}`,
    ].join('\n'),
  )

  const lines = [
    `Hello! I would like to place an order from ${storeConfig.name}.`,
    '',
    '*ORDER DETAILS*',
    '',
    `Order ID: ${order.id}`,
    `Order Date: ${formatOrderDate(order.createdAt)}`,
    '',
    '*PRODUCTS*',
    '',
    productBlocks.join('\n\n'),
    '',
    '*ORDER SUMMARY*',
    '',
    `Subtotal: ${formatCurrency(order.subtotal)}`,
    `Delivery Fee: ${formatCurrency(order.deliveryFee)}`,
    `Grand Total: ${formatCurrency(order.grandTotal)}`,
    '',
    '*CUSTOMER DETAILS*',
    '',
    `Name: ${order.customer.name}`,
    `Phone: ${order.customer.phone}`,
    `Delivery Address: ${order.customer.address}`,
    `Payment Method: ${order.paymentMethod}`,
  ]

  // The notes line only appears when the customer wrote something.
  if (order.customer.notes) {
    lines.push('', `Additional Notes: ${order.customer.notes}`)
  }

  lines.push('', 'Please confirm product availability and delivery details. Thank you!')

  return lines.join('\n')
}

// Builds the click-to-chat link.
// Returns { success: true, url, message } or { success: false, message }.
// Callers must check `success` before trying to open anything.
export function buildWhatsAppUrl(order, storeConfig = STORE_CONFIG) {
  const sellerNumber = storeConfig.sellerWhatsAppNumber

  if (!isValidSellerNumber(sellerNumber)) {
    return {
      success: false,
      message:
        "The seller's WhatsApp number is not set up correctly, so WhatsApp cannot be opened. Your order has been saved.",
    }
  }

  if (!order || !Array.isArray(order.items) || order.items.length === 0) {
    return { success: false, message: 'There is no order to send.' }
  }

  const message = buildWhatsAppMessage(order, storeConfig)

  // encodeURIComponent makes the WHOLE message safe inside a URL:
  // line breaks become %0A, spaces %20, "&" %26, "#" %23, and so on.
  const url = `https://wa.me/${sellerNumber}?text=${encodeURIComponent(message)}`

  return { success: true, url, message }
}

// Opens the WhatsApp link in a new tab/window.
// Returns true if the browser opened it, false if it was blocked.
//
// IMPORTANT: this must be called directly from a click handler (a user
// gesture). Browsers block window.open() when it runs later, e.g. after
// a timer or after "await".
export function openWhatsAppUrl(url) {
  const newWindow = window.open(url, '_blank')
  if (!newWindow) return false

  // Stop the new tab from being able to control this one. We cannot pass
  // "noopener" in the window.open() options, because then the browser always
  // returns null and we could not tell whether a popup blocker stopped it.
  try {
    newWindow.opener = null
  } catch {
    // Some browsers do not allow this. WhatsApp is a trusted site, so we continue.
  }
  return true
}