import * as z from "zod";

export const loginAffiliateSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export const registerAffiliateSchema = z.object({
  full_name: z.string().min(1, { message: "Full name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  phone: z.string().min(1, { message: "Phone number is required" }),
  address: z.string().min(1, { message: "Address is required" }),
  city: z.string().min(1, { message: "City is required" }),
  state: z.string().min(1, { message: "State is required" }),
  zip: z.string().min(1, { message: "ZIP code is required" }),
  company_id: z.coerce.number().int().positive({ message: "Company ID is required" }),
  is_pro: z.boolean().optional().default(false),
});

// Password Reset Schemas
export const requestPasswordResetSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

export const verifyOTPSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  otp_code: z.string()
    .min(6, { message: "OTP code must be 6 digits" })
    .max(6, { message: "OTP code must be 6 digits" })
    .regex(/^\d{6}$/, { message: "OTP code must be 6 digits" }),
});

export const resetPasswordSchema = z.object({
  verification_token: z.string().min(1, { message: "Verification token is required" }),
  new_password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

export type LoginAffiliateSchema = z.infer<typeof loginAffiliateSchema>;
export type RegisterAffiliateSchema = z.infer<typeof registerAffiliateSchema>;
export type RequestPasswordResetSchema = z.infer<typeof requestPasswordResetSchema>;
export type VerifyOTPSchema = z.infer<typeof verifyOTPSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>; 