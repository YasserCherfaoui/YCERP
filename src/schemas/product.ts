import { z } from "zod";


export const createProductSchema = z.object({
    company_id: z.number(),
    name: z.string().min(1, { message: "Product name is required" }),
    first_price: z.number().min(0, { message: "Price must be positive" }),
    franchise_price: z.number().min(0, { message: "Price must be positive" }),
    vip_franchise_price: z.number().min(0, { message: "VIP franchise price must be positive" }).optional(),
    price: z.number().min(0, { message: "Price must be positive" }),
    promo_price: z.number().min(0, { message: "Promo price must be positive" }).optional(),
    description: z.string().min(1, { message: "Description is required" }),
    sizes: z.array(z.number()).optional(),
    colors: z.array(z.string(), { message: "Color is required" }).optional(),
    is_bogo: z.boolean().optional(),
    pairable: z.boolean().optional(),
    combinable: z.boolean().optional(),
    is_pack: z.boolean().optional(),
    pack_quantity: z.number().int().min(2, { message: "Pack quantity must be at least 2" }).optional(),
    pack_price: z.number().min(0, { message: "Pack price must be positive" }).nullable().optional(),
    pack_margin_type: z.enum(["fixed", "percent"]).optional(),
    pack_margin_value: z.number().min(0, { message: "Extra margin cannot be negative" }).optional(),
    is_active: z.boolean().optional(),
    franchise_ship_commission: z.number().min(0).optional(),
    product_category_id: z.number().nullable().optional(),
}).superRefine((data, ctx) => {
    if (data.is_pack) {
        if (!data.pack_quantity || data.pack_quantity < 2) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["pack_quantity"],
                message: "Pack quantity must be at least 2",
            });
        }
        if (data.pack_price == null || data.pack_price <= 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["pack_price"],
                message: "Pack price must be greater than 0",
            });
        }
    }
});


export const productDefaultValues = {

    name: "",
    first_price: 0,
    franchise_price: 0,
    vip_franchise_price: 0,
    price: 0,
    description: "",
    colors: [],
    sizes: [],
    is_bogo: false,
    pairable: false,
    combinable: false,
    is_pack: false,
    pack_quantity: 2,
    pack_price: undefined as number | undefined,
    pack_margin_type: "fixed" as "fixed" | "percent",
    pack_margin_value: 0,
    is_active: true,
    product_category_id: null,
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
    promo_price: z.number().min(0, { message: "Promo price must be positive" }).optional(),
    description: z.string().optional(),
    is_woo_picture: z.boolean().optional(),
    is_bogo: z.boolean().optional(),
    pairable: z.boolean().optional(),
    combinable: z.boolean().optional(),
    is_pack: z.boolean().optional(),
    pack_quantity: z.number().int().min(2, { message: "Pack quantity must be at least 2" }).optional(),
    pack_price: z.number().min(0, { message: "Pack price must be positive" }).nullable().optional(),
    pack_margin_type: z.enum(["fixed", "percent"]).optional(),
    pack_margin_value: z.number().min(0, { message: "Extra margin cannot be negative" }).optional(),
    is_active: z.boolean().optional(),
    franchise_ship_commission: z.coerce.number().min(0).optional(),
    product_category_id: z.number().nullable().optional(),
}).superRefine((data, ctx) => {
    if (data.is_pack) {
        if (!data.pack_quantity || data.pack_quantity < 2) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["pack_quantity"],
                message: "Pack quantity must be at least 2",
            });
        }
        if (data.pack_price == null || data.pack_price <= 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["pack_price"],
                message: "Pack price must be greater than 0",
            });
        }
    }
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
    search: z.string().optional(),
    sort_by: z.string().optional(),
    sort_order: z.enum(["asc", "desc"]).optional(),
});

export type SalesQuantityRequestSchema = z.infer<typeof salesQuantityRequestSchema>