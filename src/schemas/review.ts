import { z } from "zod";

export const createReviewSchema = z.object({
  customer_phone: z.string().min(1, "Phone number is required"),
  woo_order_id: z.number().int().positive().nullable().optional(),
  rating: z.number().int().min(1).max(5, "Rating must be between 1 and 5"),
  comment: z.string().optional(),
  follow_up_call_date: z.string().nullable().optional(),
});

export type CreateReviewSchema = z.infer<typeof createReviewSchema>;

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().optional(),
  follow_up_call_date: z.string().nullable().optional(),
});

export type UpdateReviewSchema = z.infer<typeof updateReviewSchema>;

