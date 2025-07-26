import { NextRequest } from "next/server";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/database/prisma";
import { unauthorizedResponse } from "@/lib/api-response";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  lastLogin?: Date;
  loginAttempts?: number;
}

// Helper function to get client IP
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP.trim();
  }

  return "unknown";
}

// Session tracking for security
const activeSessions = new Map<
  string,
  {
    userId: string;
    ip: string;
    userAgent: string;
    lastActivity: number;
    createdAt: number;
  }
>();

// Failed login attempts tracking
const failedAttempts = new Map<
  string,
  {
    count: number;
    lastAttempt: number;
    blockedUntil?: number;
  }
>();

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

    // Check if session exists and is valid
    const sessionData = activeSessions.get(token);
    const now = Date.now();

    if (sessionData) {
      // Check session timeout (24 hours)
      if (now - sessionData.lastActivity > 24 * 60 * 60 * 1000) {
        activeSessions.delete(token);
        return {
          user: null,
          error: unauthorizedResponse("Session expired"),
        };
      }

      // Update last activity
      sessionData.lastActivity = now;
    }

    const decoded = verifyToken(token) as { userId: string } | null;

    if (!decoded || !decoded.userId) {
      return {
        user: null,
        error: unauthorizedResponse("Invalid token"),
      };
    }

    // Check if user is blocked due to failed attempts
    const clientIP = getClientIP(request);
    const attemptKey = `${decoded.userId}:${clientIP}`;
    const attempts = failedAttempts.get(attemptKey);

    if (attempts?.blockedUntil && now < attempts.blockedUntil) {
      return {
        user: null,
        error: unauthorizedResponse(
          "Account temporarily blocked due to security concerns"
        ),
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        lastLogin: true,
      },
    });

    if (!user) {
      return {
        user: null,
        error: unauthorizedResponse("User not found"),
      };
    }

    // Track session if not exists
    if (!sessionData) {
      activeSessions.set(token, {
        userId: user.id,
        ip: clientIP,
        userAgent: request.headers.get("user-agent") || "unknown",
        lastActivity: now,
        createdAt: now,
      });
    }

    // Clear failed attempts on successful auth
    if (attempts) {
      failedAttempts.delete(attemptKey);
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        lastLogin: user.lastLogin,
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

export function trackFailedLogin(userId: string, request: NextRequest) {
  const clientIP = getClientIP(request);
  const attemptKey = `${userId}:${clientIP}`;
  const now = Date.now();

  const existing = failedAttempts.get(attemptKey);
  const count = (existing?.count || 0) + 1;

  // Block after 5 failed attempts for 30 minutes
  const blockedUntil = count >= 5 ? now + 30 * 60 * 1000 : undefined;

  failedAttempts.set(attemptKey, {
    count,
    lastAttempt: now,
    blockedUntil,
  });
}

export function invalidateSession(token: string) {
  activeSessions.delete(token);
}

export function getActiveSessions(userId: string) {
  const sessions: Array<{
    ip: string;
    userAgent: string;
    lastActivity: Date;
    createdAt: Date;
  }> = [];

  for (const [, session] of activeSessions.entries()) {
    if (session.userId === userId) {
      sessions.push({
        ip: session.ip,
        userAgent: session.userAgent,
        lastActivity: new Date(session.lastActivity),
        createdAt: new Date(session.createdAt),
      });
    }
  }

  return sessions;
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
