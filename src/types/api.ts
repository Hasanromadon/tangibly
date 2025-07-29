/**
 * API-related type definitions
 * Centralized API types for request/response handling
 * Note: Basic types like ApiResponse are now in common.ts
 */

// Re-export common API types
export type { ApiResponse, PaginatedResponse, ApiError } from "./common";

// File upload types
export interface FileUploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
  onProgress?: (progress: number) => void;
}

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  type: string;
}

// Legacy API types that differ from entities.ts
// These are kept for backward compatibility with existing API endpoints
export interface LegacyLoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  token: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface LegacyUserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// Simple API response types for basic operations
export interface SimpleAsset {
  id: string;
  name: string;
  serialNumber: string;
  categoryId: string;
  locationId: string;
  companyId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface SimpleCompany {
  id: string;
  name: string;
  code: string;
  industry?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssetRequest {
  name: string;
  serialNumber: string;
  categoryId: string;
  locationId: string;
  description?: string;
  purchaseDate?: string;
  purchasePrice?: number;
}

export interface CreateCompanyRequest {
  name: string;
  code: string;
  industry?: string;
  address?: string;
  phone?: string;
  email?: string;
}
