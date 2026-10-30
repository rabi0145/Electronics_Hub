// ============================================================
// LOCAL STORAGE HELPERS
// All reading and writing of localStorage goes through this file.
// If we later move to a real backend, this is the place to change.
// ============================================================

// A prefix keeps our keys separate from other apps on the same address
// (for example other projects running on localhost).
const PREFIX = "electronics-store:";

// Every key the app uses, in one place, so we never mistype a key name.
export const STORAGE_KEYS = {
  cart: "cart",
  users: "users",
  session: "session",
  orders: "orders",
  products: "products",
};

export function fullKey(key) {
  return `${PREFIX}${key}`;
}

// Reads and parses a saved value.
// Returns `fallback` if nothing is saved, the data is corrupted,
// or localStorage is unavailable (e.g. blocked by browser privacy settings).
export function readStorage(key, fallback = null) {
  try {
    const raw = window.localStorage.getItem(fullKey(key));
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`Could not read "${key}" from localStorage:`, error);
    return fallback;
  }
}

// Saves a value (any JSON-compatible data).
// Returns true on success and false on failure (e.g. storage is full),
// so callers can react instead of silently losing data.
export function writeStorage(key, value) {
  try {
    window.localStorage.setItem(fullKey(key), JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Could not save "${key}" to localStorage:`, error);
    return false;
  }
}

// Deletes one saved value.
export function removeStorage(key) {
  try {
    window.localStorage.removeItem(fullKey(key));
  } catch (error) {
    console.warn(`Could not remove "${key}" from localStorage:`, error);
  }
}

// Can we actually save data? Some browsers block localStorage (strict privacy
// settings, some private modes). The app still works for browsing, but
// nothing would be remembered.
export function isStorageAvailable() {
  try {
    const testKey = `${PREFIX}__storage-test__`;
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}
