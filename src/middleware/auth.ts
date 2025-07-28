import { NextRequest } from "next/server";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/database/prisma";
import { unauthorizedResponse } from "@/lib/api-response";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  companyId?: string;
  lastLogin?: Date;
  loginAttempts?: number;
}

// Define role hierarchy and permissions
export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  USER: "USER",
  VIEWER: "VIEWER",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// Role hierarchy (higher number = more permissions)
export const ROLE_HIERARCHY: Record<Role, number> = {
  [ROLES.SUPER_ADMIN]: 100,
  [ROLES.ADMIN]: 80,
  [ROLES.MANAGER]: 60,
  [ROLES.USER]: 40,
  [ROLES.VIEWER]: 20,
};

// Permission sets
export const PERMISSIONS = {
  // Company permissions
  COMPANY_READ: "company:read",
  COMPANY_WRITE: "company:write",
  COMPANY_DELETE: "company:delete",
  COMPANY_MANAGE_ALL: "company:manage_all",

  // User permissions
  USER_READ: "user:read",
  USER_WRITE: "user:write",
  USER_DELETE: "user:delete",
  USER_MANAGE_ALL: "user:manage_all",
  USER_READ_SELF: "user:read_self",
  USER_WRITE_SELF: "user:write_self",

  // Asset permissions
  ASSET_READ: "asset:read",
  ASSET_WRITE: "asset:write",
  ASSET_DELETE: "asset:delete",
  ASSET_MANAGE_ALL: "asset:manage_all",

  // System permissions
  SYSTEM_ADMIN: "system:admin",
  SYSTEM_MONITORING: "system:monitoring",
  SYSTEM_LOGS: "system:logs",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.SUPER_ADMIN]: [
    PERMISSIONS.COMPANY_READ,
    PERMISSIONS.COMPANY_WRITE,
    PERMISSIONS.COMPANY_DELETE,
    PERMISSIONS.COMPANY_MANAGE_ALL,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_WRITE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.USER_MANAGE_ALL,
    PERMISSIONS.USER_READ_SELF,
    PERMISSIONS.USER_WRITE_SELF,
    PERMISSIONS.ASSET_READ,
    PERMISSIONS.ASSET_WRITE,
    PERMISSIONS.ASSET_DELETE,
    PERMISSIONS.ASSET_MANAGE_ALL,
    PERMISSIONS.SYSTEM_ADMIN,
    PERMISSIONS.SYSTEM_MONITORING,
    PERMISSIONS.SYSTEM_LOGS,
  ],
  [ROLES.ADMIN]: [
    PERMISSIONS.COMPANY_READ,
    PERMISSIONS.COMPANY_WRITE,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_WRITE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.USER_READ_SELF,
    PERMISSIONS.USER_WRITE_SELF,
    PERMISSIONS.ASSET_READ,
    PERMISSIONS.ASSET_WRITE,
    PERMISSIONS.ASSET_DELETE,
    PERMISSIONS.SYSTEM_MONITORING,
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.COMPANY_READ,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_READ_SELF,
    PERMISSIONS.USER_WRITE_SELF,
    PERMISSIONS.ASSET_READ,
    PERMISSIONS.ASSET_WRITE,
  ],
  [ROLES.USER]: [
    PERMISSIONS.COMPANY_READ,
    PERMISSIONS.USER_READ_SELF,
    PERMISSIONS.USER_WRITE_SELF,
    PERMISSIONS.ASSET_READ,
    PERMISSIONS.ASSET_WRITE,
  ],
  [ROLES.VIEWER]: [
    PERMISSIONS.COMPANY_READ,
    PERMISSIONS.USER_READ_SELF,
    PERMISSIONS.ASSET_READ,
  ],
};

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

// Utility functions for role and permission management
export function hasPermission(userRole: Role, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[userRole];
  return permissions?.includes(permission) || false;
}

export function hasMinimumRole(userRole: Role, minimumRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole];
}

export function canAccessResource(
  user: AuthenticatedUser,
  permission: Permission,
  resourceUserId?: string,
  resourceCompanyId?: string
): boolean {
  const userRole = user.role as Role;

  // Check if user has the permission
  if (!hasPermission(userRole, permission)) {
    return false;
  }

  // For self-access permissions, check if it's the same user
  if (permission.includes(":read_self") || permission.includes(":write_self")) {
    return resourceUserId === user.id;
  }

  // For company-scoped resources, check company access
  if (resourceCompanyId && user.companyId) {
    // Super admin can access all companies
    if (userRole === ROLES.SUPER_ADMIN) {
      return true;
    }
    // Others can only access their own company
    return resourceCompanyId === user.companyId;
  }

  return true;
}

export function getUserPermissions(userRole: Role): Permission[] {
  return ROLE_PERMISSIONS[userRole] || [];
}

