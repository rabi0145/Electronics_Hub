import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Pencil, Plus, RotateCcw, Search, Star, Trash2 } from "lucide-react";
import ProductImage from "../components/common/ProductImage";
import { STORE_CONFIG } from "../config/store";
import { useProducts } from "../context/ProductContext";
import { CATEGORIES, getCategoryName } from "../data/categories";
import { formatCurrency } from "../utils/currency";
import { useDocumentTitle } from '../hooks/useDocumentTitle'

// A number box plus Save button for changing one product's stock.
// The parent gives it a `key` that includes the stock, so after a successful
// save the component starts fresh with the new number (no effect needed).
function StockEditor({ product, onSave }) {
  const [value, setValue] = useState(String(product.stock));
  const [error, setError] = useState("");

  const isChanged = value !== String(product.stock);

  function handleSubmit(event) {
    event.preventDefault();
    const number = Number(value);

    if (value.trim() === "" || !Number.isInteger(number) || number < 0) {
      setError("Enter a whole number, 0 or more.");
      return;
    }

    const result = onSave(product.id, number);
    if (!result.success) setError(result.message);
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex items-center gap-2">
        <label htmlFor={`stock-${product.id}`} className="sr-only">
          Stock for {product.name}
        </label>
        <input
          id={`stock-${product.id}`}
          type="number"
          min="0"
          inputMode="numeric"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            if (error) setError("");
          }}
          aria-invalid={error ? true : undefined}
          className={`w-20 rounded-lg border bg-white px-2 py-1 text-sm ${
            error ? "border-red-500" : "border-slate-300"
          }`}
        />
        {isChanged && (
          <button
            type="submit"
            className="rounded-lg bg-brand-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-brand-700"
          >
            Save
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}

function StockBadge({ stock }) {
  if (stock <= 0) {
    return (
      <span className="text-xs font-semibold text-red-600">Out of stock</span>
    );
  }
  if (stock <= STORE_CONFIG.lowStockLimit) {
    return (
      <span className="text-xs font-semibold text-amber-700">Low stock</span>
    );
  }
  return null;
}

function AdminProducts() {
  useDocumentTitle('Admin: Products')
  const { products, updateProduct, deleteProduct, resetProducts } =
    useProducts();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  // { type: 'success' | 'error', text } shown above the table.
  
  // The add and edit pages send a success message through the router state.
  const location = useLocation();
  const [feedback, setFeedback] = useState(
    location.state?.notice
      ? { type: "success", text: location.state.notice }
      : null,
  );

  const searchText = search.trim().toLowerCase();
  const visibleProducts = products.filter(
    (product) =>
      (!searchText || product.name.toLowerCase().includes(searchText)) &&
      (category === "all" || product.category === category),
  );

  function handleSaveStock(productId, stock) {
    const result = updateProduct(productId, { stock });
    if (result.success) {
      setFeedback({ type: "success", text: `Stock updated to ${stock}.` });
    }
    return result;
  }

  function handleDelete(product) {
    const confirmed = window.confirm(
      `Delete "${product.name}"?\n\nIt will be removed from the store and from any customer's cart. Past orders keep their own record of it. This cannot be undone.`,
    );
    if (!confirmed) return;

    const result = deleteProduct(product.id);
    setFeedback(
      result.success
        ? { type: "success", text: `"${product.name}" was deleted.` }
        : { type: "error", text: result.message },
    );
  }

  function handleReset() {
    const confirmed = window.confirm(
      "Reset the catalog to the original sample products?\n\nAll products you added, edited or deleted will be lost. Orders are not affected.",
    );
    if (!confirmed) return;

    resetProducts();
    setFeedback({
      type: "success",
      text: "The catalog was reset to the sample products.",
    });
  }

  return (
    <section aria-labelledby="admin-products-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="admin-products-heading" className="text-xl font-bold">
          Products ({products.length})
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-100"
          >
            <RotateCcw className="h-4 w-4" />
            Reset sample data
          </button>
          <Link
            to="/admin/products/new"
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" />
            Add product
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="relative sm:col-span-2">
          <label htmlFor="admin-product-search" className="sr-only">
            Search products
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="admin-product-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by product name"
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm"
          />
        </div>
        <div>
          <label htmlFor="admin-product-category" className="sr-only">
            Filter by category
          </label>
          <select
            id="admin-product-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p
        role="status"
        className={`mt-3 min-h-5 text-sm font-medium ${
          feedback?.type === "error" ? "text-red-700" : "text-green-800"
        }`}
      >
        {feedback?.text}
      </p>

      {visibleProducts.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-slate-600">
          {products.length === 0
            ? "There are no products. Add one, or reset the sample data."
            : "No products match your search."}
        </p>
      ) : (
        // The wrapper scrolls sideways on small screens, so the page itself never does.
        <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <caption className="sr-only">All products in the store</caption>
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th scope="col" className="px-4 py-3">
                  Product
                </th>
                <th scope="col" className="px-4 py-3">
                  Category
                </th>
                <th scope="col" className="px-4 py-3">
                  Price
                </th>
                <th scope="col" className="px-4 py-3">
                  Stock
                </th>
                <th scope="col" className="px-4 py-3">
                  Featured
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {visibleProducts.map((product) => (
                <tr key={product.id} className="align-top">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <ProductImage
                        src={product.image}
                        alt=""
                        className="h-12 w-12 shrink-0 rounded-lg border border-slate-200"
                      />
                      <Link
                        to={`/products/${product.id}`}
                        className="font-medium hover:text-brand-700"
                      >
                        {product.name}
                      </Link>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {getCategoryName(product.category)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="px-4 py-3">
                    <StockEditor
                      key={`${product.id}-${product.stock}`}
                      product={product}
                      onSave={handleSaveStock}
                    />
                    <div className="mt-1">
                      <StockBadge stock={product.stock} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {product.featured ? (
                      <span className="flex items-center gap-1 text-amber-700">
                        <Star
                          className="h-4 w-4 fill-amber-400"
                          aria-hidden="true"
                        />
                        Yes
                      </span>
                    ) : (
                      <span className="text-slate-600">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Link
                        to={`/admin/products/${product.id}/edit`}
                        aria-label={`Edit ${product.name}`}
                        className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-brand-700"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(product)}
                        aria-label={`Delete ${product.name}`}
                        className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default AdminProducts;
