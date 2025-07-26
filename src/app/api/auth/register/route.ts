import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/database/prisma";
import { validateNPWP, validatePhone } from "@/lib/auth";

// API-specific schema that matches the expected payload structure
const apiRegisterSchema = z.object({
  company: z.object({
    name: z.string().min(2, "Company name must be at least 2 characters"),
    taxId: z.string().min(1, "NPWP is required"), // This comes as taxId from API
    phone: z.string().min(1, "Phone number is required"),
    email: z.string().email("Invalid email address"),
    address: z.string().min(1, "Address is required"),
  }),
  user: z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  }),
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
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { company, user } = validation.data;
    console.log("Validation passed. Company:", company);
    console.log("User:", user);

    // Validate Indonesian NPWP if provided
    if (company.taxId && !validateNPWP(company.taxId)) {
      console.log("NPWP validation failed for:", company.taxId);
      return NextResponse.json(
        { error: "Invalid NPWP format. Use format: XX.XXX.XXX.X-XXX.XXX" },
        { status: 400 }
      );
    }

    console.log("NPWP validation passed");

    // Validate phone number if provided
    if (company.phone && !validatePhone(company.phone)) {
      console.log("Phone validation failed for:", company.phone);
      return NextResponse.json(
        { error: "Invalid Indonesian phone number format" },
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
        { error: "Email address is already registered" },
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

      return NextResponse.json(
        {
          message: "Registration successful",
          user: result.user,
          company: result.company,
        },
        { status: 201 }
      );
    } catch (error) {
      console.error("Database transaction error:", error);

      if (error instanceof Error) {
        // Check for unique constraint violations
        if (error.message.includes("Unique constraint")) {
          return NextResponse.json(
            { error: "Email or company information already exists" },
            { status: 409 }
          );
        }
      }

      return NextResponse.json(
        { error: "Failed to create account. Please try again." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
