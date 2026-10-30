import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { LogIn } from "lucide-react";
import FormField from "../components/forms/FormField";
import { useAuth } from "../context/AuthContext";
import { hasErrors, validateLogin } from "../utils/validation";
import { getSafeRedirect } from "../utils/navigation";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const EMPTY_FORM = { email: "", password: "" };

function Login() {
  const { login, isAuthenticated } = useAuth();
  const location = useLocation();
  useDocumentTitle("Log in");

  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Already logged in (or just logged in): go back to where the visitor
  // came from, or to the homepage.
  if (isAuthenticated) {
    return <Navigate to={getSafeRedirect(location)} replace />;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));

    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: "" }));
    }
    if (formError) setFormError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;

    const validationErrors = validateLogin(values);
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    const result = await login(values);
    setIsSubmitting(false);

    if (!result.success) {
      setErrors(result.errors ?? {});
      setFormError(result.message ?? "");
      // Clear the password so the visitor retypes it. The email stays.
      setValues((current) => ({ ...current, password: "" }));
    }
    // On success, isAuthenticated becomes true and the <Navigate> above runs.
  }

  // Explains why the visitor was sent here, if a route guard redirected them.
  const wasRedirected = Boolean(location.state?.from);

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="text-center">
        <LogIn className="mx-auto h-10 w-10 text-brand-600" />
        <h1 className="mt-3 text-3xl font-bold">Log in</h1>
        <p className="mt-1 text-slate-600">
          {wasRedirected
            ? "Please log in to continue."
            : "Welcome back! Log in to your account."}
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
          autoComplete="current-password"
          required
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-brand-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>

        <p className="text-center text-sm text-slate-600">
          New here?{" "}
          <Link
            to="/register"
            state={location.state}
            className="font-medium text-brand-700 underline"
          >
            Create an account
          </Link>
        </p>
      </form>

      <p className="mt-4 text-center text-xs text-slate-500">
        Demo project: accounts are stored only in this browser and are not a
        secure login system.
      </p>
    </div>
  );
}

export default Login;
