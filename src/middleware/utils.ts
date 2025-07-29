/**
 * Core Utilities for Middleware
 * Centralized utility functions used across middleware
 */
import { NextRequest } from "next/server";

/**
 * Get client IP address from request headers
 * Centralized implementation to avoid duplication
 */
export function getClientIP(request: NextRequest): string {
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

/**
 * Simple hash generator for ETags and caching
 */
export function generateHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Input sanitization utility
 */
export function sanitizeInput(data: unknown): unknown {
  if (typeof data === "string") {
    return data
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove scripts
      .replace(/javascript:/gi, "") // Remove javascript: protocols
      .replace(/on\w+\s*=/gi, ""); // Remove event handlers
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeInput(item));
  }

  if (data && typeof data === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }

  return data;
}

/**
 * SQL injection prevention for search queries
 */
export function sanitizeSearchQuery(query: string): string {
  return query
    .replace(/['"`;\\]/g, "") // Remove dangerous characters
    .replace(
      /\b(union|select|insert|delete|update|drop|create|alter|exec|execute)\b/gi,
      ""
    ) // Remove SQL keywords
    .trim()
    .substring(0, 100); // Limit length
}

/**
 * Validate SQL input for additional security
 */
export function validateSQLInput(input: string): boolean {
  const sqlInjectionPatterns = [
    /(\s|^)(union|select|insert|delete|update|drop|create|alter|exec|execute)\s/i,
    /(\s|^)(script|javascript|vbscript|onload|onerror|onclick)/i,
    /(;|\||&|`|'|"|<|>|\*|\?|\[|\]|\{|\}|\$|\(|\))/,
    /(\s|^)(or|and)\s+\d+\s*=\s*\d+/i,
    /(\s|^)(or|and)\s+['"]\w+['"]?\s*=\s*['"]\w+['"]?/i,
  ];

  return !sqlInjectionPatterns.some(pattern => pattern.test(input));
}

/**
 * Password strength validation
 */
export function validatePasswordStrength(password: string): {
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

/**
 * Security headers for responses
 */
export function getSecurityHeaders() {
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

    // Remove server info
    "X-Powered-By": "",
  };
}
