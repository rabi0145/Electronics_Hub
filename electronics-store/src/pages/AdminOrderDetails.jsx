import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import OrderStatusBadge from "../components/common/OrderStatusBadge";
import { useOrders } from "../context/OrderContext";
import { formatCurrency } from "../utils/currency";
import { ORDER_STATUS, ORDER_STATUS_LIST } from "../utils/order";
import { formatOrderDate } from "../utils/whatsapp";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

// The status dropdown with its Update button.
// The parent gives it a `key` that includes the saved status, so after a
// successful update it starts fresh with the new value (no effect needed).
function StatusUpdater({ order }) {
  const { updateOrderStatus } = useOrders();
  const [selected, setSelected] = useState(order.status);
  const [feedback, setFeedback] = useState(null);

  const isChanged = selected !== order.status;

  function handleSubmit(event) {
    event.preventDefault();
    if (!isChanged) return;

    // Cancelling is hard to undo by accident, so ask first.
    if (selected === ORDER_STATUS.CANCELLED) {
      const confirmed = window.confirm(
        `Cancel order ${order.id}?\n\nThe customer's order history will show it as Cancelled, and it will no longer count towards the recorded order value. Stock is NOT changed automatically.`,
      );
      if (!confirmed) return;
    }

    const result = updateOrderStatus(order.id, selected);
    if (!result.success) {
      setFeedback({ type: "error", text: result.message });
    }
    // On success the order changes, so the parent's key makes a fresh updater.
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label
        htmlFor="order-status"
        className="mb-1 block text-sm font-medium text-slate-700"
      >
        Order status
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <select
          id="order-status"
          value={selected}
          onChange={(event) => {
            setSelected(event.target.value);
            if (feedback) setFeedback(null);
          }}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          {ORDER_STATUS_LIST.map((statusName) => (
            <option key={statusName} value={statusName}>
              {statusName}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={!isChanged}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Update status
        </button>
      </div>
      <p
        role="status"
        className={`mt-2 min-h-5 text-sm font-medium ${
          feedback?.type === "error" ? "text-red-700" : "text-green-800"
        }`}
      >
        {feedback?.text}
      </p>
    </form>
  );
}

function AdminOrderDetails() {
  const { orderId } = useParams();
  const { orders } = useOrders();

  // Admins can open any order, unlike customers, who only see their own.
  const order = orders.find((item) => item.id === orderId);
  useDocumentTitle(order ? `Admin: ${order.id}` : "Admin: Order not found");

  if (!order) {
    return (
      <section className="max-w-3xl">
        <h2 className="text-xl font-bold">Order not found</h2>
        <p className="mt-2 text-slate-600">
          We couldn't find this order in this browser's saved orders.
        </p>
        <Link
          to="/admin/orders"
          className="mt-4 inline-block rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          Back to orders
        </Link>
      </section>
    );
  }

  const unitCount = order.items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return (
    <section aria-labelledby="order-heading" className="max-w-4xl">
      <Link
        to="/admin/orders"
        className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to orders
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="order-heading" className="text-xl font-bold">
            {order.id}
          </h2>
          <p className="text-sm text-slate-600">
            Placed on {formatOrderDate(order.createdAt)} · {unitCount}{" "}
            {unitCount === 1 ? "item" : "items"}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Products */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="font-bold">Products</h3>
            <ul className="mt-3 divide-y divide-slate-200 text-sm">
              {order.items.map((item) => (
                <li
                  key={item.productId}
                  className="flex justify-between gap-4 py-3"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-slate-600">
                      {item.quantity} × {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  <p className="shrink-0 font-medium">
                    {formatCurrency(item.lineTotal)}
                  </p>
                </li>
              ))}
            </ul>

            <dl className="mt-2 space-y-2 border-t border-slate-200 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-600">Subtotal</dt>
                <dd className="font-medium">
                  {formatCurrency(order.subtotal)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Delivery fee</dt>
                <dd className="font-medium">
                  {formatCurrency(order.deliveryFee)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-3 text-base">
                <dt className="font-semibold">Grand total</dt>
                <dd className="font-bold">
                  {formatCurrency(order.grandTotal)}
                </dd>
              </div>
            </dl>
          </div>

          {/* Customer */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="font-bold">Customer details</h3>
            <dl className="mt-3 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-600">Name</dt>
                <dd className="font-medium">{order.customer.name}</dd>
              </div>
              <div>
                <dt className="text-slate-600">Phone</dt>
                <dd className="font-medium">
                  <a
                    href={`tel:${order.customer.phone}`}
                    className="hover:text-brand-700"
                  >
                    {order.customer.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-slate-600">Account email</dt>
                <dd className="break-all font-medium">{order.userEmail}</dd>
              </div>
              <div>
                <dt className="text-slate-600">Payment method</dt>
                <dd className="font-medium">{order.paymentMethod}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-slate-600">Delivery address</dt>
                <dd className="font-medium">{order.customer.address}</dd>
              </div>
              {order.customer.notes && (
                <div className="sm:col-span-2">
                  <dt className="text-slate-600">Notes</dt>
                  <dd className="font-medium">{order.customer.notes}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Status */}
        <aside className="h-fit rounded-xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="font-bold">Manage order</h3>
          <div className="mt-3">
            <StatusUpdater key={`${order.id}-${order.status}`} order={order} />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Changing the status does not change product stock. Adjust stock on
            the Products tab when you confirm or cancel an order. This website
            cannot verify that the customer's WhatsApp message was sent.
          </p>
        </aside>
      </div>
    </section>
  );
}

export default AdminOrderDetails;
