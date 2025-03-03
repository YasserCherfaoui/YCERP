import { z } from "zod";

export const createExitBillSchema = z.object({
    bill_items: z.array(z.object({
        product_variant_id: z.number(),
        quantity: z.number().min(1, { message: "Quantity must be at least 1" }),
    })),
    franchise_id: z.number(),
    company_id: z.number(),
})

const ItemSchema = z.object({
    product_variant_id: z.number(),
    quantity: z.number(),
});

export const createEntryBillSchema = z.object({
    exit_bill_id: z.number(),
    bill_items: z.array(ItemSchema),
    missing_items: z.array(ItemSchema).optional(),
    broken_items: z.array(ItemSchema).optional(),
    extra_items: z.array(ItemSchema).optional(),
})

export type CreateExitBillSchema = z.infer<typeof createExitBillSchema>
export type CreateEntryBillSchema = z.infer<typeof createEntryBillSchema>
