import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import FormField from '../forms/FormField'
import ProductImage from '../common/ProductImage'
import { CATEGORIES } from '../../data/categories'
import {
  hasErrors,
  isValidImageUrl,
  validateProductForm,
} from '../../utils/validation'

// The form for adding and editing products.
//
// Props:
//   initialValues - the starting field values (all text, plus `featured`)
//   onSubmit      - called with the values when they are valid. It must
//                   return { success: true } or { success: false, message }
//   submitLabel   - text on the submit button
//   cancelTo      - where the Cancel link goes
function ProductForm({
  initialValues,
  onSubmit,
  submitLabel,
  cancelTo = '/admin/products',
}) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')

  // Blocks a second submit before the page has finished navigating away.
  const isSubmittingRef = useRef(false)

  function handleChange(event) {
    const { name, value, type, checked } = event.target
    setValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))

    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: '' }))
    }
    if (formError) setFormError('')
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (isSubmittingRef.current) return

    const validationErrors = validateProductForm(values)
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors)
      return
    }

    isSubmittingRef.current = true
    const result = onSubmit(values)

    if (!result.success) {
      isSubmittingRef.current = false // allow another try
      setFormError(result.message ?? 'Could not save the product.')
    }
    // On success, the page that owns this form navigates away.
  }

  const imageText = values.image.trim()
  const showPreview = imageText !== '' && isValidImageUrl(imageText)

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-6"
    >
      {formError && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </p>
      )}

      <FormField
        label="Product name"
        name="name"
        value={values.name}
        onChange={handleChange}
        error={errors.name}
        required
      />

      <FormField
        as="select"
        label="Category"
        name="category"
        value={values.category}
        onChange={handleChange}
        error={errors.category}
        required
      >
        <option value="">Choose a category</option>
        {CATEGORIES.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </FormField>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField
          label="Price (NPR)"
          name="price"
          type="number"
          min="0"
          step="any"
          inputMode="decimal"
          value={values.price}
          onChange={handleChange}
          error={errors.price}
          required
        />
        <FormField
          label="Stock"
          name="stock"
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          value={values.stock}
          onChange={handleChange}
          error={errors.stock}
          required
        />
        <FormField
          label="Rating (0 to 5)"
          name="rating"
          type="number"
          min="0"
          max="5"
          step="0.1"
          inputMode="decimal"
          value={values.rating}
          onChange={handleChange}
          error={errors.rating}
          hint="Optional."
        />
      </div>

      <div>
        <FormField
          label="Image URL"
          name="image"
          type="text"
          value={values.image}
          onChange={handleChange}
          error={errors.image}
          placeholder="https://... or /images/products/phone.jpg"
          hint="Optional. Leave empty to use a placeholder image."
        />
        {showPreview && (
          <div className="mt-3 flex items-center gap-3">
            <ProductImage
              src={imageText}
              alt="Preview of the product image"
              className="h-20 w-20 rounded-lg border border-slate-200"
            />
            <p className="text-xs text-slate-500">Preview</p>
          </div>
        )}
      </div>

      <FormField
        as="textarea"
        label="Description"
        name="description"
        rows={4}
        value={values.description}
        onChange={handleChange}
        error={errors.description}
        required
      />

      <label className="flex items-center gap-3 text-sm font-medium">
        <input
          type="checkbox"
          name="featured"
          checked={values.featured}
          onChange={handleChange}
          className="h-4 w-4 rounded border-slate-300"
        />
        Show as a featured product on the homepage
      </label>

      <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-4">
        <button
          type="submit"
          className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          {submitLabel}
        </button>
        <Link
          to={cancelTo}
          className="rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-medium transition-colors hover:bg-slate-100"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}

export default ProductForm