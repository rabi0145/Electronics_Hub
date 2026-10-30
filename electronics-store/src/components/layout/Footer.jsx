import { Link } from 'react-router-dom'
import { Zap, Mail, Phone, MapPin } from 'lucide-react'
import { STORE_CONFIG } from '../../config/store'
import { CATEGORIES } from '../../data/categories'

// Quick links shown in the middle column.
const QUICK_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'All Products', to: '/products' },
  { label: 'Shopping Cart', to: '/cart' },
  { label: 'My Orders', to: '/orders' },
  { label: 'Login / Register', to: '/login' },
]

// Only the first few categories are listed to keep the footer tidy.
const FOOTER_CATEGORIES = CATEGORIES.slice(0, 5)

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <Zap className="h-6 w-6 text-brand-600" />
            <span>{STORE_CONFIG.name}</span>
          </Link>
          <p className="mt-3 text-sm text-slate-600">{STORE_CONFIG.tagline}</p>
        </div>

        {/* Shop by category */}
        <nav aria-label="Footer categories">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
            Shop
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {FOOTER_CATEGORIES.map((category) => (
              <li key={category.id}>
                <Link
                  to={`/products?category=${category.id}`}
                  className="text-slate-600 hover:text-brand-700"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Quick links */}
        <nav aria-label="Footer quick links">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
            Quick Links
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {QUICK_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-slate-600 hover:text-brand-700">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
            Contact
          </h2>
          <ul className="mt-3 space-y-3 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
              <span>{STORE_CONFIG.address}</span>
            </li>
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
              <span>{STORE_CONFIG.phoneDisplay}</span>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
              <a
                href={`mailto:${STORE_CONFIG.email}`}
                className="hover:text-brand-700"
              >
                {STORE_CONFIG.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-200">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 text-xs text-slate-500 sm:flex-row sm:justify-between">
          <p>
            &copy; {currentYear} {STORE_CONFIG.name}. All rights reserved.
          </p>
          <p>Demo portfolio project. No real payments or deliveries are made.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer