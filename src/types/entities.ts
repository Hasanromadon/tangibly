import {
  BaseEntity,
  Permission,
  UserRole,
  SubscriptionPlan,
  SubscriptionStatus,
} from "./common";

// ===== Entity Types =====

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
// Authentication related interfaces
export interface UserInvitation extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  companyId: string;
  invitedBy: string;
  token: string;
  expiresAt: string;
  isAccepted: boolean;
  acceptedAt?: string;
}

// Company User - for company user list display
export interface CompanyUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  department?: string;
  position?: string;
  createdAt: string;
  updatedAt: string;
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
    invitedBy: string; // This is a formatted string, not an object
    expiresAt?: string;
  };
}

// Asset management related interfaces (extensible for future features)
export interface Asset extends BaseEntity {
  companyId: string;
  assetNumber: string;
  name: string;
  description?: string;

  // Basic Information
  brand?: string;
  model?: string;
  serialNumber?: string;
  barcode?: string;

  // Categories and Locations
  categoryId?: string;
  locationId?: string;
  vendorId?: string;
  assignedTo?: string;

  // Financial Information
  purchaseCost?: number;
  purchaseDate?: string;
  purchaseOrderNumber?: string;
  invoiceNumber?: string;
  warrantyExpiresAt?: string;

  // Depreciation
  depreciationMethod:
    | "straight_line"
    | "declining_balance"
    | "units_of_production";
  usefulLifeYears?: number;
  salvageValue: number;
  bookValue?: number;

  // Status and Condition
  status:
    | "active"
    | "inactive"
    | "maintenance"
    | "disposed"
    | "stolen"
    | "lost";
  condition: "excellent" | "good" | "fair" | "poor" | "damaged";
  criticality: "critical" | "high" | "medium" | "low";

  // Environmental (ISO 14001)
  energyRating?: string;
  carbonFootprint?: number;
  recyclable: boolean;
  hazardousMaterials: string[];

  // IT Asset (ISO 27001)
  ipAddress?: string;
  macAddress?: string;
  operatingSystem?: string;
  softwareLicenses: string[];
  securityClassification?:
    | "public"
    | "internal"
    | "confidential"
    | "restricted";

  // QR Code and Metadata
  qrCode?: string;
  tags: string[];
  customFields: Record<string, unknown>;
  notes?: string;

  // Relationships
  category?: AssetCategory;
  location?: Location;
  assignee?: User;
  creator?: User;
  createdBy: string;
}

export interface AssetCreateData {
  name: string;
  description?: string;

  // Basic Information
  brand?: string;
  model?: string;
  serialNumber?: string;
  barcode?: string;

  // Categories and Locations
  categoryId?: string;
  locationId?: string;
  vendorId?: string;
  assignedTo?: string;

  // Financial Information
  purchaseCost?: number;
  purchaseDate?: string;
  purchaseOrderNumber?: string;
  invoiceNumber?: string;
  warrantyExpiresAt?: string;

  // Depreciation
  depreciationMethod?:
    | "straight_line"
    | "declining_balance"
    | "units_of_production";
  usefulLifeYears?: number;
  salvageValue?: number;

  // Status and Condition
  status?:
    | "active"
    | "inactive"
    | "maintenance"
    | "disposed"
    | "stolen"
    | "lost";
  condition?: "excellent" | "good" | "fair" | "poor" | "damaged";
  criticality?: "critical" | "high" | "medium" | "low";

  // Environmental
  energyRating?: string;
  carbonFootprint?: number;
  recyclable?: boolean;
  hazardousMaterials?: string[];

  // IT Asset
  ipAddress?: string;
  macAddress?: string;
  operatingSystem?: string;
  softwareLicenses?: string[];
  securityClassification?:
    | "public"
    | "internal"
    | "confidential"
    | "restricted";

  // Metadata
  tags?: string[];
  customFields?: Record<string, unknown>;
  notes?: string;
}

export interface AssetUpdateData {
  name?: string;
  description?: string;

  // Basic Information
  brand?: string;
  model?: string;
  serialNumber?: string;
  barcode?: string;

  // Categories and Locations
  categoryId?: string;
  locationId?: string;
  vendorId?: string;
  assignedTo?: string;

  // Financial Information
  purchaseCost?: number;
  purchaseDate?: string;
  purchaseOrderNumber?: string;
  invoiceNumber?: string;
  warrantyExpiresAt?: string;

  // Depreciation
  depreciationMethod?:
    | "straight_line"
    | "declining_balance"
    | "units_of_production";
  usefulLifeYears?: number;
  salvageValue?: number;

  // Status and Condition
  status?:
    | "active"
    | "inactive"
    | "maintenance"
    | "disposed"
    | "stolen"
    | "lost";
  condition?: "excellent" | "good" | "fair" | "poor" | "damaged";
  criticality?: "critical" | "high" | "medium" | "low";

  // Environmental
  energyRating?: string;
  carbonFootprint?: number;
  recyclable?: boolean;
  hazardousMaterials?: string[];

  // IT Asset
  ipAddress?: string;
  macAddress?: string;
  operatingSystem?: string;
  softwareLicenses?: string[];
  securityClassification?:
    | "public"
    | "internal"
    | "confidential"
    | "restricted";

  // Metadata
  tags?: string[];
  customFields?: Record<string, unknown>;
  notes?: string;
}

export interface AssetFilters {
  search?: string;
  categoryId?: string;
  locationId?: string;
  vendorId?: string;
  assignedTo?: string;
  status?:
    | "active"
    | "inactive"
    | "maintenance"
    | "disposed"
    | "stolen"
    | "lost";
  condition?: "excellent" | "good" | "fair" | "poor" | "damaged";
  criticality?: "critical" | "high" | "medium" | "low";
  purchaseDateFrom?: string;
  purchaseDateTo?: string;
  warrantyExpiring?: boolean;
  tags?: string[];
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
