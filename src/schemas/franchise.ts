import { z } from "zod";

export const createFranchiseSchema = z.object({
    company_id: z.number(),
    name: z.string().min(1, { message: "Franchise name is required" }),
    address: z.string().min(1, { message: "Franchise address is required" }),
    city: z.string().min(1, { message: "Franchise city is required" }),
    state: z.string().min(1, { message: "Franchise state is required" }),
    franchise_admin_name: z.string().min(1, { message: "Franchise admin name is required" }),
    franchise_admin_email: z.string().email({ message: "Invalid email address" }),
    franchise_admin_password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
})

export type CreateFranchiseSchema = z.infer<typeof createFranchiseSchema>