// Reusable Asset Types and Interfaces
// This file contains composable types for asset management across forms, services, and APIs

// Base enums for consistent type definitions
export const ASSET_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  MAINTENANCE: "maintenance",
  DISPOSED: "disposed",
  STOLEN: "stolen",
  LOST: "lost",
} as const;

export const ASSET_CONDITION = {
  EXCELLENT: "excellent",
  GOOD: "good",
  FAIR: "fair",
  POOR: "poor",
  DAMAGED: "damaged",
} as const;

export const ASSET_CRITICALITY = {
  CRITICAL: "critical",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
} as const;

export const DEPRECIATION_METHOD = {
  STRAIGHT_LINE: "straight_line",
  DECLINING_BALANCE: "declining_balance",
  UNITS_OF_PRODUCTION: "units_of_production",
} as const;

export const SECURITY_CLASSIFICATION = {
  PUBLIC: "public",
  INTERNAL: "internal",
  CONFIDENTIAL: "confidential",
  RESTRICTED: "restricted",
} as const;

// Type definitions from enums
export type AssetStatus = (typeof ASSET_STATUS)[keyof typeof ASSET_STATUS];
export type AssetCondition =
  (typeof ASSET_CONDITION)[keyof typeof ASSET_CONDITION];
export type AssetCriticality =
  (typeof ASSET_CRITICALITY)[keyof typeof ASSET_CRITICALITY];
export type DepreciationMethod =
  (typeof DEPRECIATION_METHOD)[keyof typeof DEPRECIATION_METHOD];
export type SecurityClassification =
  (typeof SECURITY_CLASSIFICATION)[keyof typeof SECURITY_CLASSIFICATION];

// Core asset information interfaces (composable)
export interface AssetBasicInfo {
  name: string;
  description?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  barcode?: string;
}

export interface AssetFinancialInfo {
  purchaseCost?: number;
  purchaseDate?: string; // ISO date string
  purchaseOrderNumber?: string;
  invoiceNumber?: string;
  warrantyExpiresAt?: string; // ISO date string
  salvageValue?: number;
  usefulLifeYears?: number;
  depreciationMethod?: DepreciationMethod;
}

export interface AssetStatusInfo {
  status?: AssetStatus;
  condition?: AssetCondition;
  criticality?: AssetCriticality;
}

export interface AssetITInfo {
  ipAddress?: string;
  macAddress?: string;
  operatingSystem?: string;
  securityClassification?: SecurityClassification;
  softwareLicenses?: string[];
}

export interface AssetEnvironmentalInfo {
  energyRating?: string;
  carbonFootprint?: number;
  recyclable?: boolean;
  hazardousMaterials?: string[];
}

export interface AssetMetadata {
  tags?: string[];
  customFields?: Record<string, unknown>;
  notes?: string;
}

export interface AssetRelationships {
  categoryId?: string;
  locationId?: string;
  vendorId?: string;
  assignedTo?: string;
}

// Form-specific types (with string inputs for form handling)
export interface AssetFormBasicInfo {
  name: string;
  description?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  barcode?: string;
}

export interface AssetFormFinancialInfo {
  purchaseCost?: string; // String for form input
  purchaseDate?: string;
  purchaseOrderNumber?: string;
  invoiceNumber?: string;
  warrantyExpiresAt?: string;
  salvageValue?: string; // String for form input
  usefulLifeYears?: string; // String for form input
  depreciationMethod?: DepreciationMethod;
}

export interface AssetFormStatusInfo {
  status?: AssetStatus;
  condition?: AssetCondition;
  criticality?: AssetCriticality;
}

export interface AssetFormITInfo {
  ipAddress?: string;
  macAddress?: string;
  operatingSystem?: string;
  securityClassification?: SecurityClassification;
}

export interface AssetFormEnvironmentalInfo {
  energyRating?: string;
  carbonFootprint?: string; // String for form input
  recyclable?: boolean;
}

export interface AssetFormMetadata {
  notes?: string;
}

// Composite types for different use cases

// Complete form data (used in react-hook-form)
export interface AssetFormData
  extends AssetFormBasicInfo,
    AssetFormFinancialInfo,
    AssetFormStatusInfo,
    AssetFormITInfo,
    AssetFormEnvironmentalInfo,
    AssetFormMetadata {}

