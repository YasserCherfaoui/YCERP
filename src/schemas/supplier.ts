import { z } from "zod";

export const createSupplierSchema = z.object({
    supplier_name: z.string().min(3, { message: "Name must be at least 3 characters" }),
    phone_number: z.string().min(10, { message: "Phone must be at least 10 characters" }),
    address: z.string().min(3, { message: "Address must be at least 3 characters" }),
    company_id: z.number(),
    administrator_id: z.number().nullable(),
    user_id: z.number(),
});

export const createSupplierBillSchema = z.object({
    supplier_id: z.number(),
    company_id: z.number(),
    user_id: z.number().nullable(),
    administrator_id: z.number().nullable(),
    items: z.array(z.object({
        product_variant_id: z.number(),
        quantity: z.number(),
    })),
    total: z.number(),
    paid: z.number()
})

export const createSupplierPayment = z.object({
    company_id: z.number(),
    supplier_id: z.number().min(1),
    administrator_id: z.number().nullable(),
    amount: z.number().min(1),
    comment: z.string()
})

export type CreateSupplierSchema = z.infer<typeof createSupplierSchema>;
export type CreateSupplierBillSchema = z.infer<typeof createSupplierBillSchema>;
export type CreateSupplierPayment = z.infer<typeof createSupplierPayment>;