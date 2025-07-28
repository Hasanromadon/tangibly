import { NextRequest } from "next/server";
import {
  authenticate,
  hasPermission,
  PERMISSIONS,
  normalizeRole,
} from "@/middleware/auth";
import { createAssetSchema } from "@/schemas/asset-schemas";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
} from "@/lib/api-response";
import { ZodError } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { prisma } from "@/lib/database/prisma";
import { Prisma } from "@prisma/client";

// Generate unique asset number
async function generateAssetNumber(): Promise<string> {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 5);
  return `AST-${timestamp}-${random}`.toUpperCase();
}

/**
 * GET /api/assets
 * Retrieve paginated list of assets with filtering and sorting
 * Security: Requires authentication, company-scoped data access
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { user, error } = await authenticate(request);
    if (error) return error;
    if (!user) return unauthorizedResponse();

    // Check permissions
    const normalizedRole = normalizeRole(user.role);
    if (!hasPermission(normalizedRole, PERMISSIONS.ASSET_READ)) {
      return unauthorizedResponse("Insufficient permissions to read assets");
    }

    if (!user.companyId) {
      return errorResponse("User not associated with a company", 400);
    }
    // Parse query parameters
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build where clause for filtering with company scoping
    const where: Prisma.AssetWhereInput = {
      companyId: user.companyId, // Scope to user's company
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { assetNumber: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    // Fetch assets with pagination
    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          category: { select: { id: true, name: true } },
          location: { select: { id: true, name: true } },
          assignee: { select: { id: true, firstName: true, lastName: true } },
          creator: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      prisma.asset.count({ where }),
    ]);

    const result = {
      data: assets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };

    return successResponse(result, "Assets retrieved successfully");
  } catch (error) {
    console.error("Error fetching assets:", error);
    return errorResponse("Failed to fetch assets", 500);
  }
}

/**
 * POST /api/assets
 * Create a new asset with comprehensive validation and business rules
 * Security: Requires authentication and 'asset:create' permission
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { user, error } = await authenticate(request);
    if (error) return error;
    if (!user) return unauthorizedResponse();

    // Check permissions
    const normalizedRole = normalizeRole(user.role);
    if (!hasPermission(normalizedRole, PERMISSIONS.ASSET_WRITE)) {
      return unauthorizedResponse("Insufficient permissions to create assets");
    }

    if (!user.companyId) {
      return errorResponse("User not associated with a company", 400);
    }

    // Parse and validate request body
    const body = await request.json();

    // Add company context from authenticated user
    const assetData = {
      ...body,
      companyId: user.companyId,
    };

    // Validate asset data with comprehensive business rules
    const validatedData = createAssetSchema.parse(assetData);

    // Generate unique asset number
    const assetNumber = await generateAssetNumber();

    // Create asset in database with transaction
    const newAsset = await prisma.$transaction(async tx => {
      // Check for duplicate serial number if provided
      if (validatedData.serialNumber) {
        const existingAsset = await tx.asset.findFirst({
          where: {
            serialNumber: validatedData.serialNumber,
            companyId: user.companyId,
          },
        });

        if (existingAsset) {
          throw new Error(
            "BUSINESS_RULE: Asset with this serial number already exists"
          );
        }
      }

      // Calculate initial book value for financial assets
      const bookValue = validatedData.purchaseCost
        ? validatedData.purchaseCost - validatedData.salvageValue
        : null;

      // Prepare asset data for creation
      const assetCreateData: Prisma.AssetCreateInput = {
        assetNumber,
        name: validatedData.name,
        description: validatedData.description,
        brand: validatedData.brand,
        model: validatedData.model,
        serialNumber: validatedData.serialNumber,
        barcode: validatedData.barcode,
        purchaseCost: validatedData.purchaseCost,
        purchaseDate: validatedData.purchaseDate
          ? new Date(validatedData.purchaseDate)
          : null,
        purchaseOrderNumber: validatedData.purchaseOrderNumber,
        invoiceNumber: validatedData.invoiceNumber,
        warrantyExpiresAt: validatedData.warrantyExpiresAt
          ? new Date(validatedData.warrantyExpiresAt)
          : null,
        depreciationMethod: validatedData.depreciationMethod,
        usefulLifeYears: validatedData.usefulLifeYears,
        salvageValue: validatedData.salvageValue,
        bookValue,
        accumulatedDepreciation: 0,
        status: validatedData.status,
        condition: validatedData.condition,
        criticality: validatedData.criticality,
        energyRating: validatedData.energyRating,
        carbonFootprint: validatedData.carbonFootprint,
        recyclable: validatedData.recyclable,
        ipAddress: validatedData.ipAddress,
        macAddress: validatedData.macAddress,
        operatingSystem: validatedData.operatingSystem,
        securityClassification: validatedData.securityClassification,
        notes: validatedData.notes,
        company: {
          connect: { id: user.companyId },
        },
        // Connect category if provided
        ...(validatedData.categoryId && {
          category: { connect: { id: validatedData.categoryId } },
        }),
        // Connect location if provided
        ...(validatedData.locationId && {
          location: { connect: { id: validatedData.locationId } },
        }),
        // Connect vendor if provided
        ...(validatedData.vendorId && {
          vendor: { connect: { id: validatedData.vendorId } },
        }),
        // Connect assignee if provided
        ...(validatedData.assignedTo && {
          assignee: { connect: { id: validatedData.assignedTo } },
        }),
      };

      // Create the asset
      const asset = await tx.asset.create({
        data: assetCreateData,
        include: {
          category: { select: { id: true, name: true } },
          location: { select: { id: true, name: true } },
          assignee: { select: { id: true, firstName: true, lastName: true } },
          creator: { select: { id: true, firstName: true, lastName: true } },
        },
      });

      // TODO: Log asset creation for audit trail
      // await tx.auditLog.create({
      //   data: {
      //     companyId: validatedData.companyId,
      //     entityType: 'ASSET',
      //     entityId: asset.id,
      //     action: 'CREATE',
      //     performedBy: validatedData.createdBy!,
      //     details: JSON.stringify({
      //       assetName: asset.name,
      //       assetNumber: asset.assetNumber,
      //     }),
      //   },
      // });

      return asset;
    });

    return successResponse(newAsset, "Asset created successfully", 201);
  } catch (error) {
    console.error("Error creating asset:", error);

    if (error instanceof ZodError) {
      return validationErrorResponse(error.issues);
    }

    if (error instanceof PrismaClientKnownRequestError) {
      // Handle database constraint violations
      if (error.code === "P2002") {
        const field = error.meta?.target as string[];
        return errorResponse(
          `Asset with this ${field?.[0] || "field"} already exists`,
          409
        );
      }

      if (error.code === "P2003") {
        return errorResponse("Referenced entity not found", 400);
      }
    }

    // Handle custom business logic errors
    if (error instanceof Error && error.message.includes("BUSINESS_RULE")) {
      return errorResponse(error.message.replace("BUSINESS_RULE: ", ""), 400);
    }

    return errorResponse("Failed to create asset", 500);
  }
}
