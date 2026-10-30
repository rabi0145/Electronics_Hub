import { Link } from "react-router-dom";
import { ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import ProductImage from "../components/common/ProductImage";
import QuantitySelector from "../components/common/QuantitySelector";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/currency";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

function Cart() {
  const {
    lines,
    subtotal,
    itemCount,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();
  useDocumentTitle("Shopping Cart");

  function handleClearCart() {
    if (window.confirm("Remove all items from your cart?")) {
      clearCart();
    }
  }

  // Empty state
  if (lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center">
        <ShoppingCart className="h-14 w-14 text-slate-400" />
        <h1 className="mt-4 text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-slate-600">
          Looks like you haven't added anything yet. Browse our products and
          find something you like.
        </p>
        <Link
          to="/products"
          className="mt-6 rounded-lg bg-brand-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-brand-700"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <button
          type="button"
          onClick={handleClearCart}
          className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          Clear cart
        </button>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        {/* Item list */}
        <ul className="space-y-4 lg:col-span-2">
          {lines.map(({ product, quantity, lineTotal }) => (
            <li
              key={product.id}
              className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row"
            >
              <Link to={`/products/${product.id}`} className="shrink-0">
                <ProductImage
                  src={product.image}
                  alt={product.name}
                  className="h-28 w-28 rounded-lg border border-slate-200"
                />
              </Link>

              <div className="flex flex-1 flex-col gap-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-semibold leading-snug">
                      <Link
                        to={`/products/${product.id}`}
                        className="hover:text-brand-700"
                      >
                        {product.name}
                      </Link>
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      {formatCurrency(product.price)} each
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(product.id)}
                    aria-label={`Remove ${product.name} from cart`}
                    className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <QuantitySelector
                      value={quantity}
                      onChange={(newQuantity) =>
                        updateQuantity(product.id, newQuantity)
                      }
                      max={product.stock}
                      label={product.name}
                    />
                    {quantity >= product.stock && (
                      <p className="mt-1 text-xs text-amber-700">
                        Maximum available quantity
                      </p>
                    )}
                  </div>
                  <p className="text-lg font-bold">
                    {formatCurrency(lineTotal)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Order summary */}
        <aside className="h-fit rounded-xl border border-slate-200 bg-slate-50 p-6 lg:sticky lg:top-28">
          <h2 className="text-lg font-bold">Order Summary</h2>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-600">Items ({itemCount})</dt>
              <dd className="font-medium">{formatCurrency(subtotal)}</dd>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-3 text-base">
              <dt className="font-semibold">Subtotal</dt>
              <dd className="font-bold">{formatCurrency(subtotal)}</dd>
            </div>
          </dl>

          <p className="mt-3 text-xs text-slate-500">
            The delivery fee is added at checkout.
          </p>

          <Link
            to="/checkout"
            className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-3 font-medium text-white transition-colors hover:bg-brand-700"
          >
            Proceed to checkout
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            to="/products"
            className="mt-3 block text-center text-sm font-medium text-brand-700 hover:underline"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}

export default Cart;
