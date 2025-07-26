import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
const API_TIMEOUT = 30000;

// Request/Response types for strong typing
export interface ApiResponse<T = any> {
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

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error handling interfaces
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

// Base API client following Single Responsibility Principle
export class BaseApiClient {
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

  private handleError(error: any): ApiError {
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
    } else {
      // Request setup error
      return {
        message: error.message || "An unexpected error occurred",
        status: 500,
        code: "REQUEST_ERROR",
      };
    }
  }

  // Generic HTTP methods following Open/Closed Principle
  protected async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  protected async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  protected async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  protected async patch<T>(
    url: string,
    data?: any,
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
}

// Factory for creating specialized API clients (Factory Pattern)
export class ApiClientFactory {
  private static instances: Map<string, BaseApiClient> = new Map();

  static createClient(name: string, baseURL?: string): BaseApiClient {
    if (!this.instances.has(name)) {
      this.instances.set(name, new BaseApiClient(baseURL));
    }
    return this.instances.get(name)!;
  }

  static getDefaultClient(): BaseApiClient {
    return this.createClient("default");
  }
}

// Default API client instance
export const apiClient = ApiClientFactory.getDefaultClient();
