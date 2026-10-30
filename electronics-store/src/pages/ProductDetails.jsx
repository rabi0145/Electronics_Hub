import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Check, ChevronRight, ShoppingCart } from "lucide-react";
import ProductImage from "../components/common/ProductImage";
import StarRating from "../components/common/StarRating";
import QuantitySelector from "../components/common/QuantitySelector";
import NotFoundMessage from "../components/common/NotFoundMessage";
import ProductGrid from "../components/products/ProductGrid";
import { useCart } from "../context/CartContext";
import { useProducts } from "../context/ProductContext";
import { getCategoryName } from "../data/categories";
import { formatCurrency } from "../utils/currency";
import { STORE_CONFIG } from "../config/store";
import { useDocumentTitle } from '../hooks/useDocumentTitle'

const RELATED_COUNT = 4;

// The part of the page that shows a real product.
// It is a separate component so it can hold its own state.
function ProductDetailsContent({ product }) {
  const { products } = useProducts();
  const { addToCart, getQuantityInCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState("");

  const isOutOfStock = product.stock <= 0;
  const isLowStock =
    !isOutOfStock && product.stock <= STORE_CONFIG.lowStockLimit;
  const categoryName = getCategoryName(product.category);

  // How many more units the customer may still add.
  const quantityInCart = getQuantityInCart(product.id);
  const remaining = Math.max(0, product.stock - quantityInCart);

  // The selector can never show more than what is still available.
  // This is derived on every render, so no effect is needed to "fix" it
  // after the cart changes.
  const selectedQuantity = Math.min(quantity, Math.max(remaining, 1));

  // Other products from the same category, excluding this one.
  const relatedProducts = products
    .filter(
      (item) => item.category === product.category && item.id !== product.id,
    )
    .slice(0, RELATED_COUNT);

  function handleAddToCart() {
    const result = addToCart(product, selectedQuantity);

    if (result.wasLimited) {
      setFeedback(
        `Only ${product.stock} available in total. Your cart has been updated.`,
      );
    } else {
      setFeedback(
        selectedQuantity === 1
          ? "Added 1 item to your cart."
          : `Added ${selectedQuantity} items to your cart.`,
      );
    }
    setQuantity(1);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link to="/" className="hover:text-brand-700">
              Home
            </Link>
          </li>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
          <li>
            <Link to="/products" className="hover:text-brand-700">
              Products
            </Link>
          </li>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
          <li>
            <Link
              to={`/products?category=${product.category}`}
              className="hover:text-brand-700"
            >
              {categoryName}
            </Link>
          </li>
        </ol>
      </nav>

      {/* Main product section */}
      <div className="mt-6 grid gap-8 md:grid-cols-2 lg:gap-12">
        <ProductImage
          src={product.image}
          alt={product.name}
          className="aspect-square w-full rounded-xl border border-slate-200"
        />

        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            {categoryName}
          </p>
          <h1 className="mt-1 text-3xl font-bold leading-tight">
            {product.name}
          </h1>

          <div className="mt-3">
            <StarRating rating={product.rating} />
          </div>

          <p className="mt-5 text-3xl font-bold">
            {formatCurrency(product.price)}
          </p>

          <p
            className={`mt-2 font-medium ${
              isOutOfStock
                ? "text-red-600"
                : isLowStock
                  ? "text-amber-700"
                  : "text-green-700"
            }`}
          >
            {isOutOfStock
              ? "Out of stock"
              : isLowStock
                ? `Only ${product.stock} left in stock`
                : `In stock (${product.stock} available)`}
          </p>

          {quantityInCart > 0 && (
            <p className="mt-1 text-sm text-slate-600">
              You already have {quantityInCart} in your cart.
            </p>
          )}

          <p className="mt-6 leading-relaxed text-slate-700">
            {product.description}
          </p>

          {/* Purchase controls */}
          <div className="mt-8 border-t border-slate-200 pt-6">
            {isOutOfStock ? (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                This product is currently unavailable. Please check back later.
              </p>
            ) : remaining <= 0 ? (
              <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
                All available units of this product are already in your cart.{" "}
                <Link
                  to="/cart"
                  className="font-medium text-brand-700 underline"
                >
                  View cart
                </Link>
              </p>
            ) : (
              <div className="flex flex-wrap items-center gap-4">
                <QuantitySelector
                  value={selectedQuantity}
                  onChange={setQuantity}
                  max={remaining}
                  label={product.name}
                />
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-brand-700"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add to cart
                </button>
              </div>
            )}

            {feedback && (
              <p
                role="status"
                className="mt-4 flex flex-wrap items-center gap-2 text-sm font-medium text-green-700"
              >
                <Check className="h-4 w-4" />
                {feedback}
                <Link to="/cart" className="text-brand-700 underline">
                  View cart
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16" aria-labelledby="related-heading">
          <h2 id="related-heading" className="mb-6 text-2xl font-bold">
            Related Products
          </h2>
          <ProductGrid products={relatedProducts} />
        </section>
      )}
    </div>
  );
}

// The page itself: finds the product from the URL and decides what to show.
function ProductDetails() {
  const { id } = useParams();
  const { products } = useProducts();
  const product = products.find((item) => item.id === id);
  useDocumentTitle(product ? product.name : "Product not found");

  if (!product) {
    return (
      <NotFoundMessage
        title="Product not found"
        message="We couldn't find the product you're looking for. It may have been removed."
        linkTo="/products"
        linkLabel="Browse all products"
      />
    );
  }

  // key={product.id} makes React start fresh (quantity back to 1, message cleared)
  // whenever the visitor moves from one product to another.
  return <ProductDetailsContent key={product.id} product={product} />;
}

export default ProductDetails;
