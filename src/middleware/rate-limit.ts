/**
 * Rate Limiting Middleware
 * Consolidated rate limiting functionality
 */
import { NextRequest, NextResponse } from "next/server";
import { getClientIP } from "./utils";

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
}

// In-memory store (use Redis in production)
const rateLimitStore = new Map<
  string,
  { count: number; resetTime: number; requests: number[] }
>();

/**
 * Create a rate limiter with specified configuration
 */
export function createRateLimiter(config: RateLimitConfig) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const ip = getClientIP(request);
    const key = `${ip}:${request.nextUrl.pathname}`;
    const now = Date.now();

    // Clean up old entries
    if (rateLimitStore.size > 10000) {
      for (const [k, v] of rateLimitStore.entries()) {
        if (now > v.resetTime) {
          rateLimitStore.delete(k);
        }
      }
    }

    let windowData = rateLimitStore.get(key);

    if (!windowData || now > windowData.resetTime) {
      windowData = {
        count: 0,
        resetTime: now + config.windowMs,
        requests: [],
      };
      rateLimitStore.set(key, windowData);
    }

    // Filter requests within current window
    windowData.requests = windowData.requests.filter(
      time => time > now - config.windowMs
    );

    if (windowData.requests.length >= config.maxRequests) {
      const resetTimeSeconds = Math.ceil((windowData.resetTime - now) / 1000);

      return NextResponse.json(
        {
          success: false,
          message:
            config.message || "Too many requests, please try again later.",
          retryAfter: resetTimeSeconds,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": config.maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": windowData.resetTime.toString(),
            "Retry-After": resetTimeSeconds.toString(),
          },
        }
      );
    }

    windowData.requests.push(now);
    windowData.count = windowData.requests.length;

    return null; // Allow request to proceed
  };
}

// Predefined rate limiters for different endpoints
export const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per 15 minutes
  message: "Too many authentication attempts, please try again later.",
});

export const apiRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
  message: "API rate limit exceeded.",
});

export const strictRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute
  message: "Rate limit exceeded for sensitive operations.",
});

/**
 * Generic rate limiting function for middleware compatibility
 */
export function rateLimit(options: { windowMs: number; maxRequests: number }) {
  return (request: NextRequest): NextResponse | null => {
    const ip = getClientIP(request);
    const key = `rate_limit:${ip}`;
    const now = Date.now();

    const existing = rateLimitStore.get(key);

    if (!existing || now > existing.resetTime) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + options.windowMs,
        requests: [now],
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
    existing.requests.push(now);
    return null; // Allow request
  };
}
