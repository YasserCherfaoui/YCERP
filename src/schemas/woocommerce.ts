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



