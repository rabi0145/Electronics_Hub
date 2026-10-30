import { SearchX } from 'lucide-react'
import ProductCard from './ProductCard'

// Shows a list of products as a responsive grid.
// If the list is empty, shows a friendly message instead.
//
// Props:
//   products          - array of product objects
//   onClearFilters    - optional function; if given, a "Clear filters" button is shown
function ProductGrid({ products, onClearFilters }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
        <SearchX className="h-12 w-12 text-slate-400" />
        <h2 className="mt-4 text-lg font-semibold">No products found</h2>
        <p className="mt-1 max-w-sm text-sm text-slate-600">
          We couldn't find anything matching your search or filters. Try a
          different keyword or adjust the filters.
        </p>
        {onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="mt-6 rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
          >
            Clear all filters
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

export default ProductGrid