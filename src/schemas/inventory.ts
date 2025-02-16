import { z } from "zod";

export const createInventoryItemSchema = z.object({
    product_id: z.number(),
    product_variant_id: z.number(),
    quantity: z.number().min(1, { message: "Quantity must be at least 1" })
})

export type CreateInventoryItemSchema = z.infer<typeof createInventoryItemSchema>
