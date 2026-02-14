import { z } from "zod";


export const updateInventoryItem = z.object({
    quantity: z.number(),
    comment: z.string().optional(),
    transaction_type: z.string().optional(),
});

export type UpdateInventoryItemSchema = z.infer<typeof updateInventoryItem>;