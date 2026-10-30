import { Link } from "react-router-dom";
import { AlertTriangle, Banknote, Package, ShoppingBag } from "lucide-react";
import { useOrders } from "../context/OrderContext";
import { useProducts } from "../context/ProductContext";
import { formatCurrency } from "../utils/currency";
import { getDashboardStats } from "../utils/stats";
import { useDocumentTitle } from '../hooks/useDocumentTitle'

// One statistics card.
function StatCard({ icon: Icon, label, value, hint, linkTo }) {
  const content = (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <span className="rounded-full bg-brand-50 p-2 text-brand-600">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </>
  );

  const cardClass = "block rounded-xl border border-slate-200 bg-white p-5";

  return linkTo ? (
    <Link
      to={linkTo}
      className={`${cardClass} transition-shadow hover:shadow-md`}
    >
      {content}
    </Link>
  ) : (
    <div className={cardClass}>{content}</div>
  );
}

function AdminDashboard() {
  useDocumentTitle("Admin: Dashboard");
  const { products } = useProducts();
  const { orders } = useOrders();

  const stats = getDashboardStats(products, orders);

  return (
    <section aria-label="Store statistics">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Package}
          label="Total products"
          value={stats.totalProducts}
          hint="Manage the catalog"
          linkTo="/admin/products"
        />
        <StatCard
          icon={ShoppingBag}
          label="Total orders"
          value={stats.totalOrders}
          hint={`${stats.pendingOrderCount} waiting for confirmation`}
          linkTo="/admin/orders"
        />
        <StatCard
          icon={Banknote}
          label="Recorded demo order value"
          value={formatCurrency(stats.recordedValue)}
          hint="Excludes cancelled orders. Not real revenue."
        />
        <StatCard
          icon={AlertTriangle}
          label="Low-stock products"
          value={stats.lowStockCount}
          hint={`${stats.outOfStockCount} out of stock`}
          linkTo="/admin/products"
        />
      </div>

      <p className="mt-6 text-sm text-slate-600">
        These numbers come from the orders recorded in this browser. The site
        cannot verify payments, deliveries, or whether WhatsApp messages were
        sent.
      </p>
    </section>
  );
}

export default AdminDashboard;
