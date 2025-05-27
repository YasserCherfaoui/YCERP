import { z } from "zod";

export const createClientStatusSchema = z.object({
    order_id: z.number({ required_error: "Order is required" }),
    qualification_id: z.number({ required_error: "Qualification is required" }),
    sub_qualification_id: z.number().nullable(),
    comment: z.string().optional(),
    date: z.string().min(1, "Date is required"),
});

export type CreateClientStatusSchema = z.infer<typeof createClientStatusSchema>; 