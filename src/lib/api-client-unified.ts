/**
 * Unified API Client
 * Single, comprehensive API client to replace duplicated implementations
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { API_CONFIG } from "@/constants/config";

// API Error interface
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: unknown;
}

// API Response interface
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown;
}

/**
 * Unified API Client class
 * Combines functionality from both BaseApiClient and BaseApiService
 */
export class ApiClient {
  private client: AxiosInstance;

  constructor(
    baseURL: string = API_CONFIG.BASE_URL,
    timeout: number = API_CONFIG.TIMEOUT
  ) {
    this.client = axios.create({
      baseURL,
      timeout,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
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

  /**
   * Get authentication token from storage
   */
  private getAuthToken(): string | null {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token")
      );
    }
    return null;
  }

  /**
   * Handle API errors consistently
   */
  private handleError(error: unknown): ApiError {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response: { status: number; data?: unknown };
      };
      const { status, data } = axiosError.response;
      const errorData = data as {
        message?: string;
        code?: string;
        errors?: unknown;
        details?: unknown;
      };

      return {
        message: errorData?.message || "An error occurred",
        status,
        code: errorData?.code,
        details: errorData?.errors || errorData?.details,
      };
    }

    if (error && typeof error === "object" && "request" in error) {
      return {
        message: "Network error occurred",
        status: 0,
        code: "NETWORK_ERROR",
      };
    }

    const errorObj = error as { message?: string };
    return {
      message: errorObj?.message || "An unexpected error occurred",
      status: 500,
      code: "UNKNOWN_ERROR",
    };
  }

  /**
   * Generic request method
   */
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<ApiResponse<T>> =
        await this.client.request(config);
      // Unwrap the data from ApiResponse structure
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        return response.data.data as T;
      }
      // Fallback for responses that don't follow ApiResponse structure
      return response.data as unknown as T;
    } catch (error) {
      throw error; // Will be handled by response interceptor
    }
  }

  /**
   * HTTP Methods
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: "GET", url });
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ ...config, method: "POST", url, data });
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ ...config, method: "PUT", url, data });
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ ...config, method: "PATCH", url, data });
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: "DELETE", url });
  }

  /**
   * Utility methods for common operations
   */

  // Set authentication token
  setAuthToken(token: string, persistent = false): void {
    if (typeof window !== "undefined") {
      if (persistent) {
        localStorage.setItem("auth_token", token);
      } else {
        sessionStorage.setItem("auth_token", token);
      }
    }
  }

  // Clear authentication token
  clearAuthToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      sessionStorage.removeItem("auth_token");
    }
  }

  // Upload file with progress tracking
  async uploadFile<T>(
    url: string,
    file: File,
    onProgress?: (progressEvent: { loaded: number; total?: number }) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append("file", file);

    const config: AxiosRequestConfig = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    if (onProgress) {
      config.onUploadProgress = progressEvent => {
        onProgress({
          loaded: progressEvent.loaded,
          total: progressEvent.total,
        });
      };
    }

    return this.request<T>({ ...config, method: "POST", url, data: formData });
  }

  // Download file
  async downloadFile(url: string, filename?: string): Promise<void> {
    const response = await this.client.get(url, {
      responseType: "blob",
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(downloadUrl);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for custom instances
export { ApiClient as default };
