/**
 * Base Service Class
 * Base class for all API services using the unified API client
 */
import { ApiClient } from "@/lib/api-client-unified";
import type { QueryOptions } from "@/types/common";
import type { ServiceConfig } from "@/types/services";

export abstract class BaseService {
  protected client: ApiClient;
  protected baseEndpoint: string;

  constructor(baseEndpoint: string, config?: ServiceConfig) {
    this.baseEndpoint = baseEndpoint;
    this.client = new ApiClient(config?.baseURL, config?.timeout);
  }

  /**
   * Build URL with query parameters
   */
  protected buildQueryUrl(endpoint: string, options?: QueryOptions): string {
    if (!options) return endpoint;

    const params = new URLSearchParams();

    // Pagination
    if (options.pagination?.page) {
      params.append("page", options.pagination.page.toString());
    }
    if (options.pagination?.limit) {
      params.append("limit", options.pagination.limit.toString());
    }

    // Sorting
    if (options.sort?.field) {
      params.append("sortBy", options.sort.field);
    }
    if (options.sort?.direction) {
      params.append("sortOrder", options.sort.direction);
    }

    // Filters
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    return queryString ? `${endpoint}?${queryString}` : endpoint;
  }

  /**
   * Build full endpoint URL
   */
  protected buildEndpoint(path: string): string {
    const cleanBase = this.baseEndpoint.replace(/\/$/, "");
    const cleanPath = path.replace(/^\//, "");
    return `${cleanBase}/${cleanPath}`;
  }

  /**
   * Handle API responses consistently
   */
  protected async handleResponse<T>(promise: Promise<T>): Promise<T> {
    try {
      return await promise;
    } catch (error) {
      // Add any service-level error handling here
      throw error;
    }
  }

  /**
   * Generic CRUD operations
   */
  protected async get<T>(endpoint: string): Promise<T> {
    return this.handleResponse(this.client.get<T>(endpoint));
  }

  protected async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.handleResponse(this.client.post<T>(endpoint, data));
  }

  protected async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.handleResponse(this.client.put<T>(endpoint, data));
  }

  protected async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.handleResponse(this.client.patch<T>(endpoint, data));
  }

  protected async delete<T>(endpoint: string): Promise<T> {
    return this.handleResponse(this.client.delete<T>(endpoint));
  }

  /**
   * File operations
   */
  protected async uploadFile<T>(
    endpoint: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    return this.handleResponse(
      this.client.uploadFile<T>(endpoint, file, progressEvent => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      })
    );
  }

  protected async downloadFile(
    endpoint: string,
    filename?: string
  ): Promise<void> {
    return this.handleResponse(this.client.downloadFile(endpoint, filename));
  }
}
