import { z } from "zod";

export const createVariantDepositSchema = z.object({
  customer_phone: z.string().min(1, "Customer phone is required"),
  product_variant_id: z.number().int().positive("Select a variant"),
  amount_paid: z.number().int().min(0, "Amount must be 0 or more"),
  quantity: z.number().int().min(1).default(1),
  comment: z.string().optional(),
});

export type CreateVariantDepositSchema = z.infer<typeof createVariantDepositSchema>;

export const updateVariantDepositSchema = z.object({
  status: z.enum(["cancelled", "refunded"]).optional(),
  comment: z.string().optional(),
});

export type UpdateVariantDepositSchema = z.infer<typeof updateVariantDepositSchema>;
