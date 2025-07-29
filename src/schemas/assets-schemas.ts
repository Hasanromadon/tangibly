import { z } from "zod";
import {
  ASSET_STATUS,
  ASSET_CONDITION,
  ASSET_CRITICALITY,
  DEPRECIATION_METHOD,
  SECURITY_CLASSIFICATION,
} from "@/types/asset-types";

// Re-export enums for backward compatibility
export {
  ASSET_STATUS,
  ASSET_CONDITION,
  ASSET_CRITICALITY,
  DEPRECIATION_METHOD,
  SECURITY_CLASSIFICATION,
};

// Base asset validation schema
export const baseAssetSchema = z.object({
  // Required fields
  name: z
    .string()
    .min(1, "Asset name is required")
    .max(255, "Asset name must be less than 255 characters")
    .trim(),

  // Optional identification
  description: z.string().max(1000, "Description too long").optional(),
  brand: z.string().max(100, "Brand name too long").optional(),
  model: z.string().max(100, "Model name too long").optional(),
  serialNumber: z
    .string()
    .max(100, "Serial number too long")
    .optional()
    .transform(val => val?.trim() || undefined),
  barcode: z
    .string()
    .max(100, "Barcode too long")
    .optional()
    .transform(val => val?.trim() || undefined),

  // Relations (UUIDs)
  categoryId: z.string().uuid("Invalid category ID").optional(),
  locationId: z.string().uuid("Invalid location ID").optional(),
  vendorId: z.string().uuid("Invalid vendor ID").optional(),
  assignedTo: z.string().uuid("Invalid assignee ID").optional(),

  // Financial Information with proper validation
  purchaseCost: z
    .number()
    .min(0, "Purchase cost cannot be negative")
    .max(999999999.99, "Purchase cost too large")
    .optional(),
  purchaseDate: z
    .string()
    .datetime({
      message:
        "Purchase date must be a valid ISO datetime (YYYY-MM-DDTHH:mm:ss.sssZ)",
    })
    .optional()
    .or(z.literal("")),
  purchaseOrderNumber: z.string().max(50, "PO number too long").optional(),
  invoiceNumber: z.string().max(50, "Invoice number too long").optional(),
  warrantyExpiresAt: z
    .string()
    .datetime({
      message:
        "Warranty expiry date must be a valid ISO datetime (YYYY-MM-DDTHH:mm:ss.sssZ)",
    })
    .optional()
    .or(z.literal("")),

  // Depreciation with business rules
  depreciationMethod: z
    .enum(Object.values(DEPRECIATION_METHOD) as [string, ...string[]])
    .default(DEPRECIATION_METHOD.STRAIGHT_LINE),
  usefulLifeYears: z
    .number()
    .int("Useful life must be a whole number")
    .min(1, "Useful life must be at least 1 year")
    .max(100, "Useful life cannot exceed 100 years")
    .optional(),
  salvageValue: z
    .number()
    .min(0, "Salvage value cannot be negative")
    .max(999999999.99, "Salvage value too large")
    .default(0),

  // Status fields with enums
  status: z
    .enum(Object.values(ASSET_STATUS) as [string, ...string[]])
    .default(ASSET_STATUS.ACTIVE),
  condition: z
    .enum(Object.values(ASSET_CONDITION) as [string, ...string[]])
    .default(ASSET_CONDITION.GOOD),
  criticality: z
    .enum(Object.values(ASSET_CRITICALITY) as [string, ...string[]])
    .default(ASSET_CRITICALITY.MEDIUM),

  // Environmental compliance (ISO 14001)
  energyRating: z.string().max(10, "Energy rating too long").optional(),
  carbonFootprint: z
    .number()
    .min(0, "Carbon footprint cannot be negative")
    .optional(),
  recyclable: z.boolean().default(false),
  hazardousMaterials: z
    .array(z.string().max(100, "Material name too long"))
    .default([]),

  // IT Asset fields (ISO 27001)
  ipAddress: z
    .string()
    .regex(
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
      "Invalid IP address format"
    )
    .optional()
    .or(z.literal("")),
  macAddress: z
    .string()
    .regex(
      /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
      "Invalid MAC address format"
    )
    .optional()
    .or(z.literal("")),
  operatingSystem: z.string().max(100, "OS name too long").optional(),
  softwareLicenses: z
    .array(z.string().max(100, "License name too long"))
    .default([]),

  // Security classification (ISO 27001)
  securityClassification: z
    .enum(["public", "internal", "confidential", "restricted"])
    .default("internal"),

  // Company association and metadata
  companyId: z.string().uuid("Invalid company ID").optional(),
  notes: z.string().max(2000, "Notes too long").optional(),

  // Custom fields and tags
  tags: z.array(z.string().max(50, "Tag too long")).default([]),
  customFields: z.record(z.string(), z.any()).default({}),
});

