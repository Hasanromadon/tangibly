import { NextRequest } from "next/server";
import { requireAuth, AuthenticatedUser } from "@/middleware/auth";
import { successResponse } from "@/lib/api-response";

async function getMeHandler(request: NextRequest) {
  const user = (request as unknown as { user: AuthenticatedUser }).user;

  return successResponse(user, "User retrieved successfully");
}

export const GET = requireAuth(getMeHandler);
