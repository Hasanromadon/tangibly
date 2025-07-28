import { NextRequest } from "next/server";
import { middleware, type AuthenticatedUser } from "@/lib/auth-middleware";
import { successResponse } from "@/lib/api-response";

async function getMeHandler(request: NextRequest) {
  const user = (request as unknown as { user: AuthenticatedUser }).user;

  return successResponse(user, "User retrieved successfully");
}

export const GET = middleware.auth(getMeHandler);
