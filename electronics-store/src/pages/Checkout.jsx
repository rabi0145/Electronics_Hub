import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Banknote, ShoppingCart, TriangleAlert } from "lucide-react";
import FormField from "../components/forms/FormField";
import { STORE_CONFIG } from "../config/store";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useOrders } from "../context/OrderContext";
import { useProducts } from "../context/ProductContext";
import { formatCurrency } from "../utils/currency";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import {
  calculateOrderTotals,
  validateCartForCheckout,
  PAYMENT_METHOD,
} from "../utils/order";
import {
  hasErrors,
  normalizePhone,
  validateCheckout,
} from "../utils/validation";
import {
  buildWhatsAppUrl,
  isValidSellerNumber,
  openWhatsAppUrl,
} from "../utils/whatsapp";

function Checkout() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { items, lines, clearCart } = useCart();
  const { createOrder } = useOrders();
  const { products } = useProducts();
  useDocumentTitle("Checkout");

  // The name starts as the account name, and the customer can change it.
  const [values, setValues] = useState({
    name: currentUser ? currentUser.name : "",
    phone: "",
    address: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);

  // A ref changes instantly (state updates wait for the next render), so it
  // can block a second click that arrives before React has re-rendered.
  const isPlacingOrderRef = useRef(false);

  // Derived on every render, so they always match the current cart and config.
  const cartProblems = validateCartForCheckout(items, products);
  const totals = calculateOrderTotals(lines);
  const isSellerConfigured = isValidSellerNumber(
    STORE_CONFIG.sellerWhatsAppNumber,
  );

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));

    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: "" }));
    }
    if (submitError) setSubmitError("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    // 1. Ignore repeated clicks while an order is being placed.
    if (isPlacingOrderRef.current) return;
    setSubmitError("");

    // 2. Never continue with a broken setup or cart.
    if (!isSellerConfigured || cartProblems.length > 0) return;

    // 3. Validate the form.
    const validationErrors = validateCheckout(values);
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    isPlacingOrderRef.current = true;

    // 4. Create and SAVE the order (saved to localStorage inside createOrder).
    const customer = {
      name: values.name.trim(),
      phone: normalizePhone(values.phone),
      address: values.address.trim(),
      notes: values.notes.trim(),
    };
    const result = createOrder({ user: currentUser, customer, lines });

    if (!result.success) {
      isPlacingOrderRef.current = false; // allow another try
      setSubmitError(result.message);
      return;
    }

    const { order } = result;

    // 5. Open WhatsApp. This runs synchronously inside the click, which is
    //    what keeps popup blockers from stopping it.
    const whatsapp = buildWhatsAppUrl(order);
    const whatsappOpened = whatsapp.success
      ? openWhatsAppUrl(whatsapp.url)
      : false;

    // 6. The order is recorded, so it is now safe to clear the cart.
    clearCart();
    setIsOrderPlaced(true);

    // 7. Go to the confirmation page. "replace" removes checkout from the
    //    history, so Back does not return to an empty checkout.
    navigate(`/order-confirmation/${order.id}`, {
      replace: true,
      state: { whatsappOpened },
    });
  }

  // Shown for a moment while the confirmation page loads, instead of
  // briefly flashing "Your cart is empty" after the cart was cleared.
  if (isOrderPlaced) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p role="status" className="text-slate-600">
          Your order has been saved. Taking you to your confirmation...
        </p>
      </div>
    );
  }

  // Empty cart: nothing to check out.
  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center">
        <ShoppingCart className="h-14 w-14 text-slate-400" />
        <h1 className="mt-4 text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-slate-600">
          Add some products before checking out.
        </p>
        <Link
          to="/products"
          className="mt-6 rounded-lg bg-brand-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-brand-700"
        >
          Browse products
        </Link>
      </div>
    );
  }

  const hasCartProblems = cartProblems.length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold">Checkout</h1>
      <p className="mt-1 text-slate-600">
        Enter your delivery details. You'll review and send your order through
        WhatsApp.
      </p>

      {!isSellerConfigured && (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
        >
          <p className="flex items-center gap-2 font-semibold">
            <TriangleAlert className="h-5 w-5" />
            Ordering is temporarily unavailable
          </p>
          <p className="mt-1">
            The store's WhatsApp number has not been set up correctly. Please
            try again later.
          </p>
          <p className="mt-1 text-xs text-amber-800">
            Developer note: set a valid <code>sellerWhatsAppNumber</code> in{" "}
            <code>src/config/store.js</code> (977 followed by a 10-digit mobile
            number).
          </p>
        </div>
      )}

      {hasCartProblems && (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <p className="flex items-center gap-2 font-semibold">
            <TriangleAlert className="h-5 w-5" />
            Please fix your cart before ordering
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {cartProblems.map((problem) => (
              <li key={problem}>{problem}</li>
            ))}
          </ul>
          <Link to="/cart" className="mt-3 inline-block font-medium underline">
            Go to cart
          </Link>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Customer form */}
        <form
          id="checkout-form"
          onSubmit={handleSubmit}
          noValidate
          className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2"
        >
          <h2 className="text-lg font-bold">Delivery details</h2>

          <FormField
            label="Full name"
            name="name"
            value={values.name}
            onChange={handleChange}
            error={errors.name}
            autoComplete="name"
            required
          />
          <FormField
            label="Phone number"
            name="phone"
            type="tel"
            inputMode="tel"
            value={values.phone}
            onChange={handleChange}
            error={errors.phone}
            hint="Nepali mobile number, e.g. 9812345678"
            autoComplete="tel"
            required
          />
          <FormField
            label="Delivery address"
            name="address"
            as="textarea"
            rows={3}
            value={values.address}
            onChange={handleChange}
            error={errors.address}
            hint="Area, street, ward number or a nearby landmark."
            autoComplete="street-address"
            required
          />
          <FormField
            label="Order notes (optional)"
            name="notes"
            as="textarea"
            rows={2}
            value={values.notes}
            onChange={handleChange}
            error={errors.notes}
            hint="Anything the seller should know. Maximum 300 characters."
          />

          <div>
            <h2 className="text-lg font-bold">Payment method</h2>
            <div className="mt-2 flex items-center gap-3 rounded-lg border border-brand-500 bg-brand-50 px-4 py-3">
              <Banknote className="h-5 w-5 text-brand-700" />
              <div>
                <p className="text-sm font-semibold">{PAYMENT_METHOD}</p>
                <p className="text-xs text-slate-600">
                  Pay in cash when your order is delivered.
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Order summary */}
        <aside className="h-fit rounded-xl border border-slate-200 bg-slate-50 p-6 lg:sticky lg:top-28">
          <h2 className="text-lg font-bold">Order Summary</h2>

          <ul className="mt-4 divide-y divide-slate-200 text-sm">
            {lines.map(({ product, quantity, lineTotal }) => (
              <li key={product.id} className="flex justify-between gap-4 py-3">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-slate-600">
                    {quantity} × {formatCurrency(product.price)}
                  </p>
                </div>
                <p className="shrink-0 font-medium">
                  {formatCurrency(lineTotal)}
                </p>
              </li>
            ))}
          </ul>

          <dl className="mt-2 space-y-2 border-t border-slate-200 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-600">Subtotal</dt>
              <dd className="font-medium">{formatCurrency(totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Delivery fee</dt>
              <dd className="font-medium">
                {formatCurrency(totals.deliveryFee)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-3 text-base">
              <dt className="font-semibold">Grand total</dt>
              <dd className="font-bold">{formatCurrency(totals.grandTotal)}</dd>
            </div>
          </dl>

          <p className="mt-3 text-xs text-slate-500">
            Your order is only a request until the seller confirms it on
            WhatsApp.
          </p>

          {submitError && (
            <p
              role="alert"
              className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {submitError}
            </p>
          )}

          {/* The button sits outside the <form>, so it points to it with form="" */}
          <button
            type="submit"
            form="checkout-form"
            disabled={hasCartProblems || !isSellerConfigured}
            className="mt-6 w-full rounded-lg bg-green-700 px-6 py-3 font-medium text-white transition-colors hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Place Order via WhatsApp
          </button>
          <Link
            to="/cart"
            className="mt-3 block text-center text-sm font-medium text-brand-700 hover:underline"
          >
            Back to cart
          </Link>
        </aside>
      </div>
    </div>
  );
}

export default Checkout;
