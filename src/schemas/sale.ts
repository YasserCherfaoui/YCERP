import { z } from "zod";


const saleItemSchema = z.object({
    product_variant_id: z.number(),
    discount: z.number(),
    quantity: z.number()
})

export const createSaleSchema = z.object({
    location_id: z.number(),
    sale_items: z.array(saleItemSchema),
    discount: z.number(),
})

export type CreateSaleSchema = z.infer<typeof createSaleSchema>;
export type SaleItemSchema = z.infer<typeof saleItemSchema>;