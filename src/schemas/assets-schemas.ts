import { z } from "zod";
// Validation schemas
export const createAssetSchema = z.object({
  name: z.string().min(1, "Asset name is required"),
  description: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  vendorId: z.string().uuid().optional(),
  assignedTo: z.string().uuid().optional(),

  // Asset Details
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  barcode: z.string().optional(),

  // Financial Information
  purchaseCost: z.number().positive().optional(),
  purchaseDate: z.string().datetime().optional(),
  purchaseOrderNumber: z.string().optional(),
  invoiceNumber: z.string().optional(),
  warrantyExpiresAt: z.string().datetime().optional(),

  // Depreciation
  depreciationMethod: z
    .enum(["straight_line", "declining_balance", "units_of_production"])
    .default("straight_line"),
  usefulLifeYears: z.number().positive().optional(),
  salvageValue: z.number().min(0).default(0),

  // Status
  status: z
    .enum(["active", "inactive", "maintenance", "disposed", "stolen", "lost"])
    .default("active"),
  condition: z
    .enum(["excellent", "good", "fair", "poor", "damaged"])
    .default("good"),
  criticality: z.enum(["critical", "high", "medium", "low"]).default("medium"),

  // Environmental (ISO 14001)
  energyRating: z.string().optional(),
  carbonFootprint: z.number().min(0).optional(),
  recyclable: z.boolean().default(false),
  hazardousMaterials: z.array(z.string()).default([]),

  // IT Asset (ISO 27001)
  ipAddress: z.string().optional(),
  macAddress: z.string().optional(),
  operatingSystem: z.string().optional(),
  softwareLicenses: z.array(z.string()).default([]),
  securityClassification: z
    .enum(["public", "internal", "confidential", "restricted"])
    .optional(),

  // Metadata
  tags: z.array(z.string()).default([]),
  customFields: z.record(z.string(), z.unknown()).default({}),
  notes: z.string().optional(),
});
