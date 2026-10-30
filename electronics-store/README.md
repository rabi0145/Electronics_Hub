# TechMart Nepal: Electronics E-Commerce Website

A responsive electronics store built with React, where customers browse products, fill a cart, and place **Cash on Delivery orders through WhatsApp**. It also includes an admin dashboard for managing products and orders.

This is a **frontend-only portfolio project**. All data is stored in the browser's `localStorage`, there is no backend, and it is not production-secure. See [Limitations](#limitations) before judging any of the "security" features.

**Live demo:** (https://electronics-hub-tau.vercel.app)
**Try the admin dashboard:** register with `admin@techmart.demo`, then use the **Admin** link in the navigation bar.

## Features

**Customers**

- Browse 18 sample electronics products across 10 categories
- Search by name, filter by category and price range, and sort by price or name (all work together, and the filters live in the URL)
- Product details with quantity selector, stock status, and related products
- Shopping cart with quantity controls, stock limits, and persistence across refreshes (it also syncs between browser tabs)
- Demo registration and login with validation and protected pages
- Checkout form with Nepali phone-number validation and a configurable delivery fee
- **WhatsApp order checkout:** the order is saved first, then WhatsApp opens with a ready-to-send message
- Order confirmation page with retry and copy-message fallbacks
- Order history with status badges

**Admin** (demo role)

- Dashboard statistics: total products, total orders, recorded demo order value, low-stock count
- Add, edit, and delete products, with confirmation before deleting
- Edit stock directly in the product table
- View all orders, filter by status, search by order ID or customer, and update order status

**Quality**

- Mobile-first responsive layout
- Keyboard navigation, a skip link, visible focus outlines, labelled form fields, and ARIA live regions
- Empty, loading, error, and not-found states, plus an error boundary
- Corrupted or edited `localStorage` data is validated and discarded instead of crashing the app

## Tech stack

- [React](https://react.dev/) 19 with hooks and the Context API
- [Vite](https://vite.dev/) 8
- [Tailwind CSS](https://tailwindcss.com/) 4
- [React Router](https://reactrouter.com/) 7
- [Lucide React](https://lucide.dev/) icons
- JavaScript (no TypeScript, no Redux, no backend)

## Getting started

**Requirements:** [Node.js](https://nodejs.org/) (current LTS version) and npm.

```bash
# 1. Clone the repository
git clone <your-repository-url>
cd electronics-store

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open the address shown in the terminal (usually `http://localhost:5173`).

Other commands:

```bash
npm run build     # production build into the dist folder
npm run preview   # serve the production build locally
npm run lint      # check the code with ESLint
```

## Configuration

Store-wide settings live in one file: **`src/config/store.js`**.

| Setting | What it does |
| --- | --- |
| `name` | Store name shown in the header, footer, page titles, and WhatsApp message |
| `sellerWhatsAppNumber` | Number that receives orders, in `wa.me` format |
| `deliveryFee` | Flat delivery fee in NPR |
| `lowStockLimit` | Products with this many units or fewer count as "low stock" |
| `adminEmails` | Emails that get the demo admin role |
| contact details | Email, phone, and address shown in the footer |

**Before deploying, change these:**

1. **Seller WhatsApp number.** Use the country code `977` followed by the 10-digit mobile number: digits only, with no `+`, spaces, brackets, or hyphens. Example: `9779812345678`. The checkout is disabled while the number is invalid.
2. **Store name.** Update `name` in `src/config/store.js` **and** the `<title>` in `index.html`, which cannot import the config file.
3. **Footer contact details** in `src/config/store.js`.

### Demo admin access

The admin role is decided in the browser from a list of email addresses.

1. Open the site and **register** with the email `admin@techmart.demo` (any name and password).
2. An **Admin** link appears in the navigation bar.

To use a different admin email, create a `.env.local` file (see `.env.example`):

```
VITE_ADMIN_EMAILS=you@example.com
```

Restart the dev server after changing it. On a hosting service, set the same variable in the build settings. **Do not put real secrets in `VITE_` variables**, because they are included in the public JavaScript.

### Resetting the sample data

Once an admin changes a product, the catalog is read from `localStorage` instead of `src/data/products.js`. To go back to the sample products, use **Admin → Products → Reset sample data**.

## How WhatsApp checkout works

1. The customer fills the cart and opens checkout.
2. The form is validated (name, Nepali mobile number, address, optional notes), and the cart is checked against current stock.
3. The order is created with a unique ID, with product names and prices copied as a snapshot, and **saved to `localStorage` first**.
4. A message is built from the saved order, URL-encoded, and opened as `https://wa.me/<seller number>?text=<message>`.
5. The cart is cleared, and the customer lands on the confirmation page.
6. The customer **reviews the message and presses Send manually** in WhatsApp.

The order starts as `Pending WhatsApp Confirmation`. It is never marked confirmed automatically. If the browser blocks the new tab, the order stays saved, and the confirmation page and order history offer a retry button and a copy-message fallback.

## Project structure

```
src/
  components/
    admin/       AdminLayout, ProductForm
    common/      AdminRoute, ProtectedRoute, ErrorBoundary, NotFoundMessage,
                 OrderStatusBadge, ProductImage, QuantitySelector, StarRating
    forms/       FormField
    layout/      Layout, Navbar, Footer
    products/    ProductCard, ProductGrid
  config/        store.js           (all store-wide settings)
  context/       AuthContext, CartContext, OrderContext, ProductContext
  data/          products.js, categories.js
  hooks/         useDocumentTitle.js
  pages/         Home, Products, ProductDetails, Cart, Login, Register,
                 Checkout, OrderConfirmation, OrderHistory, NotFound,
                 AdminDashboard, AdminProducts, AdminProductNew,
                 AdminProductEdit, AdminOrders, AdminOrderDetails
  utils/         cart, currency, navigation, order, password, productFilters,
                 productForm, stats, storage, validation, whatsapp
  App.jsx        routes
  main.jsx       providers
```

**Design decisions**

- Business logic (cart maths, order totals, validation, message formatting) lives in plain functions in `utils/`, separate from the UI.
- The cart stores only product IDs and quantities, so prices and stock always come from the current catalog. Orders store a snapshot, so history never changes.
- All `localStorage` access goes through one file (`utils/storage.js`), so a backend could replace it later without rewriting the pages.

## Limitations

This is a demo. Please read these before treating any part of it as secure.

- **Data is local.** Everything (accounts, products, carts, orders) lives in each visitor's own browser. It is not shared between devices or visitors, and clearing browser data deletes it.
- **Authentication is a demo.** Passwords are stored as salted PBKDF2 hashes through the Web Crypto API, never as plain text, but anyone can open developer tools and read, edit, or delete the stored data. There is no email verification, password reset, rate limiting, or lockout.
- **The admin role is a UI convenience.** Route guards only hide pages. An admin can only manage the data in their own browser. Real authorization needs a server that checks permissions on every request.
- **Inventory is not shared.** Stock is not synchronized across customers, and placing an order does not reduce stock automatically.
- **Payments are simulated.** Cash on Delivery is a fixed option, and no payment processor is involved.
- **WhatsApp delivery cannot be verified.** The site opens a pre-filled message, but the customer must press Send. The site cannot tell whether the message was sent or whether the seller accepted the order. Orders are not shared with the seller unless the customer sends the message.
- **Concurrent edits.** If the same data changes in two tabs at once, the last write wins.
- Secure password hashing needs `https://` or `localhost`, so the site will not register or log in on plain `http://` network addresses.

## Future improvements

- A backend and database shared by all visitors
- Real authentication and server-side role checks
- Automatic stock reservation when an order is confirmed
- Image uploads instead of image addresses
- Order notifications to the seller
- Automated tests

## Author

_Rabi Shrestha_ 