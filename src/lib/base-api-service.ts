import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import {
  ApiResponse,
  ApiError,
  PaginatedResponse,
  QueryOptions,
} from "@/types/common";

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
const API_TIMEOUT = 30000;

// Base API service class that all services should extend
export abstract class BaseApiService {
  protected client: AxiosInstance;

  constructor(baseURL: string = API_BASE_URL, timeout: number = API_TIMEOUT) {
    this.client = axios.create({
      baseURL,
      timeout,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for authentication
    this.client.interceptors.request.use(
      config => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      error => {
        const apiError = this.handleError(error);
        return Promise.reject(apiError);
      }
    );
  }

  private getAuthToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  }

  private handleError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error status
        const { status, data } = error.response;
        return {
          message: data?.error || data?.message || "Server error occurred",
          status,
          code: data?.code,
          details: data?.details,
        };
      } else if (error.request) {
        // Network error
        return {
          message: "Network error - please check your connection",
          status: 0,
          code: "NETWORK_ERROR",
        };
      }
    }

    // Request setup error or unknown error
    return {
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
      status: 500,
      code: "REQUEST_ERROR",
    };
  }

  // Generic HTTP methods
  protected async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  protected async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  protected async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  protected async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  protected async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  // Utility method to build query URLs with filters, sorting, and pagination
  protected buildQueryUrl(baseUrl: string, options?: QueryOptions): string {
    if (!options) return baseUrl;

    const params = new URLSearchParams();

    // Add filters
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });
    }

    // Add sorting
    if (options.sort) {
      params.append("sortBy", options.sort.field);
      params.append("sortOrder", options.sort.direction);
    }

    // Add pagination
    if (options.pagination) {
      params.append("page", String(options.pagination.page));
      params.append("limit", String(options.pagination.limit));
    }

    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }

  // Paginated request helper
  protected async getPaginated<T>(
    url: string,
    options?: QueryOptions,
    config?: AxiosRequestConfig
  ): Promise<PaginatedResponse<T>> {
    const params = this.buildQueryParams(options);
    const response = await this.client.get<PaginatedResponse<T>>(url, {
      ...config,
      params,
    });
    return response.data;
  }

  // Helper to build query parameters
  protected buildQueryParams(options?: QueryOptions): Record<string, unknown> {
    const params: Record<string, unknown> = {};

    if (options?.pagination) {
      params.page = options.pagination.page;
      params.limit = options.pagination.limit;
    }

    if (options?.sort) {
      params.sortBy = options.sort.field;
      params.sortOrder = options.sort.direction;
    }

    if (options?.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params[key] = value;
        }
      });
    }

    return params;
  }

  // Helper to build URL with path parameters
  protected buildUrl(
    template: string,
    params: Record<string, string | number>
  ): string {
    let url = template;
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
    return url;
  }
}

// Factory for creating service instances (Singleton pattern)
export class ApiServiceFactory {
  private static instances: Map<string, BaseApiService> = new Map();

  static createService<T extends BaseApiService>(
    ServiceClass: new (...args: unknown[]) => T,
    name: string,
    ...args: unknown[]
  ): T {
    if (!this.instances.has(name)) {
      this.instances.set(name, new ServiceClass(...args));
    }
    return this.instances.get(name) as T;
  }
}

// Response validation helper
export function validateApiResponse<T>(response: ApiResponse<T>): T {
  if (!response.success || !response.data) {
    throw new Error(response.error || "Invalid API response");
  }
  return response.data;
}
