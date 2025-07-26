import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/database/prisma";
import { requireAdmin } from "@/middleware/auth";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from "@/lib/api-response";

// Get all users (Admin only)
async function getUsersHandler() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return successResponse(users, "Users retrieved successfully");
  } catch (error) {
    console.error("Get users error:", error);
    return errorResponse("Internal server error");
  }
}

// Create user (Admin only)
const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["USER", "ADMIN"]).optional(),
});

async function createUserHandler(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = createUserSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(validation.error.issues);
    }

    const { email, name, role = "USER" } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return errorResponse("User already exists", 409);
    }

    // Create user with temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const user = await prisma.user.create({
      data: {
        companyId: "demo-company-id", // In real app, get from authenticated user
        email,
        firstName: name.split(" ")[0] || name,
        lastName: name.split(" ").slice(1).join(" ") || "",
        passwordHash: tempPassword, // In real app, you'd hash this and send email
        role,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return successResponse(user, "User created successfully", 201);
  } catch (error) {
    console.error("Create user error:", error);
    return errorResponse("Internal server error");
  }
}

export const GET = requireAdmin(getUsersHandler);
export const POST = requireAdmin(createUserHandler);
