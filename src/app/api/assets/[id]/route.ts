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
} from "@/lib/api-response";

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

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const resolvedParams = { params: await context.params };
  return getAssetHandler(request, resolvedParams);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const resolvedParams = { params: await context.params };
  return deleteAssetHandler(request, resolvedParams);
}
