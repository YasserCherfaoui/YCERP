import { ProductCategorySelect } from "@/components/feature-specific/company-products/product-category-select";
import { liquidGlass } from "@/components/feature-specific/crm/crm-theme";
import { formatDzd } from "@/components/feature-specific/products/product-ui-utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Product } from "@/models/data/product.model";
import { UpdateProductSchema, updateProductSchema } from "@/schemas/product";
import { updateProduct } from "@/services/product-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Edit2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface Props {
  product: Product;
}

function getProductFormValues(product: Product): UpdateProductSchema {
  return {
    name: product.name,
    first_price: product.first_price,
    franchise_price: product.franchise_price,
    vip_franchise_price: product.vip_franchise_price,
    price: product.price,
    promo_price: product.promo_price,
    description: product.description,
    is_woo_picture: product.is_woo_picture,
    is_bogo: product.is_bogo,
    pairable: product.pairable ?? false,
    combinable: product.combinable ?? false,
    is_active: product.is_active,
    franchise_ship_commission:
      product.franchise_ship_commission !== undefined
        ? product.franchise_ship_commission
        : 800,
    product_category_id:
      product.product_category_id ?? product.product_category?.ID ?? null,
  };
}

export default function UpdateProductForm({ product }: Props) {
  const [open, setOpen] = useState(false);
  const form = useForm<UpdateProductSchema>({
    resolver: zodResolver(updateProductSchema),
    defaultValues: getProductFormValues(product),
  });

  useEffect(() => {
    if (open) {
      form.reset(getProductFormValues(product));
    }
  }, [open, product, form]);

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { mutate: updateProductMutation, isPending } = useMutation({
    mutationFn: (data: UpdateProductSchema) => updateProduct(product.ID, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Product updated",
        description: `"${product.name}" was updated successfully.`,
      });
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: UpdateProductSchema) {
    updateProductMutation({
      ...values,
      product_category_id: values.product_category_id ?? null,
      franchise_ship_commission:
        values.franchise_ship_commission !== undefined
          ? values.franchise_ship_commission
          : product.franchise_ship_commission !== undefined
            ? product.franchise_ship_commission
            : 800,
    });
  }

  const firstPrice = form.watch("first_price") ?? product.first_price;
  const franchisePrice = form.watch("franchise_price") ?? product.franchise_price;
  const sellPrice = form.watch("price") ?? product.price;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="justify-start gap-2 text-sky-700 hover:text-sky-800 dark:text-sky-300"
        >
          <Edit2 className="h-4 w-4" aria-hidden="true" />
          Update Product
        </Button>
      </DialogTrigger>
      <DialogContent
        className={cn(
          "flex max-h-[90vh] max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:p-0",
          liquidGlass
        )}
      >
        <DialogHeader className="space-y-1.5 border-b border-white/40 px-5 py-4 pr-12 text-left dark:border-white/10">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-100">
              <Edit2 className="h-4 w-4" aria-hidden="true" />
            </span>
            Update Product · #{product.ID}
          </DialogTitle>
          <DialogDescription>
            Edit catalog details, pricing ledger, category, and promo rules for{" "}
            <span className="font-medium text-foreground">{product.name}</span>.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="space-y-4 overflow-y-auto px-5 py-4">
              {/* Basic Info */}
              <fieldset className="space-y-3 rounded-xl border bg-background/60 p-4">
                <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Product info
                </legend>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Product #1"
                            type="text"
                            className="bg-background"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="product_category_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <ProductCategorySelect
                            companyId={product.company_id}
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Product description..."
                          className="min-h-20 resize-y bg-background"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </fieldset>

              {/* Pricing Ledger */}
              <fieldset className="space-y-3 rounded-xl border bg-background/60 p-4">
                <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Pricing ledger (DZD)
                </legend>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="first_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Price (Cost)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="2000"
                            type="number"
                            className="bg-background tabular-nums"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            value={Number(field.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="franchise_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Franchise Price</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="2300"
                            type="number"
                            className="bg-background tabular-nums"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            value={Number(field.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vip_franchise_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>VIP Franchise Price</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="2500"
                            type="number"
                            className="bg-background tabular-nums"
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? undefined
                                  : Number(e.target.value)
                              )
                            }
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sell Price</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="2800"
                            type="number"
                            className="bg-background tabular-nums"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            value={Number(field.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="promo_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Promo (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="2500"
                            type="number"
                            className="bg-background tabular-nums"
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(
                                value === "" ? undefined : Number(value)
                              );
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="franchise_ship_commission"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ship Commission (DZD)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="800"
                            type="number"
                            min={0}
                            className="bg-background tabular-nums"
                            value={field.value !== undefined ? field.value : 800}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-wrap gap-3 rounded-lg border bg-muted/40 px-3 py-2 text-xs text-muted-foreground tabular-nums">
                  <span>
                    Company benefit:{" "}
                    <strong className="text-foreground">
                      {formatDzd(franchisePrice - firstPrice)}
                    </strong>
                  </span>
                  <span>
                    Direct retail margin:{" "}
                    <strong className="text-foreground">
                      {formatDzd(sellPrice - firstPrice)}
                    </strong>
                  </span>
                </div>
              </fieldset>

              {/* Promotions & Flags */}
              <fieldset className="space-y-2.5 rounded-xl border bg-background/60 p-4">
                <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Promotions & settings
                </legend>
                <FormField
                  control={form.control}
                  name="is_bogo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-3 space-y-0 rounded-lg border bg-background/70 px-3 py-2.5">
                      <FormControl>
                        <Checkbox
                          checked={field.value ?? false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer font-normal">
                        BOGO (buy one, get second at half price)
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pairable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-3 space-y-0 rounded-lg border bg-background/70 px-3 py-2.5">
                      <FormControl>
                        <Checkbox
                          checked={field.value ?? false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer font-normal">
                        Pairable (pair promo when 2+ pairable units in cart)
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="combinable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-3 space-y-0 rounded-lg border bg-background/70 px-3 py-2.5">
                      <FormControl>
                        <Checkbox
                          checked={field.value ?? false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer font-normal">
                        Combinable (anchor at first price when 2+ combinable units in cart)
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_woo_picture"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-3 space-y-0 rounded-lg border bg-background/70 px-3 py-2.5">
                      <FormControl>
                        <Checkbox
                          checked={field.value ?? false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer font-normal">
                        Bring product pictures from WooCommerce
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-3 space-y-0 rounded-lg border bg-background/70 px-3 py-2.5">
                      <FormControl>
                        <Checkbox
                          checked={field.value ?? false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer font-normal">
                        Active in catalog
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </fieldset>
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
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" aria-hidden="true" />
                    Save changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
