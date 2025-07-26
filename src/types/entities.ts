import {
  BaseEntity,
  Permission,
  UserRole,
  SubscriptionPlan,
  SubscriptionStatus,
} from "./common";

// User related interfaces
export interface User extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  companyId: string;
  employeeId: string | null;
  phone?: string;
  department?: string;
  position?: string;
  permissions: Permission[];
  avatarUrl?: string;
  isActive: boolean;
  lastLogin: string | null;
  emailVerifiedAt: string | null;
  passwordChangedAt: string;
}

// Company related interfaces
export interface Company extends BaseEntity {
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
  taxId?: string; // NPWP in Indonesia
  industry?: string;
  logoUrl?: string;
  settings: Record<string, unknown>;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiresAt: string | null;
  isActive: boolean;
}

// Authentication related interfaces
export interface AuthResponse {
  token: string;
  user: User;
  company: Company;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterData {
  company: {
    name: string;
    taxId: string; // NPWP
    phone: string;
    email: string;
    address: string;
  };
  user: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  };
}

// Invitation related interfaces
export interface UserInvitation extends BaseEntity {
  companyId: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  invitedById: string;
  token: string;
  isAccepted: boolean;
  acceptedAt: string | null;
  expiresAt: string;
}

export interface InviteUserData {
  email: string;
  role: UserRole;
  permissions?: Permission[];
}

export interface AcceptInvitationData {
  token: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface VerifyInvitationResponse {
  invitation: {
    email: string;
    role: UserRole;
    companyName: string;
    invitedBy: {
      firstName: string;
      lastName: string;
    };
    expiresAt: string;
  };
}

// Asset management related interfaces (extensible for future features)
export interface Asset extends BaseEntity {
  companyId: string;
  name: string;
  description?: string;
  serialNumber?: string;
  model?: string;
  manufacturer?: string;
  categoryId: string;
  locationId?: string;
  assignedToId?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  currentValue?: number;
  status: "active" | "maintenance" | "retired" | "disposed";
  condition: "excellent" | "good" | "fair" | "poor";
  warrantyExpiresAt?: string;
  notes?: string;
  imageUrls: string[];
  tags: string[];
}

export interface AssetCategory extends BaseEntity {
  companyId: string;
  name: string;
  description?: string;
  parentId?: string;
  color?: string;
  icon?: string;
}

export interface Location extends BaseEntity {
  companyId: string;
  name: string;
  description?: string;
  address?: string;
  parentId?: string;
  type: "building" | "floor" | "room" | "area";
}

// Update profile related interfaces
export interface UpdateProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// User management interfaces
export interface UserCreateData {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  permissions?: Permission[];
  phone?: string;
  department?: string;
  position?: string;
  employeeId?: string;
  isActive?: boolean;
}

export interface UserUpdateData {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: UserRole;
  permissions?: Permission[];
  phone?: string;
  department?: string;
  position?: string;
  employeeId?: string;
  isActive?: boolean;
}

export interface UserFilters {
  search?: string;
  role?: UserRole;
  department?: string;
  isActive?: boolean;
  lastLoginAfter?: string;
  lastLoginBefore?: string;
}
