import { z } from "zod";

export const stockMovementLineSchema = z.object({
  product_variant_id: z.number().int().positive(),
  quantity: z.number().int().min(1, { message: "Quantity must be at least 1" }),
});

export const createStockMovementSchema = z
  .object({
    company_id: z.number().int().positive(),
    from_inventory_id: z.number().int().positive(),
    to_inventory_id: z.number().int().positive(),
    items: z.array(stockMovementLineSchema).min(1, { message: "Add at least one item" }),
  })
  .refine((value) => value.from_inventory_id !== value.to_inventory_id, {
    message: "Choose two different inventories",
    path: ["to_inventory_id"],
  });

export type CreateStockMovementSchema = z.infer<typeof createStockMovementSchema>;
