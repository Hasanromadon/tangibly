/**
 * API Response Validation Utilities
 * Helper functions for validating API responses
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  details?: unknown;
}

// Response validation helper
export function validateApiResponse<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    // Create a proper error with the API error message
    const error = new Error(response.error || "API request failed") as Error & {
      status?: number;
      code?: string;
      details?: unknown;
    };

    // Add additional error properties if available
    if (response.details) {
      error.details = response.details;
    }

    throw error;
  }

  // For successful responses, data can be null (e.g., DELETE operations)
  return response.data as T;
}

// Type guard for API responses
export function isApiResponse<T>(
  response: unknown
): response is ApiResponse<T> {
  return (
    typeof response === "object" &&
    response !== null &&
    "success" in response &&
    typeof (response as { success: unknown }).success === "boolean"
  );
}

// Create a standardized API response
export function createApiResponse<T>(
  success: boolean,
  message: string,
  data?: T,
  error?: string,
  details?: unknown
): ApiResponse<T> {
  return {
    success,
    message,
    data,
    error,
    details,
  };
}
