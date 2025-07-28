import { z } from "zod";
// Validation schemas
export const createCompanySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  code: z.string().min(1, "Company code is required").max(10),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default("Indonesia"),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  taxId: z.string().optional(), // NPWP
  industry: z.string().optional(),
});