// API create request (used in service calls)
export interface AssetCreateRequest
  extends AssetBasicInfo,
    AssetFinancialInfo,
    AssetStatusInfo,
    AssetITInfo,
    AssetEnvironmentalInfo,
    AssetMetadata,
    AssetRelationships {}

// API update request (all fields optional except id)
export interface AssetUpdateRequest
  extends Partial<AssetBasicInfo>,
    Partial<AssetFinancialInfo>,
    Partial<AssetStatusInfo>,
    Partial<AssetITInfo>,
    Partial<AssetEnvironmentalInfo>,
    Partial<AssetMetadata>,
    Partial<AssetRelationships> {
  id: string;
}

// Full asset entity (from database/API)
export interface Asset
  extends AssetBasicInfo,
    AssetFinancialInfo,
    AssetStatusInfo,
    AssetITInfo,
    AssetEnvironmentalInfo,
    AssetMetadata,
    AssetRelationships {
  id: string;
  companyId: string;
  assetNumber: string;

  // Calculated fields
  accumulatedDepreciation?: number;
  bookValue?: number;

  // Media
  images?: string[];
  documents?: string[];

  // Compliance
  lastAuditDate?: string;
  nextAuditDate?: string;
  complianceStatus?: "compliant" | "non_compliant" | "pending";

  // Audit fields
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Utility types for transformations
export type FormDataToApiData<T extends AssetFormData> = {
  [K in keyof T]: K extends "purchaseCost" | "salvageValue" | "carbonFootprint"
    ? T[K] extends string
      ? number
      : T[K]
    : K extends "usefulLifeYears"
      ? T[K] extends string
        ? number
        : T[K]
      : T[K];
};

// Helper functions for type transformations
export const transformFormToApiData = (
  formData: AssetFormData | Record<string, unknown>
): AssetCreateRequest => {
  // Handle both typed and untyped form data
  const data = formData as Record<string, unknown>;

  return {
    name: data.name as string,
    description: (data.description as string) || undefined,
    brand: (data.brand as string) || undefined,
    model: (data.model as string) || undefined,
    serialNumber: (data.serialNumber as string) || undefined,
    barcode: (data.barcode as string) || undefined,
    status: data.status as AssetStatus,
    condition: data.condition as AssetCondition,
    criticality: data.criticality as AssetCriticality,
    purchaseCost: data.purchaseCost
      ? Number(data.purchaseCost as string)
      : undefined,
    purchaseDate: (data.purchaseDate as string) || undefined,
    purchaseOrderNumber: (data.purchaseOrderNumber as string) || undefined,
    invoiceNumber: (data.invoiceNumber as string) || undefined,
    warrantyExpiresAt: (data.warrantyExpiresAt as string) || undefined,
    salvageValue: data.salvageValue
      ? Number(data.salvageValue as string)
      : undefined,
    usefulLifeYears: data.usefulLifeYears
      ? Number(data.usefulLifeYears as string)
      : undefined,
    depreciationMethod: data.depreciationMethod as DepreciationMethod,
    ipAddress: (data.ipAddress as string) || undefined,
    macAddress: (data.macAddress as string) || undefined,
    operatingSystem: (data.operatingSystem as string) || undefined,
    securityClassification:
      data.securityClassification as SecurityClassification,
    energyRating: (data.energyRating as string) || undefined,
    carbonFootprint: data.carbonFootprint
      ? Number(data.carbonFootprint as string)
      : undefined,
    recyclable: data.recyclable as boolean,
    notes: (data.notes as string) || undefined,
    // Default values for arrays
    softwareLicenses: [],
    hazardousMaterials: [],
  };
};

export const getDefaultFormValues = (): AssetFormData => ({
  name: "",
  description: "",
  brand: "",
  model: "",
  serialNumber: "",
  barcode: "",
  status: ASSET_STATUS.ACTIVE,
  condition: ASSET_CONDITION.GOOD,
  criticality: ASSET_CRITICALITY.MEDIUM,
  purchaseCost: "",
  purchaseDate: "",
  purchaseOrderNumber: "",
  invoiceNumber: "",
  warrantyExpiresAt: "",
  salvageValue: "0",
  depreciationMethod: DEPRECIATION_METHOD.STRAIGHT_LINE,
  usefulLifeYears: "",
  ipAddress: "",
  macAddress: "",
  operatingSystem: "",
  securityClassification: SECURITY_CLASSIFICATION.PUBLIC,
  energyRating: "",
  carbonFootprint: "",
  recyclable: false,
  notes: "",
});
