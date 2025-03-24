import { z } from "zod";


export const updateInventoryItem = z.object({
    quantity: z.number()

});

export type UpdateInventoryItemSchema = z.infer<typeof updateInventoryItem>;