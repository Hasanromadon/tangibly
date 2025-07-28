# API Authentication Guide

## Overview

This guide documents the standardized authentication and authorization system for all API routes in the Tangibly project.

## Authentication Middleware System

### Core Components

1. **Base Authentication Middleware** (`src/middleware/auth.ts`)
   - Handles JWT token verification
   - Extracts user information from tokens
   - Provides role-based access control (RBAC)

2. **Standardized Middleware Utilities** (`src/lib/auth-middleware.ts`)
   - Pre-configured middleware for common use cases
   - Consistent API for different permission levels
   - Helper functions for parameter extraction

## Role Hierarchy

```typescript
SUPER_ADMIN (100) - Full system access
ADMIN (80)        - Company-wide administration
MANAGER (60)      - Department/team management
USER (40)         - Standard user access
VIEWER (20)       - Read-only access
```

## Permission Categories

### Company Permissions

- `company:read` - View company information
- `company:write` - Modify company information
- `company:delete` - Delete company
- `company:manage_all` - Full company management

### User Permissions

- `user:read` - View user information
- `user:write` - Modify user information
- `user:delete` - Delete users
- `user:manage_all` - Full user management
- `user:read_self` - View own profile
- `user:write_self` - Modify own profile

### Asset Permissions

- `asset:read` - View assets
- `asset:write` - Create/modify assets
- `asset:delete` - Delete assets
- `asset:manage_all` - Full asset management

### System Permissions

- `system:admin` - System administration
- `system:monitoring` - Access monitoring data
- `system:logs` - Access system logs

## Standardized Usage Patterns

### 1. Simple Authentication

```typescript
import { middleware } from "@/lib/auth-middleware";

// Requires valid authentication only
export const GET = middleware.auth(handler);
```

### 2. Role-Based Access

```typescript
// Requires specific role or higher
export const POST = middleware.superAdminOnly(handler);
export const PUT = middleware.adminOnly(handler);
export const PATCH = middleware.managerOrHigher(handler);
```

### 3. Permission-Based Access

```typescript
// Requires specific permissions
export const GET = middleware.company.read(handler);
export const POST = middleware.asset.write(handler);
export const DELETE = middleware.user.manageAll(handler);
```

### 4. Company-Scoped Access

```typescript
// Automatically filters data by user's company
export const GET = middleware.asset.companyScoped(handler);
export const POST = middleware.company.access(handler);
```

### 5. Self-or-Admin Access (for user routes with ID params)

```typescript
import { getUserIdFromParams } from "@/lib/auth-middleware";

// Users can access their own data, admins can access any
export const GET = middleware.user.selfOrAdmin(getUserIdFromParams)(handler);
```

## Current API Route Authentication Status

### ✅ Fully Standardized Routes

- `GET /api/companies` - Company read permission
- `POST /api/companies` - Super admin only
- `GET /api/assets` - Company-scoped asset access
- `POST /api/assets` - Asset write permission
- `GET /api/users` - User management permission
- `POST /api/users` - User management permission
- `GET /api/auth/me` - Basic authentication
- `GET /api/monitoring/security` - System monitoring permission

### ✅ Using Legacy Middleware (Still Secure)

- `GET /api/users/[id]` - Basic auth with role checking
- `PUT /api/users/[id]` - Basic auth with role checking
- `DELETE /api/users/[id]` - Admin only

### ⚠️ Custom Authentication Logic

- `POST /api/auth/invite` - Custom JWT verification for invitations
- `GET /api/auth/invite` - Custom JWT verification for invitations

### ✅ Public Endpoints (No Authentication Required)

- `GET /api/health` - Health check
- `POST /api/auth/login` - Login endpoint
- `POST /api/auth/logout` - Logout endpoint
- `POST /api/auth/register` - Registration endpoint
- `GET /api/auth/verify-invitation` - Public invitation verification
- `POST /api/auth/accept-invitation` - Public invitation acceptance
- `POST /api/monitoring/performance` - Performance metrics collection
- `POST /api/monitoring/frontend-errors` - Error reporting

## Best Practices

### 1. Handler Function Structure

```typescript
async function myHandler(request: NextRequest) {
  try {
    // Access authenticated user
    const user = (request as unknown as { user: AuthenticatedUser }).user;

    // Your business logic here

    return successResponse(data, "Success message");
  } catch (error) {
    console.error("Handler error:", error);
    return errorResponse("Error message");
  }
}
```

### 2. Company-Scoped Data Access

```typescript
// Automatically filter by user's company (except super admin)
const baseWhere: { companyId?: string } = {};
if (user.role !== ROLES.SUPER_ADMIN && user.companyId) {
  baseWhere.companyId = user.companyId;
}
```

### 3. Error Handling

- Always use `successResponse()` and `errorResponse()` for consistent API responses
- Log errors with appropriate context
- Return appropriate HTTP status codes

### 4. Type Safety

```typescript
import { type AuthenticatedUser } from "@/lib/auth-middleware";

// Always use proper typing for authenticated users
const user = (request as unknown as { user: AuthenticatedUser }).user;
```

## Migration Guide

### From Legacy to Standardized Middleware

**Old Pattern:**

```typescript
import { requireAuth, requireAdmin } from "@/middleware/auth";
export const GET = requireAuth(handler);
export const POST = requireAdmin(handler);
```

**New Pattern:**

```typescript
import { middleware } from "@/lib/auth-middleware";
export const GET = middleware.auth(handler);
export const POST = middleware.adminOnly(handler);
```

### Benefits of Standardization

1. **Consistency** - All routes use the same authentication patterns
2. **Maintainability** - Centralized permission management
3. **Flexibility** - Easy to change permissions without touching individual routes
4. **Type Safety** - Better TypeScript support and error checking
5. **Scalability** - Easy to add new permission levels and combinations

## Testing Authentication

### Unit Tests

```typescript
// Mock authenticated user for testing
const mockUser: AuthenticatedUser = {
  id: "test-user-id",
  email: "test@example.com",
  name: "Test User",
  role: ROLES.USER,
  companyId: "test-company-id",
};

// Test middleware behavior
const mockRequest = {
  user: mockUser,
} as unknown as NextRequest;
```

### Integration Tests

- Test each permission level with appropriate user roles
- Verify company-scoped data isolation
- Test error responses for unauthorized access

## Security Considerations

1. **JWT Token Validation** - All tokens are verified for signature and expiration
2. **Role Escalation Prevention** - Users cannot modify their own roles
3. **Company Isolation** - Users can only access data from their own company
4. **Permission Granularity** - Fine-grained permissions for different operations
5. **Audit Logging** - Authentication events are logged for security monitoring

## Future Enhancements

1. **Dynamic Permissions** - Database-driven permission assignment
2. **Resource-Level Permissions** - Per-resource access control
3. **API Rate Limiting** - Per-user and per-company rate limits
4. **Session Management** - Advanced session handling and revocation
5. **Multi-Factor Authentication** - Additional security layers
