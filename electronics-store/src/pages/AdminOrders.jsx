import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import OrderStatusBadge from '../components/common/OrderStatusBadge'
import { useOrders } from '../context/OrderContext'
import { formatCurrency } from '../utils/currency'
import { ORDER_STATUS_LIST } from '../utils/order'
import { formatOrderDate } from '../utils/whatsapp'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

function AdminOrders() {
    useDocumentTitle('Admin: Orders')
  const { orders } = useOrders()

  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')

  const searchText = search.trim().toLowerCase()

  // Newest first. [...orders] makes a copy, because sort() changes its array.
  const visibleOrders = [...orders]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .filter((order) => {
      if (status !== 'all' && order.status !== status) return false
      if (!searchText) return true

      const customerName = String(order.customer.name ?? '').toLowerCase()
      return order.id.toLowerCase().includes(searchText) || customerName.includes(searchText)
    })

  function countWithStatus(statusName) {
    return orders.filter((order) => order.status === statusName).length
  }

  return (
    <section aria-labelledby="admin-orders-heading">
      <h2 id="admin-orders-heading" className="text-xl font-bold">
        Orders ({orders.length})
      </h2>

      {/* Filters */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="relative sm:col-span-2">
          <label htmlFor="admin-order-search" className="sr-only">
            Search orders
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="admin-order-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by order ID or customer name"
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm"
          />
        </div>
        <div>
          <label htmlFor="admin-order-status" className="sr-only">
            Filter by status
          </label>
          <select
            id="admin-order-status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="all">All statuses ({orders.length})</option>
            {ORDER_STATUS_LIST.map((statusName) => (
              <option key={statusName} value={statusName}>
                {statusName} ({countWithStatus(statusName)})
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mt-3 text-sm text-slate-600" aria-live="polite">
        Showing {visibleOrders.length} of {orders.length} orders
      </p>

      {visibleOrders.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-slate-600">
          {orders.length === 0
            ? 'No orders have been placed in this browser yet.'
            : 'No orders match your search or filter.'}
        </p>
      ) : (
        <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <caption className="sr-only">All customer orders</caption>
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th scope="col" className="px-4 py-3">Order</th>
                <th scope="col" className="px-4 py-3">Date</th>
                <th scope="col" className="px-4 py-3">Customer</th>
                <th scope="col" className="px-4 py-3">Total</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {visibleOrders.map((order) => (
                <tr key={order.id}>
                  <td className="whitespace-nowrap px-4 py-3 font-medium">
                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="hover:text-brand-700"
                    >
                      {order.id}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {formatOrderDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3">{order.customer.name}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium">
                    {formatCurrency(order.grandTotal)}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/admin/orders/${order.id}`}
                      aria-label={`View order ${order.id}`}
                      className="font-medium text-brand-700 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default AdminOrders