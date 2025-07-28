import { NextRequest } from "next/server";
import { prisma } from "@/lib/database/prisma";
import {
  authenticate,
  hasPermission,
  PERMISSIONS,
  normalizeRole,
} from "@/middleware/auth";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "@/lib/api-response";
import { updateAssetSchema } from "@/schemas/assets-schemas";
import { ZodError } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Prisma } from "@prisma/client";

// GET /api/assets/[id] - Get single asset
async function getAssetHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    const baseWhere: { id: string; companyId?: string } = { id };

    // Users can only see assets from their company (except super admin)
    const isSuperAdmin = normalizedRole === "SUPER_ADMIN";
    if (!isSuperAdmin && user.companyId) {
      baseWhere.companyId = user.companyId;
    }

    const asset = await prisma.asset.findFirst({
      where: baseWhere,
      include: {
        category: {
          select: { id: true, name: true, code: true, icon: true, color: true },
        },
        location: { select: { id: true, name: true, code: true } },
        vendor: { select: { id: true, name: true, code: true } },
        assignee: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        company: { select: { id: true, name: true } },
      },
    });

    if (!asset) {
      return errorResponse("Asset not found", 404);
    }

    return successResponse(asset, "Asset retrieved successfully");
  } catch (error) {
    console.error("Error fetching asset:", error);
    return errorResponse("Failed to fetch asset");
  }
}

// DELETE /api/assets/[id] - Delete asset
async function deleteAssetHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const { user, error } = await authenticate(request);
    if (error) return error;
    if (!user) return unauthorizedResponse();

    // Check permissions
    const normalizedRole = normalizeRole(user.role);
    if (!hasPermission(normalizedRole, PERMISSIONS.ASSET_DELETE)) {
      return unauthorizedResponse("Insufficient permissions to delete assets");
    }

    const { id } = params;
    const baseWhere: { id: string; companyId?: string } = { id };

    // Users can only delete assets from their company (except super admin)
    const isSuperAdmin = normalizedRole === "SUPER_ADMIN";
    if (!isSuperAdmin && user.companyId) {
      baseWhere.companyId = user.companyId;
    }

    // Check if asset exists
    const asset = await prisma.asset.findFirst({
      where: baseWhere,
    });

    if (!asset) {
      return errorResponse("Asset not found", 404);
    }

    // Delete the asset
    await prisma.asset.delete({
      where: { id },
    });

    return successResponse(null, "Asset deleted successfully");
  } catch (error) {
    console.error("Error deleting asset:", error);
    return errorResponse("Failed to delete asset");
  }
}

