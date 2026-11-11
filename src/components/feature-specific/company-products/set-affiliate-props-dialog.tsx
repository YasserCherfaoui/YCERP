import { liquidGlass } from "@/components/feature-specific/crm/crm-theme";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Product } from "@/models/data/product.model";
import { setAffiliateProps } from "@/services/product-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link2, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";

const affiliatePropSchema = z.object({
  name: z.string().min(1, "Name is required"),
  creatives_link: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  product_link: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  shopify_link: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  commission: z.coerce.number().int().min(0, "Commission cannot be negative"),
  pro_commission: z.coerce
    .number()
    .int()
    .min(0, "Pro commission cannot be negative")
    .optional()
    .default(0),
  is_active: z.boolean().optional().default(true),
});

const formSchema = z.object({
  affiliate_props: z.array(affiliatePropSchema),
  product_id: z.number(),
});

export type AffiliateFormValues = z.infer<typeof formSchema>;

interface SetAffiliatePropsDialogProps {
  product: Product;
}

export function SetAffiliatePropsDialog({
  product,
}: SetAffiliatePropsDialogProps) {
  const uniqueColors = [
    ...new Set(
      (product.product_variants ?? []).map(
        (variant) => product.name + " " + variant.color.toLocaleUpperCase()
      )
    ),
  ];

  const defaultValues: Partial<AffiliateFormValues> = {
    product_id: product.ID,
    affiliate_props: uniqueColors.map((color) => {
      const existingProp = product.affiliate_props?.find(
        (p) => p.name === color
      );
      return {
        name: color,
        creatives_link: existingProp?.creatives_link || "",
        product_link: existingProp?.product_link || "",
        commission: existingProp?.commission || 0,
        pro_commission: existingProp?.pro_commission || 0,
        shopify_link: existingProp?.shopify_link || "",
        is_active: existingProp?.is_active ?? true,
      };
    }),
  };

  const form = useForm<AffiliateFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "affiliate_props",
  });
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { mutate: setAffiliatePropsMutation, isPending } = useMutation({
    mutationFn: setAffiliateProps,
    onSuccess: () => {
      toast({
        title: "Affiliate props updated",
        description: "Commission and link settings saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update affiliate props",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: AffiliateFormValues) {
    setAffiliatePropsMutation(data);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e: Event) => e.preventDefault()}>
          <Link2 className="mr-2 h-4 w-4" aria-hidden="true" />
          Set Affiliate Props
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent
        className={cn(
          "flex max-h-[90vh] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:p-0",
          liquidGlass
        )}
      >
        <DialogHeader className="space-y-1.5 border-b border-white/40 px-5 py-4 pr-12 text-left dark:border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-100">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </span>
              Affiliate Props · {product.name}
            </DialogTitle>
            <Badge variant="secondary" className="tabular-nums">
              {fields.length} color{fields.length === 1 ? "" : "s"}
            </Badge>
          </div>
          <DialogDescription>
            Configure creatives links, store URLs, and commissions per color variant.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="space-y-4 overflow-y-auto px-5 py-4">
              {fields.length === 0 ? (
                <div className="rounded-xl border border-dashed bg-background/50 px-4 py-8 text-center text-sm text-muted-foreground">
                  This product has no variants yet. Add product variants first to configure affiliate props.
                </div>
              ) : (
                fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="space-y-3 rounded-xl border bg-background/60 p-4 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                      <span className="text-sm font-semibold">{field.name}</span>
                      <FormField
                        control={form.control}
                        name={`affiliate_props.${index}.is_active`}
                        render={({ field: activeField }) => (
                          <FormItem className="flex items-center gap-2 space-y-0">
                            <FormLabel className="text-xs text-muted-foreground">
                              Catalog active
                            </FormLabel>
                            <FormControl>
                              <Switch
                                checked={activeField.value ?? true}
                                onCheckedChange={activeField.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name={`affiliate_props.${index}.name`}
                      render={({ field: nameField }) => (
                        <FormItem>
                          <FormLabel>Name (Color)</FormLabel>
                          <FormControl>
                            <Input {...nameField} disabled className="bg-muted/60" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <FormField
                        control={form.control}
                        name={`affiliate_props.${index}.creatives_link`}
                        render={({ field: linkField }) => (
                          <FormItem>
                            <FormLabel>Creatives Link</FormLabel>
                            <FormControl>
                              <Input
                                type="url"
                                placeholder="https://..."
                                className="bg-background"
                                {...linkField}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`affiliate_props.${index}.product_link`}
                        render={({ field: linkField }) => (
                          <FormItem>
                            <FormLabel>WooCommerce Link</FormLabel>
                            <FormControl>
                              <Input
                                type="url"
                                placeholder="https://..."
                                className="bg-background"
                                {...linkField}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`affiliate_props.${index}.shopify_link`}
                        render={({ field: linkField }) => (
                          <FormItem>
                            <FormLabel>Shopify Link</FormLabel>
                            <FormControl>
                              <Input
                                type="url"
                                placeholder="https://..."
                                className="bg-background"
                                {...linkField}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name={`affiliate_props.${index}.commission`}
                        render={({ field: commField }) => (
                          <FormItem>
                            <FormLabel>Commission (DZD)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                className="bg-background tabular-nums"
                                {...commField}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`affiliate_props.${index}.pro_commission`}
                        render={({ field: proField }) => (
                          <FormItem>
                            <FormLabel>Pro Commission (DZD)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                className="bg-background tabular-nums"
                                {...proField}
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              0 = same as regular commission
                            </FormDescription>
                            {proField.value > 0 &&
                              proField.value <
                                form.getValues(
                                  `affiliate_props.${index}.commission`
                                ) && (
                                <p className="text-xs text-amber-600 dark:text-amber-400">
                                  Pro commission is lower than regular commission
                                </p>
                              )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            <DialogFooter className="border-t border-white/40 px-5 py-3 dark:border-white/10">
              <Button
                type="button"
                variant="outline"
                className="bg-background"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || fields.length === 0}>
                {isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                )}
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
