# Tangibly - Full-Stack Architecture Guidelines

## 🏗️ **SOLID Principles Implementation**

This document outlines standardized architecture patterns for both Frontend (FE) and Backend (BE) development in the Tangibly asset management system.

## 📁 **Frontend Architecture (FE)**

### Frontend Structure

```
src/
├── app/                    # Next.js App Router (FE Pages)
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── auth/              # Authentication pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React Components (FE)
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── forms/            # Form components with validation
│   ├── common/           # Shared components (ThemeToggle, etc.)
│   └── asset-management/ # Feature-specific components
├── hooks/                # Custom React hooks (FE)
│   ├── useAuth.ts        # Authentication state management
│   ├── useUsers.ts       # User management hooks
│   └── useAssets.ts      # Asset management hooks
├── contexts/             # React contexts (FE State)
├── store/                # Zustand stores (FE Global State)
└── services/             # API service layer (FE ↔ BE Communication)
    ├── auth-api.ts       # Authentication API calls
    ├── user-api.ts       # User management API calls
    └── asset-api.ts      # Asset management API calls
```

## 📡 **Backend Architecture (BE)**

### Backend Structure

```
src/
├── app/api/              # Next.js API Routes (BE)
│   ├── auth/            # Authentication endpoints
│   ├── users/           # User management endpoints
│   ├── companies/       # Company management endpoints
│   ├── assets/          # Asset management endpoints
│   └── monitoring/      # System monitoring endpoints
├── middleware/          # API middleware (BE)
│   ├── auth.ts         # JWT authentication middleware
│   ├── rate-limit.ts   # Rate limiting middleware
│   ├── security.ts     # Security headers middleware
│   └── validation.ts   # Request validation middleware
├── lib/database/        # Database layer (BE)
│   └── prisma.ts       # Prisma client configuration
└── schemas/             # Validation schemas (Shared FE+BE)
    ├── auth-schemas.ts  # Authentication validation
    ├── user-schemas.ts  # User management validation
    └── asset-schemas.ts # Asset management validation
```

## 🔧 **Frontend Patterns (FE)**

### API Client Pattern (Single Responsibility)

```typescript
// src/lib/api-client.ts (FE)
export class BaseApiClient {
  protected client: AxiosInstance;

  constructor(baseURL: string, timeout: number) {
    this.client = axios.create({ baseURL, timeout });
    this.setupInterceptors();
  }

  // Generic HTTP methods for FE → BE communication
  protected async get<T>(url: string): Promise<ApiResponse<T>>;
  protected async post<T>(url: string, data?: any): Promise<ApiResponse<T>>;
  protected async put<T>(url: string, data?: any): Promise<ApiResponse<T>>;
  protected async delete<T>(url: string): Promise<ApiResponse<T>>;
}
  protected async post<T>(url: string, data?: unknown): Promise<ApiResponse<T>>;
  // ... other methods
}
```

### Service Layer (Business Logic Separation)

```typescript
// src/services/auth-api.ts
export class AuthApiService extends BaseApiClient {
  private readonly endpoints = {
    login: "/auth/login",
    register: "/auth/register",
    // ... other endpoints
  } as const;

  async login(
    credentials: LoginCredentials
  ): Promise<ApiResponse<AuthResponse>> {
    return this.post<AuthResponse>(this.endpoints.login, credentials);
  }
}

export const authApiService = new AuthApiService();
```

### React Query Hooks Pattern (Frontend)

```typescript
// src/hooks/useAuth.ts (FE)
export function useLogin() {
  return useMutation<AuthResponse, ApiError, LoginCredentials>({
    mutationFn: async credentials => {
      const response = await authApiService.login(credentials);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Login failed");
      }
      return response.data;
    },
    onSuccess: data => {
      // Handle success (FE state updates)
      toast.success("Login successful");
      // Redirect user or update auth state
    },
    onError: error => {
      // Handle error (FE user feedback)
      toast.error(error.message);
    },
  });
}

// Query keys for cache management (FE)
export const authQueryKeys = {
  all: ["auth"] as const,
  user: () => [...authQueryKeys.all, "user"] as const,
} as const;
```

## 📝 **Form Pattern (Frontend - Open/Closed Principle)**

### Zod Validation Schemas

```typescript
// src/schemas/auth-schemas.ts
export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
```

### Form Components

```typescript
// src/components/forms/FormFields.tsx
interface BaseFormFieldProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  label?: string
  required?: boolean
}

export function TextField<T extends FieldValues>({
  control,
  name,
  label,
  required = false,
  ...props
}: TextFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <Input {...field} {...props} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
```

### Page Implementation

```typescript
// src/app/auth/login/page.tsx
export default function LoginPage() {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: false },
  })

  const loginMutation = useLogin()

  const onSubmit = async (data: LoginFormData) => {
    try {
      await loginMutation.mutateAsync(data)
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <TextField
          control={form.control}
          name="email"
          label="Email"
          type="email"
          required
        />
        <TextField
          control={form.control}
          name="password"
          label="Password"
          type="password"
          required
        />
        <Button type="submit" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </Form>
  )
}
```

