// ============================================================
// PASSWORD HELPERS (demo only)
//
// We never store a password. We store a salted PBKDF2 hash instead.
// IMPORTANT: this is NOT real security. Anyone can edit localStorage in
// their own browser. Real authentication needs a backend server.
// ============================================================

// Higher = slower for attackers, but also slower for us (a fraction of a
// second). Stored with each record, so we can raise it later without
// breaking existing demo accounts.
const DEFAULT_ITERATIONS = 310000
const SALT_BYTES = 16
const HASH_BITS = 256

// --- Small conversion helpers: bytes <-> text we can store in JSON ---

function bytesToBase64(bytes) {
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return window.btoa(binary)
}

function base64ToBytes(base64) {
  const binary = window.atob(base64)
  return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}

// The Web Crypto API only exists on secure pages: https:// or localhost.
function getCrypto() {
  const cryptoApi = window.crypto
  if (!cryptoApi || !cryptoApi.subtle) {
    throw new Error(
      'Secure password hashing is not available here. Open the site on https:// or localhost.',
    )
  }
  return cryptoApi
}

// Turns a password + salt into a hash (as base64 text).
async function derivePasswordHash(password, saltBytes, iterations) {
  const cryptoApi = getCrypto()
  const encoder = new TextEncoder()

  const keyMaterial = await cryptoApi.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )

  const bits = await cryptoApi.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltBytes, iterations, hash: 'SHA-256' },
    keyMaterial,
    HASH_BITS,
  )

  return bytesToBase64(new Uint8Array(bits))
}

// Compares two strings without stopping at the first difference.
// (Good habit; the timing risk is tiny in a browser demo.)
function safeEqual(a, b) {
  if (a.length !== b.length) return false
  let difference = 0
  for (let i = 0; i < a.length; i += 1) {
    difference |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return difference === 0
}

// Call when REGISTERING. Returns something safe to store:
//   { salt, hash, iterations }
export async function createPasswordRecord(password) {
  const cryptoApi = getCrypto()
  const saltBytes = cryptoApi.getRandomValues(new Uint8Array(SALT_BYTES))
  const hash = await derivePasswordHash(password, saltBytes, DEFAULT_ITERATIONS)

  return {
    salt: bytesToBase64(saltBytes),
    hash,
    iterations: DEFAULT_ITERATIONS,
  }
}

// Call when LOGGING IN. Returns true if the password matches the record.
export async function verifyPassword(password, record) {
  if (!record || !record.salt || !record.hash || !record.iterations) {
    return false
  }

  try {
    const hash = await derivePasswordHash(
      password,
      base64ToBytes(record.salt),
      record.iterations,
    )
    return safeEqual(hash, record.hash)
  } catch {
    return false
  }
}