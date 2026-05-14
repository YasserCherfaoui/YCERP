import { z } from "zod";

export const createCompanySchema = z.object(
    {
        company_name: z.string().min(3, { message: "Company name must be at least 3 characters long" }),
        address: z.string().min(10, { message: "Company address must be at least 10 characters long" }),
    }
)

export type CreateCompanySchema = z.infer<typeof createCompanySchema>;

export const updateCompanySchema = z.object({
  company_name: z.string().min(3, { message: "Company name must be at least 3 characters long" }),
  address: z.string().min(10, { message: "Company address must be at least 10 characters long" }),
  logo: z.string().optional(),
  registration_number: z.string().optional(),
  vat_number: z.string().optional(),
  vip_allow_bogo: z.boolean().optional(),
  vip_allow_pairable: z.boolean().optional(),
  vip_allow_combinable: z.boolean().optional(),
});

export type UpdateCompanySchema = z.infer<typeof updateCompanySchema>;