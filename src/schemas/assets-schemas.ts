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

const optionalUUID = z
  .string()
  .uuid("Invalid UUID")
  .or(z.literal("").transform(() => undefined))
  .optional();

// Base asset validation schema - remains largely the same
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
  categoryId: optionalUUID,
  locationId: optionalUUID,
  vendorId: optionalUUID,
  assignedTo: optionalUUID,

  // Financial Information with proper validation
  purchaseCost: z.coerce
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
  usefulLifeYears: z.coerce
    .number()
    .int("Useful life must be a whole number")
    .min(1, "Useful life must be at least 1 year")
    .max(100, "Useful life cannot exceed 100 years")
    .optional(),
  salvageValue: z.coerce
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
  carbonFootprint: z.coerce
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
    .enum(Object.values(SECURITY_CLASSIFICATION) as [string, ...string[]]) // Use the imported enum
    .default(SECURITY_CLASSIFICATION.INTERNAL),

  // Company association and metadata
  companyId: z.string().uuid("Invalid company ID").optional(),
  notes: z.string().max(2000, "Notes too long").optional(),

  //bookValue
  bookValue: z.coerce
    .number()
    .min(0, "Book value cannot be negative")
    .optional(),
  accumulatedDepreciation: z.coerce
    .number()
    .min(0, "Accumulated depreciation cannot be negative")
    .default(0),

  //compliance
  lastAuditDate: z
    .string()
    .datetime({ message: "Invalid last audit date" })
    .optional()
    .or(z.literal("")),
  nextAuditDate: z
    .string()
    .datetime({ message: "Invalid next audit date" })
    .optional()
    .or(z.literal("")),
  complianceStatus: z
    .enum(["compliant", "non-compliant", "pending"])
    .default("compliant"),

  //media and documents
  images: z.array(z.string().url("Invalid image URL")).default([]),
  documents: z.array(z.string().url("Invalid document URL")).default([]),
  // Custom fields and tags
  tags: z.array(z.string().max(50, "Tag too long")).default([]),
  customFields: z.record(z.string(), z.any()).default({}),

  // Metadata
  createdBy: z.string().uuid("Invalid createdBy ID").optional(),
  updatedBy: z.string().uuid("Invalid updatedBy ID").optional(),
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
        // Ensure dates are valid before comparison
        const purchaseDate = new Date(data.purchaseDate);
        const warrantyDate = new Date(data.warrantyExpiresAt);
        return (
          !isNaN(purchaseDate.getTime()) &&
          !isNaN(warrantyDate.getTime()) &&
          warrantyDate > purchaseDate
        );
      }
      return true;
    },
    {
      message: "Warranty expiry must be after purchase date",
      path: ["warrantyExpiresAt"],
    }
  );

// Update asset schema: Extend baseAssetSchema and make all fields optional
// except for 'id', which is required for an update operation.
export const updateAssetSchema = baseAssetSchema
  .extend({
    id: z.string().uuid("Asset ID is required for update"), // ID is essential for identifying the asset to update
  })
  .partial() // Makes all fields from baseAssetSchema optional for update
  .refine(
    data => {
      // If purchase cost is provided, purchase date should also be provided (same as create)
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
      // Salvage value cannot exceed purchase cost (same as create)
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
      // Warranty expiry should be after purchase date (same as create)
      if (data.purchaseDate && data.warrantyExpiresAt) {
        const purchaseDate = new Date(data.purchaseDate);
        const warrantyDate = new Date(data.warrantyExpiresAt);
        return (
          !isNaN(purchaseDate.getTime()) &&
          !isNaN(warrantyDate.getTime()) &&
          warrantyDate > purchaseDate
        );
      }
      return true;
    },
    {
      message: "Warranty expiry must be after purchase date",
      path: ["warrantyExpiresAt"],
    }
  );

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
export type UpdateAssetData = z.infer<typeof updateAssetSchema>; // New type for update
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