// PUT /api/assets/[id] - Update asset
async function updateAssetHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const { user, error } = await authenticate(request);
    if (error) return error;
    if (!user) return unauthorizedResponse();

    // Check permissions
    const normalizedRole = normalizeRole(user.role);
    if (!hasPermission(normalizedRole, PERMISSIONS.ASSET_WRITE)) {
      return unauthorizedResponse("Insufficient permissions to update assets");
    }

    const { id } = params;
    const baseWhere: { id: string; companyId?: string } = { id };

    // Users can only update assets from their company (except super admin)
    const isSuperAdmin = normalizedRole === "SUPER_ADMIN";
    if (!isSuperAdmin && user.companyId) {
      baseWhere.companyId = user.companyId;
    }

    // Check if asset exists
    const existingAsset = await prisma.asset.findFirst({
      where: baseWhere,
    });

    if (!existingAsset) {
      return errorResponse("Asset not found", 404);
    }

    // Parse and validate request body
    const body = await request.json();

    // Validate update data
    const validatedData = updateAssetSchema.parse(body);

    // Handle serial number uniqueness check if being updated
    if (
      validatedData.serialNumber &&
      validatedData.serialNumber !== existingAsset.serialNumber
    ) {
      const existingWithSerial = await prisma.asset.findFirst({
        where: {
          serialNumber: validatedData.serialNumber,
          companyId: existingAsset.companyId,
          id: { not: id }, // Exclude current asset
        },
      });

      if (existingWithSerial) {
        return errorResponse(
          "Asset with this serial number already exists",
          409
        );
      }
    }

    // Prepare update data
    const updateData: Prisma.AssetUpdateInput = {};

    // Basic fields
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.description !== undefined)
      updateData.description = validatedData.description;
    if (validatedData.brand !== undefined)
      updateData.brand = validatedData.brand;
    if (validatedData.model !== undefined)
      updateData.model = validatedData.model;
    if (validatedData.serialNumber !== undefined)
      updateData.serialNumber = validatedData.serialNumber;
    if (validatedData.barcode !== undefined)
      updateData.barcode = validatedData.barcode;

    // Financial fields
    if (validatedData.purchaseCost !== undefined)
      updateData.purchaseCost = validatedData.purchaseCost;
    if (validatedData.purchaseDate !== undefined) {
      updateData.purchaseDate = validatedData.purchaseDate
        ? new Date(validatedData.purchaseDate)
        : null;
    }
    if (validatedData.purchaseOrderNumber !== undefined)
      updateData.purchaseOrderNumber = validatedData.purchaseOrderNumber;
    if (validatedData.invoiceNumber !== undefined)
      updateData.invoiceNumber = validatedData.invoiceNumber;
    if (validatedData.warrantyExpiresAt !== undefined) {
      updateData.warrantyExpiresAt = validatedData.warrantyExpiresAt
        ? new Date(validatedData.warrantyExpiresAt)
        : null;
    }
    if (validatedData.salvageValue !== undefined)
      updateData.salvageValue = validatedData.salvageValue;
    if (validatedData.usefulLifeYears !== undefined)
      updateData.usefulLifeYears = validatedData.usefulLifeYears;
    if (validatedData.depreciationMethod !== undefined)
      updateData.depreciationMethod = validatedData.depreciationMethod;

    // Status fields
    if (validatedData.status !== undefined)
      updateData.status = validatedData.status;
    if (validatedData.condition !== undefined)
      updateData.condition = validatedData.condition;
    if (validatedData.criticality !== undefined)
      updateData.criticality = validatedData.criticality;

    // IT fields
    if (validatedData.ipAddress !== undefined)
      updateData.ipAddress = validatedData.ipAddress;
    if (validatedData.macAddress !== undefined)
      updateData.macAddress = validatedData.macAddress;
    if (validatedData.operatingSystem !== undefined)
      updateData.operatingSystem = validatedData.operatingSystem;
    if (validatedData.securityClassification !== undefined)
      updateData.securityClassification = validatedData.securityClassification;

    // Environmental fields
    if (validatedData.energyRating !== undefined)
      updateData.energyRating = validatedData.energyRating;
    if (validatedData.carbonFootprint !== undefined)
      updateData.carbonFootprint = validatedData.carbonFootprint;
    if (validatedData.recyclable !== undefined)
      updateData.recyclable = validatedData.recyclable;
    if (validatedData.hazardousMaterials !== undefined)
      updateData.hazardousMaterials = validatedData.hazardousMaterials;

    // IT fields - additional
    if (validatedData.softwareLicenses !== undefined)
      updateData.softwareLicenses = validatedData.softwareLicenses;

    // Metadata
    if (validatedData.notes !== undefined)
      updateData.notes = validatedData.notes;
    if (validatedData.tags !== undefined) updateData.tags = validatedData.tags;
    if (validatedData.customFields !== undefined)
      updateData.customFields = validatedData.customFields;

    // Handle relationships
    if (validatedData.categoryId !== undefined) {
      updateData.category = validatedData.categoryId
        ? { connect: { id: validatedData.categoryId } }
        : { disconnect: true };
    }

    if (validatedData.locationId !== undefined) {
      updateData.location = validatedData.locationId
        ? { connect: { id: validatedData.locationId } }
        : { disconnect: true };
    }

    if (validatedData.vendorId !== undefined) {
      updateData.vendor = validatedData.vendorId
        ? { connect: { id: validatedData.vendorId } }
        : { disconnect: true };
    }

    if (validatedData.assignedTo !== undefined) {
      updateData.assignee = validatedData.assignedTo
        ? { connect: { id: validatedData.assignedTo } }
        : { disconnect: true };
    }

    // Recalculate book value if financial data changed
    if (
      validatedData.purchaseCost !== undefined ||
      validatedData.salvageValue !== undefined
    ) {
      const newPurchaseCost =
        validatedData.purchaseCost ?? existingAsset.purchaseCost;
      const newSalvageValue =
        validatedData.salvageValue ?? existingAsset.salvageValue;

      if (newPurchaseCost && newSalvageValue !== null) {
        updateData.bookValue = newPurchaseCost - newSalvageValue;
      }
    }

    // Update the asset
    const updatedAsset = await prisma.asset.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: { id: true, name: true, code: true, icon: true, color: true },
        },
        location: { select: { id: true, name: true, code: true } },
        vendor: { select: { id: true, name: true, code: true } },
        assignee: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        company: { select: { id: true, name: true } },
      },
    });

    return successResponse(updatedAsset, "Asset updated successfully");
  } catch (error) {
    console.error("Error updating asset:", error);

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

    return errorResponse("Failed to update asset");
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const resolvedParams = { params: await context.params };
  return getAssetHandler(request, resolvedParams);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const resolvedParams = { params: await context.params };
  return updateAssetHandler(request, resolvedParams);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const resolvedParams = { params: await context.params };
  return deleteAssetHandler(request, resolvedParams);
}
