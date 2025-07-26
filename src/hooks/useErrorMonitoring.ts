import { useEffect, useCallback, useRef } from "react";

// Extended type definitions for browser APIs
interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface NetworkInformation {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
  sources: Array<{
    node?: Node;
    previousRect: DOMRectReadOnly;
    currentRect: DOMRectReadOnly;
  }>;
}

declare global {
  interface Performance {
    memory?: PerformanceMemory;
  }

  interface Navigator {
    connection?: NetworkInformation;
  }
}

export interface FrontendError {
  id: string;
  type: "javascript" | "promise" | "network" | "component" | "performance";
  message: string;
  stack?: string;
  timestamp: Date;
  url: string;
  userAgent: string;
  userId?: string;
  sessionId: string;
  component?: string;
  props?: Record<string, unknown>;
  severity: "low" | "medium" | "high" | "critical";
  context: Record<string, unknown>;
}

class FrontendErrorLogger {
  private static instance: FrontendErrorLogger;
  private errors: FrontendError[] = [];
  private maxErrors = 100;
  private isOnline = true;
  private retryQueue: FrontendError[] = [];
  private sessionId: string;
  private userId?: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupGlobalErrorHandlers();
    this.setupOnlineStatusTracking();
  }

  static getInstance(): FrontendErrorLogger {
    if (!FrontendErrorLogger.instance) {
      FrontendErrorLogger.instance = new FrontendErrorLogger();
    }
    return FrontendErrorLogger.instance;
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupGlobalErrorHandlers() {
    // JavaScript errors
    window.addEventListener("error", event => {
      this.logError({
        type: "javascript",
        message: event.message,
        stack: event.error?.stack,
        severity: "high",
        context: {
          ...this.getBaseContext(),
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // Unhandled promise rejections
    window.addEventListener("unhandledrejection", event => {
      this.logError({
        type: "promise",
        message: event.reason?.message || "Unhandled promise rejection",
        stack: event.reason?.stack,
        severity: "high",
        context: {
          ...this.getBaseContext(),
          reason: event.reason,
        },
      });
    });

    // Network errors (fetch failures)
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);

        if (!response.ok) {
          this.logError({
            type: "network",
            message: `HTTP ${response.status}: ${response.statusText}`,
            severity: response.status >= 500 ? "high" : "medium",
            context: {
              ...this.getBaseContext(),
              url: args[0]?.toString(),
              status: response.status,
              method: args[1]?.method || "GET",
            },
          });
        }

        return response;
      } catch (error) {
        this.logError({
          type: "network",
          message: `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
          stack: error instanceof Error ? error.stack : undefined,
          severity: "high",
          context: {
            ...this.getBaseContext(),
            url: args[0]?.toString(),
            method: args[1]?.method || "GET",
          },
        });
        throw error;
      }
    };
  }

  private setupOnlineStatusTracking() {
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.flushRetryQueue();
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
    });
  }

  private getBaseContext(): Record<string, unknown> {
    const context: Record<string, unknown> = {
      route: window.location.pathname,
      referrer: document.referrer,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };

    // Add memory info if available
    if (performance.memory) {
      const memory = performance.memory;
      context.memory = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
      };
    }

    // Add connection info if available
    if (navigator.connection) {
      const connection = navigator.connection;
      context.connection = {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
      };
    }

    return context;
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  logError(error: Partial<FrontendError>) {
    const fullError: FrontendError = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: error.type || "javascript",
      message: error.message || "Unknown error",
      stack: error.stack,
      timestamp: new Date(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: this.userId,
      sessionId: this.sessionId,
      component: error.component,
      props: error.props,
      severity: error.severity || "medium",
      context: {
        ...this.getBaseContext(),
        ...error.context,
      },
    };

    this.errors.push(fullError);

    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("[FRONTEND ERROR]", fullError);
    }

    // Send to backend if online
    if (this.isOnline) {
      this.sendToBackend(fullError);
    } else {
      this.retryQueue.push(fullError);
    }

    // Trigger alert for critical errors
    if (fullError.severity === "critical") {
      this.alertCriticalError();
    }
  }

  private async sendToBackend(error: FrontendError) {
    try {
      await fetch("/api/monitoring/frontend-errors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(error),
      });
    } catch (sendError) {
      // If sending fails, add to retry queue
      this.retryQueue.push(error);
      console.warn("Failed to send error to backend:", sendError);
    }
  }

  private async flushRetryQueue() {
    const queue = [...this.retryQueue];
    this.retryQueue = [];

    for (const error of queue) {
      try {
        await this.sendToBackend(error);
      } catch {
        // If still failing, add back to queue (but limit retry attempts)
        const retryCount = (error.context.retryCount as number) || 0;
        if (retryCount < 3) {
          error.context.retryCount = retryCount + 1;
          this.retryQueue.push(error);
        }
      }
    }
  }

  private alertCriticalError() {
    // Could show user-friendly error boundary or notification
    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification("Application Error", {
            body: "A critical error occurred. Please refresh the page.",
            icon: "/favicon.ico",
          });
        }
      });
    }
  }

  getErrors(filter?: {
    type?: FrontendError["type"];
    severity?: FrontendError["severity"];
    since?: Date;
  }) {
    let filtered = this.errors;

    if (filter?.type) {
      filtered = filtered.filter(e => e.type === filter.type);
    }

    if (filter?.severity) {
      filtered = filtered.filter(e => e.severity === filter.severity);
    }

    if (filter?.since) {
      filtered = filtered.filter(e => e.timestamp >= filter.since!);
    }

    return filtered.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  getStats() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const recentErrors = this.getErrors({ since: oneHourAgo });

    return {
      total: this.errors.length,
      recentCount: recentErrors.length,
      byType: this.groupBy(recentErrors, "type"),
      bySeverity: this.groupBy(recentErrors, "severity"),
      criticalErrors: recentErrors.filter(e => e.severity === "critical")
        .length,
      sessionId: this.sessionId,
      userId: this.userId,
    };
  }

  private groupBy<T, K extends keyof T>(
    array: T[],
    key: K
  ): Record<string, number> {
    return array.reduce(
      (groups, item) => {
        const group = String(item[key]);
        groups[group] = (groups[group] || 0) + 1;
        return groups;
      },
      {} as Record<string, number>
    );
  }

  clearErrors() {
    this.errors = [];
    this.retryQueue = [];
  }
}

// React hooks for error monitoring
export function useErrorMonitoring() {
  const logger = FrontendErrorLogger.getInstance();

  const logError = useCallback(
    (error: Partial<FrontendError>) => {
      logger.logError(error);
    },
    [logger]
  );

  const getErrors = useCallback(
    (filter?: Parameters<typeof logger.getErrors>[0]) => {
      return logger.getErrors(filter);
    },
    [logger]
  );

  const getStats = useCallback(() => {
    return logger.getStats();
  }, [logger]);

  return {
    logError,
    getErrors,
    getStats,
    clearErrors: logger.clearErrors.bind(logger),
  };
}

// React Error Boundary Hook
export function useErrorBoundary() {
  const { logError } = useErrorMonitoring();

  useEffect(() => {
    // This would be used in an Error Boundary component
    // The actual error boundary would call logError in componentDidCatch
    return () => {};
  }, [logError]);

  const logComponentError = useCallback(
    (error: Error, errorInfo: { componentStack: string }) => {
      logError({
        type: "component",
        message: error.message,
        stack: error.stack,
        severity: "high",
        context: {
          componentStack: errorInfo.componentStack,
        },
      });
    },
    [logError]
  );

  return { logComponentError };
}

// Performance error monitoring
export function usePerformanceErrorMonitoring() {
  const { logError } = useErrorMonitoring();

  useEffect(() => {
    const observer = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        // Log long tasks (over 50ms)
        if (entry.entryType === "longtask" && entry.duration > 50) {
          logError({
            type: "performance",
            message: `Long task detected: ${entry.duration}ms`,
            severity: entry.duration > 100 ? "high" : "medium",
            context: {
              duration: entry.duration,
              startTime: entry.startTime,
            },
          });
        }

        // Log layout shifts
        if (entry.entryType === "layout-shift") {
          const layoutEntry = entry as LayoutShiftEntry;
          if (layoutEntry.value > 0.1) {
            logError({
              type: "performance",
              message: `Layout shift detected: ${layoutEntry.value}`,
              severity: layoutEntry.value > 0.25 ? "high" : "medium",
              context: {
                value: layoutEntry.value,
                hadRecentInput: layoutEntry.hadRecentInput,
              },
            });
          }
        }
      }
    });

    try {
      observer.observe({ entryTypes: ["longtask", "layout-shift"] });
    } catch (e) {
      // Some browsers might not support these entry types
      console.warn("Performance observer not fully supported:", e);
    }

    return () => observer.disconnect();
  }, [logError]);
}

// Hook for component-specific error logging
export function useComponentErrorLogger(componentName: string) {
  const { logError } = useErrorMonitoring();
  const componentRef = useRef(componentName);

  const logComponentError = useCallback(
    (error: Error | string, props?: Record<string, unknown>) => {
      logError({
        type: "component",
        message: typeof error === "string" ? error : error.message,
        stack: typeof error === "string" ? undefined : error.stack,
        component: componentRef.current,
        props,
        severity: "medium",
      });
    },
    [logError]
  );

  return logComponentError;
}

export const frontendErrorLogger = FrontendErrorLogger.getInstance();
