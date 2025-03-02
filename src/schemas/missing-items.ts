import { z } from "zod";

const formSchema = z.object({
    items: z.array(
        z.object({
            productId: z.number(),
            broken: z.number().min(0, "Cannot be negative"),
            missing: z.number().min(0, "Cannot be negative"),
            total: z.number(),
        })
    ).superRefine((items, ctx) => {
        items.forEach((item, index) => {
            if (item.broken + item.missing !== item.total) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Sum of broken and missing must equal total quantity at item ${index + 1}`,
                });
            }
        });
    }),
});

export type MissingItemsSchema = z.infer<typeof formSchema>;
export { formSchema as MissingItemsFormSchema };
