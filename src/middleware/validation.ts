/**
 * Validation Middleware
 * Enhanced validation schemas with security checks using centralized utilities
 */
import { z } from "zod";
import { NextRequest } from "next/server";
import { sanitizeInput, validatePasswordStrength } from "./utils";

// Enhanced validation schemas with security checks
export const secureEmailSchema = z
  .string()
  .email("Invalid email format")
  .min(5, "Email too short")
  .max(254, "Email too long")
  .refine(email => {
    // Check for common injection patterns
    const maliciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
      /\beval\b/i,
      /\bexec\b/i,
    ];
    return !maliciousPatterns.some(pattern => pattern.test(email));
  }, "Invalid email format");

export const securePasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password too long")
  .refine(password => {
    const validation = validatePasswordStrength(password);
    return validation.isValid;
  }, "Password does not meet security requirements");

export const secureNameSchema = z
  .string()
  .min(1, "Name is required")
  .max(100, "Name too long")
  .refine(name => {
    // Prevent XSS and injection
    const cleaned = name.replace(/[<>\"'&]/g, "");
    return cleaned === name;
  }, "Name contains invalid characters");

export const secureIdSchema = z
  .string()
  .uuid("Invalid ID format")
  .refine(id => {
    // Additional UUID validation
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }, "Invalid UUID format");

export const secureTextSchema = z
  .string()
  .max(10000, "Text too long")
  .refine(text => {
    // Check for script injection
    const scriptPattern = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    return !scriptPattern.test(text);
  }, "Text contains invalid content");

// Login validation with additional security
export const secureLoginSchema = z.object({
  email: secureEmailSchema,
  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password too long"),
  captcha: z.string().optional(),
  remember: z.boolean().optional(),
});

// Registration validation
export const secureRegisterSchema = z.object({
  email: secureEmailSchema,
  password: securePasswordSchema,
  name: secureNameSchema,
  terms: z
    .boolean()
    .refine(val => val === true, "Must accept terms and conditions"),
});

// User update validation
export const secureUserUpdateSchema = z.object({
  name: secureNameSchema.optional(),
  email: secureEmailSchema.optional(),
  avatar: z.string().url("Invalid avatar URL").optional(),
  bio: secureTextSchema.optional(),
});

// Post validation
export const securePostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  content: secureTextSchema,
  published: z.boolean().optional(),
  tags: z.array(z.string().max(50)).max(10, "Too many tags").optional(),
});

// Password change validation
export const securePasswordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: securePasswordSchema,
    confirmPassword: z.string(),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Query parameter validation
export const paginationSchema = z.object({
  page: z
    .string()
    .transform(val => parseInt(val, 10))
    .pipe(z.number().min(1).max(1000))
    .optional(),
  limit: z
    .string()
    .transform(val => parseInt(val, 10))
    .pipe(z.number().min(1).max(100))
    .optional(),
  search: z.string().max(100).optional(),
  sort: z.enum(["asc", "desc"]).optional(),
  sortBy: z.string().max(50).optional(),
});

// Validation middleware creator
export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return async (
    request: NextRequest
  ): Promise<
    | { success: true; data: T }
    | {
        success: false;
        errors: Array<{ field: string; message: string; code: string }>;
      }
  > => {
    try {
      let body;
      const contentType = request.headers.get("content-type");

      if (contentType?.includes("application/json")) {
        body = await request.json();
      } else if (contentType?.includes("application/x-www-form-urlencoded")) {
        const formData = await request.formData();
        body = Object.fromEntries(formData);
      } else {
        body = {};
      }

      // Sanitize input before validation using centralized utility
      const sanitizedBody = sanitizeInput(body);

      const result = schema.safeParse(sanitizedBody);

      if (!result.success) {
        return {
          success: false,
          errors: result.error.issues.map(issue => ({
            field: issue.path.join("."),
            message: issue.message,
            code: issue.code,
          })),
        };
      }

      return {
        success: true,
        data: result.data,
      };
    } catch {
      return {
        success: false,
        errors: [
          {
            field: "body",
            message: "Invalid request body",
            code: "invalid_type",
          },
        ],
      };
    }
  };
}

// SQL injection prevention for search queries
export function sanitizeSearchQuery(query: string): string {
  return query
    .replace(/['"`;\\]/g, "") // Remove dangerous characters
    .replace(
      /\b(union|select|insert|delete|update|drop|create|alter|exec|execute)\b/gi,
      ""
    ) // Remove SQL keywords
    .trim()
    .substring(0, 100); // Limit length
}

// File upload validation
export const fileUploadSchema = z.object({
  name: z.string().max(255),
  size: z.number().max(10 * 1024 * 1024), // 10MB limit
  type: z.enum([
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "text/plain",
  ]),
});

// API key validation
export const apiKeySchema = z
  .string()
  .regex(/^[a-zA-Z0-9_-]{32,128}$/, "Invalid API key format");
