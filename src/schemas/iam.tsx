import { z } from "zod";


export const createUserSchema = z.object({
    full_name: z.string().min(3, { message: "Full name must be at least 3 characters long" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
    phone_number: z.string().min(10, { message: "Phone number must be at least 10 characters long" }),
    owner_id: z.number().int().positive(),
    email: z.string().email({ message: "Invalid email address" }),
    role: z.string().min(1, { message: "Role is required" })
})

export type CreateUserSchema = z.infer<typeof createUserSchema>;