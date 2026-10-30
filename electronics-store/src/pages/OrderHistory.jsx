import { useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Package } from "lucide-react";
import OrderStatusBadge from "../components/common/OrderStatusBadge";
import { useAuth } from "../context/AuthContext";
import { useOrders } from "../context/OrderContext";
import { formatCurrency } from "../utils/currency";
import { ORDER_STATUS } from "../utils/order";
import {
  buildWhatsAppUrl,
  formatOrderDate,
  openWhatsAppUrl,
} from "../utils/whatsapp";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

function OrderHistory() {
  const { currentUser } = useAuth();
  const { getOrdersForUser } = useOrders();
  useDocumentTitle("My Orders");

  // Message shown under one order's button: { orderId, type, text }
  const [feedback, setFeedback] = useState(null);

  // Only this customer's orders, newest first. The route is already
  // protected, but we still guard against a missing user.
  const orders = currentUser ? getOrdersForUser(currentUser.id) : [];

  // Runs directly from a button click, so browsers allow the new tab.
  function handleOpenWhatsApp(order) {
    const result = buildWhatsAppUrl(order);

    if (!result.success) {
      setFeedback({ orderId: order.id, type: "error", text: result.message });
      return;
    }

    if (openWhatsAppUrl(result.url)) {
      setFeedback({
        orderId: order.id,
        type: "success",
        text: "WhatsApp opened in a new tab. Press Send there to deliver your order.",
      });
    } else {
      setFeedback({
        orderId: order.id,
        type: "error",
        text: "Your browser blocked the new tab. Allow pop-ups for this site and try again.",
      });
    }
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center">
        <Package className="h-14 w-14 text-slate-400" />
        <h1 className="mt-4 text-2xl font-bold">No orders yet</h1>
        <p className="mt-2 text-slate-600">
          When you place an order, it will appear here so you can track its
          status.
        </p>
        <Link
          to="/products"
          className="mt-6 rounded-lg bg-brand-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-brand-700"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold">My Orders</h1>
      <p className="mt-1 text-slate-600">
        {orders.length === 1 ? "1 order" : `${orders.length} orders`} placed
        from this browser.
      </p>

      <ul className="mt-6 space-y-6">
        {orders.map((order) => {
          const isPending = order.status === ORDER_STATUS.PENDING_WHATSAPP;
          const orderFeedback =
            feedback?.orderId === order.id ? feedback : null;

          return (
            <li
              key={order.id}
              className="rounded-xl border border-slate-200 bg-white p-6"
            >
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold">{order.id}</h2>
                  <p className="text-sm text-slate-600">
                    Placed on {formatOrderDate(order.createdAt)}
                  </p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              {/* Products */}
              <ul className="mt-4 divide-y divide-slate-200 text-sm">
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

              {/* Totals */}
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

              {/* Delivery details */}
              <dl className="mt-4 grid gap-3 border-t border-slate-200 pt-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-slate-600">Payment method</dt>
                  <dd className="font-medium">{order.paymentMethod}</dd>
                </div>
                <div>
                  <dt className="text-slate-600">Phone</dt>
                  <dd className="font-medium">{order.customer.phone}</dd>
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

              {/* Only orders still waiting for the seller can be re-sent */}
              {isPending && (
                <div className="mt-4 rounded-lg bg-amber-50 p-4">
                  <p className="text-sm text-amber-900">
                    This order is not confirmed yet. If you haven't sent your
                    message on WhatsApp, you can open it again. This website
                    cannot tell whether a message was sent.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleOpenWhatsApp(order)}
                    className="mt-3 flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-800"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Open WhatsApp
                  </button>
                  <p
                    role="status"
                    className={`mt-2 text-sm font-medium ${
                      orderFeedback?.type === "error"
                        ? "text-red-700"
                        : "text-green-800"
                    }`}
                  >
                    {orderFeedback?.text}
                  </p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default OrderHistory;
