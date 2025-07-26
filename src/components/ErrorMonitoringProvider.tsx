"use client";

import { useEffect } from "react";
import { frontendErrorLogger } from "@/hooks/useErrorMonitoring";

export function ErrorMonitoringProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Initialize the error monitoring system
    // The singleton instance is automatically created when imported

    // Set user ID if available (from auth context, localStorage, etc.)
    const userId = localStorage.getItem("userId");
    if (userId) {
      frontendErrorLogger.setUserId(userId);
    }

    // Log initialization
    if (process.env.NODE_ENV === "development") {
      console.log("🔍 Frontend error monitoring initialized");
    }
  }, []);

  return <>{children}</>;
}
