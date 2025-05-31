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
});

export const createFranchisePaymentSchema = z.object({
    company_id: z.number().min(1, "Company is required"),
    franchise_id: z.number().min(1, "Franchise is required"),
    administrator_id: z.number(),
    amount: z.number().min(1, "Amount must be greater than 0"),
    comment: z.string(),
});

export const updateExitBillSchema = z.object({
    exit_bill_id: z.number(),
    franchise_id: z.number(),
    company_id: z.number(),
    bill_items: z.array(
        z.object({
            id: z.number().optional(),
            product_variant_id: z.number(),
            quantity: z.number(),
        })
    ),
});

export type CreateFranchisePayment = z.infer<typeof createFranchisePaymentSchema>;
export type CreateExitBillSchema = z.infer<typeof createExitBillSchema>
export type CreateEntryBillSchema = z.infer<typeof createEntryBillSchema>
export type UpdateExitBillSchema = z.infer<typeof updateExitBillSchema>;

