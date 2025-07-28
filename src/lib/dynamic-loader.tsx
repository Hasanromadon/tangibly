import React, { lazy, ComponentType, Suspense } from "react";

// Props type for components
type ComponentProps = Record<string, unknown>;

// Dynamic loading utility for heavy components
export const createDynamicComponent = <
  P extends ComponentProps = ComponentProps,
>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  fallback?: ComponentType<P>
) => {
  const DynamicComponent = lazy(importFn);

  if (fallback) {
    const WrappedComponent = (props: P) => (
      <Suspense fallback={React.createElement(fallback, props)}>
        <DynamicComponent {...props} />
      </Suspense>
    );
    WrappedComponent.displayName = "DynamicComponentWithFallback";
    return WrappedComponent;
  }

  return DynamicComponent;
};

// Common loading components
export const LoadingSkeleton = ({ className = "" }: { className?: string }) => (
  <div className={`bg-muted animate-pulse rounded ${className}`} />
);

export const LoadingSpinner = ({ size = 20 }: { size?: number }) => (
  <div
    className="animate-spin rounded-full border-2 border-current border-t-transparent"
    style={{ width: size, height: size }}
  />
);

export const LoadingButton = () => (
  <div className="bg-muted h-10 w-24 animate-pulse rounded" />
);

export const LoadingCard = () => (
  <div className="space-y-3 p-4">
    <LoadingSkeleton className="h-4 w-3/4" />
    <LoadingSkeleton className="h-4 w-1/2" />
    <LoadingSkeleton className="h-8 w-1/4" />
  </div>
);

// Example usage - actual components should be created when they exist
// export const DynamicChart = createDynamicComponent(
//   () => import("@/components/charts/Chart"),
//   LoadingCard
// );

// Helper for creating lazy loaded page components
export const createLazyPage = <P extends ComponentProps = ComponentProps>(
  importFn: () => Promise<{ default: ComponentType<P> }>
) => {
  const LazyPage = lazy(importFn);

  const WrappedPage = (props: P) => (
    <Suspense fallback={<LoadingCard />}>
      <LazyPage {...props} />
    </Suspense>
  );

  WrappedPage.displayName = "LazyPage";
  return WrappedPage;
};
