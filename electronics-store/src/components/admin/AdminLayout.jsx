import { NavLink, Outlet } from 'react-router-dom'
import { Info } from 'lucide-react'

const ADMIN_LINKS = [
  { label: 'Dashboard', to: '/admin', end: true },
  { label: 'Products', to: '/admin/products', end: false },
  { label: 'Orders', to: '/admin/orders', end: false },
]

// The frame shared by every admin page: a title, section tabs, and a demo
// notice, with the current page shown through <Outlet />.
function AdminLayout() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <p className="mt-3 flex items-start gap-2 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>
          Demo admin. All data lives in this browser only, and the admin role is
          a convenience for this demo, not real security.
        </span>
      </p>

      <nav aria-label="Admin sections" className="mt-6 border-b border-slate-200">
        <ul className="-mb-px flex gap-1 overflow-x-auto">
          {ADMIN_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `block whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-brand-600 text-brand-700'
                      : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900'
                  }`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  )
}

export default AdminLayout