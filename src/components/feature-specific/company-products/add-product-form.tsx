import { RootState } from "@/app/store";
import { ProductCategorySelect } from "@/components/feature-specific/company-products/product-category-select";
import { liquidGlass } from "@/components/feature-specific/crm/crm-theme";
import { formatDzd } from "@/components/feature-specific/products/product-ui-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  CreateProductSchema,
  createProductSchema,
  productDefaultValues,
} from "@/schemas/product";
import { createProduct } from "@/services/product-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, PackagePlus, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

export default function AddProductForm() {
  const companyFromStore = useSelector(
    (state: RootState) => state.company.company
  );
  const userCompany = useSelector((state: RootState) => state.user.company);
  const { pathname } = useLocation();
  const company = pathname.includes("moderator") ? userCompany : companyFromStore;

  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const form = useForm<CreateProductSchema>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      company_id: company?.ID ?? 0,
      ...productDefaultValues,
    },
  });
  const queryClient = useQueryClient();
  const { mutate: createProductMutation, isPending: loading } = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Product Created",
        description: "Product was created successfully!",
      });
      form.reset({
        company_id: company?.ID ?? 0,
        ...productDefaultValues,
      });
      setIsOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!company) return null;

  const createProductHandler = (data: CreateProductSchema) => {
    createProductMutation({ ...data, company_id: company.ID });
  };

  const firstPrice = form.watch("first_price") || 0;
  const franchisePrice = form.watch("franchise_price") || 0;
  const sellPrice = form.watch("price") || 0;
  const sizes = form.watch("sizes") ?? [];
  const colors = form.watch("colors") ?? [];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button type="button">
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span className="sm:hidden">Product</span>
          <span className="hidden sm:inline">Add Product</span>
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
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-100">
              <PackagePlus className="h-4 w-4" aria-hidden="true" />
            </span>
            Add Product
          </DialogTitle>
          <DialogDescription>
            Define product details, pricing ledger, variants, and promotion flags.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(createProductHandler)}
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
                    name="name"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Classic Sneakers"
                            className="bg-background"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="product_category_id"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <ProductCategorySelect
                            companyId={company.ID}
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
                  name="description"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Short catalog description..."
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
                    name="first_price"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Price (Cost)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="bg-background tabular-nums"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="franchise_price"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Franchise Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="bg-background tabular-nums"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="vip_franchise_price"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>VIP Franchise Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="bg-background tabular-nums"
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? undefined
                                  : Number(e.target.value)
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="price"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sell Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="bg-background tabular-nums"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="promo_price"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Promo (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="bg-background tabular-nums"
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? Number(e.target.value)
                                  : undefined
                              )
                            }
                            value={field.value ?? ""}
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

              {/* Variants */}
              <fieldset className="space-y-3 rounded-xl border bg-background/60 p-4">
                <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Initial variants
                </legend>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <FormField
                    name="sizes"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sizes (comma-separated)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-background"
                            value={field.value?.join(", ") || ""}
                            placeholder="e.g. 38, 39, 40"
                            onChange={(e) => {
                              const inputList = e.target.value
                                .split(",")
                                .map((size) =>
                                  Number.isNaN(Number(size.trim()))
                                    ? 0
                                    : Number(size.trim())
                                );
                              field.onChange(Array.from(new Set(inputList)));
                            }}
                          />
                        </FormControl>
                        {sizes.length > 0 && (
                          <FormDescription className="flex flex-wrap gap-1 pt-1">
                            {sizes.map((size, index) => (
                              <Badge key={index} variant="secondary" className="tabular-nums">
                                {String(size)}
                              </Badge>
                            ))}
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="colors"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Colors (comma-separated)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-background"
                            placeholder="e.g. Black, White"
                            value={field.value?.join(", ") || ""}
                            onChange={(e) => {
                              const inputList = e.target.value
                                .split(",")
                                .map((color) => color.trim());
                              field.onChange(Array.from(new Set(inputList)));
                            }}
                          />
                        </FormControl>
                        {colors.length > 0 && (
                          <FormDescription className="flex flex-wrap gap-1 pt-1">
                            {colors.map((color, index) => (
                              <Badge key={index} variant="secondary">
                                {color}
                              </Badge>
                            ))}
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </fieldset>

              {/* Promotions */}
              <fieldset className="space-y-2.5 rounded-xl border bg-background/60 p-4">
                <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Promotions
                </legend>
                <FormField
                  name="is_bogo"
                  control={form.control}
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
                  name="pairable"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-3 space-y-0 rounded-lg border bg-background/70 px-3 py-2.5">
                      <FormControl>
                        <Checkbox
                          checked={field.value ?? false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer font-normal">
                        Pairable (min/max pairing when 2+ pairable units in cart)
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  name="combinable"
                  control={form.control}
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
              </fieldset>
            </div>

            <DialogFooter className="border-t border-white/40 px-5 py-3 dark:border-white/10">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="bg-background">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" aria-hidden="true" />
                    Save Product
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
