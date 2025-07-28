import { NextRequest } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { type AuthenticatedUser, ROLES } from "@/lib/auth-middleware";
import { successResponse, errorResponse } from "@/lib/api-response";

// GET /api/assets/[id] - Get single asset
async function getAssetHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = (request as unknown as { user: AuthenticatedUser }).user;
    const { id } = params;

    const baseWhere: { id: string; companyId?: string } = { id };

    // Users can only see assets from their company (except super admin)
    if (user.role !== ROLES.SUPER_ADMIN && user.companyId) {
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
    const user = (request as unknown as { user: AuthenticatedUser }).user;
    const { id } = params;

    const baseWhere: { id: string; companyId?: string } = { id };

    // Users can only delete assets from their company (except super admin)
    if (user.role !== ROLES.SUPER_ADMIN && user.companyId) {
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
