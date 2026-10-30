// ============================================================
// STORE CONFIGURATION
// All store-wide settings live here. Edit this file to change
// the store name, contact details, or delivery fee.
// ============================================================

// Turns "a@x.com, B@x.com" into ['a@x.com', 'b@x.com'].
// Falls back to `fallback` when the setting is missing or empty.
function parseEmailList(text, fallback) {
  const list = String(text ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return list.length > 0 ? list : fallback;
}

export const STORE_CONFIG = {
  // --- Branding ---
  name: "TechMart Nepal", // Temporary name. Change it any time.
  tagline: "Quality electronics, delivered across Nepal",

  // --- Contact details (shown in the footer) ---
  email: "support@example.com",
  phoneDisplay: "+977 980-0000000",
  address: "Katari, Koshi Province, Nepal",

  // --- WhatsApp ---
  // Seller's WhatsApp number in international format for wa.me links:
  //   country code 977 + 10-digit mobile number.
  //   Digits only: no "+", spaces, brackets or hyphens.
  // Example: 9779812345678
  // TODO: replace this placeholder with the real seller number.
  sellerWhatsAppNumber: "977980000000",

  // --- Pricing ---
  currencyCode: "NPR",
  deliveryFee: 150, // Flat delivery fee in NPR, used at checkout.
  lowStockLimit: 5, // Products with this many units or fewer count as "low stock".

  // --- Demo admin (UI convenience only, NOT real security) ---
  // Anyone who registers with one of these emails sees the admin dashboard.
  // The list can be overridden with VITE_ADMIN_EMAILS in a .env.local file
  // (comma-separated). Never put a password here: this file is public.
  adminEmails: parseEmailList(import.meta.env.VITE_ADMIN_EMAILS, [
    "admin@techmart.demo",
  ]),
};
