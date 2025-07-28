import { NextRequest } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { z } from "zod";
import {
  middleware,
  type AuthenticatedUser,
  ROLES,
} from "@/lib/auth-middleware";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from "@/lib/api-response";

// Validation schemas
const createAssetSchema = z.object({
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

// Helper function to generate asset number
async function generateAssetNumber(
  companyId: string,
  categoryCode?: string
): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = categoryCode ? categoryCode.toUpperCase() : "AST";

  // Get the last asset number for this company and category
  const lastAsset = await prisma.asset.findFirst({
    where: {
      companyId,
      assetNumber: {
        startsWith: `${prefix}-${year}-`,
      },
    },
    orderBy: {
      assetNumber: "desc",
    },
  });

  let nextNumber = 1;
  if (lastAsset) {
    const lastNumberMatch = lastAsset.assetNumber.match(/-(\d+)$/);
    if (lastNumberMatch) {
      nextNumber = parseInt(lastNumberMatch[1]) + 1;
    }
  }

  return `${prefix}-${year}-${nextNumber.toString().padStart(4, "0")}`;
}

// Helper function to calculate book value
function calculateBookValue(
  purchaseCost: number,
  accumulatedDepreciation: number,
  salvageValue: number
): number {
  return Math.max(purchaseCost - accumulatedDepreciation, salvageValue);
}

// GET /api/assets - List assets with filtering and pagination
// GET /api/assets - List assets (company-scoped access)
async function getAssetsHandler(request: NextRequest) {
  try {
    const user = (request as unknown as { user: AuthenticatedUser }).user;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const status = searchParams.get("status") || "";
    const skip = (page - 1) * limit;

    const baseWhere: { companyId?: string } = {};

    // Users can only see assets from their company (except super admin)
    if (user.role !== ROLES.SUPER_ADMIN && user.companyId) {
      baseWhere.companyId = user.companyId;
    }

    const searchConditions = [];
    if (search) {
      searchConditions.push(
        { name: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
        { serialNumber: { contains: search, mode: "insensitive" as const } },
        { barcode: { contains: search, mode: "insensitive" as const } }
      );
    }

    const where = {
      ...baseWhere,
      ...(categoryId && { categoryId }),
      ...(status && { status }),
      ...(searchConditions.length > 0 && { OR: searchConditions }),
    };

    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          category: { select: { id: true, name: true } },
          location: { select: { id: true, name: true } },
          assignee: { select: { id: true, firstName: true, lastName: true } },
          company: { select: { id: true, name: true } },
        },
      }),
      prisma.asset.count({ where }),
    ]);

    return successResponse(
      {
        assets,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      "Assets retrieved successfully"
    );
  } catch (error) {
    console.error("Error fetching assets:", error);
    return errorResponse("Failed to fetch assets");
  }
}

export async function GET(request: NextRequest) {
  return middleware.asset.companyScoped(getAssetsHandler)(request, {});
}

// POST /api/assets - Create new asset
// POST /api/assets - Create new asset
async function createAssetHandler(request: NextRequest) {
  try {
    const user = (request as unknown as { user: AuthenticatedUser }).user;
    const body = await request.json();
    const validatedData = createAssetSchema.parse(body);

    // Get category for asset number generation
    let categoryCode = "AST";
    if (validatedData.categoryId) {
      const category = await prisma.assetCategory.findUnique({
        where: { id: validatedData.categoryId },
        select: { code: true },
      });
      if (category) {
        categoryCode = category.code;
      }
    }

    // Generate asset number
    const assetNumber = await generateAssetNumber(
      user.companyId!,
      categoryCode
    );

    // Calculate book value if purchase cost is provided
    let bookValue: number | undefined;
    if (validatedData.purchaseCost) {
      bookValue = calculateBookValue(
        validatedData.purchaseCost,
        0, // New asset has no accumulated depreciation
        validatedData.salvageValue
      );
    }

    // Generate QR code data
    const qrCode = JSON.stringify({
      assetNumber,
      name: validatedData.name,
      category: validatedData.categoryId,
      location: validatedData.locationId,
    });

    const asset = await prisma.asset.create({
      data: {
        ...validatedData,
        companyId: user.companyId!,
        assetNumber,
        qrCode,
        bookValue,
        purchaseDate: validatedData.purchaseDate
          ? new Date(validatedData.purchaseDate)
          : undefined,
        warrantyExpiresAt: validatedData.warrantyExpiresAt
          ? new Date(validatedData.warrantyExpiresAt)
          : undefined,
        customFields: JSON.parse(JSON.stringify(validatedData.customFields)),
        createdBy: user.id,
      },
      include: {
        category: {
          select: { id: true, name: true, code: true, icon: true, color: true },
        },
        location: {
          select: { id: true, name: true, code: true },
        },
        vendor: {
          select: { id: true, name: true, code: true },
        },
        assignee: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    return successResponse(asset, "Asset created successfully", 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error);
    }
    console.error("Error creating asset:", error);
    return errorResponse("Failed to create asset");
  }
}

export async function POST(request: NextRequest) {
  return middleware.asset.write(createAssetHandler)(request, {});
}
