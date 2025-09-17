import { z } from "zod";

export const createMissingVariantRequestSchema = z.object({
  product_variant_id: z.number().min(1, "Product variant ID is required"),
  requested_quantity: z.number().min(1, "Requested quantity must be at least 1"),
  comment: z.string().optional(),
});

export const updateMissingVariantRequestSchema = z.object({
  requested_quantity: z.number().min(1, "Requested quantity must be at least 1"),
  comment: z.string().optional(),
});

export const createExitBillFromMissingVariantsSchema = z.object({
  franchise_id: z.number().min(1, "Franchise ID is required"),
  company_id: z.number().min(1, "Company ID is required"),
  request_ids: z.array(z.number().min(1)).optional(),
  comment: z.string().optional(),
  // Updated to allow 0 quantities (items with 0 quantity will be excluded)
  quantity_adjustments: z.array(z.object({
    request_id: z.number().min(1, "Request ID is required"),
    quantity: z.number().min(0, "Quantity must be 0 or greater"),
  })).optional(),
  // New field for additional items
  additional_items: z.array(z.object({
    product_variant_id: z.number().min(1, "Product variant ID is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
  })).optional(),
}).refine((data) => {
  // Either request_ids or additional_items (or both) must be provided
  return (data.request_ids && data.request_ids.length > 0) || 
         (data.additional_items && data.additional_items.length > 0);
}, {
  message: "Either request_ids or additional_items (or both) must be provided",
  path: ["request_ids"], // This will show the error on request_ids field
});

export const missingVariantFiltersSchema = z.object({
  franchise_id: z.number().optional(),
  status: z.enum(["pending", "fulfilled", "cancelled"]).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

export type CreateMissingVariantRequestSchema = z.infer<typeof createMissingVariantRequestSchema>;
export type UpdateMissingVariantRequestSchema = z.infer<typeof updateMissingVariantRequestSchema>;
export type CreateExitBillFromMissingVariantsSchema = z.infer<typeof createExitBillFromMissingVariantsSchema>;
export type MissingVariantFiltersSchema = z.infer<typeof missingVariantFiltersSchema>;
