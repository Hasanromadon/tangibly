# API Route Standards

## Standardized Route Structure

All API routes should follow this consistent structure for better maintainability and readability.

### 1. File Structure Pattern

```typescript
// 1. Imports (grouped by category)
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/database/prisma";
import { middleware, type AuthenticatedUser } from "@/lib/auth-middleware";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from "@/lib/api-response";

// 2. Validation Schemas
const createResourceSchema = z.object({
  // validation rules
});

const updateResourceSchema = z.object({
  // validation rules
});

// 3. Helper Functions (if needed)
async function helperFunction() {
  // helper logic
}

// 4. Handler Functions (separated from exports)
async function getResourceHandler(request: NextRequest) {
  try {
    // implementation
  } catch (error) {
    // error handling
  }
}

async function createResourceHandler(request: NextRequest) {
  try {
    // implementation
  } catch (error) {
    // error handling
  }
}

// 5. Route Exports with Middleware
export const GET = middleware.auth(getResourceHandler);
export const POST = middleware.asset.write(createResourceHandler);
```

### 2. Handler Function Standards

#### Structure Template:

```typescript
async function handlerName(request: NextRequest, context?: RouteContext) {
  try {
    // 1. Extract user from authenticated request (if needed)
    const user = (request as unknown as { user: AuthenticatedUser }).user;

    // 2. Parse and validate input
    const body = await request.json(); // for POST/PUT
    const { searchParams } = new URL(request.url); // for GET params
    const validatedData = schema.parse(body);

    // 3. Business logic implementation
    const result = await businessLogic();

    // 4. Return standardized success response
    return successResponse(result, "Operation completed successfully");
  } catch (error) {
    // 5. Standardized error handling
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error);
    }
    console.error("Handler error:", error);
    return errorResponse("Operation failed");
  }
}
```

### 3. Naming Conventions

- **Handler Functions**: `{verb}{Resource}Handler`
  - Examples: `getUserHandler`, `createCompanyHandler`, `updateAssetHandler`
- **Validation Schemas**: `{operation}{Resource}Schema`
  - Examples: `createUserSchema`, `updateCompanySchema`
- **Helper Functions**: `{descriptive}Helper` or `{action}{Resource}`
  - Examples: `generateAssetNumber`, `validatePermissions`

### 4. Error Handling Standards

```typescript
try {
  // main logic
} catch (error) {
  // Validation errors
  if (error instanceof z.ZodError) {
    return validationErrorResponse(error);
  }

  // Prisma errors
  if (error.code === "P2002") {
    return errorResponse("Resource already exists", 409);
  }

  // Generic error
  console.error("Operation error:", error);
  return errorResponse("Internal server error");
}
```

### 5. Authentication Patterns

#### Public Routes (no auth needed):

```typescript
export async function POST(request: NextRequest) {
  return loginHandler(request);
}
```

#### Authenticated Routes:

```typescript
export const GET = middleware.auth(getProfileHandler);
```

#### Role-based Routes:

```typescript
export const GET = middleware.admin(getUsersHandler);
export const POST = middleware.superAdminOnly(createCompanyHandler);
```

#### Permission-based Routes:

```typescript
export const GET = middleware.asset.read(getAssetsHandler);
export const POST = middleware.asset.write(createAssetHandler);
```

#### Company-scoped Routes:

```typescript
export const GET = middleware.asset.companyScoped(getCompanyAssetsHandler);
```

### 6. Response Standards

All responses should use the standardized response functions:

```typescript
// Success responses
return successResponse(data, "Message", statusCode?);

// Error responses
return errorResponse("Error message", statusCode?);
return validationErrorResponse(zodError);
return notFoundResponse("Resource not found");
return unauthorizedResponse("Access denied");
```

### 7. Documentation Comments

Each handler should have a clear comment describing its purpose:

```typescript
// GET /api/assets - List assets with filtering and pagination (company-scoped)
async function getAssetsHandler(request: NextRequest) {
  // implementation
}

// POST /api/companies - Create new company (super admin only)
async function createCompanyHandler(request: NextRequest) {
  // implementation
}
```

## Benefits of This Structure

1. **Consistency**: All routes follow the same pattern
2. **Maintainability**: Clear separation of concerns
3. **Readability**: Easy to understand and navigate
4. **Testing**: Handler functions are easily testable
5. **Type Safety**: Proper TypeScript usage throughout
6. **Error Handling**: Standardized error responses
7. **Security**: Consistent authentication patterns
