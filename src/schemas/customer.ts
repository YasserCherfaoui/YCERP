import { z } from "zod";

export const updateCustomerSchema = z.object({
  birthday: z.string().nullable().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
});

export type UpdateCustomerSchema = z.infer<typeof updateCustomerSchema>;

export const getCustomersSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().optional(),
  min_delivery_rate: z.coerce.number().min(0).max(100).optional(),
  max_delivery_rate: z.coerce.number().min(0).max(100).optional(),
});

export type GetCustomersSchema = z.infer<typeof getCustomersSchema>;

