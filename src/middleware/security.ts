import { NextRequest, NextResponse } from "next/server";

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

export class SecurityMiddleware {
  // Rate limiting
  static rateLimit(options: RateLimitOptions) {
    return (request: NextRequest) => {
      const ip = this.getClientIP(request);
      const key = `rate_limit:${ip}`;
      const now = Date.now();

      const existing = rateLimitStore.get(key);

      if (!existing || now > existing.resetTime) {
        rateLimitStore.set(key, {
          count: 1,
          resetTime: now + options.windowMs,
        });
        return null; // Allow request
      }

      if (existing.count >= options.maxRequests) {
        return NextResponse.json(
          {
            success: false,
            message: "Rate limit exceeded. Too many requests.",
            retryAfter: Math.ceil((existing.resetTime - now) / 1000),
          },
          { status: 429 }
        );
      }

      existing.count++;
      return null; // Allow request
    };
  }

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

  // Input sanitization
  static sanitizeInput(data: unknown): unknown {
    if (typeof data === "string") {
      return data
        .trim()
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove scripts
        .replace(/javascript:/gi, "") // Remove javascript: protocols
        .replace(/on\w+\s*=/gi, ""); // Remove event handlers
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeInput(item));
    }

    if (data && typeof data === "object") {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeInput(value);
      }
      return sanitized;
    }

    return data;
  }

  // Security headers
  static getSecurityHeaders() {
    return {
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
        "font-src 'self'",
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
    };
  }

  // Get client IP address
  private static getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get("x-forwarded-for");
    const realIP = request.headers.get("x-real-ip");

    if (forwarded) {
      return forwarded.split(",")[0].trim();
    }

    if (realIP) {
      return realIP.trim();
    }

    return "unknown";
  }

  // SQL Injection prevention (additional layer)
  static validateSQLInput(input: string): boolean {
    const sqlInjectionPatterns = [
      /(\s|^)(union|select|insert|delete|update|drop|create|alter|exec|execute)\s/i,
      /(\s|^)(script|javascript|vbscript|onload|onerror|onclick)/i,
      /(;|\||&|`|'|"|<|>|\*|\?|\[|\]|\{|\}|\$|\(|\))/,
      /(\s|^)(or|and)\s+\d+\s*=\s*\d+/i,
      /(\s|^)(or|and)\s+['"]\w+['"]?\s*=\s*['"]\w+['"]?/i,
    ];

    return !sqlInjectionPatterns.some(pattern => pattern.test(input));
  }

  // Password strength validation
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 8) score += 1;
    else feedback.push("Password should be at least 8 characters long");

    if (password.length >= 12) score += 1;

    // Character diversity
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push("Include lowercase letters");

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push("Include uppercase letters");

    if (/\d/.test(password)) score += 1;
    else feedback.push("Include numbers");

    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
    else feedback.push("Include special characters");

    // Common password check
    const commonPasswords = [
      "password",
      "123456",
      "123456789",
      "qwerty",
      "abc123",
      "password123",
      "admin",
      "letmein",
      "welcome",
      "monkey",
    ];

    if (commonPasswords.includes(password.toLowerCase())) {
      score = 0;
      feedback.push("Avoid common passwords");
    }

    return {
      isValid: score >= 4,
      score: Math.min(score, 5),
      feedback,
    };
  }
}
