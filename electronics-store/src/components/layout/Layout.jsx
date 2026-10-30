import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { TriangleAlert } from 'lucide-react'
import Navbar from './Navbar'
import Footer from './Footer'
import ErrorBoundary from '../common/ErrorBoundary'
import { isStorageAvailable } from '../../utils/storage'

function Layout() {
  const { pathname } = useLocation()
  const mainRef = useRef(null)
  const previousPathname = useRef(pathname)

  // Checked once, when the layout first appears.
  const [storageAvailable] = useState(isStorageAvailable)

  // When the visitor moves to a different page: scroll to the top and move
  // keyboard focus to the main area, so keyboard and screen-reader users start
  // at the new content instead of staying on the link they clicked.
  // Comparing with the previous path means this does not run on first load, and
  // does not run when only the query string changes (e.g. typing in the filters).
  useEffect(() => {
    if (previousPathname.current === pathname) return
    previousPathname.current = pathname

    window.scrollTo(0, 0)
    mainRef.current?.focus({ preventScroll: true })
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow"
      >
        Skip to main content
      </a>

      <Navbar />

      {!storageAvailable && (
        <div role="alert" className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="mx-auto flex max-w-7xl items-start gap-2">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              Your browser is blocking local storage, so your cart, account and
              orders cannot be saved and will be lost when you leave. Allow site
              data for this website to shop normally.
            </span>
          </p>
        </div>
      )}

      {/* tabIndex={-1} lets code focus this area without adding it to the Tab
          order. It is not interactive, so it gets no focus outline. */}
      <main
        id="main-content"
        ref={mainRef}
        tabIndex={-1}
        className="flex-1 focus:outline-none"
      >
        {/* key={pathname} gives each page a fresh boundary, so an error on one
            page never follows the visitor to the next. */}
        <ErrorBoundary key={pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>

      <Footer />
    </div>
  )
}

export default Layout