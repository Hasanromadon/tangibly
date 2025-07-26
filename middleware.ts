// Middleware for other features (auth, security, etc.)
// No i18n routing since we're using localStorage for locale

export const config = {
  // Match all routes except static files
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
