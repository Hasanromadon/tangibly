// Type definitions for Asset Management System
// Compliant with Indonesian regulations and ISO standards

export interface Company {
  id: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country: string;
  phone?: string;
  email?: string;
  website?: string;
  taxId?: string; // NPWP for Indonesian companies
  industry?: string;
  logoUrl?: string;
  settings: Record<string, unknown>;
  subscriptionPlan: "starter" | "professional" | "enterprise";
  subscriptionExpiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  companyId: string;
  employeeId?: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  department?: string;
  position?: string;
  role: "super_admin" | "admin" | "manager" | "user" | "viewer";
  permissions: string[];
  avatarUrl?: string;
  isActive: boolean;
  lastLogin?: Date;
  passwordChangedAt: Date;
  emailVerifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetCategory {
  id: string;
  companyId: string;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  color?: string;
  depreciationMethod:
    | "straight_line"
    | "declining_balance"
    | "units_of_production";
  usefulLifeYears?: number;
  salvageValuePercentage: number;
  isItAsset: boolean; // ISO 27001 IT assets
  isEnvironmentalAsset: boolean; // ISO 14001 environmental assets
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  id: string;
  companyId: string;
  name: string;
  code: string;
  description?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  coordinates?: string; // "lat,lng"
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  parentId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vendor {
  id: string;
  companyId: string;
  name: string;
  code: string;
  type?: "supplier" | "contractor" | "service_provider";
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  taxId?: string; // NPWP
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  paymentTerms?: string;
  rating?: number; // 1-5 stars
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Asset {
  id: string;
  companyId: string;
  assetNumber: string; // Unique identifier
  name: string;
  description?: string;
  categoryId?: string;
  locationId?: string;
  vendorId?: string;
  assignedTo?: string;

  // Asset Details
  brand?: string;
  model?: string;
  serialNumber?: string;
  barcode?: string;
  qrCode?: string;

  // Financial Information (Indonesian PSAK standards)
  purchaseCost?: number;
  purchaseDate?: Date;
  purchaseOrderNumber?: string;
  invoiceNumber?: string;
  warrantyExpiresAt?: Date;

  // Depreciation (PSAK 16 compliant)
  depreciationMethod:
    | "straight_line"
    | "declining_balance"
    | "units_of_production";
  usefulLifeYears?: number;
  salvageValue: number;
  accumulatedDepreciation: number;
  bookValue?: number;

  // Status and Lifecycle
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

  // IT Asset specific (ISO 27001)
  ipAddress?: string;
  macAddress?: string;
  operatingSystem?: string;
  softwareLicenses: string[];
  securityClassification?:
    | "public"
    | "internal"
    | "confidential"
    | "restricted";

  // Media and Documents
  images: string[];
  documents: string[];

  // Compliance
  lastAuditDate?: Date;
  nextAuditDate?: Date;
  complianceStatus: "compliant" | "non_compliant" | "pending";

  // Metadata
  tags: string[];
  customFields: Record<string, unknown>;
  notes?: string;

  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetMovement {
  id: string;
  companyId: string;
  assetId: string;
  movementType:
    | "transfer"
    | "loan"
    | "return"
    | "disposal"
    | "found"
    | "stolen";
  fromLocationId?: string;
  toLocationId?: string;
  fromUserId?: string;
  toUserId?: string;
  movementDate: Date;
  reason?: string;
  approvalStatus: "pending" | "approved" | "rejected";
  approvedBy?: string;
  approvedAt?: Date;
  createdBy?: string;
  createdAt: Date;
}

export interface MaintenanceType {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  category?: "preventive" | "corrective" | "predictive";
  defaultFrequencyDays?: number;
  estimatedDurationHours?: number;
  defaultCost?: number;
  requiredSkills: string[];
  safetyRequirements: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkOrder {
  id: string;
  companyId: string;
  workOrderNumber: string;
  assetId?: string;
  maintenanceTypeId?: string;
  title: string;
  description?: string;
  priority: "critical" | "high" | "medium" | "low";
  status: "open" | "in_progress" | "completed" | "cancelled" | "on_hold";

  // Scheduling
  scheduledDate?: Date;
  startedAt?: Date;
  completedAt?: Date;
  estimatedHours?: number;
  actualHours?: number;

  // Assignment
  assignedTo?: string;
  assignedTeam: string[];
  vendorId?: string;

  // Costs
  estimatedCost?: number;
  actualCost?: number;
  laborCost?: number;
  partsCost?: number;
  vendorCost?: number;

  // Completion Details
  completionNotes?: string;
  partsUsed: PartUsed[];
  completionPhotos: string[];

  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PartUsed {
  partNumber: string;
  description: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface AuditLog {
  id: string;
  companyId: string;
  userId?: string;
  entityType: string;
  entityId?: string;
  action: "create" | "update" | "delete" | "view" | "export";
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  complianceEvent: boolean;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Filter and Query Types
export interface AssetFilters {
  categoryId?: string;
  locationId?: string;
  status?: string;
  condition?: string;
  assignedTo?: string;
  search?: string;
  tags?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface WorkOrderFilters {
  assetId?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

// Compliance and Reporting Types
export interface ComplianceReport {
  companyId: string;
  reportType: "iso27001" | "iso14001" | "indonesian_tax";
  generatedAt: Date;
  period: {
    from: Date;
    to: Date;
  };
  summary: Record<string, unknown>;
  details: Record<string, unknown>;
}

export interface DepreciationReport {
  assetId: string;
  assetName: string;
  purchaseCost: number;
  accumulatedDepreciation: number;
  bookValue: number;
  currentMonthDepreciation: number;
  method: string;
  usefulLifeYears: number;
}

// Indonesian Specific Types
export interface IndonesianTaxReport {
  companyTaxId: string; // NPWP
  fiscalYear: number;
  assets: {
    id: string;
    name: string;
    category: string;
    purchaseCost: number;
    accumulatedDepreciation: number;
    bookValue: number;
    taxDepreciation: number; // Based on Indonesian tax law
  }[];
  summary: {
    totalAssets: number;
    totalPurchaseCost: number;
    totalAccumulatedDepreciation: number;
    totalBookValue: number;
    totalTaxDepreciation: number;
  };
}

// ISO Compliance Types
export interface ISO27001Asset extends Asset {
  informationClassification:
    | "public"
    | "internal"
    | "confidential"
    | "restricted";
  dataController?: string;
  dataProcessor?: string;
  retentionPeriod?: number;
  encryptionRequired: boolean;
  accessControlRequired: boolean;
  backupRequired: boolean;
  riskAssessment?: {
    confidentialityRisk: "low" | "medium" | "high";
    integrityRisk: "low" | "medium" | "high";
    availabilityRisk: "low" | "medium" | "high";
  };
}

export interface ISO14001Asset extends Asset {
  environmentalImpact: "low" | "medium" | "high";
  wasteGenerated: boolean;
  energyConsumption?: number; // kWh
  waterConsumption?: number; // Liters
  carbonEmission?: number; // kg CO2
  recyclingPlan?: string;
  disposalMethod?: string;
  environmentalCompliance: boolean;
}

// Dashboard Analytics Types
export interface DashboardMetrics {
  totalAssets: number;
  activeAssets: number;
  maintenanceAssets: number;
  criticalAssets: number;
  overdueMaintenances: number;
  upcomingMaintenances: number;
  totalValue: number;
  depreciationThisMonth: number;
  complianceScore: number;
}
