// Helpers for the admin product form.
// Form fields always hold TEXT (that is what inputs give us), so numbers are
// converted to strings here, and converted back by ProductContext when saving.

export const EMPTY_PRODUCT_FORM = {
  name: '',
  category: '',
  price: '',
  stock: '',
  rating: '',
  image: '',
  description: '',
  featured: false,
}

// Turns a saved product into the shape the form needs (used by the Edit page).
export function productToFormValues(product) {
  return {
    name: product.name,
    category: product.category,
    price: String(product.price),
    stock: String(product.stock),
    rating: String(product.rating),
    image: product.image,
    description: product.description,
    featured: product.featured,
  }
}