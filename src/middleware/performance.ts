import { NextRequest, NextResponse } from "next/server";

export class PerformanceMiddleware {
  // Response compression middleware
  static compression() {
    return (response: NextResponse) => {
      // Enable gzip compression for responses > 1KB
      const contentLength = response.headers.get("content-length");
      if (contentLength && parseInt(contentLength) > 1024) {
        response.headers.set("Content-Encoding", "gzip");
      }

      return response;
    };
  }

  // Cache control headers
  static cacheControl(
    options: {
      maxAge?: number;
      sMaxAge?: number;
      staleWhileRevalidate?: number;
      private?: boolean;
      noCache?: boolean;
    } = {}
  ) {
    return (response: NextResponse) => {
      const {
        maxAge = 3600,
        sMaxAge,
        staleWhileRevalidate = 86400,
        private: isPrivate = false,
        noCache = false,
      } = options;

      if (noCache) {
        response.headers.set(
          "Cache-Control",
          "no-cache, no-store, must-revalidate"
        );
        response.headers.set("Pragma", "no-cache");
        response.headers.set("Expires", "0");
      } else {
        const cacheDirectives = [
          isPrivate ? "private" : "public",
          `max-age=${maxAge}`,
          sMaxAge ? `s-maxage=${sMaxAge}` : "",
          `stale-while-revalidate=${staleWhileRevalidate}`,
        ].filter(Boolean);

        response.headers.set("Cache-Control", cacheDirectives.join(", "));
      }

      return response;
    };
  }

  // ETags for caching
  static etag(content: string) {
    const hash = this.generateHash(content);
    return `"${hash}"`;
  }

  // Check if content is modified
  static isNotModified(request: NextRequest, etag: string): boolean {
    const ifNoneMatch = request.headers.get("if-none-match");
    return ifNoneMatch === etag;
  }

  // Response optimization
  static optimizeResponse(response: NextResponse): NextResponse {
    // Remove unnecessary headers
    response.headers.delete("x-powered-by");

    // Add performance headers
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-DNS-Prefetch-Control", "on");

    // Add preload hints for critical resources
    response.headers.set(
      "Link",
      "</styles/critical.css>; rel=preload; as=style, </scripts/critical.js>; rel=preload; as=script"
    );

    return response;
  }

  // Database query optimization helpers
  static optimizeQuery<T>(
    query: () => Promise<T>,
    cacheKey: string,
    ttl: number = 300 // 5 minutes default
  ): Promise<T> {
    return this.withCache(cacheKey, query, ttl);
  }

  // Simple in-memory cache (use Redis in production)
  private static cache = new Map<string, { data: unknown; expires: number }>();

  private static async withCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number
  ): Promise<T> {
    const now = Date.now();
    const cached = this.cache.get(key);

    if (cached && now < cached.expires) {
      return cached.data as T;
    }

    const data = await fetcher();
    this.cache.set(key, {
      data,
      expires: now + ttl * 1000,
    });

    // Clean up expired entries periodically
    if (this.cache.size > 1000) {
      for (const [k, v] of this.cache.entries()) {
        if (now > v.expires) {
          this.cache.delete(k);
        }
      }
    }

    return data;
  }

  // Generate simple hash for ETags
  private static generateHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Response size optimization
  static minifyJSON(obj: Record<string, unknown>): string {
    return JSON.stringify(obj, (key, value) => {
      // Remove null values and empty arrays/objects to reduce payload size
      if (value === null || value === undefined) return undefined;
      if (Array.isArray(value) && value.length === 0) return undefined;
      if (typeof value === "object" && Object.keys(value).length === 0)
        return undefined;
      return value;
    });
  }

  // Pagination optimization
  static paginationParams(request: NextRequest): {
    page: number;
    limit: number;
    offset: number;
  } {
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(url.searchParams.get("limit") || "10", 10))
    );
    const offset = (page - 1) * limit;

    return { page, limit, offset };
  }

  // Database connection optimization
  static async withTransaction<T>(
    operation: (prisma: unknown) => Promise<T>
  ): Promise<T> {
    const { prisma } = await import("@/lib/database/prisma");

    return prisma.$transaction(
      async (tx: unknown) => {
        return operation(tx);
      },
      {
        maxWait: 5000, // 5 seconds
        timeout: 10000, // 10 seconds
        isolationLevel: "ReadCommitted",
      }
    );
  }

  // Memory usage monitoring
  static getMemoryUsage(): {
    used: number;
    total: number;
    percentage: number;
  } {
    const usage = process.memoryUsage();
    const used = usage.heapUsed / 1024 / 1024; // MB
    const total = usage.heapTotal / 1024 / 1024; // MB

    return {
      used: Math.round(used * 100) / 100,
      total: Math.round(total * 100) / 100,
      percentage: Math.round((used / total) * 100),
    };
  }

  // Request timing
  static timing() {
    const start = Date.now();

    return {
      end: () => Date.now() - start,
      addToResponse: (response: NextResponse) => {
        const duration = Date.now() - start;
        response.headers.set("X-Response-Time", `${duration}ms`);
        return response;
      },
    };
  }
}
