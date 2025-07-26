import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security Headers
  const securityHeaders = {
    // HTTPS redirect
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",

    // XSS Protection
    "X-XSS-Protection": "1; mode=block",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",

    // Content Security Policy
    "Content-Security-Policy": [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join("; "),

    // Referrer Policy
    "Referrer-Policy": "strict-origin-when-cross-origin",

    // Permissions Policy
    "Permissions-Policy": [
      "geolocation=()",
      "microphone=()",
      "camera=()",
      "payment=()",
      "usb=()",
      "magnetometer=()",
      "accelerometer=()",
      "gyroscope=()",
    ].join(", "),

    // Remove server info
    Server: "",
    "X-Powered-By": "",
  };

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Performance headers
  response.headers.set("X-DNS-Prefetch-Control", "on");

  // API routes specific handling
  if (request.nextUrl.pathname.startsWith("/api/")) {
    // CORS for API routes
    const origin = request.headers.get("origin");
    const allowedOrigins = [
      "http://localhost:3000",
      "https://localhost:3000",
      process.env.NEXTAUTH_URL || "",
    ].filter(Boolean);

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
    }

    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With"
    );
    response.headers.set("Access-Control-Max-Age", "86400");

    // Handle preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 200, headers: response.headers });
    }

    // Add API response time header
    const start = Date.now();
    response.headers.set("X-Response-Time-Start", start.toString());
  }

  // Static assets caching
  if (
    request.nextUrl.pathname.startsWith("/_next/static/") ||
    request.nextUrl.pathname.startsWith("/images/") ||
    request.nextUrl.pathname.startsWith("/icons/")
  ) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );
  }

  // Public assets caching
  if (
    request.nextUrl.pathname.match(
      /\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/
    )
  ) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=86400, stale-while-revalidate=604800"
    );
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: "/((?!_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
