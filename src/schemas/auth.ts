import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" },),
    password: z.string().min(8, { message: "Password must be at least 8 characters long" },),
});

export const registerSchema = z.object({
    full_name: z.string().min(3, { message: "Full name must be at least 3 characters long" },),
    email: z.string().email({ message: "Invalid email address" },),
    password: z.string().min(8, { message: "Password must be at least 8 characters long" },)
})

export type LoginFormSchema = z.infer<typeof loginSchema>;

export type RegisterFormSchema = z.infer<typeof registerSchema>;

