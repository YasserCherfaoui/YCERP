import { RootState } from "@/app/store";
import { liquidGlass } from "@/components/feature-specific/crm/crm-theme";
import Autocomplete from "@/components/ui/autocomplete";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { TagsInput } from "@/components/ui/tags_input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  CreateProductVariantSchema,
  createProductVariantSchema,
} from "@/schemas/product";
import {
  createProductVariant,
  getAllProductsWithVariantsByCompany,
} from "@/services/product-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Boxes, Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

export default function AddProductVariantForm() {
  const [open, setOpen] = useState(false);
  const companyFromStore = useSelector(
    (state: RootState) => state.company.company
  );
  const userCompany = useSelector((state: RootState) => state.user.company);
  const { pathname } = useLocation();
  const company = pathname.includes("moderator") ? userCompany : companyFromStore;

  const form = useForm<CreateProductVariantSchema>({
    resolver: zodResolver(createProductVariantSchema),
    defaultValues: {
      company_id: company?.ID ?? 0,
      product_id: 0,
      color: [],
      size: [],
    },
  });

  useEffect(() => {
    if (open && company?.ID) {
      form.reset({
        company_id: company.ID,
        product_id: 0,
        color: [],
        size: [],
      });
    }
  }, [open, company?.ID, form]);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: products } = useQuery({
    queryKey: ["products", company?.ID],
    queryFn: () => getAllProductsWithVariantsByCompany(company?.ID ?? 0),
    enabled: Boolean(company?.ID),
  });

  const { mutate: createProductVariantMutation, isPending } = useMutation({
    mutationFn: createProductVariant,
    onSuccess: () => {
      toast({
        title: "Product Variant Created",
        description: "Product variants were created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="bg-background">
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span className="sm:hidden">Variant</span>
          <span className="hidden sm:inline">Add Variant</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className={cn(
          "flex max-h-[90vh] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:p-0",
          liquidGlass
        )}
      >
        <DialogHeader className="space-y-1.5 border-b border-white/40 px-5 py-4 pr-12 text-left dark:border-white/10">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-100">
              <Boxes className="h-4 w-4" aria-hidden="true" />
            </span>
            Add Product Variant
          </DialogTitle>
          <DialogDescription>
            Generate color and size combinations for an existing product.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) =>
              createProductVariantMutation(data)
            )}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="space-y-4 overflow-y-auto px-5 py-4">
              <div className="rounded-xl border bg-background/60 p-4 space-y-4">
                <Autocomplete
                  options={products?.data ?? []}
                  displayField="name"
                  valueField="ID"
                  form={form}
                  name="product_id"
                  label="Product"
                />

                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Colors</FormLabel>
                      <FormControl>
                        <TagsInput
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Type a color and press Enter..."
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Add one or more colors (e.g. Black, Beige).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sizes</FormLabel>
                      <FormControl>
                        <TagsInput
                          typeof="number"
                          value={field.value.map((size) => size.toString())}
                          onValueChange={(value) =>
                            field.onChange(
                              value
                                .map(Number)
                                .filter((n) => !Number.isNaN(n) && n > 0)
                            )
                          }
                          placeholder="Type a numeric size and press Enter..."
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Add numeric sizes (e.g. 38, 40, 42).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
                {isPending && (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                )}
                Add Variants
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
