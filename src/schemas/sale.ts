import { z } from "zod";


const saleItemSchema = z.object({
    product_variant_id: z.number(),
    discount: z.number(),
    quantity: z.number().min(1, {
        message: "Quantity must be greater than 0"
    })
})

export const createSaleSchema = z.object({
    location_id: z.number(),
    sale_items: z.array(saleItemSchema),
    discount: z.number(),
    sale_type: z.string(),
    phone_number: z.string().optional(),
    rating: z.number().min(1).max(5).optional().nullable(),
})

export type CreateSaleSchema = z.infer<typeof createSaleSchema>;
export type SaleItemSchema = z.infer<typeof saleItemSchema>;