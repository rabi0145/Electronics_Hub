import { useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import ProductGrid from "../components/products/ProductGrid";
import { useProducts } from "../context/ProductContext";
// import { CATEGORIES } from "../data/categories";
import { filterAndSortProducts, SORT_OPTIONS } from "../utils/productFilters";
import { CATEGORIES, getCategoryName } from "../data/categories";
import { useDocumentTitle } from '../hooks/useDocumentTitle'

const fieldClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm";
const labelClass = "mb-1 block text-sm font-medium text-slate-700";

function Products() {
  const { products } = useProducts();
  // The URL is the single source of truth for the filters:
  // /products?search=sony&category=audio&minPrice=1000&sort=price-asc
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";

  // Ignore unknown values typed into the URL by hand.
  const rawCategory = searchParams.get("category") ?? "all";
  const category = CATEGORIES.some((item) => item.id === rawCategory)
    ? rawCategory
    : "all";

  useDocumentTitle(
    category === "all" ? "All Products" : getCategoryName(category),
  );
  const rawSort = searchParams.get("sort") ?? "default";
  const sort = SORT_OPTIONS.some((option) => option.value === rawSort)
    ? rawSort
    : "default";

  // Set one filter in the URL. An empty value removes it.
  function updateFilter(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value === "") {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    // replace: true means typing does not fill the browser history
    setSearchParams(next, { replace: true });
  }

  function clearFilters() {
    setSearchParams({}, { replace: true });
  }

  // Calculated on every render. With 18 products this is instant,
  // and we avoid storing a second copy of the data in state.
  const visibleProducts = filterAndSortProducts(products, {
    search,
    category,
    minPrice,
    maxPrice,
    sort,
  });

  const hasActiveFilters =
    search !== "" ||
    category !== "all" ||
    minPrice !== "" ||
    maxPrice !== "" ||
    sort !== "default";

  const hasInvalidPriceRange =
    minPrice !== "" && maxPrice !== "" && Number(minPrice) > Number(maxPrice);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold">All Products</h1>
      <p className="mt-1 text-slate-600">
        Browse our electronics and find the right device for you.
      </p>

      {/* Filter panel */}
      <section
        aria-label="Search and filters"
        className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-2">
            <label htmlFor="filter-search" className={labelClass}>
              Search
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="filter-search"
                type="search"
                value={search}
                onChange={(event) => updateFilter("search", event.target.value)}
                placeholder="Search by product name"
                className={`${fieldClass} pl-9`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="filter-category" className={labelClass}>
              Category
            </label>
            <select
              id="filter-category"
              value={category}
              onChange={(event) =>
                updateFilter(
                  "category",
                  event.target.value === "all" ? "" : event.target.value,
                )
              }
              className={fieldClass}
            >
              <option value="all">All categories</option>
              {CATEGORIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-min-price" className={labelClass}>
              Min price (NPR)
            </label>
            <input
              id="filter-min-price"
              type="number"
              min="0"
              inputMode="numeric"
              value={minPrice}
              onChange={(event) => updateFilter("minPrice", event.target.value)}
              placeholder="0"
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="filter-max-price" className={labelClass}>
              Max price (NPR)
            </label>
            <input
              id="filter-max-price"
              type="number"
              min="0"
              inputMode="numeric"
              value={maxPrice}
              onChange={(event) => updateFilter("maxPrice", event.target.value)}
              placeholder="Any"
              className={fieldClass}
            />
          </div>
        </div>

        {hasInvalidPriceRange && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            The minimum price is higher than the maximum price. Please adjust
            the range.
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div className="w-full sm:w-64">
            <label htmlFor="filter-sort" className={labelClass}>
              Sort by
            </label>
            <select
              id="filter-sort"
              value={sort}
              onChange={(event) =>
                updateFilter(
                  "sort",
                  event.target.value === "default" ? "" : event.target.value,
                )
              }
              className={fieldClass}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
              Clear all filters
            </button>
          )}
        </div>
      </section>

      {/* Results */}
      <h2 className="sr-only">Results</h2>
      <p className="mt-6 text-sm text-slate-600" aria-live="polite">
        Showing {visibleProducts.length} of {products.length} products
      </p>

      <div className="mt-4">
        <ProductGrid
          products={visibleProducts}
          onClearFilters={hasActiveFilters ? clearFilters : undefined}
        />
      </div>
    </div>
  );
}

export default Products;
