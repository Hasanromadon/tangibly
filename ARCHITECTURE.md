# Tangibly - Standardized Architecture Guidelines

## 🏗️ **SOLID Principles Implementation**

This document outlines the standardized architecture patterns for building components and APIs in the Tangibly asset management system. Follow these patterns for consistency and maintainability.

## 📁 **Project Structure**

```
src/
├── lib/                     # Core utilities following Single Responsibility
│   ├── api-client.ts       # Base HTTP client with error handling
│   ├── utils.ts            # Utility functions
│   └── auth.ts             # Authentication utilities
├── services/               # API service layer (Business Logic)
│   ├── auth-api.ts         # Authentication API service
│   ├── user-api.ts         # User management API service
│   └── asset-api.ts        # Asset management API service
├── hooks/                  # React Query hooks (Interface Segregation)
│   ├── useAuth.ts          # Authentication hooks
│   ├── useUsers.ts         # User management hooks
│   └── useAssets.ts        # Asset management hooks
├── schemas/                # Zod validation schemas
│   ├── auth-schemas.ts     # Authentication forms validation
│   ├── user-schemas.ts     # User management validation
│   └── asset-schemas.ts    # Asset management validation
├── components/
│   ├── ui/                 # Base UI components (Dependency Inversion)
│   ├── forms/              # Reusable form components
│   └── features/           # Feature-specific components
├── contexts/               # React contexts for state management
└── app/                    # Next.js app router pages
```

## 🔧 **API Client Pattern (Single Responsibility)**

### Base API Client

```typescript
// src/lib/api-client.ts
export class BaseApiClient {
  protected client: AxiosInstance;

  constructor(baseURL: string, timeout: number) {
    this.client = axios.create({ baseURL, timeout });
    this.setupInterceptors();
  }

  // Generic HTTP methods
  protected async get<T>(url: string): Promise<ApiResponse<T>>;
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

## 🎣 **React Query Hooks Pattern (Interface Segregation)**

### Authentication Hooks

```typescript
// src/hooks/useAuth.ts
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
      // Handle success
    },
    onError: error => {
      // Handle error
    },
  });
}

// Query keys for cache management
export const authQueryKeys = {
  all: ["auth"] as const,
  user: () => [...authQueryKeys.all, "user"] as const,
} as const;
```

## 📝 **Form Pattern (Open/Closed Principle)**

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

## 🔐 **API Route Pattern (Dependency Inversion)**

### Standard API Response

```typescript
// src/lib/api-response.ts
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

### API Route Implementation

```typescript
// src/app/api/auth/login/route.ts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = loginSchema.parse(body);

    // Business logic
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

## 🎯 **Component Standards**

### 1. **Single Responsibility**

- Each component has one clear purpose
- Separate business logic from UI logic
- Use custom hooks for complex state management

### 2. **Open/Closed Principle**

- Components are open for extension via props
- Closed for modification of core functionality
- Use composition over inheritance

### 3. **Liskov Substitution**

- Form field components implement consistent interfaces
- Base components can be replaced without breaking functionality

### 4. **Interface Segregation**

- Small, focused prop interfaces
- Optional props for specific use cases
- Separate concerns into different hooks

### 5. **Dependency Inversion**

- Components depend on abstractions (hooks, contexts)
- High-level modules don't depend on low-level modules
- Inject dependencies through props or context

## 📋 **Checklist for New Components**

### ✅ API Service

- [ ] Extends BaseApiClient
- [ ] Has typed endpoints object
- [ ] Uses consistent method names
- [ ] Exports singleton instance
- [ ] Has proper error handling

### ✅ React Query Hook

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

This architecture ensures maintainable, scalable, and consistent code across the entire application. Follow these patterns for all new features and components.
