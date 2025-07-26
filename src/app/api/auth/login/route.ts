import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { verifyPassword, generateToken } from "@/lib/auth";

const prisma = new PrismaClient();

const loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, password, remember } = validation.data;

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
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check if user account is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: "Account is deactivated" },
        { status: 401 }
      );
    }

    // Check if company is active
    if (!user.company.isActive) {
      return NextResponse.json(
        { error: "Company account is suspended" },
        { status: 401 }
      );
    }

    // Check subscription status
    if (
      user.company.subscriptionExpiresAt &&
      new Date() > user.company.subscriptionExpiresAt
    ) {
      return NextResponse.json(
        { error: "Company subscription has expired" },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Update last login
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

    // Return user data and token
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      permissions: user.permissions,
      department: user.department,
      position: user.position,
      avatarUrl: user.avatarUrl,
      company: user.company,
      lastLogin: new Date(),
    };

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: userData,
      token,
    });

    // Set secure cookie if remember me is enabled
    if (remember) {
      response.headers.set(
        "Set-Cookie",
        `auth-token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${30 * 24 * 60 * 60}; Path=/`
      );
    }

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
