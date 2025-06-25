import { z } from "zod";

export const assignRequest = z.object({
    orders_ids: z.array(z.number()),
    user_id: z.number(),
});

export type AssignRequest = z.infer<typeof assignRequest>;

export const shuffleRequest = z.object({
    selected_users: z.array(z.number()),
});

export type ShuffleRequest = z.infer<typeof shuffleRequest>;


export const updateWooCommerceOrderStatusRequest = z.object({
  order_id: z.number(),
  status: z.string(),
});

export type UpdateWooCommerceOrderStatusRequest = z.infer<typeof updateWooCommerceOrderStatusRequest>;

export const declareEmptyExchangeRequest = z.object({
  woo_order_id: z.number(),
  reason: z.string(),
  comments: z.string().optional(),
});

export type DeclareEmptyExchangeRequest = z.infer<typeof declareEmptyExchangeRequest>;