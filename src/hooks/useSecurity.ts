import { useEffect, useState } from "react";

// Custom hook for secure input handling
export function useSecureInput(initialValue: string = "") {
  const [value, setValue] = useState(initialValue);
  const [isDirty, setIsDirty] = useState(false);
  const [sanitizedValue, setSanitizedValue] = useState(initialValue);

  const sanitizeInput = (input: string): string => {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove scripts
      .replace(/javascript:/gi, "") // Remove javascript: protocols
      .replace(/on\w+\s*=/gi, "") // Remove event handlers
      .trim();
  };

  const handleChange = (newValue: string) => {
    setIsDirty(true);
    setValue(newValue);
    setSanitizedValue(sanitizeInput(newValue));
  };

  return {
    value,
    sanitizedValue,
    isDirty,
    onChange: handleChange,
    reset: () => {
      setValue(initialValue);
      setSanitizedValue(initialValue);
      setIsDirty(false);
    },
  };
}

// CSRF Token hook
export function useCSRFToken() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Generate CSRF token
    const generateToken = () => {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, "0")).join(
        ""
      );
    };

    const csrfToken = generateToken();
    setToken(csrfToken);

    // Store in session storage for API calls
    sessionStorage.setItem("csrf-token", csrfToken);
  }, []);

  return token;
}

// Content Security Policy violation handler
export function setupCSPViolationHandler() {
  if (typeof window !== "undefined") {
    const handleCSPViolation = (event: SecurityPolicyViolationEvent) => {
      console.warn("CSP Violation:", event);

      // Report to monitoring service
      fetch("/api/security/csp-violation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blockedURI: event.blockedURI,
          documentURI: event.documentURI,
          effectiveDirective: event.effectiveDirective,
          originalPolicy: event.originalPolicy,
          violatedDirective: event.violatedDirective,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {
        // Ignore errors to prevent infinite loops
      });
    };

    document.addEventListener("securitypolicyviolation", handleCSPViolation);

    return () => {
      document.removeEventListener(
        "securitypolicyviolation",
        handleCSPViolation
      );
    };
  }
}

// Secure API client with built-in security features
export class SecureAPIClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string = "/api") {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
  }

  private getHeaders(): Record<string, string> {
    const headers = { ...this.defaultHeaders };

    // Add CSRF token
    const csrfToken = sessionStorage.getItem("csrf-token");
    if (csrfToken) {
      headers["X-CSRF-Token"] = csrfToken;
    }

    // Add auth token
    const authToken =
      localStorage.getItem("auth-token") ||
      sessionStorage.getItem("auth-token");
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        throw new Error(`Rate limited. Retry after ${retryAfter} seconds.`);
      }

      // Handle unauthorized
      if (response.status === 401) {
        // Clear stored tokens
        localStorage.removeItem("auth-token");
        sessionStorage.removeItem("auth-token");
        window.location.href = "/login";
        throw new Error("Unauthorized");
      }

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error("API Request failed:", error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

// Secure storage utilities
export class SecureStorage {
  private static encrypt(data: string): string {
    // Simple encryption for demo - use proper encryption in production
    return btoa(data);
  }

  private static decrypt(data: string): string {
    try {
      return atob(data);
    } catch {
      return "";
    }
  }

  static setItem(key: string, value: string, secure: boolean = false): void {
    const storage = secure ? sessionStorage : localStorage;
    const data = secure ? this.encrypt(value) : value;
    storage.setItem(key, data);
  }

  static getItem(key: string, secure: boolean = false): string | null {
    const storage = secure ? sessionStorage : localStorage;
    const data = storage.getItem(key);

    if (!data) return null;

    return secure ? this.decrypt(data) : data;
  }

  static removeItem(key: string): void {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }

  static clear(): void {
    localStorage.clear();
    sessionStorage.clear();
  }
}

// XSS Prevention utilities
export const XSSPrevent = {
  sanitizeHTML(html: string): string {
    const div = document.createElement("div");
    div.textContent = html;
    return div.innerHTML;
  },

  escapeHTML(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  },

  validateURL(url: string): boolean {
    try {
      const parsed = new URL(url);
      return ["http:", "https:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  },

  sanitizeProps(props: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(props)) {
      if (typeof value === "string") {
        sanitized[key] = this.escapeHTML(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  },
};

// Performance monitoring hook
export function usePerformanceMonitoring() {
  useEffect(() => {
    // Monitor page load performance
    const observer = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === "navigation") {
          const navigation = entry as PerformanceNavigationTiming;

          // Send performance metrics
          fetch("/api/monitoring/performance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              loadTime: navigation.loadEventEnd - navigation.loadEventStart,
              domContentLoaded:
                navigation.domContentLoadedEventEnd -
                navigation.domContentLoadedEventStart,
              firstPaint: navigation.responseEnd - navigation.requestStart,
              url: window.location.href,
              timestamp: new Date().toISOString(),
            }),
          }).catch(() => {
            // Ignore errors
          });
        }
      }
    });

    observer.observe({ entryTypes: ["navigation"] });

    return () => observer.disconnect();
  }, []);
}

// Export the secure API client instance
export const apiClient = new SecureAPIClient();
