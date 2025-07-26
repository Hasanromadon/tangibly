import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ApiError,
  QueryOptions,
  FilterOptions,
  SortOptions,
  PaginationOptions,
  PaginatedResponse,
} from "@/types/common";
import { useState, useCallback } from "react";

// Standard query configuration
export const DEFAULT_QUERY_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
  refetchOnWindowFocus: false,
  retry: 3,
};

// Query key factory for consistent cache management
export class QueryKeys {
  static readonly auth = {
    all: ["auth"] as const,
    me: () => [...QueryKeys.auth.all, "me"] as const,
    verify: (token: string) =>
      [...QueryKeys.auth.all, "verify", token] as const,
  };

  static readonly users = {
    all: ["users"] as const,
    lists: () => [...QueryKeys.users.all, "list"] as const,
    list: (options?: QueryOptions) =>
      [...QueryKeys.users.lists(), options] as const,
    details: () => [...QueryKeys.users.all, "detail"] as const,
    detail: (id: string) => [...QueryKeys.users.details(), id] as const,
  };

  static readonly companies = {
    all: ["companies"] as const,
    lists: () => [...QueryKeys.companies.all, "list"] as const,
    list: (options?: QueryOptions) =>
      [...QueryKeys.companies.lists(), options] as const,
    details: () => [...QueryKeys.companies.all, "detail"] as const,
    detail: (id: string) => [...QueryKeys.companies.details(), id] as const,
  };

  static readonly assets = {
    all: ["assets"] as const,
    lists: () => [...QueryKeys.assets.all, "list"] as const,
    list: (options?: QueryOptions) =>
      [...QueryKeys.assets.lists(), options] as const,
    details: () => [...QueryKeys.assets.all, "detail"] as const,
    detail: (id: string) => [...QueryKeys.assets.details(), id] as const,
    categories: () => [...QueryKeys.assets.all, "categories"] as const,
    locations: () => [...QueryKeys.assets.all, "locations"] as const,
  };

  static readonly invitations = {
    all: ["invitations"] as const,
    lists: () => [...QueryKeys.invitations.all, "list"] as const,
    list: (options?: QueryOptions) =>
      [...QueryKeys.invitations.lists(), options] as const,
    verify: (token: string) =>
      [...QueryKeys.invitations.all, "verify", token] as const,
  };
}

// Base query hook
export function useBaseQuery<T>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<T>,
  options?: Omit<UseQueryOptions<T, ApiError>, "queryKey" | "queryFn">
) {
  return useQuery<T, ApiError>({
    queryKey,
    queryFn,
    ...DEFAULT_QUERY_CONFIG,
    ...options,
  });
}

// Base mutation hook with standard error handling
export function useBaseMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: ApiError, variables: TVariables) => void;
    successMessage?: string;
    errorMessage?: string;
    invalidateQueries?: readonly unknown[][];
    redirectTo?: string;
  } & Omit<UseMutationOptions<TData, ApiError, TVariables>, "mutationFn">
) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<TData, ApiError, TVariables>({
    mutationFn,
    onSuccess: (data, variables) => {
      // Show success message
      if (options?.successMessage) {
        toast.success(options.successMessage);
      }

      // Invalidate specified queries
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
      }

      // Redirect if specified
      if (options?.redirectTo) {
        router.push(options.redirectTo);
      }

      // Call custom success handler
      options?.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      // Show error message
      const errorMessage =
        options?.errorMessage || error.message || "An error occurred";
      toast.error(errorMessage);

      // Call custom error handler
      options?.onError?.(error, variables);
    },
    ...options,
  });
}

// Base list query hook for paginated data
export function useBaseList<T>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<PaginatedResponse<T>>,
  options?: QueryOptions &
    Omit<
      UseQueryOptions<PaginatedResponse<T>, ApiError>,
      "queryKey" | "queryFn"
    >
) {
  return useQuery<PaginatedResponse<T>, ApiError>({
    queryKey,
    queryFn,
    ...DEFAULT_QUERY_CONFIG,
    ...options,
  });
}

// List management hook with filtering, sorting, and pagination
export function useListState(initialFilters?: FilterOptions) {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters || {});
  const [sort, setSort] = useState<SortOptions>({
    field: "createdAt",
    direction: "desc",
  });
  const [pagination, setPagination] = useState<PaginationOptions>({
    page: 1,
    limit: 10,
  });

  const updateFilters = useCallback((newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when filtering
  }, []);

  const updateSort = useCallback((field: string) => {
    setSort(prev => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when sorting
  }, []);

  const updatePagination = useCallback(
    (newPagination: Partial<PaginationOptions>) => {
      setPagination(prev => ({ ...prev, ...newPagination }));
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters(initialFilters || {});
    setPagination({ page: 1, limit: 10 });
  }, [initialFilters]);

  const queryOptions: QueryOptions = {
    filters,
    sort,
    pagination,
  };

  return {
    filters,
    sort,
    pagination,
    queryOptions,
    updateFilters,
    updateSort,
    updatePagination,
    resetFilters,
  };
}

// Form state management hook
export function useFormState<T>(initialData: T) {
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = useCallback(
    (field: keyof T, value: T[keyof T]) => {
      setData(prev => ({ ...prev, [field]: value }));
      // Clear error for this field when user starts typing
      if (errors[field as string]) {
        setErrors(prev => ({ ...prev, [field as string]: "" }));
      }
    },
    [errors]
  );

  const updateData = useCallback((newData: Partial<T>) => {
    setData(prev => ({ ...prev, ...newData }));
  }, []);

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const reset = useCallback(() => {
    setData(initialData);
    setErrors({});
    setIsLoading(false);
    setIsSubmitting(false);
  }, [initialData]);

  return {
    data,
    errors,
    isLoading,
    isSubmitting,
    updateField,
    updateData,
    setFieldError,
    clearErrors,
    setIsLoading,
    setIsSubmitting,
    reset,
    formState: {
      data,
      errors,
      isLoading,
      isSubmitting,
    },
  };
}

// Optimistic update helper
export function useOptimisticUpdate<T>(queryKey: readonly unknown[]) {
  const queryClient = useQueryClient();

  const optimisticUpdate = useCallback(
    (updater: (oldData: T | undefined) => T) => {
      queryClient.setQueryData(queryKey, updater);
    },
    [queryClient, queryKey]
  );

  const rollback = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  return { optimisticUpdate, rollback };
}
