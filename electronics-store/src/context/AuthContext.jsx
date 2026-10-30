import { createContext, useContext, useEffect, useState } from "react";
import {
  readStorage,
  writeStorage,
  fullKey,
  STORAGE_KEYS,
} from "../utils/storage";
import { createPasswordRecord, verifyPassword } from "../utils/password";
import { STORE_CONFIG } from "../config/store";
import {
  normalizeEmail,
  validateRegistration,
  validateLogin,
  hasErrors,
} from "../utils/validation";

const AuthContext = createContext(null);

// Same message for "no such email" and "wrong password", so the form never
// reveals which emails are registered.
const LOGIN_FAILED_MESSAGE = "Incorrect email or password.";

// crypto.randomUUID only exists on secure pages, so we keep a simple fallback.
function generateId() {
  if (window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `user-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// Reads saved users and discards anything that does not look like a user.
// localStorage can be edited or corrupted, so we never trust it blindly.
function loadUsers() {
  const saved = readStorage(STORAGE_KEYS.users, []);
  if (!Array.isArray(saved)) return [];

  return saved.filter(
    (user) =>
      user &&
      typeof user.id === "string" &&
      typeof user.name === "string" &&
      typeof user.email === "string" &&
      user.passwordRecord &&
      typeof user.passwordRecord.hash === "string",
  );
}

// The session only stores WHO is logged in (a user id), never a password.
function loadSessionUserId() {
  const saved = readStorage(STORAGE_KEYS.session, null);
  return saved && typeof saved.userId === "string" ? saved.userId : null;
}

// The version of a user that the rest of the app is allowed to see.
// The password record never leaves this file.
//
// The role is worked out HERE, from the email, every time. It is never
// saved in localStorage, so editing a saved user cannot "promote" it.
// (Anyone can still change their own email in DevTools, which is why
// this is a UI convenience and not real security.)
function toPublicUser(user) {
  const isAdminEmail = STORE_CONFIG.adminEmails.includes(user.email);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: isAdminEmail ? "admin" : "customer",
  };
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(loadUsers);
  const [sessionUserId, setSessionUserId] = useState(loadSessionUserId);

  // Save whenever they change.
  useEffect(() => {
    writeStorage(STORAGE_KEYS.users, users);
  }, [users]);

  useEffect(() => {
    writeStorage(
      STORAGE_KEYS.session,
      sessionUserId ? { userId: sessionUserId } : null,
    );
  }, [sessionUserId]);

  // Keep this tab in sync when ANOTHER tab registers, logs in, or logs out.
  useEffect(() => {
    const usersKey = fullKey(STORAGE_KEYS.users);
    const sessionKey = fullKey(STORAGE_KEYS.session);

    function handleStorageChange(event) {
      if (event.key === null || event.key === usersKey) setUsers(loadUsers());
      if (event.key === null || event.key === sessionKey) {
        setSessionUserId(loadSessionUserId());
      }
    }

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Derived: the logged-in user, or null. If the saved session points to a
  // user that no longer exists, nobody is logged in.
  const sessionUser = users.find((user) => user.id === sessionUserId);
  const currentUser = sessionUser ? toPublicUser(sessionUser) : null;

  // Creates an account and logs the new user in.
  // Returns { success: true } or { success: false, errors, message }.
  async function register(formValues) {
    const errors = validateRegistration(formValues);
    if (hasErrors(errors)) {
      return { success: false, errors };
    }

    // Read the freshest saved users (another tab may have just registered).
    const savedUsers = loadUsers();
    const email = normalizeEmail(formValues.email);

    if (savedUsers.some((user) => user.email === email)) {
      return {
        success: false,
        errors: { email: "An account with this email already exists." },
      };
    }

    try {
      const passwordRecord = await createPasswordRecord(formValues.password);

      const newUser = {
        id: generateId(),
        name: formValues.name.trim(),
        email,
        passwordRecord,
        createdAt: new Date().toISOString(),
      };

      setUsers([...savedUsers, newUser]);
      setSessionUserId(newUser.id);
      return { success: true };
    } catch (error) {
      console.error("Registration failed:", error);
      return {
        success: false,
        message: "Could not create the account. Please try again.",
      };
    }
  }

  // Returns { success: true } or { success: false, errors?, message? }.
  async function login(formValues) {
    const errors = validateLogin(formValues);
    if (hasErrors(errors)) {
      return { success: false, errors };
    }

    const email = normalizeEmail(formValues.email);
    const user = loadUsers().find((item) => item.email === email);

    if (!user) {
      return { success: false, message: LOGIN_FAILED_MESSAGE };
    }

    const passwordMatches = await verifyPassword(
      formValues.password,
      user.passwordRecord,
    );
    if (!passwordMatches) {
      return { success: false, message: LOGIN_FAILED_MESSAGE };
    }

    setUsers(loadUsers());
    setSessionUserId(user.id);
    return { success: true };
  }

  function logout() {
    setSessionUserId(null);
  }

  const value = {
    currentUser,
    isAuthenticated: currentUser !== null,
    isAdmin: currentUser !== null && currentUser.role === "admin",
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}
