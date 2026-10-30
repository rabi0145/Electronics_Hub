import { STORE_CONFIG } from '../config/store'

// Nepal groups digits in the South Asian style: 1,24,999 (not 124,999).
// The "en-IN" locale uses the same lakh/crore grouping, so we borrow it.
const numberFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 2,
})

// Formats only the number part: 124999 -> "1,24,999"
export function formatNumber(amount) {
  const value = Number(amount)
  return numberFormatter.format(Number.isFinite(value) ? value : 0)
}

// Formats a price with the currency code: 124999 -> "NPR 1,24,999"
// This is the function components should normally use.
export function formatCurrency(amount) {
  return `${STORE_CONFIG.currencyCode} ${formatNumber(amount)}`
}