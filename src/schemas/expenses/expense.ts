import { z } from "zod";

export const expenseSchema = z.object({
  company_id: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string().optional().default(""),
  category: z.string().min(1),
  amount: z.number().int().positive(),
  currency: z.string().min(1).default("DZD"),
  date: z.string().min(1), // YYYY-MM-DD or RFC3339
  payment_method: z.string().min(1),
  vendor: z.string().optional().default(""),
  created_by: z.number().int().positive(),
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