## 🔐 **Backend Patterns (BE)**

### API Route Pattern (Dependency Inversion)

```typescript
// src/lib/api-response.ts (BE)
export interface StandardApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: ValidationError[];
}

export function createSuccessResponse<T>(
  data: T,
  message?: string
): StandardApiResponse<T> {
  return { success: true, data, message };
}

export function createErrorResponse(
  error: string,
  details?: ValidationError[]
): StandardApiResponse {
  return { success: false, error, details };
}
```

### API Route Implementation (Backend)

```typescript
// src/app/api/auth/login/route.ts (BE)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input (BE validation)
    const validatedData = loginSchema.parse(body);

    // Business logic (BE service layer)
    const authService = new AuthService();
    const result = await authService.login(validatedData);

    return NextResponse.json(createSuccessResponse(result));
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        createErrorResponse("Validation failed", error.errors),
        { status: 400 }
      );
    }

    return NextResponse.json(createErrorResponse("Internal server error"), {
      status: 500,
    });
  }
}
```

### Middleware Pattern (Backend)

```typescript
// src/middleware/auth.ts (BE)
export async function authMiddleware(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(createErrorResponse("Authentication required"), {
        status: 401,
      });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET!);

    // Add user to request context
    const requestWithUser = request.clone();
    requestWithUser.headers.set("user", JSON.stringify(payload));

    return requestWithUser;
  } catch (error) {
    return NextResponse.json(createErrorResponse("Invalid token"), {
      status: 401,
    });
  }
}
```

### Database Service Pattern (Backend)

```typescript
// src/services/auth-service.ts (BE)
export class AuthService {
  private prisma = new PrismaClient();

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Find user in database
    const user = await this.prisma.user.findUnique({
      where: { email: credentials.email },
    });

    if (!user || !(await bcrypt.compare(credentials.password, user.password))) {
      throw new Error("Invalid credentials");
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return { user, token };
  }
}
```

## 🎯 **Component Standards (Frontend + Backend)**

### 1. **Single Responsibility (FE + BE)**

- **Frontend**: Each component has one clear purpose, separate UI from business logic
- **Backend**: Each API endpoint handles one specific operation
- Use custom hooks (FE) and service classes (BE) for complex logic

### 2. **Open/Closed Principle (FE + BE)**

- **Frontend**: Components open for extension via props, closed for modification
- **Backend**: API services can add new endpoints without changing base functionality
- Use composition over inheritance in both layers

### 3. **Liskov Substitution (FE + BE)**

- **Frontend**: Form field components implement consistent interfaces
- **Backend**: Service classes can be substituted without breaking API contracts
- Base components/services can be replaced without breaking functionality

### 4. **Interface Segregation (FE + BE)**

- **Frontend**: Small, focused prop interfaces and custom hooks
- **Backend**: Specific service methods for different operations
- Separate concerns into different modules

### 5. **Dependency Inversion (FE + BE)**

- **Frontend**: Components depend on hooks/contexts (abstractions)
- **Backend**: High-level business logic doesn't depend on database specifics
- Inject dependencies through constructor parameters or context

## 📋 **Development Checklists**

### ✅ Frontend Component Checklist

- [ ] Uses TypeScript with proper prop interfaces
- [ ] Implements proper error boundaries
- [ ] Has loading and error states
- [ ] Uses React Query for server state
- [ ] Uses React Hook Form for forms
- [ ] Has proper accessibility attributes
- [ ] Includes unit tests

### ✅ Backend API Endpoint Checklist

- [ ] Uses Zod validation for input
- [ ] Implements proper authentication/authorization
- [ ] Has comprehensive error handling
- [ ] Returns consistent API response format
- [ ] Includes proper logging and monitoring
- [ ] Has rate limiting where appropriate
- [ ] Includes API tests

### ✅ API Service (Frontend)

- [ ] Extends BaseApiClient (FE)
- [ ] Has typed endpoints object
- [ ] Uses consistent method names
- [ ] Exports singleton instance
- [ ] Has proper error handling

### ✅ React Query Hook (Frontend)

- [ ] Uses proper query/mutation pattern
- [ ] Has typed parameters and return values
- [ ] Includes proper error handling
- [ ] Uses toast notifications
- [ ] Has loading states

### ✅ Form Component

- [ ] Uses Zod validation schema
- [ ] Implements React Hook Form
- [ ] Has proper TypeScript types
- [ ] Uses standardized form fields
- [ ] Has error display

### ✅ Validation Schema

- [ ] Uses Zod for runtime validation
- [ ] Has proper error messages
- [ ] Includes Indonesian-specific validations
- [ ] Exports TypeScript types
- [ ] Has utility functions if needed

