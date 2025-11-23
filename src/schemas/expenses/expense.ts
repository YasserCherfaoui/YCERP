import { z } from "zod";

export const expenseSchema = z.object({
  company_id: z.number().int().positive().optional(),
  franchise_id: z.number().int().positive().optional(),
  title: z.string().min(1),
  description: z.string().optional().default(""),
  category: z.string().min(1),
  amount: z.number().int().positive(),
  currency: z.string().min(1).default("DZD"),
  date: z.string().min(1), // YYYY-MM-DD or RFC3339
  payment_method: z.string().min(1),
  vendor: z.string().optional().default(""),
  created_by: z.number().int().positive(),
}).refine((data) => (data.company_id !== undefined && data.company_id > 0) || (data.franchise_id !== undefined && data.franchise_id > 0), {
  message: "Either company_id or franchise_id must be provided",
}).refine((data) => !(data.company_id && data.franchise_id), {
  message: "Cannot provide both company_id and franchise_id",
});

export type ExpenseCreateSchema = z.infer<typeof expenseSchema>;

export const expenseUpdateSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  amount: z.number().int().positive().optional(),
  currency: z.string().optional(),
  date: z.string().optional(),
  payment_method: z.string().optional(),
  vendor: z.string().optional(),
  updated_by: z.number().int().positive(),
});

export type ExpenseUpdateSchema = z.infer<typeof expenseUpdateSchema>;


