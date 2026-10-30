import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderHistory from "./pages/OrderHistory";
import AdminRoute from "./components/common/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminProductNew from "./pages/AdminProductNew";
import AdminProductEdit from "./pages/AdminProductEdit";
import AdminOrders from "./pages/AdminOrders";
import AdminOrderDetails from "./pages/AdminOrderDetails";

// TEMPORARY placeholder for pages we have not built yet.
// Each one is replaced by a real page in a later phase.
function ComingSoon() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-2xl font-bold">Coming soon</h1>
      <p className="mt-2 text-slate-600">This page hasn't been built yet.</p>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route
          path="/order-confirmation/:orderId"
          element={<OrderConfirmation />}
        />
        <Route path="/orders" element={<OrderHistory />} />

        {/* Customer-only pages: logged-out visitors are sent to /login */}
        <Route element={<ProtectedRoute />}>
          {/* Admin-only pages */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/products/new" element={<AdminProductNew />} />
              <Route
                path="/admin/products/:id/edit"
                element={<AdminProductEdit />}
              />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route
                path="/admin/orders/:orderId"
                element={<AdminOrderDetails />}
              />
            </Route>
          </Route>
          {/* <Route path="/orders" element={<ComingSoon />} /> */}
        </Route>

        {/* Anything else is a real 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
