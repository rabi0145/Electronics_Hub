import { ORDER_STATUS } from '../../utils/order'

// One colour style per status. The status TEXT is always shown too, so
// colour is never the only way to tell statuses apart (accessibility).
const STATUS_STYLES = {
  [ORDER_STATUS.PENDING_WHATSAPP]: 'bg-amber-100 text-amber-800',
  [ORDER_STATUS.CONFIRMED]: 'bg-blue-100 text-blue-800',
  [ORDER_STATUS.PROCESSING]: 'bg-indigo-100 text-indigo-800',
  [ORDER_STATUS.SHIPPED]: 'bg-purple-100 text-purple-800',
  [ORDER_STATUS.DELIVERED]: 'bg-green-100 text-green-800',
  [ORDER_STATUS.CANCELLED]: 'bg-red-100 text-red-800',
}

// Used if a saved order has a status we don't recognise.
const FALLBACK_STYLE = 'bg-slate-100 text-slate-700'

function OrderStatusBadge({ status }) {
  const style = STATUS_STYLES[status] ?? FALLBACK_STYLE

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${style}`}
    >
      {status}
    </span>
  )
}

export default OrderStatusBadge