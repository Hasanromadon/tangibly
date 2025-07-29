import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/database/prisma";
import { generateToken } from "@/lib/auth";
import { companySchema, userSchema } from "@/schemas/auth-schemas";
import { validationHelpers } from "@/lib";

// API-specific schema that maps the auth schemas to API format
// The API expects 'taxId' but the schema uses 'npwp', so we transform it
const apiRegisterSchema = z.object({
  company: companySchema.omit({ npwp: true }).extend({
    taxId: z
      .string()
      .min(1, "NPWP is required")
      .regex(
        /^\d{2}\.\d{3}\.\d{3}\.\d{1}-\d{3}\.\d{3}$/,
        "NPWP must be in format XX.XXX.XXX.X-XXX.XXX"
      ),
  }),
  user: userSchema,
});

export async function POST(request: NextRequest) {
  try {
    console.log("Registration API called");
    const body = await request.json();
    console.log("Request body:", JSON.stringify(body, null, 2));

    const validation = apiRegisterSchema.safeParse(body);

    if (!validation.success) {
      console.log("Validation failed:", validation.error.issues);
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { company, user } = validation.data;
    console.log("Validation passed. Company:", company);
    console.log("User:", user);

    // Validate Indonesian NPWP if provided
    if (company.taxId && !validationHelpers.isValidNPWP(company.taxId)) {
      console.log("NPWP validation failed for:", company.taxId);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid NPWP format. Use format: XX.XXX.XXX.X-XXX.XXX",
        },
        { status: 400 }
      );
    }

    console.log("NPWP validation passed");

    // Validate phone number if provided
    if (company.phone && !validationHelpers.isValidPhone(company.phone)) {
      console.log("Phone validation failed for:", company.phone);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid Indonesian phone number format",
        },
        { status: 400 }
      );
    }

    console.log("Phone validation passed");

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (existingUser) {
      console.log("Email already exists:", user.email);
      return NextResponse.json(
        {
          success: false,
          error: "Email address is already registered",
        },
        { status: 409 }
      );
    }

    console.log("Email is available");

    // Generate a company code from the company name
    let companyCode = company.name
      .substring(0, 6)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .padEnd(6, "0");

    // Check if company code already exists
    const existingCompany = await prisma.company.findUnique({
      where: { code: companyCode },
    });

    if (existingCompany) {
      // If code exists, append a number
      let counter = 1;
      let newCompanyCode = `${companyCode.substring(0, 5)}${counter}`;
      while (
        await prisma.company.findUnique({ where: { code: newCompanyCode } })
      ) {
        counter++;
        newCompanyCode = `${companyCode.substring(0, 5)}${counter}`;
      }
      companyCode = newCompanyCode;
    }

    console.log("Generated company code:", companyCode);

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);
    console.log("Password hashed successfully");

    try {
      // Create company and user in transaction
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await prisma.$transaction(async (tx: any) => {
        console.log("Starting database transaction");

        // Create company
        const newCompany = await tx.company.create({
          data: {
            name: company.name,
            code: companyCode,
            taxId: company.taxId,
            address: company.address,
            phone: company.phone,
          },
        });
        console.log("Company created:", newCompany.id);

        // Create user
        const newUser = await tx.user.create({
          data: {
            email: user.email,
            passwordHash: hashedPassword,
            firstName: user.firstName,
            lastName: user.lastName,
            companyId: newCompany.id,
            emailVerifiedAt: null,
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            companyId: true,
            emailVerifiedAt: true,
            createdAt: true,
          },
        });
        console.log("User created:", newUser.id);

        return { company: newCompany, user: newUser };
      });

      console.log("Transaction completed successfully");

      // Generate JWT token
      const token = generateToken(
        {
          userId: result.user.id,
          email: result.user.email,
          companyId: result.company.id,
        },
        "7d"
      );

      return NextResponse.json(
        {
          success: true,
          data: {
            token,
            user: result.user,
            company: result.company,
          },
          message: "Registration successful",
        },
        { status: 201 }
      );
    } catch (error) {
      console.error("Database transaction error:", error);

      if (error instanceof Error) {
        // Check for unique constraint violations
        if (error.message.includes("Unique constraint")) {
          return NextResponse.json(
            {
              success: false,
              error: "Email or company information already exists",
            },
            { status: 409 }
          );
        }
      }

      return NextResponse.json(
        {
          success: false,
          error: "Failed to create account. Please try again.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
