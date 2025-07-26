import { useEffect, useState, useCallback, useMemo, useRef } from "react";

// Debounced value hook for performance optimization
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Throttled callback hook
export function useThrottle<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const lastCall = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        return callback(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(
          () => {
            lastCall.current = Date.now();
            callback(...args);
          },
          delay - (now - lastCall.current)
        );
      }
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
}

// Virtual scrolling hook for large lists
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );

  const visibleItems = useMemo(
    () => items.slice(visibleStart, visibleEnd),
    [items, visibleStart, visibleEnd]
  );

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStart * itemHeight;

  const handleScroll = useCallback((event: React.UIEvent<HTMLElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    visibleStart,
    visibleEnd,
  };
}

// Image lazy loading hook
export function useLazyImage(src: string, threshold: number = 0.1) {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  useEffect(() => {
    if (isInView && src) {
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
      };
      img.src = src;
    }
  }, [isInView, src]);

  return { imgRef, imageSrc, isLoaded, isInView };
}

// Memory usage monitoring
export function useMemoryMonitoring() {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null>(null);

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ("memory" in performance) {
        const memory = (
          performance as unknown as {
            memory: {
              usedJSHeapSize: number;
              totalJSHeapSize: number;
              jsHeapSizeLimit: number;
            };
          }
        ).memory;
        setMemoryInfo({
          usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1024 / 1024),
          totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1024 / 1024),
          jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
        });
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
}

// Bundle size monitoring
export function useBundleMetrics() {
  const [metrics, setMetrics] = useState<{
    bundleSize: number;
    loadTime: number;
    renderTime: number;
  } | null>(null);

  useEffect(() => {
    // Get bundle size from Resource Timing API
    const resources = performance.getEntriesByType(
      "resource"
    ) as PerformanceResourceTiming[];
    const bundleResources = resources.filter(
      resource =>
        resource.name.includes("_next/static/chunks/") ||
        resource.name.includes(".js") ||
        resource.name.includes(".css")
    );

    const totalSize = bundleResources.reduce(
      (total, resource) => total + (resource.transferSize || 0),
      0
    );

    // Get navigation timing
    const navigation = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming;

    setMetrics({
      bundleSize: Math.round(totalSize / 1024), // KB
      loadTime: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
      renderTime: Math.round(
        navigation.domContentLoadedEventEnd -
          navigation.domContentLoadedEventStart
      ),
    });
  }, []);

  return metrics;
}

// Cache hook for expensive computations
export function useCache<T>(
  key: string,
  computation: () => T,
  deps: React.DependencyList
): T {
  const cache = useRef<Map<string, T>>(new Map());

  return useMemo(() => {
    const cacheKey = `${key}-${JSON.stringify(deps)}`;

    if (cache.current.has(cacheKey)) {
      return cache.current.get(cacheKey)!;
    }

    const result = computation();
    cache.current.set(cacheKey, result);

    // Limit cache size
    if (cache.current.size > 100) {
      const firstKey = cache.current.keys().next().value;
      if (firstKey) {
        cache.current.delete(firstKey);
      }
    }

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, computation, ...deps]);
}

// Optimized API calls with caching and deduplication
export function useOptimizedAPI<T>(
  url: string,
  options: RequestInit = {},
  cacheTime: number = 5 * 60 * 1000 // 5 minutes
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cache = useRef<Map<string, { data: T; timestamp: number }>>(new Map());
  const pendingRequests = useRef<Map<string, Promise<T>>>(new Map());

  const fetchData = useCallback(async () => {
    const cacheKey = `${url}-${JSON.stringify(options)}`;
    const now = Date.now();

    // Check cache
    const cached = cache.current.get(cacheKey);
    if (cached && now - cached.timestamp < cacheTime) {
      setData(cached.data);
      return cached.data;
    }

    // Check pending requests (deduplication)
    const pending = pendingRequests.current.get(cacheKey);
    if (pending) {
      return pending;
    }

    setLoading(true);
    setError(null);

    const request = fetch(url, options)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      })
      .then((result: T) => {
        cache.current.set(cacheKey, { data: result, timestamp: now });
        setData(result);
        setError(null);
        return result;
      })
      .catch(err => {
        setError(err.message);
        throw err;
      })
      .finally(() => {
        setLoading(false);
        pendingRequests.current.delete(cacheKey);
      });

    pendingRequests.current.set(cacheKey, request);
    return request;
  }, [url, options, cacheTime]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    const cacheKey = `${url}-${JSON.stringify(options)}`;
    cache.current.delete(cacheKey);
    return fetchData();
  }, [url, options, fetchData]);

  return { data, loading, error, refetch };
}

// Component render optimization
export function useRenderOptimization(componentName: string) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;

    if (process.env.NODE_ENV === "development") {
      console.log(
        `[RENDER] ${componentName}: #${renderCount.current}, ${timeSinceLastRender}ms since last render`
      );
    }

    lastRenderTime.current = now;
  });

  return {
    renderCount: renderCount.current,
    resetCount: () => {
      renderCount.current = 0;
    },
  };
}

// Resource preloading
export function useResourcePreloader() {
  const preloadedResources = useRef<Set<string>>(new Set());

  const preloadImage = useCallback((src: string) => {
    if (!preloadedResources.current.has(src)) {
      const img = new Image();
      img.src = src;
      preloadedResources.current.add(src);
    }
  }, []);

  const preloadScript = useCallback((src: string) => {
    if (!preloadedResources.current.has(src)) {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "script";
      link.href = src;
      document.head.appendChild(link);
      preloadedResources.current.add(src);
    }
  }, []);

  const preloadStylesheet = useCallback((href: string) => {
    if (!preloadedResources.current.has(href)) {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "style";
      link.href = href;
      document.head.appendChild(link);
      preloadedResources.current.add(href);
    }
  }, []);

  return { preloadImage, preloadScript, preloadStylesheet };
}
