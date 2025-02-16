import { z } from "zod";

export const createCompanySchema = z.object(
    {
        company_name: z.string().min(3, { message: "Company name must be at least 3 characters long" }),
        address: z.string().min(10, { message: "Company address must be at least 10 characters long" }),
    }
)

export type CreateCompanySchema = z.infer<typeof createCompanySchema>;