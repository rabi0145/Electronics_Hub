import { createContext, useContext, useEffect, useState } from "react";
import { PRODUCTS, placeholderImage } from "../data/products";
import { CATEGORIES } from "../data/categories";
import {
  readStorage,
  writeStorage,
  removeStorage,
  fullKey,
  STORAGE_KEYS,
} from "../utils/storage";

const ProductContext = createContext(null);

// Does this saved value look like a real product? localStorage can be
// edited or corrupted, so anything that doesn't pass is thrown away.
function isValidProduct(product) {
  return Boolean(
    product &&
    typeof product.id === "string" &&
    typeof product.name === "string" &&
    typeof product.description === "string" &&
    typeof product.category === "string" &&
    typeof product.image === "string" &&
    typeof product.createdAt === "string" &&
    Number.isFinite(product.price) &&
    Number.isFinite(product.rating) &&
    Number.isInteger(product.stock) &&
    product.stock >= 0 &&
    typeof product.featured === "boolean",
  );
}

// Nothing saved yet (or the saved data is not a list)? Use the sample data
// from src/data/products.js. Once the admin changes something, the saved
// copy takes over.
function loadProducts() {
  const saved = readStorage(STORAGE_KEYS.products, null);
  if (!Array.isArray(saved)) return PRODUCTS;
  return saved.filter(isValidProduct);
}

// Checks and cleans the fields an admin can edit.
// Returns { product } on success or { error: 'message' }.
function normalizeProductInput(input) {
  const name = String(input.name ?? "").trim();
  const description = String(input.description ?? "").trim();
  const price = Number(input.price);
  const stock = Number(input.stock);
  const rating =
    input.rating === "" || input.rating == null ? 0 : Number(input.rating);
  const image = String(input.image ?? "").trim() || placeholderImage(name);

  if (!name) return { error: "Product name is required." };
  if (!CATEGORIES.some((category) => category.id === input.category)) {
    return { error: "Please choose a valid category." };
  }
  if (!Number.isFinite(price) || price <= 0) {
    return { error: "Price must be greater than 0." };
  }
  if (!Number.isInteger(stock) || stock < 0) {
    return { error: "Stock must be a whole number of 0 or more." };
  }
  if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
    return { error: "Rating must be between 0 and 5." };
  }
  // Only web addresses or files from this site. Nothing else is accepted.
  if (!/^(https?:\/\/|\/(?!\/))/i.test(image)) {
    return {
      error:
        "Image must be a web address (https://...) or a path like /images/phone.jpg.",
    };
  }

  return {
    product: {
      name,
      description,
      category: input.category,
      price,
      stock,
      rating,
      image,
      featured: Boolean(input.featured),
    },
  };
}

function generateProductId(existingIds) {
  const used = new Set(existingIds);
  let id;
  do {
    id = `p-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
  } while (used.has(id));
  return id;
}

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(loadProducts);

  // Keep this tab in sync when ANOTHER tab changes the products.
  useEffect(() => {
    const productsKey = fullKey(STORAGE_KEYS.products);

    function handleStorageChange(event) {
      if (event.key === null || event.key === productsKey) {
        setProducts(loadProducts());
      }
    }

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Saves first, and only updates the screen if saving worked.
  function saveProducts(nextProducts) {
    if (!writeStorage(STORAGE_KEYS.products, nextProducts)) return false;
    setProducts(nextProducts);
    return true;
  }

  const SAVE_FAILED = {
    success: false,
    message:
      "Could not save the change. Your browser storage may be full or blocked.",
  };

  function getProductById(productId) {
    return products.find((product) => product.id === productId) ?? null;
  }

  // All the functions below return { success: true, ... } or
  // { success: false, message }, like the other contexts.
  function addProduct(input) {
    const result = normalizeProductInput(input);
    if (!result.product) return { success: false, message: result.error };

    const current = loadProducts();
    const product = {
      ...result.product,
      id: generateProductId(current.map((item) => item.id)),
      createdAt: new Date().toISOString(),
    };

    return saveProducts([...current, product])
      ? { success: true, product }
      : SAVE_FAILED;
  }

  function updateProduct(productId, input) {
    const current = loadProducts();
    const existing = current.find((item) => item.id === productId);
    if (!existing) return { success: false, message: "Product not found." };

    const result = normalizeProductInput({ ...existing, ...input });
    if (!result.product) return { success: false, message: result.error };

    const updated = { ...existing, ...result.product };
    const next = current.map((item) =>
      item.id === productId ? updated : item,
    );

    return saveProducts(next)
      ? { success: true, product: updated }
      : SAVE_FAILED;
  }

  function deleteProduct(productId) {
    const current = loadProducts();
    if (!current.some((item) => item.id === productId)) {
      return { success: false, message: "Product not found." };
    }

    const next = current.filter((item) => item.id !== productId);
    return saveProducts(next) ? { success: true } : SAVE_FAILED;
  }

  // Throws away every admin change and goes back to the sample data.
  function resetProducts() {
    removeStorage(STORAGE_KEYS.products);
    setProducts(PRODUCTS);
    return { success: true };
  }

  const value = {
    products,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
    resetProducts,
  };

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProducts() {
  const context = useContext(ProductContext);
  if (context === null) {
    throw new Error("useProducts must be used inside <ProductProvider>");
  }
  return context;
}
