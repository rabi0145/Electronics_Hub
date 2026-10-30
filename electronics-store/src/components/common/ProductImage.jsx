import { useState } from 'react'
import { ImageOff } from 'lucide-react'

// Shows a product image. If the URL is missing or fails to load,
// a neutral "image unavailable" box is shown instead of a broken icon.
function ProductImage({ src, alt, className = '' }) {
  // We remember WHICH url failed (not just true/false), so if the product's
  // image is edited later in the admin panel, the new url is tried again.
  const [failedSrc, setFailedSrc] = useState(null)

  const showFallback = !src || failedSrc === src

  if (showFallback) {
    return (
      <div
        role="img"
        aria-label={`${alt} (image unavailable)`}
        className={`flex flex-col items-center justify-center gap-2 bg-slate-100 text-slate-600 ${className}`}
      >
        <ImageOff className="h-10 w-10" />
        <span className="text-xs">Image unavailable</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailedSrc(src)}
      className={`bg-slate-100 object-contain ${className}`}
    />
  )
}

export default ProductImage