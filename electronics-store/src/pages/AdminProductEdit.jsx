import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ProductForm from "../components/admin/ProductForm";
import { useProducts } from "../context/ProductContext";
import { productToFormValues } from "../utils/productForm";
import { useDocumentTitle } from '../hooks/useDocumentTitle'

function AdminProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProductById, updateProduct } = useProducts();

  const product = getProductById(id);
  useDocumentTitle(
    product ? `Admin: Edit ${product.name}` : "Admin: Product not found",
  );

  function handleSubmit(values) {
    const result = updateProduct(id, values);

    if (result.success) {
      navigate("/admin/products", {
        state: { notice: `"${result.product.name}" was updated.` },
      });
    }
    return result;
  }

  // Unknown ID (a mistyped address, or the product was deleted).
  if (!product) {
    return (
      <section className="max-w-3xl">
        <h2 className="text-xl font-bold">Product not found</h2>
        <p className="mt-2 text-slate-600">
          This product doesn't exist. It may have been deleted.
        </p>
        <Link
          to="/admin/products"
          className="mt-4 inline-block rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          Back to products
        </Link>
      </section>
    );
  }

  return (
    <section aria-labelledby="edit-product-heading" className="max-w-3xl">
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to products
      </Link>

      <h2 id="edit-product-heading" className="mt-3 text-xl font-bold">
        Edit product
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Changes appear in the store, carts, and checkout right away. Past orders
        keep the name and price they were bought at.
      </p>

      <div className="mt-4">
        {/* key={product.id} gives each product its own fresh form, so values
            from one product can never leak into another's edit page. */}
        <ProductForm
          key={product.id}
          initialValues={productToFormValues(product)}
          onSubmit={handleSubmit}
          submitLabel="Save changes"
        />
      </div>
    </section>
  );
}

export default AdminProductEdit;
