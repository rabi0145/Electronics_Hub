import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import ProductImage from "../common/ProductImage";
import StarRating from "../common/StarRating";
import { useCart } from "../../context/CartContext";
import { formatCurrency } from "../../utils/currency";
import { getCategoryName } from "../../data/categories";
import { STORE_CONFIG } from "../../config/store";

const FEEDBACK_DURATION_MS = 2000;

// Returns the label and colour for the stock badge.
function getStockStatus(stock) {
  if (stock <= 0) {
    return { label: "Out of stock", className: "text-red-600" };
  }
  if (stock <= STORE_CONFIG.lowStockLimit) {
    return { label: `Only ${stock} left`, className: "text-amber-700" };
  }
  return { label: "In stock", className: "text-green-700" };
}

function ProductCard({ product }) {
  const { addToCart, getQuantityInCart } = useCart();
  const [feedback, setFeedback] = useState(null);

  const stockStatus = getStockStatus(product.stock);
  const isOutOfStock = product.stock <= 0;
  const quantityInCart = getQuantityInCart(product.id);
  const isAtLimit = !isOutOfStock && quantityInCart >= product.stock;

  // Hide the feedback message after a short time.
  // The cleanup function cancels the timer if the card disappears first,
  // or if a new message replaces the old one.
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), FEEDBACK_DURATION_MS);
    return () => clearTimeout(timer);
  }, [feedback]);

  function handleAddToCart() {
    const result = addToCart(product, 1);
    if (result.wasLimited) {
      setFeedback({ text: `Only ${product.stock} available` });
    } else {
      setFeedback({ text: "Added to cart" });
    }
  }

  // A message to show: temporary feedback first, otherwise a permanent
  // note when every available unit is already in the cart.
  const message = feedback
    ? feedback.text
    : isAtLimit
      ? "Max quantity in cart"
      : "";

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-md">
      <Link
        to={`/products/${product.id}`}
        aria-label={`View details for ${product.name}`}
      >
        <ProductImage
          src={product.image}
          alt={product.name}
          className="aspect-square w-full"
        />
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {getCategoryName(product.category)}
        </p>

        <h3 className="mt-1 font-semibold leading-snug">
          <Link to={`/products/${product.id}`} className="hover:text-brand-700">
            {product.name}
          </Link>
        </h3>

        <div className="mt-2">
          <StarRating rating={product.rating} />
        </div>

        <p className="mt-3 text-lg font-bold text-slate-900">
          {formatCurrency(product.price)}
        </p>
        <p className={`text-sm font-medium ${stockStatus.className}`}>
          {stockStatus.label}
        </p>

        {/* Fixed height so the card does not jump when the message appears.
            aria-live makes screen readers announce the message. */}
        <p
          className="mt-1 h-5 text-xs font-medium text-brand-700"
          aria-live="polite"
        >
          {message}
        </p>

        {/* mt-auto pushes the buttons to the bottom so all cards line up */}
        <div className="mt-auto flex gap-2 pt-2">
          <Link
            to={`/products/${product.id}`}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-center text-sm font-medium transition-colors hover:bg-slate-100"
          >
            Details
          </Link>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAtLimit}
            aria-label={`Add ${product.name} to cart`}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <ShoppingCart className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
