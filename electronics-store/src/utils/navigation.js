// Works out where to send a visitor after they log in or register.
//
// Route guards (Step 7) redirect logged-out visitors to /login and save the
// page they wanted in location.state.from. After logging in we send them back.
//
// Only paths inside this site are allowed ("/cart", not "//evil.com" or
// "https://evil.com"). Without this check, a crafted link could send someone
// to another website right after they log in (an "open redirect").
export function getSafeRedirect(location, fallback = '/') {
  const from = location?.state?.from?.pathname

  if (typeof from === 'string' && from.startsWith('/') && !from.startsWith('//')) {
    return from
  }
  return fallback
}