import { z } from "zod";


export const createProductSchema = z.object({
    company_id: z.number(),
    name: z.string().min(1, { message: "Product name is required" }),
    first_price: z.number().min(0, { message: "Price must be positive" }),
    franchise_price: z.number().min(0, { message: "Price must be positive" }),
    price: z.number().min(0, { message: "Price must be positive" }),
    description: z.string().min(1, { message: "Description is required" }),
    sizes: z.array(z.number()).optional(),
    colors: z.array(z.string(), { message: "Color is required" }).optional(),
})


export const productDefaultValues = {

    name: "",
    first_price: 0,
    franchise_price: 0,
    price: 0,
    description: "",
    colors: [],
    sizes: [],
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