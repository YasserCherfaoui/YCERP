import { z } from "zod";

export const issueReplySchema = z.object({
  reply: z.string().min(1, { message: "Reply is required" }),
  issue_ticket_id: z.number().nullable(),
  order_ticket_id: z.number().nullable(),
}).refine(
  (data) => data.issue_ticket_id === null || data.order_ticket_id === null,
  {
    message: "Either issue_ticket_id or order_ticket_id must be provided.",
    path: ["issue_ticket_id", "order_ticket_id"],
  }
);

export type IssueReplySchema = z.infer<typeof issueReplySchema>; 