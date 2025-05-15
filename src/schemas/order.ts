import { z } from "zod";

export const createOrderItemSchema = z.object({
  product_id: z.number(),
  product_variant_id: z.number(),
  discount: z.number().optional(),
  quantity: z.number(),
});

export const createShippingSchema = z.object({
  full_name: z.string(),
  phone_number: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  delivery_id: z.number().optional(),
});

export const createOrderSchema = z.object({
  company_id: z.number(),
  shipping: createShippingSchema,
  order_items: z.array(createOrderItemSchema),
  total: z.number(),
  status: z.string(),
  discount: z.number().optional(),
  taken_by_id: z.number().optional(),
});

export type CreateOrderSchema = z.infer<typeof createOrderSchema>;
export type CreateOrderItemSchema = z.infer<typeof createOrderItemSchema>;
export type CreateShippingSchema = z.infer<typeof createShippingSchema>; 