export function isHigherRole(userRole: Role, targetRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] > ROLE_HIERARCHY[targetRole];
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
        firstName: true,
        lastName: true,
        role: true,
        companyId: true,
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
        name: `${user.firstName} ${user.lastName}`.trim(),
        role: user.role,
        companyId: user.companyId ?? undefined,
        lastLogin: user.lastLogin ?? undefined,
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

    if (error) {
      return error;
    }

    if (!user) {
      return unauthorizedResponse("Authentication failed");
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

    if (error) {
      return error;
    }

    if (!user) {
      return unauthorizedResponse("Authentication failed");
    }

    if (user.role !== "ADMIN") {
      return unauthorizedResponse("Admin access required");
    }

    // Add user to request context
    (request as unknown as { user: AuthenticatedUser }).user = user;

    return handler(request, context);
  };
}

// Flexible permission-based middleware
export function requirePermission<T = unknown>(
  permission: Permission,
  options: {
    allowSelfAccess?: boolean;
    getUserIdFromContext?: (context: T) => string;
    getCompanyIdFromContext?: (context: T) => string;
  } = {}
) {
  return (handler: (request: NextRequest, context: T) => Promise<Response>) => {
    return async (request: NextRequest, context: T) => {
      const { user, error } = await authenticate(request);

      if (error) {
        return error;
      }

      if (!user) {
        return unauthorizedResponse("Authentication failed");
      }

      const userRole = user.role as Role;

      // Get resource context if provided
      const resourceUserId = options.getUserIdFromContext?.(context);
      const resourceCompanyId = options.getCompanyIdFromContext?.(context);

      // Check if user can access the resource
      if (
        !canAccessResource(user, permission, resourceUserId, resourceCompanyId)
      ) {
        return unauthorizedResponse("Access denied: insufficient permissions");
      }

      // Add user to request context
      (request as unknown as { user: AuthenticatedUser }).user = user;

      return handler(request, context);
    };
  };
}

// Role-based middleware
export function requireRole<T = unknown>(minimumRole: Role) {
  return (handler: (request: NextRequest, context: T) => Promise<Response>) => {
    return async (request: NextRequest, context: T) => {
      const { user, error } = await authenticate(request);

      if (error) {
        return error;
      }

      if (!user) {
        return unauthorizedResponse("Authentication failed");
      }

      const userRole = user.role as Role;

      if (!hasMinimumRole(userRole, minimumRole)) {
        return unauthorizedResponse(
          `Access denied: ${minimumRole} role or higher required`
        );
      }

      // Add user to request context
      (request as unknown as { user: AuthenticatedUser }).user = user;

      return handler(request, context);
    };
  };
}

// Self-access middleware (user can only access their own resources)
export function requireSelfOrHigherRole<T = unknown>(
  minimumRole: Role,
  getUserIdFromContext: (context: T) => string
) {
  return (handler: (request: NextRequest, context: T) => Promise<Response>) => {
    return async (request: NextRequest, context: T) => {
      const { user, error } = await authenticate(request);

      if (error) {
        return error;
      }

      if (!user) {
        return unauthorizedResponse("Authentication failed");
      }

      const userRole = user.role as Role;
      const resourceUserId = getUserIdFromContext(context);

      // Allow if it's the same user or if user has required role
      if (
        user.id !== resourceUserId &&
        !hasMinimumRole(userRole, minimumRole)
      ) {
        return unauthorizedResponse(
          "Access denied: can only access own resources or need higher role"
        );
      }

      // Add user to request context
      (request as unknown as { user: AuthenticatedUser }).user = user;

      return handler(request, context);
    };
  };
}

// Company-scoped access middleware
export function requireCompanyAccess<T = unknown>(
  permission: Permission,
  getCompanyIdFromContext?: (context: T) => string
) {
  return (handler: (request: NextRequest, context: T) => Promise<Response>) => {
    return async (request: NextRequest, context: T) => {
      const { user, error } = await authenticate(request);

      if (error) {
        return error;
      }

      if (!user) {
        return unauthorizedResponse("Authentication failed");
      }

      const userRole = user.role as Role;
      const resourceCompanyId = getCompanyIdFromContext?.(context);

      // Super admin can access all companies
      if (userRole === ROLES.SUPER_ADMIN) {
        (request as unknown as { user: AuthenticatedUser }).user = user;
        return handler(request, context);
      }

      // Check permission
      if (!hasPermission(userRole, permission)) {
        return unauthorizedResponse("Access denied: insufficient permissions");
      }

      // Check company access
      if (resourceCompanyId && user.companyId !== resourceCompanyId) {
        return unauthorizedResponse(
          "Access denied: cannot access other company's resources"
        );
      }

      // If no specific company requested, user can only access their own company
      if (!resourceCompanyId && !user.companyId) {
        return unauthorizedResponse(
          "Access denied: user not associated with any company"
        );
      }

      // Add user to request context
      (request as unknown as { user: AuthenticatedUser }).user = user;

      return handler(request, context);
    };
  };
}
