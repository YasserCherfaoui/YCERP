import { z } from "zod";


export const createProductSchema = z.object({
    company_id: z.number(),
    name: z.string().min(1, { message: "Product name is required" }),
    first_price: z.number().min(0, { message: "Price must be positive" }),
    franchise_price: z.number().min(0, { message: "Price must be positive" }),
    vip_franchise_price: z.number().min(0, { message: "VIP franchise price must be positive" }).optional(),
    price: z.number().min(0, { message: "Price must be positive" }),
    description: z.string().min(1, { message: "Description is required" }),
    sizes: z.array(z.number()).optional(),
    colors: z.array(z.string(), { message: "Color is required" }).optional(),
    is_active: z.boolean().optional(),
})


export const productDefaultValues = {

    name: "",
    first_price: 0,
    franchise_price: 0,
    vip_franchise_price: 0,
    price: 0,
    description: "",
    colors: [],
    sizes: [],
    is_active: true,
}


export type CreateProductSchema = z.infer<typeof createProductSchema>

export const generateBarcodePDFSchema = z.object({
    variants: z.array(
        z.object({
            product_variant_id: z.number(),
            quantity: z.number(),
        })
    ),
    width: z.number(),
    height: z.number(),
    margin: z.number(),
    columns_per_page: z.number().int().min(1),
    rows_per_page: z.number().int().min(1),
});

export const defaultPDFValues = {
    variants: [],
    width: 80,
    height: 50,
    margin: 1,
    columns_per_page: 1,
    rows_per_page: 4,
}

export type GenerateBarcodePDFSchema = z.infer<
    typeof generateBarcodePDFSchema
>;


export const updateProductSchema = z.object({
    name: z.string().min(1).optional(),
    first_price: z.number().optional(),
    franchise_price: z.number().optional(),
    vip_franchise_price: z.number().min(0, { message: "VIP franchise price must be positive" }).optional(),
    price: z.number().optional(),
    description: z.string().optional(),
    is_woo_picture: z.boolean().optional(),
    is_active: z.boolean().optional(),
});

export type UpdateProductSchema = z.infer<typeof updateProductSchema>

export const createProductVariantSchema = z.object({
    company_id: z.number(),
    product_id: z.number(),
    color: z.array(z.string().min(1, { message: "Color is required" }), { message: "Color is required" }),
    size: z.array(z.number().min(1, { message: "Size is required" }), { message: "Size is required" }),
});

export type CreateProductVariantSchema = z.infer<typeof createProductVariantSchema>


export const salesQuantityRequestSchema = z.object({
    company_id: z.number(),
    start_date: z.date(),
    end_date: z.date(),
    page: z.number().optional(),
    limit: z.number().optional(),
});

export type SalesQuantityRequestSchema = z.infer<typeof salesQuantityRequestSchema>