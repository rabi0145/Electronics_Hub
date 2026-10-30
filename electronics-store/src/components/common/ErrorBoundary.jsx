import { Component } from 'react'
import { TriangleAlert } from 'lucide-react'

// Catches errors thrown while React is RENDERING its children and shows a
// recovery message instead of a blank page.
//
// It does NOT catch errors inside event handlers or async code (for example
// a click handler). Those are handled where they happen, with result objects
// like { success: false, message }.
//
// It uses plain <a> and <button> elements instead of router links, so it also
// works if the problem is in the router itself.
class ErrorBoundary extends Component {
  state = { hasError: false }

  // React calls this when a child throws. The returned object becomes the new state.
  static getDerivedStateFromError() {
    return { hasError: true }
  }

  // A good place to report the error. Here we only log it.
  componentDidCatch(error, info) {
    console.error('Unexpected error:', error, info.componentStack)
  }

  handleRetry = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <div role="alert" className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center">
        <TriangleAlert className="h-14 w-14 text-amber-500" />
        <h1 className="mt-4 text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-slate-600">
          An unexpected error occurred. Your cart and orders are saved in this
          browser, so nothing has been lost.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={this.handleRetry}
            className="rounded-lg bg-brand-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-brand-700"
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-lg border border-slate-300 px-6 py-2.5 font-medium transition-colors hover:bg-slate-100"
          >
            Go to homepage
          </a>
        </div>
      </div>
    )
  }
}

export default ErrorBoundary