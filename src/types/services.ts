/**
 * Service Types
 * Type definitions for API services that extend base types
 */

// Re-export main entity types for services
export type {
  User,
  Company,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  UserInvitation,
} from "./entities";

// Auth service specific types that aren't in entities
export interface InviteUserData {
  email: string;
  role: string;
  message?: string;
}

export interface AcceptInvitationData {
  token: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface VerifyInvitationResponse {
  valid: boolean;
  invitation?: {
    email: string;
    role: string;
    companyName: string;
    invitedBy: string;
  };
  error?: string;
}

// Asset service types
export interface AssetCreateData {
  name: string;
  description?: string;
  categoryId: string;
  locationId: string;
  serialNumber: string;
  model?: string;
  manufacturer?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  warrantyExpiry?: string;
  status?: "active" | "inactive" | "maintenance" | "disposed";
  condition?: "excellent" | "good" | "fair" | "poor";
  tags?: string[];
}

export interface AssetUpdateData extends Partial<AssetCreateData> {
  assignedToId?: string | null;
  notes?: string;
}

export interface AssetFilters {
  status?: string[];
  condition?: string[];
  categoryId?: string;
  locationId?: string;
  assignedToId?: string;
  search?: string;
  dateRange?: {
    from?: string;
    to?: string;
  };
}

// Company service types
export interface CompanyCreateData {
  name: string;
  code: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  taxId?: string;
  industry?: string;
  subscriptionPlan: "starter" | "professional" | "enterprise";
}

export interface CompanyUpdateData extends Partial<CompanyCreateData> {
  logoUrl?: string;
  settings?: Record<string, unknown>;
  isActive?: boolean;
}

export interface CompanyFilters {
  search?: string;
  industry?: string;
  isActive?: boolean;
}

// User service types
export interface UserCreateData {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  password?: string; // Optional for invited users
  employeeId?: string;
  department?: string;
  position?: string;
  phone?: string;
}

export interface UserUpdateData
  extends Partial<Omit<UserCreateData, "email" | "password">> {
  avatar?: string;
  isActive?: boolean;
}

export interface UserFilters {
  role?: string[];
  department?: string;
  isActive?: boolean;
  search?: string;
}

// Base Service Configuration
export interface ServiceConfig {
  baseURL?: string;
  timeout?: number;
  retries?: number;
}
