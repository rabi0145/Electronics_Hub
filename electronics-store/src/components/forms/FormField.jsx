import { useId } from "react";

// A label + input (or textarea) + optional hint + error message.
//
// Props:
//   label      - text shown above the field
//   name       - field name (also used by forms to know which field changed)
//   value      - current value (the parent owns it: controlled input)
//   onChange   - the usual input change handler
//   error      - error message string; empty/undefined means "no error"
//   hint       - optional helper text shown under the field
//   as         - 'input' (default) or 'textarea'
//   required   - shows a * and sets aria-required
//   ...rest    - any other input attribute: type, placeholder, autoComplete, rows...
function FormField({
  label,
  name,
  value,
  onChange,
  error = "",
  hint = "",
  as = "input",
  required = false,
  ...rest
}) {
  // useId creates a unique id, so every label is linked to its own field
  // even if the same form appears twice on a page.
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const Element = as === "textarea" || as === "select" ? as : "input";

  // Tell screen readers which messages describe this field.
  const describedBy = [hint ? hintId : null, error ? errorId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-sm font-medium text-slate-700"
      >
        {label}
        {required && (
          <span className="text-red-600" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>

      <Element
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm placeholder:text-slate-500 ${
          error ? "border-red-500" : "border-slate-300"
        }`}
        {...rest}
      />

      {hint && !error && (
        <p id={hintId} className="mt-1 text-xs text-slate-500">
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} role="alert" className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export default FormField;
