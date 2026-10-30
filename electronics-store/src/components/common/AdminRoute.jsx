import { Navigate, Outlet, useLocation } from "react-router-dom";
import NotFoundMessage from "./NotFoundMessage";
import { useAuth } from "../../context/AuthContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

// Shown to logged-in customers who open an admin address.
function AccessDenied() {
  useDocumentTitle("Access denied");

  return (
    <NotFoundMessage
      title="Access denied"
      message="This area is only available to store administrators."
      linkTo="/"
      linkLabel="Back to homepage"
    />
  );
}

// A "layout route" that only lets admins through.
//   - Not logged in      -> redirected to /login (and sent back afterwards)
//   - Logged in customer -> "Access denied" message
//   - Admin              -> the nested admin pages (via <Outlet />)
//
// NOTE: this only hides pages in the browser (UI-level protection).
// Real authorization must be enforced by a server on every request.
function AdminRoute() {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!isAdmin) {
    return <AccessDenied />;
  }

  return <Outlet />;
}

export default AdminRoute;
