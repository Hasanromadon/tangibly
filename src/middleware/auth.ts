import { NextRequest } from "next/server";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/database/prisma";
import { unauthorizedResponse } from "@/lib/api-response";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export async function authenticate(
  request: NextRequest
): Promise<{ user: AuthenticatedUser | null; error: Response | null }> {
  try {
    const token = getTokenFromRequest(request);

    if (!token) {
      return {
        user: null,
        error: unauthorizedResponse("No token provided"),
      };
    }

    const decoded = verifyToken(token) as { userId: string } | null;

    if (!decoded || !decoded.userId) {
      return {
        user: null,
        error: unauthorizedResponse("Invalid token"),
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      return {
        user: null,
        error: unauthorizedResponse("User not found"),
      };
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      error: null,
    };
  } catch {
    return {
      user: null,
      error: unauthorizedResponse("Authentication failed"),
    };
  }
}

export function requireAuth<T = unknown>(
  handler: (request: NextRequest, context: T) => Promise<Response>
) {
  return async (request: NextRequest, context: T) => {
    const { user, error } = await authenticate(request);

    if (error || !user) {
      return error;
    }

    // Add user to request context
    (request as unknown as { user: AuthenticatedUser }).user = user;

    return handler(request, context);
  };
}

export function requireAdmin<T = unknown>(
  handler: (request: NextRequest, context: T) => Promise<Response>
) {
  return async (request: NextRequest, context: T) => {
    const { user, error } = await authenticate(request);

    if (error || !user) {
      return error;
    }

    if (user.role !== "ADMIN") {
      return unauthorizedResponse("Admin access required");
    }

    // Add user to request context
    (request as unknown as { user: AuthenticatedUser }).user = user;

    return handler(request, context);
  };
}
