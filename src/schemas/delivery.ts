

import { z } from "zod";

export const createDeliveryCompanySchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  company_id: z.number().int().positive({ message: "Company ID must be a positive number" }),
});

export type CreateDeliveryCompanySchema = z.infer<typeof createDeliveryCompanySchema>;

export const createEmployeeSchema = z.object({
  delivery_company_id: z.number().int().positive({ message: "Delivery company ID must be a positive number" }),
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export type CreateEmployeeSchema = z.infer<typeof createEmployeeSchema>;
