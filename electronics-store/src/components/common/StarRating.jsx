import { Star } from 'lucide-react'

// Shows a rating out of 5 as filled/empty stars plus the number.
// Example: <StarRating rating={4.6} />
function StarRating({ rating, showNumber = true }) {
  // Keep the value between 0 and 5, and treat bad input as 0.
  const safeRating = Math.min(5, Math.max(0, Number(rating) || 0))

  // Round to the nearest whole star for display: 4.6 -> 5 filled stars.
  const filledStars = Math.round(safeRating)

  return (
    <div
      className="flex items-center gap-1"
      role="img"
      aria-label={`Rated ${safeRating.toFixed(1)} out of 5`}
    >
      <div className="flex" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((starNumber) => (
          <Star
            key={starNumber}
            className={`h-4 w-4 ${
              starNumber <= filledStars
                ? 'fill-amber-400 text-amber-400'
                : 'text-slate-300'
            }`}
          />
        ))}
      </div>

      {showNumber && (
        <span className="text-sm text-slate-600">{safeRating.toFixed(1)}</span>
      )}
    </div>
  )
}

export default StarRating