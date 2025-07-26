"use client";

import { useState } from "react";
import {
  useErrorMonitoring,
  useComponentErrorLogger,
  usePerformanceErrorMonitoring,
} from "@/hooks/useErrorMonitoring";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Demo component that can trigger errors
function ErrorDemo() {
  const [errorType, setErrorType] = useState("");
  const { logError, getStats, getErrors } = useErrorMonitoring();
  const logComponentError = useComponentErrorLogger("ErrorDemo");

  // Initialize performance monitoring
  usePerformanceErrorMonitoring();

  const triggerError = (type: string) => {
    setErrorType(type);

    switch (type) {
      case "javascript":
        // Trigger a JavaScript error
        setTimeout(() => {
          throw new Error("Demo JavaScript error for testing");
        }, 100);
        break;

      case "promise":
        // Trigger an unhandled promise rejection
        Promise.reject(new Error("Demo promise rejection for testing"));
        break;

      case "network":
        // Trigger a network error
        fetch("/api/nonexistent-endpoint").catch(() => {}); // Silently handled, but logged by error monitor
        break;

      case "component":
        // Log a component error manually
        logComponentError(new Error("Demo component error"), {
          userAction: "button_click",
          componentState: { errorType },
        });
        break;

      case "critical":
        // Log a critical error
        logError({
          type: "javascript",
          message: "Demo critical error - system failure",
          severity: "critical",
          component: "ErrorDemo",
          context: {
            userAction: "critical_test",
            systemState: "degraded",
          },
        });
        break;

      case "react":
        // Trigger a React component error
        throw new Error("Demo React component error");

      default:
        console.log("Unknown error type");
    }
  };

  const stats = getStats();
  const recentErrors = getErrors({
    since: new Date(Date.now() - 60 * 60 * 1000),
  }); // Last hour

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <div className="rounded-lg bg-white p-6 shadow">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          Frontend Error Monitoring Demo
        </h1>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <button
            onClick={() => triggerError("javascript")}
            className="rounded bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
          >
            Trigger JS Error
          </button>

          <button
            onClick={() => triggerError("promise")}
            className="rounded bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-orange-700"
          >
            Trigger Promise Rejection
          </button>

          <button
            onClick={() => triggerError("network")}
            className="rounded bg-yellow-600 px-4 py-2 text-white transition-colors hover:bg-yellow-700"
          >
            Trigger Network Error
          </button>

          <button
            onClick={() => triggerError("component")}
            className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Log Component Error
          </button>

          <button
            onClick={() => triggerError("critical")}
            className="rounded bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
          >
            Trigger Critical Error
          </button>

          <ErrorBoundary
            fallback={
              <div className="rounded bg-gray-200 px-4 py-2 text-gray-700">
                Error caught by boundary
              </div>
            }
          >
            <button
              onClick={() => triggerError("react")}
              className="rounded bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700"
            >
              Trigger React Error
            </button>
          </ErrorBoundary>
        </div>
      </div>

      {/* Error Statistics */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Error Statistics
        </h2>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded bg-gray-50 p-4">
            <div className="text-2xl font-bold text-gray-900">
              {stats.total}
            </div>
            <div className="text-sm text-gray-600">Total Errors</div>
          </div>

          <div className="rounded bg-yellow-50 p-4">
            <div className="text-2xl font-bold text-yellow-800">
              {stats.recentCount}
            </div>
            <div className="text-sm text-yellow-600">Recent (1h)</div>
          </div>

          <div className="rounded bg-red-50 p-4">
            <div className="text-2xl font-bold text-red-800">
              {stats.criticalErrors}
            </div>
            <div className="text-sm text-red-600">Critical</div>
          </div>

          <div className="rounded bg-blue-50 p-4">
            <div className="text-2xl font-bold text-blue-800">
              {stats.sessionId.slice(-8)}
            </div>
            <div className="text-sm text-blue-600">Session</div>
          </div>
        </div>

        {/* Error breakdown by type */}
        <div className="mb-4">
          <h3 className="mb-2 text-lg font-medium text-gray-900">By Type</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.byType).map(([type, count]) => (
              <span
                key={type}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800"
              >
                {type}: {count}
              </span>
            ))}
          </div>
        </div>

        {/* Error breakdown by severity */}
        <div>
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            By Severity
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.bySeverity).map(([severity, count]) => (
              <span
                key={severity}
                className={`rounded-full px-3 py-1 text-sm ${
                  severity === "critical"
                    ? "bg-red-100 text-red-800"
                    : severity === "high"
                      ? "bg-orange-100 text-orange-800"
                      : severity === "medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                }`}
              >
                {severity}: {count}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Errors */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Recent Errors (Last Hour)
        </h2>

        {recentErrors.length === 0 ? (
          <p className="text-gray-500">No recent errors</p>
        ) : (
          <div className="space-y-3">
            {recentErrors.slice(0, 5).map(error => (
              <div
                key={error.id}
                className="rounded border border-gray-200 p-4"
              >
                <div className="mb-2 flex items-start justify-between">
                  <span
                    className={`rounded px-2 py-1 text-xs font-medium ${
                      error.severity === "critical"
                        ? "bg-red-100 text-red-800"
                        : error.severity === "high"
                          ? "bg-orange-100 text-orange-800"
                          : error.severity === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {error.severity}
                  </span>
                  <span className="text-xs text-gray-500">
                    {error.timestamp.toLocaleTimeString()}
                  </span>
                </div>

                <div className="text-sm">
                  <div className="font-medium text-gray-900">
                    {error.message}
                  </div>
                  <div className="mt-1 text-gray-600">
                    Type: {error.type} | Component: {error.component || "N/A"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ErrorMonitoringPage() {
  return (
    <ErrorBoundary>
      <ErrorDemo />
    </ErrorBoundary>
  );
}
