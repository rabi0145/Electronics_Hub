import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle, Banknote, ShieldCheck } from "lucide-react";
import ProductGrid from "../components/products/ProductGrid";
import { useProducts } from "../context/ProductContext";
import { CATEGORIES } from "../data/categories";
import { STORE_CONFIG } from "../config/store";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const FEATURED_COUNT = 4;
const LATEST_COUNT = 4;

// Heading for a homepage section, with an optional "View all" link.
function SectionHeader({ title, linkTo, linkLabel = "View all" }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <h2 className="text-2xl font-bold">{title}</h2>
      {linkTo && (
        <Link
          to={linkTo}
          className="flex shrink-0 items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
        >
          {linkLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

function Home() {
  useDocumentTitle();
  const { products } = useProducts();

  const featuredProducts = products
    .filter((product) => product.featured)
    .slice(0, FEATURED_COUNT);

  // Newest first. Dates like "2026-09-20" sort correctly as plain text,
  // and so do the full timestamps of products added by the admin.
  // [...products] makes a copy, because sort() changes the array it is called on.
  const latestProducts = [...products]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, LATEST_COUNT);

  return (
    <div>
      {/* Hero */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
            Welcome to {STORE_CONFIG.name}
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
            The latest electronics, at your doorstep.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-slate-600">
            {STORE_CONFIG.tagline}. Shop smartphones, laptops, audio and more,
            and order in a few taps through WhatsApp.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/products"
              className="flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 font-medium text-white transition-colors hover:bg-brand-700"
            >
              Shop now
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/products?category=smartphones"
              className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-medium transition-colors hover:bg-slate-100"
            >
              Browse smartphones
            </Link>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 pt-14">
        <SectionHeader title="Featured Products" linkTo="/products" />
        <ProductGrid products={featuredProducts} />
      </section>

      {/* Popular categories */}
      <section className="mx-auto max-w-7xl px-4 pt-14">
        <SectionHeader title="Popular Categories" />
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <li key={category.id}>
                <Link
                  to={`/products?category=${category.id}`}
                  className="flex h-full flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-5 text-center transition-all hover:border-brand-500 hover:shadow-md"
                >
                  <span className="rounded-full bg-brand-50 p-3 text-brand-600">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="text-sm font-medium">{category.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Promotional banner */}
      <section className="mx-auto max-w-7xl px-4 pt-14">
        <div className="rounded-2xl bg-brand-600 px-6 py-10 text-white sm:px-12">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Order in minutes with WhatsApp checkout
          </h2>
          <p className="mt-2 max-w-2xl text-brand-50">
            Fill in your details, send the pre-written message to our team, and
            pay with Cash on Delivery.
          </p>
          <ul className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
            <li className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 shrink-0" />
              Order details sent via WhatsApp
            </li>
            <li className="flex items-center gap-2">
              <Banknote className="h-5 w-5 shrink-0" />
              Cash on Delivery
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 shrink-0" />
              Availability confirmed by the seller
            </li>
          </ul>
          <Link
            to="/products"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-medium text-brand-700 transition-colors hover:bg-brand-50"
          >
            Start shopping
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Latest products */}
      <section className="mx-auto max-w-7xl px-4 pt-14">
        <SectionHeader
          title="Latest Products"
          linkTo="/products?sort=default"
        />
        <ProductGrid products={latestProducts} />
      </section>
    </div>
  );
}

export default Home;
