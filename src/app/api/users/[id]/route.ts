import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/database/prisma";
import {
  requireAuth,
  requireAdmin,
  AuthenticatedUser,
} from "@/middleware/auth";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse,
} from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Get single user
async function getUserHandler(request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = (request as unknown as { user: AuthenticatedUser })
      .user;
    const { id } = await params;

    // Users can only access their own data unless they're admin
    if (currentUser.role !== "ADMIN" && currentUser.id !== id) {
      return errorResponse("Access denied", 403);
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return notFoundResponse("User not found");
    }

    return successResponse(user, "User retrieved successfully");
  } catch (error) {
    console.error("Get user error:", error);
    return errorResponse("Internal server error");
  }
}

// Update user
const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  avatar: z.string().url("Invalid avatar URL").optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
});

async function updateUserHandler(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const currentUser = (request as unknown as { user: AuthenticatedUser })
      .user;
    const { id } = await params;
    const body = await request.json();

    // Users can only update their own data unless they're admin
    if (currentUser.role !== "ADMIN" && currentUser.id !== id) {
      return errorResponse("Access denied", 403);
    }

    // Validate input
    const validation = updateUserSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(validation.error.issues);
    }

    const updates = validation.data;

    // Only admins can change roles
    if (updates.role && currentUser.role !== "ADMIN") {
      delete updates.role;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updates,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return successResponse(user, "User updated successfully");
  } catch (error) {
    console.error("Update user error:", error);
    return errorResponse("Internal server error");
  }
}

// Delete user (Admin only)
async function deleteUserHandler(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    await prisma.user.delete({
      where: { id },
    });

    return successResponse(null, "User deleted successfully");
  } catch (error) {
    console.error("Delete user error:", error);
    return errorResponse("Internal server error");
  }
}

export const GET = requireAuth(getUserHandler);
export const PUT = requireAuth(updateUserHandler);
export const DELETE = requireAdmin(deleteUserHandler);
