import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// A "layout route" that only lets logged-in customers through.
// Any routes nested inside it are shown through <Outlet />.
//
// If nobody is logged in, the visitor is redirected to /login and the page
// they wanted is saved in the router state (state.from), so Login.jsx can
// send them back after a successful login.
//
// NOTE: this only hides pages in the browser (UI-level protection). Because
// this is a frontend-only demo, anyone can change their own localStorage.
// Real protection requires a server that checks permissions on every request.
function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export default ProtectedRoute