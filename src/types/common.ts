// Common types used across the application

// Base component props that all components can extend
export interface BaseComponentProps {
  className?: string;
  id?: string;
}

// Base entity interface that all entities should extend
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

// API Response wrapper for all API endpoints
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: Array<{
    path: string[];
    message: string;
    code?: string;
  }>;
}

// Paginated response for list endpoints
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// API Error interface
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: Record<string, unknown>;
}

// Generic filter and sort options
export interface FilterOptions {
  search?: string;
  status?: string;
  role?: string;
  isActive?: boolean;
  dateFrom?: string;
  dateTo?: string;
  [key: string]: string | boolean | number | undefined;
}

export interface SortOptions {
  field: string;
  direction: "asc" | "desc";
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

// Query options that combine filtering, sorting, and pagination
export interface QueryOptions {
  filters?: FilterOptions;
  sort?: SortOptions;
  pagination?: PaginationOptions;
}

// Standard form state interface
export interface FormState<T> {
  data: T;
  errors: Record<string, string>;
  isLoading: boolean;
  isSubmitting: boolean;
}

// Standard list state interface
export interface ListState<T> {
  items: T[];
  total: number;
  isLoading: boolean;
  error: string | null;
  filters: FilterOptions;
  sort: SortOptions;
  pagination: PaginationOptions;
}

// Permission and role types
export type Permission =
  | "asset_read"
  | "asset_write"
  | "asset_delete"
  | "user_read"
  | "user_write"
  | "user_delete"
  | "user_manage"
  | "company_read"
  | "company_write"
  | "reports_read"
  | "reports_write"
  | "settings_read"
  | "settings_write"
  | "all";

export type UserRole = "super_admin" | "admin" | "manager" | "user" | "viewer";

export type SubscriptionPlan =
  | "starter"
  | "professional"
  | "enterprise"
  | "custom";

export type SubscriptionStatus =
  | "active"
  | "expired"
  | "suspended"
  | "cancelled";
