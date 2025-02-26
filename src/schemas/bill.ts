import { z } from "zod";

export const createExitBillSchema = z.object({
    bill_items: z.array(z.object({
        product_variant_id: z.number(),
        quantity: z.number().min(1, { message: "Quantity must be at least 1" }),
    })),
    franchise_id: z.number(),
    company_id: z.number(),
})

export type CreateExitBillSchema = z.infer<typeof createExitBillSchema>
