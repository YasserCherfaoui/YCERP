
import { Sale } from "@/models/data/sale.model";
import * as z from "zod";




export const createSaleReturnSchema = z.object({
    sale_id: z.number(),
    reason: z.string().optional(),
    type: z.string().optional(),
    comment: z.string().optional(),
    return_items: z.array(z.object({
        product_variant_id: z.number(),
        quantity: z.number(),
    })),
    cost: z.number().int(),
    exchange_items: z.array(z.object({
        product_variant_id: z.number(),
        quantity: z.number(),
        discount: z.number().int(),
    })),
    exchange_discount: z.number().int().optional(),
    extra_costs: z.number().int(),
});

export const makeCreateSaleReturnSchema = (sale: Sale) => z.object({
    sale_id: z.number(),
    reason: z.string().optional(),
    type: z.string().optional(),
    comment: z.string().optional(),
    return_items: z.array(z.object({
        product_variant_id: z.number(),
        quantity: z.number(),
    })),
    cost: z.number().int(),
    exchange_items: z.array(z.object({
        product_variant_id: z.number().min(1, "Please insert a product"),
        quantity: z.number().min(1, "please insert a quantity > 0 or remove the item"),
        discount: z.number(),
    })),
    exchange_discount: z.number().int().optional(),
    extra_costs: z.number().int(),
}).superRefine((val, ctx) => {
    if (val.return_items.filter(r => r.quantity > 0).length == 0) {
        val.return_items.forEach((_, idx) => {
            ctx.addIssue(
                {
                    code: z.ZodIssueCode.custom,
                    message: `At least one item should have a quantity > 0`,
                    path: [`return_items`, idx, `quantity`]
                }
            )
        })
    }
    val.return_items.forEach((item, idx) => {
        const saleItem = sale.sale_items.find(
            (si) => si.product_variant_id === item.product_variant_id
        );
        if (!saleItem) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `No sale item found with product_variant_id ${item.product_variant_id}`,
                path: [`return_items`, idx, `product_variant_id`],
            });
            return;
        }
        if (item.quantity > saleItem.quantity) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Quantity ${item.quantity} is greater than the quantity in sale ${saleItem.quantity}`,
                path: [`return_items`, idx, `quantity`],
            });
        }
    });
});

export type CreateSaleReturnSchema = z.infer<typeof createSaleReturnSchema>;


export const createUnknownReturnSchema = z.object({
    return_items: z.array(z.object({
        product_variant_id: z.number().min(1, "Please insert a product"),
        quantity: z.number().min(1, "please insert a quantity > 0 or remove the item"),
    })),
    cost: z.number(),
    location_id: z.number().min(1, "Please select a location")
}).superRefine((val, ctx) => {
    if (val.return_items.length < 1) {
        ctx.addIssue(
            {
                code: z.ZodIssueCode.custom,
                message: `At least one product should be selected.`,
                path: [`cost`]
            }
        )
    }
});

export type CreateUnknownReturnSchema = z.infer<typeof createUnknownReturnSchema>;