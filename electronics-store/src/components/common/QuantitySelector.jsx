import { Minus, Plus } from 'lucide-react'

// A "- 1 +" control. It does NOT store the quantity itself.
// The parent owns the value and receives changes through onChange.
//
// Props:
//   value     - current quantity (number)
//   onChange  - function called with the new quantity
//   min       - lowest allowed quantity (default 1)
//   max       - highest allowed quantity (usually the product's stock)
//   label     - used in screen reader text, e.g. product name
function QuantitySelector({ value, onChange, min = 1, max, label = 'item' }) {
  const canDecrease = value > min
  const canIncrease = value < max

  const buttonClass =
    'flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white'

  return (
    <div className="inline-flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={!canDecrease}
        aria-label={`Decrease quantity of ${label}`}
        className={buttonClass}
      >
        <Minus className="h-4 w-4" />
      </button>

      <span
        className="min-w-8 text-center font-semibold"
        aria-live="polite"
        aria-label={`Quantity: ${value}`}
      >
        {value}
      </span>

      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={!canIncrease}
        aria-label={`Increase quantity of ${label}`}
        className={buttonClass}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}

export default QuantitySelector