import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/database/prisma";
import {
  hashPassword,
  generateToken,
  validateNPWP,
  validatePhone,
} from "@/lib/auth";

const registerSchema = z.object({
  // Company information
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  companyCode: z
    .string()
    .min(2, "Company code must be at least 2 characters")
    .max(10, "Company code must be at most 10 characters"),
  industry: z.string().optional(),
  taxId: z.string().optional(), // NPWP for Indonesian companies
  companyEmail: z.string().email("Invalid company email").optional(),
  companyPhone: z.string().optional(),

  // Company address
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),

  // Admin user information
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address").toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  phone: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),

  // Subscription plan
  subscriptionPlan: z
    .enum(["starter", "professional", "enterprise"])
    .default("starter"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const {
      companyName,
      companyCode,
      industry,
      taxId,
      companyEmail,
      companyPhone,
      address,
      city,
      province,
      postalCode,
      firstName,
      lastName,
      email,
      password,
      phone,
      department,
      position,
      subscriptionPlan,
    } = validation.data;

    // Validate Indonesian NPWP if provided
    if (taxId && !validateNPWP(taxId)) {
      return NextResponse.json(
        { error: "Invalid NPWP format. Use format: XX.XXX.XXX.X-XXX.XXX" },
        { status: 400 }
      );
    }

    // Validate phone number if provided
    if (phone && !validatePhone(phone)) {
      return NextResponse.json(
        { error: "Invalid Indonesian phone number format" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email address is already registered" },
        { status: 409 }
      );
    }

    // Check if company code already exists
    const existingCompany = await prisma.company.findUnique({
      where: { code: companyCode },
    });

    if (existingCompany) {
      return NextResponse.json(
        { error: "Company code is already taken" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create company and admin user in a transaction
    const result = await prisma.$transaction(async (tx: typeof prisma) => {
      // Create company
      const company = await tx.company.create({
        data: {
          name: companyName,
          code: companyCode,
          industry,
          taxId,
          email: companyEmail,
          phone: companyPhone,
          address,
          city,
          province,
          postalCode,
          country: "Indonesia",
          subscriptionPlan,
          subscriptionExpiresAt: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ), // 30 days trial
          settings: {
            timezone: "Asia/Jakarta",
            currency: "IDR",
            locale: "id-ID",
            fiscalYearStart: "01-01",
            defaultDepreciationMethod: "straight_line",
            auditEnabled: true,
            notificationsEnabled: true,
          },
          isActive: true,
        },
      });

      // Create admin user
      const user = await tx.user.create({
        data: {
          companyId: company.id,
          employeeId: `${companyCode}001`, // Auto-generate employee ID
          email,
          passwordHash,
          firstName,
          lastName,
          phone,
          department,
          position,
          role: "admin", // First user is admin
          permissions: [
            "asset_read",
            "asset_write",
            "asset_delete",
            "user_manage",
            "company_settings",
            "reports_view",
          ],
          isActive: true,
          emailVerifiedAt: new Date(), // Auto-verify for now
        },
      });

      return { company, user };
    });

    // Generate JWT token
    const token = generateToken({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
      companyId: result.company.id,
      permissions: result.user.permissions,
    });

    // Return user data and token
    const userData = {
      id: result.user.id,
      email: result.user.email,
      firstName: result.user.firstName,
      lastName: result.user.lastName,
      role: result.user.role,
      permissions: result.user.permissions,
      department: result.user.department,
      position: result.user.position,
      company: {
        id: result.company.id,
        name: result.company.name,
        code: result.company.code,
        subscriptionPlan: result.company.subscriptionPlan,
        subscriptionExpiresAt: result.company.subscriptionExpiresAt,
        isActive: result.company.isActive,
      },
    };

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        user: userData,
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
