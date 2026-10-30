import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Check, Copy, MessageCircle, TriangleAlert } from "lucide-react";
import NotFoundMessage from "../components/common/NotFoundMessage";
import { useAuth } from "../context/AuthContext";
import { useOrders } from "../context/OrderContext";
import { formatCurrency } from "../utils/currency";
import OrderStatusBadge from "../components/common/OrderStatusBadge";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  formatOrderDate,
  openWhatsAppUrl,
} from "../utils/whatsapp";

function OrderConfirmation() {
  const { orderId } = useParams();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { getOrderForUser } = useOrders();

  // { type: 'success' | 'error', text: '...' } shown under the buttons.
  const [feedback, setFeedback] = useState(null);

  // Only the customer who placed the order can open this page for it.
  const order = currentUser ? getOrderForUser(orderId, currentUser.id) : null;
  useDocumentTitle(order ? `Order ${order.id}` : "Order not found");

  if (!order) {
    return (
      <NotFoundMessage
        title="Order not found"
        message="We couldn't find this order in your account. It may belong to a different account or have been cleared from this browser."
        linkTo="/products"
        linkLabel="Continue shopping"
      />
    );
  }

  // true = the checkout page opened WhatsApp, false = it was blocked,
  // undefined = the visitor arrived some other way (e.g. a bookmark).
  const whatsappOpened = location.state?.whatsappOpened;

  // Runs directly from a button click, so browsers allow the new tab.
  function handleOpenWhatsApp() {
    const result = buildWhatsAppUrl(order);

    if (!result.success) {
      setFeedback({ type: "error", text: result.message });
      return;
    }

    if (openWhatsAppUrl(result.url)) {
      setFeedback({
        type: "success",
        text: "WhatsApp opened in a new tab. Press Send there to deliver your order.",
      });
    } else {
      setFeedback({
        type: "error",
        text: "Your browser blocked the new tab. Allow pop-ups for this site and try again, or copy the message below.",
      });
    }
  }

  async function handleCopyMessage() {
    try {
      await navigator.clipboard.writeText(buildWhatsAppMessage(order));
      setFeedback({
        type: "success",
        text: "Message copied. Paste it into a WhatsApp chat with the seller and press Send.",
      });
    } catch {
      setFeedback({
        type: "error",
        text: "Could not copy automatically. Please try opening WhatsApp again.",
      });
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700">
          <Check className="h-8 w-8" />
        </span>
        <h1 className="mt-4 text-3xl font-bold">Your order has been saved</h1>
        <p className="mt-1 text-slate-600">
          Order ID:{" "}
          <span className="font-semibold text-slate-900">{order.id}</span>
        </p>
      </div>

      {/* Next step: honest wording, the order is NOT confirmed yet */}
      <section
        aria-labelledby="next-step-heading"
        className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5"
      >
        <h2
          id="next-step-heading"
          className="flex items-center gap-2 font-semibold text-amber-900"
        >
          <TriangleAlert className="h-5 w-5" />
          One more step: send your order on WhatsApp
        </h2>

        <p className="mt-2 text-sm text-amber-900">
          {whatsappOpened === true &&
            "WhatsApp should have opened in a new tab with your order message ready. Press Send there. Your order is not confirmed until the seller replies."}
          {whatsappOpened === false &&
            "WhatsApp couldn't be opened automatically. Use the button below to try again. Your order is not confirmed until you send the message and the seller replies."}
          {whatsappOpened === undefined &&
            "If you haven't sent your order message yet, use the button below. Your order is not confirmed until you send it and the seller replies."}
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="flex items-center gap-2 rounded-lg bg-green-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-800"
          >
            <MessageCircle className="h-5 w-5" />
            {whatsappOpened === true ? "Open WhatsApp again" : "Open WhatsApp"}
          </button>
          <button
            type="button"
            onClick={handleCopyMessage}
            className="flex items-center gap-2 rounded-lg border border-amber-300 bg-white px-5 py-2.5 text-sm font-medium text-amber-900 transition-colors hover:bg-amber-100"
          >
            <Copy className="h-4 w-4" />
            Copy message
          </button>
        </div>

        <p
          role="status"
          className={`mt-3 text-sm font-medium ${
            feedback?.type === "error" ? "text-red-700" : "text-green-800"
          }`}
        >
          {feedback?.text}
        </p>

        <p className="mt-3 text-xs text-amber-800">
          This website cannot tell whether your message was sent or whether the
          seller has accepted the order.
        </p>
      </section>

      {/* Order details */}
      <section
        aria-labelledby="order-details-heading"
        className="mt-8 rounded-xl border border-slate-200 bg-white p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="order-details-heading" className="text-lg font-bold">
            Order details
          </h2>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="mt-1 text-sm text-slate-600">
          Placed on {formatOrderDate(order.createdAt)}
        </p>

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

        <dl className="mt-2 space-y-2 border-t border-slate-200 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-600">Subtotal</dt>
            <dd className="font-medium">{formatCurrency(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-600">Delivery fee</dt>
            <dd className="font-medium">{formatCurrency(order.deliveryFee)}</dd>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-3 text-base">
            <dt className="font-semibold">Grand total</dt>
            <dd className="font-bold">{formatCurrency(order.grandTotal)}</dd>
          </div>
        </dl>

        <dl className="mt-6 grid gap-4 border-t border-slate-200 pt-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-600">Name</dt>
            <dd className="font-medium">{order.customer.name}</dd>
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
          <div>
            <dt className="text-slate-600">Payment method</dt>
            <dd className="font-medium">{order.paymentMethod}</dd>
          </div>
        </dl>
      </section>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/orders"
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-slate-100"
        >
          View my orders
        </Link>
        <Link
          to="/products"
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}

export default OrderConfirmation;
