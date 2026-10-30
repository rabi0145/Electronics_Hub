import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { UserPlus } from "lucide-react";
import FormField from "../components/forms/FormField";
import { useAuth } from "../context/AuthContext";
import { hasErrors, validateRegistration } from "../utils/validation";
import { getSafeRedirect } from "../utils/navigation";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const EMPTY_FORM = { name: "", email: "", password: "", confirmPassword: "" };

function Register() {
  const { register, isAuthenticated } = useAuth();
  const location = useLocation();
  useDocumentTitle("Create an account");

  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Already logged in (or just registered): go back to where the visitor
  // came from, or to the homepage.
  if (isAuthenticated) {
    return <Navigate to={getSafeRedirect(location)} replace />;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));

    // Remove the old error for this field as soon as the user edits it.
    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: "" }));
    }
    if (formError) setFormError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;

    // Quick check first, so we only hash the password when the form is valid.
    const validationErrors = validateRegistration(values);
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    const result = await register(values);
    setIsSubmitting(false);

    if (!result.success) {
      setErrors(result.errors ?? {});
      setFormError(result.message ?? "");
    }
    // On success, isAuthenticated becomes true and the <Navigate> above runs.
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="text-center">
        <UserPlus className="mx-auto h-10 w-10 text-brand-600" />
        <h1 className="mt-3 text-3xl font-bold">Create an account</h1>
        <p className="mt-1 text-slate-600">
          Register to place orders and view your order history.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        aria-busy={isSubmitting}
        className="mt-8 space-y-4 rounded-xl border border-slate-200 bg-white p-6"
      >
        {formError && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {formError}
          </p>
        )}

        <FormField
          label="Full name"
          name="name"
          value={values.name}
          onChange={handleChange}
          error={errors.name}
          autoComplete="name"
          required
        />
        <FormField
          label="Email"
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
          hint="At least 8 characters, with a letter and a number."
          autoComplete="new-password"
          required
        />
        <FormField
          label="Confirm password"
          name="confirmPassword"
          type="password"
          value={values.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          autoComplete="new-password"
          required
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-brand-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>

        <p className="text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            to="/login"
            state={location.state}
            className="font-medium text-brand-700 underline"
          >
            Log in
          </Link>
        </p>
      </form>

      <p className="mt-4 text-center text-xs text-slate-500">
        Demo project: accounts are stored only in this browser and are not a
        secure login system. Please don't reuse a real password.
      </p>
    </div>
  );
}

export default Register;
