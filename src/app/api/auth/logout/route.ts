import { NextRequest } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { getTokenFromRequest } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);

    if (token) {
      // Delete the session
      await prisma.session.deleteMany({
        where: { token },
      });
    }

    return successResponse(null, "Logout successful");
  } catch (error) {
    console.error("Logout error:", error);
    return errorResponse("Internal server error");
  }
}
