import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import ProductForm from '../components/admin/ProductForm'
import { useProducts } from '../context/ProductContext'
import { EMPTY_PRODUCT_FORM } from '../utils/productForm'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

function AdminProductNew() {
  useDocumentTitle('Admin: Add product')
  const { addProduct } = useProducts()
  const navigate = useNavigate()

  function handleSubmit(values) {
    const result = addProduct(values)

    if (result.success) {
      navigate('/admin/products', {
        state: { notice: `"${result.product.name}" was added.` },
      })
    }
    return result
  }

  return (
    <section aria-labelledby="new-product-heading" className="max-w-3xl">
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to products
      </Link>

      <h2 id="new-product-heading" className="mt-3 text-xl font-bold">
        Add product
      </h2>

      <div className="mt-4">
        <ProductForm
          initialValues={EMPTY_PRODUCT_FORM}
          onSubmit={handleSubmit}
          submitLabel="Add product"
        />
      </div>
    </section>
  )
}

export default AdminProductNew