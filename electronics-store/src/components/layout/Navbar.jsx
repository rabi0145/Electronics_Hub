import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Search,
  ShoppingCart,
  User,
  UserPlus,
  LogOut,
  Package,
  LayoutDashboard,
  Zap,
} from "lucide-react";
import { STORE_CONFIG } from "../../config/store";
import { CATEGORIES } from "../../data/categories";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

// A small search form used in two places (desktop header and mobile menu).
// Submitting it sends the visitor to /products?search=their+text
function SearchForm({ onSearched }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = query.trim();
    navigate(
      trimmed ? `/products?search=${encodeURIComponent(trimmed)}` : "/products",
    );
    onSearched?.();
  }

  return (
    <form onSubmit={handleSubmit} role="search" className="flex w-full">
      <label htmlFor="site-search" className="sr-only">
        Search products
      </label>
      <input
        id="site-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search for phones, laptops, headphones..."
        className="w-full rounded-l-lg border border-r-0 border-slate-300 px-4 py-2 text-sm placeholder:text-slate-500"
      />
      <button
        type="submit"
        aria-label="Search"
        className="rounded-r-lg bg-brand-600 px-4 text-white transition-colors hover:bg-brand-700"
      >
        <Search className="h-5 w-5" />
      </button>
    </form>
  );
}

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { itemCount: cartCount } = useCart();
  const { currentUser, isAuthenticated, isAdmin, logout } = useAuth();

  const firstName = currentUser ? currentUser.name.split(" ")[0] : "";

  function closeMenu() {
    setIsMenuOpen(false);
  }

  function handleLogout() {
    logout();
    closeMenu();
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      {/* Top row: logo, search (desktop), account, cart, menu button */}
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link
          to="/"
          onClick={closeMenu}
          className="flex shrink-0 items-center gap-2 text-xl font-bold"
        >
          <Zap className="h-6 w-6 text-brand-600" />
          <span>{STORE_CONFIG.name}</span>
        </Link>

        <div className="mx-4 hidden max-w-2xl flex-1 md:block">
          <SearchForm />
        </div>

        <div className="ml-auto flex items-center gap-1">
          {/* Account area (tablet and desktop) */}
          {isAuthenticated ? (
            <div className="hidden items-center gap-1 sm:flex">
              <Link
                to="/orders"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100"
              >
                <User className="h-5 w-5" />
                <span className="max-w-28 truncate">Hi, {firstName}</span>
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-brand-700 hover:bg-slate-100"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  <span>Admin</span>
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-1 sm:flex">
              <Link
                to="/login"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100"
              >
                <User className="h-5 w-5" />
                <span>Login</span>
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
              >
                Register
              </Link>
            </div>
          )}

          <Link
            to="/cart"
            aria-label={`Shopping cart, ${cartCount} items`}
            className="relative rounded-lg p-2 hover:bg-slate-100"
          >
            <ShoppingCart className="h-6 w-6" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-xs font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            className="rounded-lg p-2 hover:bg-slate-100 md:hidden"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Category navigation (desktop and tablet) */}
      <nav
        aria-label="Product categories"
        className="hidden border-t border-slate-100 bg-slate-50 md:block"
      >
        <ul className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-1.5 text-sm">
          <li>
            <Link
              to="/products"
              className="block whitespace-nowrap rounded-md px-3 py-1.5 font-semibold text-brand-700 hover:bg-white"
            >
              All Products
            </Link>
          </li>
          {CATEGORIES.map((category) => (
            <li key={category.id}>
              <Link
                to={`/products?category=${category.id}`}
                className="block whitespace-nowrap rounded-md px-3 py-1.5 text-slate-700 hover:bg-white hover:text-brand-700"
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile menu (only rendered when open) */}
      {isMenuOpen && (
        <div
          id="mobile-menu"
          className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-slate-200 bg-white px-4 py-4 md:hidden"
        >
          <SearchForm onSearched={closeMenu} />

          <nav aria-label="Mobile navigation" className="mt-4">
            <ul className="space-y-1">
              <li>
                <Link
                  to="/products"
                  onClick={closeMenu}
                  className="block rounded-lg px-3 py-2 font-semibold text-brand-700 hover:bg-slate-100"
                >
                  All Products
                </Link>
              </li>
              {CATEGORIES.map((category) => {
                const Icon = category.icon;
                return (
                  <li key={category.id}>
                    <Link
                      to={`/products?category=${category.id}`}
                      onClick={closeMenu}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-100"
                    >
                      <Icon className="h-5 w-5 text-slate-500" />
                      {category.name}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Account links (mobile) */}
            <ul className="mt-2 space-y-1 border-t border-slate-200 pt-2">
              {isAuthenticated ? (
                <>
                  <li className="px-3 py-2 text-sm text-slate-500">
                    Signed in as{" "}
                    <span className="font-medium text-slate-900">
                      {currentUser.name}
                    </span>
                  </li>
                  {isAdmin && (
                    <li>
                      <Link
                        to="/admin"
                        onClick={closeMenu}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-brand-700 hover:bg-slate-100"
                      >
                        <LayoutDashboard className="h-5 w-5" />
                        Admin dashboard
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link
                      to="/orders"
                      onClick={closeMenu}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-100"
                    >
                      <Package className="h-5 w-5 text-slate-500" />
                      My Orders
                    </Link>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-100"
                    >
                      <LogOut className="h-5 w-5 text-slate-500" />
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      to="/login"
                      onClick={closeMenu}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-100"
                    >
                      <User className="h-5 w-5 text-slate-500" />
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/register"
                      onClick={closeMenu}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-100"
                    >
                      <UserPlus className="h-5 w-5 text-slate-500" />
                      Register
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;