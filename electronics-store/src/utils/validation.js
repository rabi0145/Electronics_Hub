import { CATEGORIES } from '../data/categories'

// ============================================================
// FORM VALIDATION
// Each validate* function returns an error message (a string),
// or an empty string '' when the value is valid.
// The form-level functions return an object with one message per
// invalid field, e.g. { email: 'Email is required.' }.
// An empty object {} means the whole form is valid.
// ============================================================

const NAME_MIN = 2
const NAME_MAX = 60
const PASSWORD_MIN = 8
const PASSWORD_MAX = 128

// Simple, practical email check: something@something.tld
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Nepali mobile numbers: 10 digits starting with 96, 97 or 98
// (Ncell, NTC, Smart Cell). Landlines are not accepted in this demo.
const NEPAL_MOBILE_PATTERN = /^9[678]\d{8}$/

// ---------- Normalizing helpers ----------

// Emails are not case-sensitive in practice, so we store them in lowercase.
export function normalizeEmail(email) {
  return String(email ?? '').trim().toLowerCase()
}

// Returns the 10-digit mobile number, or null if it is not valid.
// Accepts spaces, hyphens, brackets and a +977 / 977 prefix:
//   "9812345678", "981-234-5678", "+977 9812345678"
export function normalizePhone(phone) {
  const cleaned = String(phone ?? '').replace(/[\s\-()]/g, '')

  let digits = cleaned
  if (cleaned.startsWith('+977')) {
    digits = cleaned.slice(4)
  } else if (cleaned.startsWith('977') && cleaned.length === 13) {
    digits = cleaned.slice(3)
  }

  return NEPAL_MOBILE_PATTERN.test(digits) ? digits : null
}

// ---------- Single-field validators ----------

export function validateName(name) {
  const value = String(name ?? '').trim()
  if (!value) return 'Full name is required.'
  if (value.length < NAME_MIN) return `Name must be at least ${NAME_MIN} characters.`
  if (value.length > NAME_MAX) return `Name must be ${NAME_MAX} characters or fewer.`
  return ''
}

export function validateEmail(email) {
  const value = normalizeEmail(email)
  if (!value) return 'Email is required.'
  if (!EMAIL_PATTERN.test(value)) return 'Enter a valid email address.'
  return ''
}

export function validatePassword(password) {
  const value = String(password ?? '')
  if (!value) return 'Password is required.'
  if (value.length < PASSWORD_MIN) {
    return `Password must be at least ${PASSWORD_MIN} characters.`
  }
  if (value.length > PASSWORD_MAX) {
    return `Password must be ${PASSWORD_MAX} characters or fewer.`
  }
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    return 'Password must include at least one letter and one number.'
  }
  return ''
}

export function validateConfirmPassword(password, confirmPassword) {
  const value = String(confirmPassword ?? '')
  if (!value) return 'Please confirm your password.'
  if (value !== String(password ?? '')) return 'Passwords do not match.'
  return ''
}

export function validatePhone(phone) {
  if (!String(phone ?? '').trim()) return 'Phone number is required.'
  if (normalizePhone(phone) === null) {
    return 'Enter a valid Nepali mobile number, e.g. 9812345678.'
  }
  return ''
}

// ---------- Whole-form validators ----------

// Keeps only the fields that have an error message.
function collectErrors(results) {
  const errors = {}
  for (const [field, message] of Object.entries(results)) {
    if (message) errors[field] = message
  }
  return errors
}

export function validateRegistration({ name, email, password, confirmPassword }) {
  return collectErrors({
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
    confirmPassword: validateConfirmPassword(password, confirmPassword),
  })
}

// Login only checks that the fields are filled in. We do not apply the
// password-strength rules here, and we never reveal whether the email
// or the password was the wrong one.
export function validateLogin({ email, password }) {
  return collectErrors({
    email: validateEmail(email),
    password: String(password ?? '') ? '' : 'Password is required.',
  })
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0
}


// ---------- Checkout validators ----------

