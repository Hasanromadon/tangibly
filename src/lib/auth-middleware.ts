import {
  ROLES,
  PERMISSIONS,
  ROLE_HIERARCHY,
  Role,
  AuthenticatedUser,
  requirePermission,
  requireRole,
  requireSelfOrHigherRole,
  requireCompanyAccess,
  requireAuth,
  requireAdmin,
} from "@/middleware/auth";

// Pre-configured middleware for common use cases
export const middleware = {
  // Authentication only
  auth: requireAuth,

  // Role-based access
  superAdminOnly: requireRole(ROLES.SUPER_ADMIN),
  adminOnly: requireRole(ROLES.ADMIN),
  managerOrHigher: requireRole(ROLES.MANAGER),
  userOrHigher: requireRole(ROLES.USER),

  // Legacy compatibility
  admin: requireAdmin,

  // Company management
  company: {
    read: requirePermission(PERMISSIONS.COMPANY_READ),
    write: requirePermission(PERMISSIONS.COMPANY_WRITE),
    delete: requirePermission(PERMISSIONS.COMPANY_DELETE),
    manageAll: requirePermission(PERMISSIONS.COMPANY_MANAGE_ALL),
    access: requireCompanyAccess(PERMISSIONS.COMPANY_READ),
  },

  // User management
  user: {
    read: requirePermission(PERMISSIONS.USER_READ),
    write: requirePermission(PERMISSIONS.USER_WRITE),
    delete: requirePermission(PERMISSIONS.USER_DELETE),
    manageAll: requirePermission(PERMISSIONS.USER_MANAGE_ALL),
    readSelf: requirePermission(PERMISSIONS.USER_READ_SELF),
    writeSelf: requirePermission(PERMISSIONS.USER_WRITE_SELF),
    selfOrAdmin: <T = unknown>(getUserId: (context: T) => string) =>
      requireSelfOrHigherRole(ROLES.ADMIN, getUserId),
  },

  // Asset management
  asset: {
    read: requirePermission(PERMISSIONS.ASSET_READ),
    write: requirePermission(PERMISSIONS.ASSET_WRITE),
    delete: requirePermission(PERMISSIONS.ASSET_DELETE),
    manageAll: requirePermission(PERMISSIONS.ASSET_MANAGE_ALL),
    companyScoped: requireCompanyAccess(PERMISSIONS.ASSET_READ),
  },

  // System access
  system: {
    admin: requirePermission(PERMISSIONS.SYSTEM_ADMIN),
    monitoring: requirePermission(PERMISSIONS.SYSTEM_MONITORING),
    logs: requirePermission(PERMISSIONS.SYSTEM_LOGS),
  },
};

// Helper function to extract user ID from URL params
export function getUserIdFromParams<T extends { params: { id: string } }>(
  context: T
): string {
  return context.params.id;
}

// Helper function to extract company ID from URL params
export function getCompanyIdFromParams<
  T extends { params: { companyId: string } },
>(context: T): string {
  return context.params.companyId;
}

// Helper function to extract company ID from query params
export function getCompanyIdFromQuery(request: Request): string | undefined {
  const url = new URL(request.url);
  return url.searchParams.get("companyId") || undefined;
}

// Role validation utilities
export function validateRoleChange(
  currentUser: AuthenticatedUser,
  targetUserId: string,
  newRole: Role
): { isValid: boolean; error?: string } {
  const currentRole = currentUser.role as Role;

  // Users cannot change their own role
  if (currentUser.id === targetUserId) {
    return { isValid: false, error: "Cannot change your own role" };
  }

  // Only super admin can assign super admin role
  if (newRole === ROLES.SUPER_ADMIN && currentRole !== ROLES.SUPER_ADMIN) {
    return {
      isValid: false,
      error: "Only super admin can assign super admin role",
    };
  }

  // Users cannot assign roles higher than their own
  if (ROLE_HIERARCHY[newRole] >= ROLE_HIERARCHY[currentRole]) {
    return {
      isValid: false,
      error: "Cannot assign role equal or higher than your own",
    };
  }

  return { isValid: true };
}

// Company access validation
export function validateCompanyAccess(
  user: AuthenticatedUser,
  resourceCompanyId: string
): { hasAccess: boolean; error?: string } {
  const userRole = user.role as Role;

  // Super admin has access to all companies
  if (userRole === ROLES.SUPER_ADMIN) {
    return { hasAccess: true };
  }

  // Users can only access their own company
  if (user.companyId !== resourceCompanyId) {
    return {
      hasAccess: false,
      error: "Access denied: cannot access other company's resources",
    };
  }

  return { hasAccess: true };
}

// Export common types and constants for easy access
export {
  ROLES,
  PERMISSIONS,
  type Role,
  type Permission,
  type AuthenticatedUser,
} from "@/middleware/auth";
