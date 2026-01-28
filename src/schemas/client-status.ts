import { z } from "zod";

export const createClientStatusSchema = z.object({
    order_id: z.number().nullable().optional(),
    woo_order_id: z.number().nullable().optional(),
    order_ticket_id: z.number().nullable().optional(),
    qualification_id: z.number({ required_error: "Qualification is required" }),
    sub_qualification_id: z.number().nullable().optional(),
    comment: z.string().optional(),
    date: z.string().min(1, "Date is required"),
    notify_via_whatsapp: z.boolean().optional().default(false),
}).refine(
    (data) => {
        const hasOrder = data.order_id != null;
        const hasWooOrder = data.woo_order_id != null;
        const hasOrderTicket = data.order_ticket_id != null;
        const count = [hasOrder, hasWooOrder, hasOrderTicket].filter(Boolean).length;
        return count === 1;
    },
    {
        message: "Exactly one of order_id, woo_order_id, or order_ticket_id must be provided",
    }
);

export type CreateClientStatusSchema = z.infer<typeof createClientStatusSchema>; 