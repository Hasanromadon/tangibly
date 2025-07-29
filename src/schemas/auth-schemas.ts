import { z } from "zod";
import { VALIDATION_LIMITS } from "@/constants";

// Indonesian phone number validation
const indonesianPhoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;

// NPWP validation (15 digits in XX.XXX.XXX.X-XXX.XXX format)
const npwpRegex = /^\d{2}\.\d{3}\.\d{3}\.\d{1}-\d{3}\.\d{3}$/;

// Email validation for Indonesian domains (optional but recommended)
const emailSchema = z
  .string()
  .email("Invalid email format")
  .min(1, "Email is required");

// Password validation with strong requirements
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/\d/, "Password must contain at least one number")
  .regex(
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    "Password must contain at least one special character"
  );

// Company information schema
export const companySchema = z.object({
  name: z
    .string()
    .min(1, "Company name is required")
    .min(
      VALIDATION_LIMITS.COMPANY.NAME_MIN,
      `Company name must be at least ${VALIDATION_LIMITS.COMPANY.NAME_MIN} characters`
    )
    .max(
      VALIDATION_LIMITS.COMPANY.NAME_MAX,
      `Company name must not exceed ${VALIDATION_LIMITS.COMPANY.NAME_MAX} characters`
    ),

  npwp: z
    .string()
    .min(1, "NPWP is required")
    .regex(npwpRegex, "NPWP must be in format XX.XXX.XXX.X-XXX.XXX"),

  phone: z
    .string()
    .min(1, "Phone number is required")
    .max(
      VALIDATION_LIMITS.COMPANY.PHONE_MAX,
      `Phone number must not exceed ${VALIDATION_LIMITS.COMPANY.PHONE_MAX} characters`
    )
    .regex(
      indonesianPhoneRegex,
      "Please enter a valid Indonesian phone number"
    ),

  email: emailSchema,

  address: z
    .string()
    .min(1, "Address is required")
    .min(
      VALIDATION_LIMITS.COMPANY.ADDRESS_MIN,
      `Address must be at least ${VALIDATION_LIMITS.COMPANY.ADDRESS_MIN} characters`
    )
    .max(
      VALIDATION_LIMITS.COMPANY.ADDRESS_MAX,
      `Address must not exceed ${VALIDATION_LIMITS.COMPANY.ADDRESS_MAX} characters`
    ),
});

// User information schema
export const userSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .min(
      VALIDATION_LIMITS.USER.FIRST_NAME_MIN,
      `First name must be at least ${VALIDATION_LIMITS.USER.FIRST_NAME_MIN} characters`
    )
    .max(
      VALIDATION_LIMITS.USER.FIRST_NAME_MAX,
      `First name must not exceed ${VALIDATION_LIMITS.USER.FIRST_NAME_MAX} characters`
    )
    .regex(
      /^[a-zA-Z.'-]+$/,
      "First name can only contain letters, dots, apostrophes, and hyphens"
    ),

  lastName: z
    .string()
    .min(1, "Last name is required")
    .min(
      VALIDATION_LIMITS.USER.LAST_NAME_MIN,
      `Last name must be at least ${VALIDATION_LIMITS.USER.LAST_NAME_MIN} characters`
    )
    .max(
      VALIDATION_LIMITS.USER.LAST_NAME_MAX,
      `Last name must not exceed ${VALIDATION_LIMITS.USER.LAST_NAME_MAX} characters`
    )
    .regex(
      /^[a-zA-Z.'-]+$/,
      "Last name can only contain letters, dots, apostrophes, and hyphens"
    ),

  email: emailSchema,

  password: passwordSchema,
});

// Login form schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

// Registration form schema
export const registerSchema = z
  .object({
    company: companySchema,
    user: userSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    agreeTerms: z
      .boolean()
      .refine(
        val => val === true,
        "You must agree to the terms and conditions"
      ),
  })
  .refine(data => data.user.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Invite user schema
export const inviteUserSchema = z.object({
  email: emailSchema,
  role: z.enum(["user", "manager", "admin", "viewer"], {
    message: "Invalid role selected",
  }),
});

// Change password schema
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// User profile update schema
export const updateProfileSchema = z.object({
  firstName: userSchema.shape.firstName,
  lastName: userSchema.shape.lastName,
  email: emailSchema,
  phone: z
    .string()
    .regex(indonesianPhoneRegex, "Please enter a valid Indonesian phone number")
    .optional(),
});

// Type exports for TypeScript
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type InviteUserFormData = z.infer<typeof inviteUserSchema>;

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

// Utility function for NPWP formatting
export const formatNPWP = (value: string): string => {
  // Remove all non-numeric characters
  const numbers = value.replace(/\D/g, "");

  // Format as XX.XXX.XXX.X-XXX.XXX
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
  if (numbers.length <= 8)
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
  if (numbers.length <= 9)
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}.${numbers.slice(8)}`;
  if (numbers.length <= 12)
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}.${numbers.slice(8, 9)}-${numbers.slice(9)}`;
  return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}.${numbers.slice(8, 9)}-${numbers.slice(9, 12)}.${numbers.slice(12, 15)}`;
};

// Utility function for phone number formatting
export const formatPhoneNumber = (value: string): string => {
  // Remove all non-numeric characters except +
  const numbers = value.replace(/[^\d+]/g, "");

  // Handle different formats
  if (numbers.startsWith("+62")) {
    return numbers;
  } else if (numbers.startsWith("62")) {
    return `+${numbers}`;
  } else if (numbers.startsWith("0")) {
    return `+62${numbers.slice(1)}`;
  } else if (numbers.startsWith("8")) {
    return `+62${numbers}`;
  }

  return numbers;
};
