import { NextRequest } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { z } from "zod";
import { middleware, AuthenticatedUser, ROLES } from "@/lib/auth-middleware";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from "@/lib/api-response";
import { createCompanySchema } from "@/schemas/company-schemas";

// GET /api/companies - List companies (Super admin can see all, others see their own)
async function getCompaniesHandler(request: NextRequest) {
  try {
    const user = (request as unknown as { user: AuthenticatedUser }).user;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const baseWhere: { id?: string } = {};

    // Super admin can see all companies, others only their own
    if (user.role !== ROLES.SUPER_ADMIN) {
      baseWhere.id = user.companyId;
    }

    const where = search
      ? {
          ...baseWhere,
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { code: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : baseWhere;

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

    return successResponse(
      {
        companies,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      "Companies retrieved successfully"
    );
  } catch (error) {
    console.error("Error fetching companies:", error);
    return errorResponse("Failed to fetch companies");
  }
}

// POST /api/companies - Create new company (Super admin only)
async function createCompanyHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createCompanySchema.parse(body);

    // Check if company code already exists
    const existingCompany = await prisma.company.findUnique({
      where: { code: validatedData.code },
    });

    if (existingCompany) {
      return errorResponse("Company code already exists", 400);
    }

    const company = await prisma.company.create({
      data: {
        ...validatedData,
        settings: {
          timezone: "Asia/Jakarta",
          currency: "IDR",
          locale: "id-ID",
          fiscalYearStart: "01-01",
          defaultDepreciationMethod: "straight_line",
          auditEnabled: true,
          notificationsEnabled: true,
        },
      },
    });

    return successResponse(company, "Company created successfully");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error);
    }

    console.error("Error creating company:", error);
    return errorResponse("Failed to create company");
  }
}

// Apply authentication middleware
export const GET = middleware.company.read(getCompaniesHandler);
export const POST = middleware.superAdminOnly(createCompanyHandler);
