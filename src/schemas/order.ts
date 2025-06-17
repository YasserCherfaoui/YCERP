import { z } from "zod";

export const createOrderItemSchema = z.object({
  product_id: z.number().min(1, { message: "Product is required" }),
  product_variant_id: z.number().min(1, { message: "Product variant is required" }),
  discount: z.number().optional().default(0),
  quantity: z.number().min(1),
});

export const createShippingSchema = z.object({
  full_name: z.string(),
  phone_number: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  wilaya: z.string(),
  commune: z.string(),
  delivery_id: z.number().optional().nullable(),
  comments: z.string().optional(),
});

export const createOrderSchema = z.object({
  woo_order_id: z.number().optional(),
  company_id: z.number(),
  shipping: createShippingSchema,
  order_items: z.array(createOrderItemSchema),
  total: z.number(),
  status: z.string(),
  discount: z.number().optional(),
  taken_by_id: z.number().optional(),
  shipping_provider: z.enum(['yalidine', 'my_companies']),
  delivery_type: z.enum(['home', 'stopdesk']),
  selected_commune: z.string().optional(),
  selected_center: z.string().optional(),
  first_delivery_cost: z.number().optional(),
  second_delivery_cost: z.number().optional(),
}).superRefine((data, ctx) => {
  if (data.shipping_provider === 'yalidine') {
    if (data.delivery_type === 'home' && !data.selected_commune) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Commune must be selected for Yalidine Home delivery',
        path: ['selected_commune'],
      });
    }
    if (data.delivery_type === 'stopdesk' && !data.selected_center) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Center must be selected for Yalidine Stop Desk delivery',
        path: ['selected_center'],
      });
    }
  }
  if (data.shipping_provider === 'my_companies' && !data.shipping.delivery_id) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'A delivery company must be selected',
      path: ['shipping', 'delivery_id'],
    });
  }
});

export const exchangeWooOrderSchema = z.object({
  original_order_id: z.number(),
  returned_items: z.array(z.object({
    product_variant_id: z.number(),
    quantity: z.number().nullable().default(0)
  })),
  exchange_items: z.array(z.object({
    product_variant_id: z.number(),
    quantity: z.number(),
    discount: z.number().optional()
  })),
  reason: z.string().optional(),
  return_type: z.string().optional(),
  comment: z.string().optional(),
  cost: z.number().optional(),
  exchange_type: z.string().optional(),
  exchange_reason: z.string().optional(),
  exchange_discount: z.number().optional(),
  extra_costs: z.number().optional(),
  shipping: createShippingSchema,
  total: z.number(),
  discount: z.number().optional(),
  shipping_provider: z.enum(['yalidine', 'my_companies']),
  delivery_type: z.enum(['home', 'stopdesk']),
  selected_commune: z.string().optional(),
  selected_center: z.string().optional(),
  first_delivery_cost: z.number().optional(),
  second_delivery_cost: z.number().optional()
}).superRefine((data, ctx) => {
  if (data.shipping_provider === 'yalidine') {
    if (data.delivery_type === 'home' && !data.selected_commune) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Commune must be selected for Yalidine Home delivery',
        path: ['selected_commune'],
      });
    }
    if (data.delivery_type === 'stopdesk' && !data.selected_center) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Center must be selected for Yalidine Stop Desk delivery',
        path: ['selected_center'],
      });
    }
  }
  if (data.shipping_provider === 'my_companies' && !data.shipping.delivery_id) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'A delivery company must be selected',
      path: ['shipping', 'delivery_id'],
    });
  }
  // check if the sum of the returned items is not zero
  if (data.returned_items.reduce((acc, item) => acc + (item.quantity || 0), 0) === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'The sum of the returned items must be greater than zero',
      path: ['returned_items'],
    });
  }
});

export type ExchangeWooOrderSchema = z.infer<typeof exchangeWooOrderSchema>;
export type CreateOrderSchema = z.infer<typeof createOrderSchema>;
export type CreateOrderItemSchema = z.infer<typeof createOrderItemSchema>;
export type CreateShippingSchema = z.infer<typeof createShippingSchema>; 