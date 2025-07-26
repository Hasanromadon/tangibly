import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/database/prisma";
import { hashPassword, verifyToken, generateToken } from "@/lib/auth";

const acceptInvitationSchema = z.object({
  token: z.string(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = acceptInvitationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { token, password } = validation.data;

    // Verify invitation token
    const payload = verifyToken(token) as any;
    if (!payload || payload.invitationType !== "user_invitation") {
      return NextResponse.json(
        { error: "Invalid or expired invitation token" },
        { status: 401 }
      );
    }

    // Find the invited user
    const user = await prisma.user.findFirst({
      where: {
        email: payload.email,
        companyId: payload.companyId,
        isActive: false,
        passwordHash: "", // Invitation not yet accepted
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            code: true,
            subscriptionPlan: true,
            subscriptionExpiresAt: true,
            isActive: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invitation not found or already accepted" },
        { status: 404 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Activate user account
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        isActive: true,
        emailVerifiedAt: new Date(),
        passwordChangedAt: new Date(),
      },
    });

    // Generate JWT token for login
    const authToken = generateToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      companyId: updatedUser.companyId,
      permissions: updatedUser.permissions,
    });

    // Return user data and token
    const userData = {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role,
      permissions: updatedUser.permissions,
      department: updatedUser.department,
      position: updatedUser.position,
      company: user.company,
    };

    return NextResponse.json({
      success: true,
      message: "Invitation accepted successfully",
      user: userData,
      token: authToken,
    });
  } catch (error) {
    console.error("Accept invitation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get invitation details (for displaying on accept invitation page)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Invitation token required" },
        { status: 400 }
      );
    }

    // Verify invitation token
    const payload = verifyToken(token) as any;
    if (!payload || payload.invitationType !== "user_invitation") {
      return NextResponse.json(
        { error: "Invalid or expired invitation token" },
        { status: 401 }
      );
    }

    // Find the invited user
    const user = await prisma.user.findFirst({
      where: {
        email: payload.email,
        companyId: payload.companyId,
        isActive: false,
        passwordHash: "", // Invitation not yet accepted
      },
      include: {
        company: {
          select: {
            name: true,
            code: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invitation not found or already accepted" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      invitation: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        department: user.department,
        position: user.position,
        company: user.company,
      },
    });
  } catch (error) {
    console.error("Get invitation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
