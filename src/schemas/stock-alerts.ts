import { z } from "zod";

export const AlertConfigSchema = z.object({
  location_type: z.enum(["company", "franchise"]),
  location_id: z.number().positive(),
  low_stock_threshold: z.number().min(0, "Must be 0 or greater"),
  reorder_point: z.number().min(0, "Must be 0 or greater"),
  overstock_threshold: z.number().min(0, "Must be 0 or greater").optional().nullable(),
  enable_email_alerts: z.boolean(),
  enable_in_app_alerts: z.boolean(),
  email_recipients: z.array(z.string().email("Invalid email address")),
});

export type AlertConfigFormData = z.infer<typeof AlertConfigSchema>;