// Create asset schema with refined validation
export const createAssetSchema = baseAssetSchema
  .refine(
    data => {
      // If purchase cost is provided, purchase date should also be provided
      if (data.purchaseCost && data.purchaseCost > 0 && !data.purchaseDate) {
        return false;
      }
      return true;
    },
    {
      message: "Purchase date is required when purchase cost is provided",
      path: ["purchaseDate"],
    }
  )
  .refine(
    data => {
      // Salvage value cannot exceed purchase cost
      if (
        data.purchaseCost &&
        data.salvageValue &&
        data.salvageValue > data.purchaseCost
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Salvage value cannot exceed purchase cost",
      path: ["salvageValue"],
    }
  )
  .refine(
    data => {
      // Warranty expiry should be after purchase date
      if (data.purchaseDate && data.warrantyExpiresAt) {
        return new Date(data.warrantyExpiresAt) > new Date(data.purchaseDate);
      }
      return true;
    },
    {
      message: "Warranty expiry must be after purchase date",
      path: ["warrantyExpiresAt"],
    }
  );

// Form-specific schema for react-hook-form (with string inputs)
export const assetFormSchema = z
  .object({
    // Basic Information
    name: z
      .string()
      .min(1, "Asset name is required")
      .max(255, "Asset name must be less than 255 characters")
      .trim(),
    description: z.string().optional(),
    brand: z.string().optional(),
    model: z.string().optional(),
    serialNumber: z.string().optional(),
    barcode: z.string().optional(),

    // Status fields
    status: z
      .enum(Object.values(ASSET_STATUS) as [string, ...string[]])
      .default(ASSET_STATUS.ACTIVE),
    condition: z
      .enum(Object.values(ASSET_CONDITION) as [string, ...string[]])
      .default(ASSET_CONDITION.GOOD),
    criticality: z
      .enum(Object.values(ASSET_CRITICALITY) as [string, ...string[]])
      .default(ASSET_CRITICALITY.MEDIUM),

    // Financial Information with proper date handling
    purchaseCost: z.string().optional(),
    purchaseDate: z.date().optional().or(z.literal("")),
    purchaseOrderNumber: z.string().optional(),
    invoiceNumber: z.string().optional(),
    warrantyExpiresAt: z.date().optional().or(z.literal("")),
    salvageValue: z.string().default("0"),

    // Depreciation
    depreciationMethod: z
      .enum(Object.values(DEPRECIATION_METHOD) as [string, ...string[]])
      .default(DEPRECIATION_METHOD.STRAIGHT_LINE),
    usefulLifeYears: z.string().optional(),

    // IT Asset Information
    ipAddress: z.string().optional(),
    macAddress: z.string().optional(),
    operatingSystem: z.string().optional(),
    securityClassification: z
      .enum(["public", "internal", "confidential", "restricted"])
      .default("public"),

    // Environmental Information
    energyRating: z.string().optional(),
    carbonFootprint: z.string().optional(),
    recyclable: z.boolean().default(false),

    // Notes
    notes: z.string().optional(),
  })
  .refine(
    data => {
      // If purchase cost is provided, purchase date should also be provided
      const purchaseCost = data.purchaseCost ? Number(data.purchaseCost) : 0;
      if (purchaseCost > 0 && !data.purchaseDate) {
        return false;
      }
      return true;
    },
    {
      message: "Purchase date is required when purchase cost is provided",
      path: ["purchaseDate"],
    }
  )
  .refine(
    data => {
      // Salvage value cannot exceed purchase cost
      const purchaseCost = data.purchaseCost ? Number(data.purchaseCost) : 0;
      const salvageValue = Number(data.salvageValue) || 0;
      if (purchaseCost > 0 && salvageValue > purchaseCost) {
        return false;
      }
      return true;
    },
    {
      message: "Salvage value cannot exceed purchase cost",
      path: ["salvageValue"],
    }
  );

export type AssetFormData = z.infer<typeof assetFormSchema>;

// Update asset schema (allows partial updates)
export const updateAssetSchema = baseAssetSchema.partial();

// Asset query/filter schema
export const assetQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().max(255).optional(),
  status: z
    .enum(Object.values(ASSET_STATUS) as [string, ...string[]])
    .optional(),
  condition: z
    .enum(Object.values(ASSET_CONDITION) as [string, ...string[]])
    .optional(),
  criticality: z
    .enum(Object.values(ASSET_CRITICALITY) as [string, ...string[]])
    .optional(),
  categoryId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  assignedTo: z.string().uuid().optional(),
  sortBy: z
    .enum(["name", "purchaseDate", "purchaseCost", "status", "createdAt"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Asset movement schema
export const assetMovementSchema = z.object({
  assetId: z.string().uuid("Invalid asset ID"),
  fromLocationId: z.string().uuid("Invalid from location ID").optional(),
  toLocationId: z.string().uuid("Invalid to location ID"),
  movedBy: z.string().uuid("Invalid user ID"),
  reason: z.string().max(500, "Reason too long").optional(),
  notes: z.string().max(1000, "Notes too long").optional(),
  scheduledDate: z.string().datetime().optional(),
  completedDate: z.string().datetime().optional(),
});

// Asset assignment schema
export const assetAssignmentSchema = z.object({
  assetId: z.string().uuid("Invalid asset ID"),
  assignedTo: z.string().uuid("Invalid assignee ID"),
  assignedBy: z.string().uuid("Invalid assigner ID"),
  assignmentDate: z.string().datetime(),
  expectedReturnDate: z.string().datetime().optional(),
  notes: z.string().max(1000, "Notes too long").optional(),
  responsibility: z.enum(["full", "shared", "custodian"]).default("full"),
});

// Asset maintenance schema
export const assetMaintenanceSchema = z.object({
  assetId: z.string().uuid("Invalid asset ID"),
  type: z.enum(["preventive", "corrective", "predictive"]),
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  description: z.string().max(1000, "Description too long").optional(),
  scheduledDate: z.string().datetime(),
  completedDate: z.string().datetime().optional(),
  performedBy: z.string().uuid("Invalid technician ID").optional(),
  cost: z.number().min(0, "Cost cannot be negative").optional(),
  notes: z.string().max(1000, "Notes too long").optional(),
  nextMaintenanceDate: z.string().datetime().optional(),
});

// TypeScript types derived from schemas
export type CreateAssetData = z.infer<typeof createAssetSchema>;
export type UpdateAssetData = z.infer<typeof updateAssetSchema>;
export type AssetQueryParams = z.infer<typeof assetQuerySchema>;
export type AssetMovementData = z.infer<typeof assetMovementSchema>;
export type AssetAssignmentData = z.infer<typeof assetAssignmentSchema>;
export type AssetMaintenanceData = z.infer<typeof assetMaintenanceSchema>;

// Validation error helper
export const validateAssetData = (data: unknown) => {
  try {
    return {
      success: true,
      data: createAssetSchema.parse(data),
      errors: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        data: null,
        errors: error.issues.map(err => ({
          field: err.path.join("."),
          message: err.message,
        })),
      };
    }
    return {
      success: false,
      data: null,
      errors: [{ field: "general", message: "Validation failed" }],
    };
  }
};
