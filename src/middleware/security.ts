/**
 * Security Middleware
 * Handles CSRF protection, security headers, and other security measures
 */
import { NextRequest, NextResponse } from "next/server";
import {
  getClientIP,
  sanitizeInput,
  validatePasswordStrength,
  getSecurityHeaders,
  validateSQLInput,
} from "./utils";

export class SecurityMiddleware {
  // CSRF Protection
  static csrfProtection(request: NextRequest) {
    const method = request.method;

    // Skip CSRF for safe methods
    if (["GET", "HEAD", "OPTIONS"].includes(method)) {
      return null;
    }

    const origin = request.headers.get("origin");

    // Check origin for same-origin policy
    const allowedOrigins = [
      process.env.NEXTAUTH_URL || "http://localhost:3000",
      "http://localhost:3000",
      "https://localhost:3000",
    ];

    if (origin && !allowedOrigins.includes(origin)) {
      return NextResponse.json(
        { success: false, message: "Invalid origin" },
        { status: 403 }
      );
    }

    return null;
  }

  // Apply security headers to response
  static applySecurityHeaders(response: NextResponse): NextResponse {
    const headers = getSecurityHeaders();

    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  }

  // Comprehensive security validation
  static validateRequest(request: NextRequest): NextResponse | null {
    // CSRF Protection
    const csrfResult = this.csrfProtection(request);
    if (csrfResult) return csrfResult;

    // Additional security checks can be added here
    return null;
  }
}

// Re-export commonly used functions from utils for convenience
export {
  sanitizeInput,
  validatePasswordStrength,
  getClientIP,
  getSecurityHeaders,
  validateSQLInput,
};
