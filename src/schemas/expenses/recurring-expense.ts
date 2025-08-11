import { z } from "zod";

export const recurringExpenseCreateSchema = z.object({
  company_id: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string().optional().default(""),
  category: z.string().min(1),
  amount: z.number().int().positive(),
  currency: z.string().min(1).default("DZD"),
  payment_method: z.string().min(1),
  vendor: z.string().optional().default(""),
  day_of_month: z.number().int().min(1).max(28),
  start_month: z.string().min(1), // YYYY-MM-01
  end_month: z.string().nullable().optional(),
  created_by: z.number().int().positive(),
});

export type RecurringExpenseCreateSchema = z.infer<typeof recurringExpenseCreateSchema>;

export const recurringExpenseUpdateSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  amount: z.number().int().positive().optional(),
  currency: z.string().optional(),
  payment_method: z.string().optional(),
  vendor: z.string().optional(),
  day_of_month: z.number().int().min(1).max(28).optional(),
  end_month: z.string().nullable().optional(),
  updated_by: z.number().int().positive(),
});

export type RecurringExpenseUpdateSchema = z.infer<typeof recurringExpenseUpdateSchema>;


