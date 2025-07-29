import { z } from "zod";
export const inviteUserSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase(),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  role: z.enum(["admin", "manager", "user", "viewer"]),
  department: z.string().optional(),
  position: z.string().optional(),
  phone: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

export const acceptInvitationSchema = z.object({
  token: z.string(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
});
