import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/database/prisma";
import { verifyPassword, generateToken } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from "@/lib/api-response";

// Validation schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

// POST /api/auth/login - Authenticate user and return JWT token
async function loginHandler(request: NextRequest) {
  try {
    // Parse and validate input
    const body = await request.json();
    const { email, password, remember } = loginSchema.parse(body);

    // Find user with company information
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            code: true,
            subscriptionPlan: true,
            subscriptionExpiresAt: true,
            isActive: true,
            settings: true,
            createdAt: true,
          },
        },
      },
    });

    // Validate user existence
    if (!user) {
      return errorResponse("Invalid credentials", 401);
    }

    // Validate user account status
    if (!user.isActive) {
      return errorResponse("Account is deactivated", 401);
    }

    // Validate company status
    if (!user.company.isActive) {
      return errorResponse("Company account is suspended", 401);
    }

    // Validate subscription status
    if (
      user.company.subscriptionExpiresAt &&
      new Date() > user.company.subscriptionExpiresAt
    ) {
      return errorResponse("Company subscription has expired", 401);
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return errorResponse("Invalid credentials", 401);
    }

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Generate JWT token
    const expiresIn = remember ? "30d" : "7d";
    const token = generateToken(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        permissions: user.permissions,
      },
      expiresIn
    );

    // Prepare response data
    const userData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      employeeId: user.employeeId,
      permissions: Array.isArray(user.permissions) ? user.permissions : [],
      isActive: user.isActive,
      lastLogin: user.lastLogin?.toISOString() || null,
      createdAt: user.createdAt.toISOString(),
    };

    const companyData = {
      id: user.company.id,
      name: user.company.name,
      code: user.company.code,
      npwp: "",
      phone: "",
      email: "",
      address: "",
      subscriptionStatus: "active",
      subscriptionPlan: user.company.subscriptionPlan,
      subscriptionExpiresAt:
        user.company.subscriptionExpiresAt?.toISOString() || null,
      createdAt: user.company.createdAt.toISOString(),
    };

    const authResponse = {
      token,
      user: userData,
      company: companyData,
    };

    // Create success response
    const response = successResponse(authResponse, "Login successful");

    // Set secure cookie if remember me is enabled
    if (remember) {
      response.headers.set(
        "Set-Cookie",
        `auth-token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${30 * 24 * 60 * 60}; Path=/`
      );
    }

    return response;
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error);
    }

    // Handle generic errors
    console.error("Login error:", error);
    return errorResponse("Internal server error");
  }
}

// Route export
export async function POST(request: NextRequest) {
  return loginHandler(request);
}