### ✅ Page Component

- [ ] Uses standardized layout
- [ ] Implements proper error boundaries
- [ ] Has loading states
- [ ] Uses consistent styling
- [ ] Has proper SEO metadata

## 🚀 **Getting Started Template**

Use this template when creating new features:

```bash
# 1. Create API service
src/services/feature-api.ts

# 2. Create validation schemas
src/schemas/feature-schemas.ts

# 3. Create React Query hooks
src/hooks/useFeature.ts

# 4. Create form components (if needed)
src/components/forms/FeatureForm.tsx

# 5. Create page components
src/app/feature/page.tsx

# 6. Create API routes
src/app/api/feature/route.ts
```

## 🔍 **Code Review Checklist**

- [ ] Follows SOLID principles
- [ ] Uses TypeScript properly
- [ ] Has proper error handling
- [ ] Uses React Query for data fetching
- [ ] Uses React Hook Form for forms
- [ ] Has Zod validation
- [ ] Uses consistent naming conventions
- [ ] Has proper loading and error states
- [ ] Follows accessibility guidelines
- [ ] Has proper documentation
- [ ] Includes comprehensive tests
- [ ] Tests cover edge cases and error scenarios

## 🧪 **Testing Architecture**

### Testing Strategy

The testing architecture follows the testing pyramid principle:

1. **Unit Tests** (70%) - Test individual functions and utilities
2. **Component Tests** (20%) - Test React components in isolation
3. **Integration Tests** (10%) - Test API routes and data flow
4. **E2E Tests** (5%) - Test complete user workflows

### Testing Structure

```
src/
├── __tests__/               # Global test utilities
├── test-utils/              # Testing utilities and mocks
│   ├── index.ts            # Custom render functions
│   ├── mocks/              # MSW handlers and mock data
│   │   ├── auth.ts         # Authentication mocks
│   │   ├── users.ts        # User management mocks
│   │   └── assets.ts       # Asset management mocks
│   └── test-helpers.ts     # Test helper functions
├── lib/__tests__/          # Unit tests for utilities
├── components/__tests__/   # Component tests
├── app/api/__tests__/      # API route tests
└── hooks/__tests__/        # Custom hook tests

tests/
└── e2e/                    # End-to-end tests
    ├── specs/              # Test specifications
    ├── fixtures/           # Test data
    └── utils/              # E2E utilities
```

### Testing Patterns

#### Unit Test Example

```typescript
// src/lib/__tests__/auth.test.ts
import { validatePassword, hashPassword } from "../auth";

describe("Auth Utilities", () => {
  describe("validatePassword", () => {
    it("should validate strong password", () => {
      expect(validatePassword("StrongPass123!")).toBe(true);
    });

    it("should reject weak password", () => {
      expect(validatePassword("weak")).toBe(false);
    });
  });
});
```

#### Component Test Example

```typescript
// src/components/__tests__/button.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../ui/button'

describe('Button Component', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('should handle click events', async () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    await userEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

#### API Test Example

```typescript
// src/app/api/__tests__/auth.test.ts
import { createMocks } from "node-mocks-http";
import { POST } from "../auth/login/route";

describe("/api/auth/login", () => {
  it("should authenticate valid user", async () => {
    const { req } = createMocks({
      method: "POST",
      body: { email: "test@example.com", password: "password123" },
    });

    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.token).toBeDefined();
  });
});
```

### Testing Checklist

#### ✅ Unit Tests

- [ ] Test utility functions with edge cases
- [ ] Test validation schemas with invalid data
- [ ] Test error handling scenarios
- [ ] Test authentication helpers
- [ ] Mock external dependencies

#### ✅ Component Tests

- [ ] Test component rendering
- [ ] Test user interactions
- [ ] Test form submissions
- [ ] Test error states
- [ ] Test loading states
- [ ] Use custom render with providers

#### ✅ API Tests

- [ ] Test successful requests
- [ ] Test validation errors
- [ ] Test authentication/authorization
- [ ] Test database errors
- [ ] Mock external services

#### ✅ E2E Tests

- [ ] Test complete user workflows
- [ ] Test cross-browser compatibility
- [ ] Test responsive design
- [ ] Test critical user paths
- [ ] Test error recovery

### Mock Service Worker (MSW) Setup

```typescript
// src/test-utils/mocks/auth.ts
import { http, HttpResponse } from "msw";

export const authHandlers = [
  http.post("/api/auth/login", async ({ request }) => {
    const body = await request.json();

    if (body.email === "test@example.com") {
      return HttpResponse.json({
        success: true,
        data: { token: "mock-jwt-token", user: mockUser },
      });
    }

    return HttpResponse.json(
      { success: false, error: "Invalid credentials" },
      { status: 401 }
    );
  }),
];
```

This architecture ensures maintainable, scalable, and consistent code across the entire application. Follow these patterns for all new features and components.
