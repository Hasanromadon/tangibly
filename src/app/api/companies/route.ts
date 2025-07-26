import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { z } from "zod";

// Validation schemas
const createCompanySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  code: z.string().min(1, "Company code is required").max(10),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default("Indonesia"),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  taxId: z.string().optional(), // NPWP
  industry: z.string().optional(),
});

// GET /api/companies - List companies (authenticated users can see their own company)
export async function GET(request: NextRequest) {
  try {
    // For now, return demo data - will implement auth later
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { code: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              users: true,
              assets: true,
            },
          },
        },
      }),
      prisma.company.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: companies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}

// POST /api/companies - Create new company
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createCompanySchema.parse(body);

    // Check if company code already exists
    const existingCompany = await prisma.company.findUnique({
      where: { code: validatedData.code },
    });

    if (existingCompany) {
      return NextResponse.json(
        { error: "Company code already exists" },
        { status: 400 }
      );
    }

    const company = await prisma.company.create({
      data: {
        ...validatedData,
        settings: {
          timezone: "Asia/Jakarta",
          currency: "IDR",
          locale: "id-ID",
          fiscalYearStart: "01-01", // January 1st
          defaultDepreciationMethod: "straight_line",
          auditEnabled: true,
          notificationsEnabled: true,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: company,
      message: "Company created successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating company:", error);
    return NextResponse.json(
      { error: "Failed to create company" },
      { status: 500 }
    );
  }
}
