// ============================================================
// CART LOGIC (pure functions, no React)
//
// A cart is an array of lightweight items:
//   [{ productId: 'p01', quantity: 2 }, ...]
//
// We store only the product ID and quantity, never the price or name.
// Prices and stock are looked up from the product data each time, so
// the cart can never show an outdated price.
// ============================================================

// Keeps a quantity between 0 and the available stock.
// Bad input (letters, NaN, decimals) becomes a whole number or 0.
export function clampQuantity(quantity, stock) {
  const whole = Math.floor(Number(quantity))
  if (!Number.isFinite(whole)) return 0
  return Math.max(0, Math.min(whole, stock))
}

// Adds a product to the cart.
// - If the product is already in the cart, its quantity is increased
//   (no duplicate entries).
// - The final quantity never exceeds the product's stock.
// Returns { items, wasLimited }. wasLimited is true when we could not add
// everything that was requested because of the stock limit.
export function addToCartItems(items, product, quantity = 1) {
  const amount = Math.floor(Number(quantity))
  if (!Number.isFinite(amount) || amount < 1) {
    return { items, wasLimited: false }
  }

  const existing = items.find((item) => item.productId === product.id)
  const requested = (existing ? existing.quantity : 0) + amount
  const finalQuantity = clampQuantity(requested, product.stock)

  // Out of stock (or already at the limit with nothing to change).
  if (finalQuantity <= 0) {
    return { items, wasLimited: true }
  }

  const wasLimited = finalQuantity < requested

  const nextItems = existing
    ? items.map((item) =>
        item.productId === product.id
          ? { ...item, quantity: finalQuantity }
          : item,
      )
    : [...items, { productId: product.id, quantity: finalQuantity }]

  return { items: nextItems, wasLimited }
}

// Sets an item's quantity directly (used by the - / + buttons in the cart).
// The result is always between 1 and the product's stock.
// To remove an item, use removeItem instead.
export function setItemQuantity(items, product, quantity) {
  const finalQuantity = Math.max(1, clampQuantity(quantity, product.stock))

  return items.map((item) =>
    item.productId === product.id ? { ...item, quantity: finalQuantity } : item,
  )
}

// Removes one product from the cart.
export function removeItem(items, productId) {
  return items.filter((item) => item.productId !== productId)
}

// Combines cart items with product data into "lines" ready to display:
//   [{ product, quantity, lineTotal }]
// - Items whose product no longer exists (e.g. deleted by the admin) are dropped.
// - Out-of-stock products are dropped.
// - A quantity higher than the current stock is reduced to the stock.
export function getCartLines(items, products) {
  const lines = []

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId)
    if (!product) continue

    const quantity = clampQuantity(item.quantity, product.stock)
    if (quantity < 1) continue

    lines.push({ product, quantity, lineTotal: product.price * quantity })
  }

  return lines
}

// Sum of all line totals (before the delivery fee).
export function getCartSubtotal(lines) {
  return lines.reduce((total, line) => total + line.lineTotal, 0)
}

// Total number of units in the cart (used for the navbar badge).
export function getCartCount(lines) {
  return lines.reduce((count, line) => count + line.quantity, 0)
}