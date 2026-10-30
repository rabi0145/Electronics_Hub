// ============================================================
// PRODUCT FILTERING AND SORTING
// One function applies search + category + price range + sorting,
// so all of them always work together.
// ============================================================

// Options for the "Sort by" dropdown. The `value` is what we store in the
// URL/state, the `label` is what the customer sees.
export const SORT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
]

// Turns the text from a price input into a number, or null if it is empty
// or invalid. null means "no limit".
function parsePrice(value) {
  if (value === '' || value === null || value === undefined) return null
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : null
}

// filters = { search, category, minPrice, maxPrice, sort }
// Every field is optional. Returns a NEW array; the original is not changed.
export function filterAndSortProducts(products, filters = {}) {
  const {
    search = '',
    category = 'all',
    minPrice = '',
    maxPrice = '',
    sort = 'default',
  } = filters

  const searchText = search.trim().toLowerCase()
  const min = parsePrice(minPrice)
  const max = parsePrice(maxPrice)

  const result = products.filter((product) => {
    // Search by product name (case-insensitive, partial match)
    if (searchText && !product.name.toLowerCase().includes(searchText)) {
      return false
    }

    // Category ('all' or empty means every category)
    if (category && category !== 'all' && product.category !== category) {
      return false
    }

    // Price range
    if (min !== null && product.price < min) return false
    if (max !== null && product.price > max) return false

    return true
  })

  // Sorting. filter() already gave us a new array, so sorting it here
  // does not change the original PRODUCTS list.
  switch (sort) {
    case 'price-asc':
      result.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      result.sort((a, b) => b.price - a.price)
      break
    case 'name-asc':
      result.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'name-desc':
      result.sort((a, b) => b.name.localeCompare(a.name))
      break
    default:
      break // keep the original order
  }

  return result
}