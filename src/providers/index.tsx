"use client";

import React, { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";

// Lazy load heavy components
const Toaster = React.lazy(() =>
  import("sonner").then(module => ({ default: module.Toaster }))
);

const ErrorMonitoringProvider = React.lazy(() =>
  import("@/components/ErrorMonitoringProvider").then(module => ({
    default: module.ErrorMonitoringProvider,
  }))
);

// Create a client with optimized defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && "status" in error) {
          const status = (error as Error & { status: number }).status;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: 1,
    },
  },
});

interface ProvidersProps {
  children: React.ReactNode;
}

// Loading component for lazy loaded providers
const ProviderSkeleton = () => <div className="bg-background min-h-screen" />;

export function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<ProviderSkeleton />}>
        <ErrorMonitoringProvider>
          <AuthProvider>
            <QueryClientProvider client={queryClient}>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                {children}
                <Suspense fallback={null}>
                  <Toaster richColors position="top-right" />
                </Suspense>
              </ThemeProvider>
            </QueryClientProvider>
          </AuthProvider>
        </ErrorMonitoringProvider>
      </Suspense>
    </ErrorBoundary>
  );
}
