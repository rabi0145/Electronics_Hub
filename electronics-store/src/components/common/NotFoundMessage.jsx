import { Link } from 'react-router-dom'
import { SearchX } from 'lucide-react'

// A reusable "nothing here" message with a way back.
// Used by the 404 page and by the product details page (invalid product ID).
function NotFoundMessage({
  title = 'Page not found',
  message = "The page you're looking for doesn't exist or may have been moved.",
  linkTo = '/',
  linkLabel = 'Go to homepage',
}) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center">
      <SearchX className="h-14 w-14 text-slate-400" />
      <h1 className="mt-4 text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-slate-600">{message}</p>
      <Link
        to={linkTo}
        className="mt-6 rounded-lg bg-brand-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-brand-700"
      >
        {linkLabel}
      </Link>
    </div>
  )
}

export default NotFoundMessage