const ADDRESS_MIN = 10
const ADDRESS_MAX = 200
const NOTES_MAX = 300

export function validateAddress(address) {
  const value = String(address ?? '').trim()
  if (!value) return 'Delivery address is required.'
  if (value.length < ADDRESS_MIN) {
    return 'Please enter a more complete address (area, street or landmark).'
  }
  if (value.length > ADDRESS_MAX) {
    return `Address must be ${ADDRESS_MAX} characters or fewer.`
  }
  return ''
}

// Notes are optional, so an empty value is fine.
export function validateNotes(notes) {
  if (String(notes ?? '').trim().length > NOTES_MAX) {
    return `Notes must be ${NOTES_MAX} characters or fewer.`
  }
  return ''
}

export function validateCheckout({ name, phone, address, notes }) {
  return collectErrors({
    name: validateName(name),
    phone: validatePhone(phone),
    address: validateAddress(address),
    notes: validateNotes(notes),
  })
}

// ---------- Product (admin) validators ----------

const PRODUCT_NAME_MAX = 100
const DESCRIPTION_MIN = 10
const DESCRIPTION_MAX = 1000
const PRICE_MAX = 10000000
const STOCK_MAX = 100000

// A web address (https://...) or a path on this site (/images/phone.jpg).
// "//host/..." is rejected, because it would point to another website.
const IMAGE_PATTERN = /^(https?:\/\/|\/(?!\/))/i

export function isValidImageUrl(value) {
  return IMAGE_PATTERN.test(String(value ?? '').trim())
}

function validateProductName(name) {
  const value = String(name ?? '').trim()
  if (!value) return 'Product name is required.'
  if (value.length > PRODUCT_NAME_MAX) {
    return `Name must be ${PRODUCT_NAME_MAX} characters or fewer.`
  }
  return ''
}

function validateProductDescription(description) {
  const value = String(description ?? '').trim()
  if (!value) return 'Description is required.'
  if (value.length < DESCRIPTION_MIN) {
    return `Description must be at least ${DESCRIPTION_MIN} characters.`
  }
  if (value.length > DESCRIPTION_MAX) {
    return `Description must be ${DESCRIPTION_MAX} characters or fewer.`
  }
  return ''
}

function validateProductCategory(category) {
  return CATEGORIES.some((item) => item.id === category)
    ? ''
    : 'Please choose a category.'
}

function validateProductPrice(price) {
  const text = String(price ?? '').trim()
  if (!text) return 'Price is required.'
  const number = Number(text)
  if (!Number.isFinite(number) || number <= 0) {
    return 'Price must be a number greater than 0.'
  }
  if (number > PRICE_MAX) return 'Price is too large.'
  return ''
}

function validateProductStock(stock) {
  const text = String(stock ?? '').trim()
  if (!text) return 'Stock is required.'
  const number = Number(text)
  if (!Number.isInteger(number) || number < 0) {
    return 'Stock must be a whole number, 0 or more.'
  }
  if (number > STOCK_MAX) return 'Stock is too large.'
  return ''
}

// Rating is optional. Empty means "not rated yet" (saved as 0).
function validateProductRating(rating) {
  const text = String(rating ?? '').trim()
  if (!text) return ''
  const number = Number(text)
  if (!Number.isFinite(number) || number < 0 || number > 5) {
    return 'Rating must be between 0 and 5.'
  }
  return ''
}

// The image is optional. Empty means "use a placeholder image".
function validateProductImage(image) {
  const text = String(image ?? '').trim()
  if (!text) return ''
  return isValidImageUrl(text)
    ? ''
    : 'Use a web address (https://...) or a path like /images/phone.jpg.'
}

export function validateProductForm(values) {
  return collectErrors({
    name: validateProductName(values.name),
    category: validateProductCategory(values.category),
    price: validateProductPrice(values.price),
    stock: validateProductStock(values.stock),
    rating: validateProductRating(values.rating),
    image: validateProductImage(values.image),
    description: validateProductDescription(values.description),
  })
}