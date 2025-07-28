import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/database/prisma";
import { verifyToken, generateToken, validatePhone } from "@/lib/auth";
import { middleware, type AuthenticatedUser } from "@/lib/auth-middleware";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from "@/lib/api-response";

const inviteUserSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase(),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  role: z.enum(["admin", "manager", "user", "viewer"]),
  department: z.string().optional(),
  position: z.string().optional(),
  phone: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Get and verify JWT token
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token) as any;

    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Check if user has permission to invite users
    if (!payload.permissions?.includes("user_manage")) {
      return NextResponse.json(
        { error: "Insufficient permissions to invite users" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = inviteUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const {
      email,
      firstName,
      lastName,
      role,
      department,
      position,
      phone,
      permissions,
    } = validation.data;

    // Validate phone number if provided
    if (phone && !validatePhone(phone)) {
      return NextResponse.json(
        { error: "Invalid Indonesian phone number format" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Get company information
    const company = await prisma.company.findUnique({
      where: { id: payload.companyId },
      include: {
        users: {
          select: { employeeId: true },
          orderBy: { employeeId: "desc" },
          take: 1,
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Generate employee ID
    const lastEmployee = company.users[0];
    let employeeNumber = 1;
    if (lastEmployee?.employeeId) {
      const lastNumber = parseInt(lastEmployee.employeeId.slice(-3));
      employeeNumber = lastNumber + 1;
    }
    const employeeId = `${company.code}${employeeNumber.toString().padStart(3, "0")}`;

    // Define default permissions based on role
    const defaultPermissions = {
      viewer: ["asset_read"],
      user: ["asset_read", "asset_write"],
      manager: ["asset_read", "asset_write", "reports_view"],
      admin: [
        "asset_read",
        "asset_write",
        "asset_delete",
        "user_manage",
        "reports_view",
      ],
    };

    const userPermissions =
      permissions || defaultPermissions[role] || defaultPermissions.user;

    // Generate invitation token (valid for 7 days)
    const invitationToken = generateToken(
      {
        email,
        companyId: payload.companyId,
        invitationType: "user_invitation",
      },
      "7d"
    );

    // Create user invitation record
    const invitation = await prisma.user.create({
      data: {
        companyId: payload.companyId,
        employeeId,
        email,
        passwordHash: "", // Will be set when user accepts invitation
        firstName,
        lastName,
        phone,
        department,
        position,
        role,
        permissions: userPermissions,
        isActive: false, // Inactive until invitation is accepted
        emailVerifiedAt: null,
      },
    });

    // In a real application, you would send an email here
    // For now, we'll return the invitation token

    const responseData = {
      id: invitation.id,
      email: invitation.email,
      firstName: invitation.firstName,
      lastName: invitation.lastName,
      role: invitation.role,
      employeeId: invitation.employeeId,
      invitationToken,
      invitationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auth/accept-invitation?token=${invitationToken}`,
    };

    return NextResponse.json(
      {
        success: true,
        message: "User invitation created successfully",
        invitation: responseData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("User invitation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get pending invitations
export async function GET(request: NextRequest) {
  try {
    // Get and verify JWT token
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token) as any;

    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Check if user has permission to view invitations
    if (!payload.permissions?.includes("user_manage")) {
      return NextResponse.json(
        { error: "Insufficient permissions to view invitations" },
        { status: 403 }
      );
    }

    // Get pending invitations (inactive users)
    const invitations = await prisma.user.findMany({
      where: {
        companyId: payload.companyId,
        isActive: false,
        passwordHash: "", // Invitation not yet accepted
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        department: true,
        position: true,
        employeeId: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      invitations,
    });
  } catch (error) {
    console.error("Get invitations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
