import { RootState } from "@/app/store";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  GenerateBarcodePDFSchema,
  defaultPDFValues,
  generateBarcodePDFSchema,
} from "@/schemas/product";
import { getCompanyInventory } from "@/services/inventory-service";
import {
  generateBarcodes,
  generateThermalBarcodes,
} from "@/services/product-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Plus, Printer, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { ProductVariantCombobox } from "./product-variant-combobox";

export default function PrintProductsLabelsDialog() {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<GenerateBarcodePDFSchema>({
    resolver: zodResolver(generateBarcodePDFSchema),
    defaultValues: {
      ...defaultPDFValues,
      variants: [{ product_variant_id: 0, quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  useEffect(() => {
    if (isOpen && form.getValues("variants").length === 0) {
      append({ product_variant_id: 0, quantity: 1 });
    }
  }, [isOpen, form, append]);

  const companyFromStore = useSelector(
    (state: RootState) => state.company.company
  );
  const userCompany = useSelector((state: RootState) => state.user.company);
  const { pathname } = useLocation();
  const company = pathname.includes("moderator") ? userCompany : companyFromStore;

  const { data: inventory } = useQuery({
    queryKey: ["products-variants", company?.ID],
    queryFn: () => getCompanyInventory(company?.ID ?? 0),
    enabled: Boolean(company?.ID) && isOpen,
  });

  const variantsList =
    inventory?.data?.items
      .map((item) => item.product_variant)
      .filter((v): v is NonNullable<typeof v> => Boolean(v)) ?? [];

  const { toast } = useToast();
  const { mutate: generateBarcodesMutation, isPending } = useMutation({
    mutationFn: generateBarcodes,
    onSuccess: () => {
      setIsOpen(false);
      toast({
        title: "Barcodes generated successfully",
        description: "Your A4 barcode sheet has been downloaded.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error generating barcodes",
        description: error.message || "There was an error generating your barcodes.",
      });
    },
  });

  const { mutate: generateThermalBarcodesMutation, isPending: isPendingThermal } =
    useMutation({
      mutationFn: generateThermalBarcodes,
      onSuccess: () => {
        setIsOpen(false);
        toast({
          title: "Thermal barcodes generated",
          description: "Your 50×30mm labels have been downloaded.",
        });
      },
      onError: (error: Error) => {
        toast({
          variant: "destructive",
          title: "Error generating barcodes",
          description: error.message || "There was an error generating your barcodes.",
        });
      },
    });

  const watchedVariants = form.watch("variants");
  const totalLabels = watchedVariants.reduce(
    (sum, item) => sum + (Number(item?.quantity) || 0),
    0
  );

  const isBusy = isPending || isPendingThermal;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="bg-background">
          <Printer className="h-4 w-4" aria-hidden="true" />
          <span>Labels</span>
        </Button>
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
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-100">
                <Printer className="h-4 w-4" aria-hidden="true" />
              </span>
              Print Product Labels
            </DialogTitle>
            <Badge variant="secondary" className="tabular-nums">
              {totalLabels} label{totalLabels === 1 ? "" : "s"}
            </Badge>
          </div>
          <DialogDescription>
            Choose product variants and label quantities for A4 or thermal (50×30mm) printing.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => generateBarcodesMutation(data))}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="space-y-3 overflow-y-auto px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Variants ({fields.length})
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="bg-background"
                  onClick={() => append({ product_variant_id: 0, quantity: 1 })}
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Add Row
                </Button>
              </div>

              <div className="space-y-2.5">
                {fields.map((fieldItem, idx) => (
                  <div
                    key={fieldItem.id}
                    className="grid grid-cols-1 gap-3 rounded-xl border bg-background/60 p-3 sm:grid-cols-[1fr_7.5rem_auto] sm:items-end"
                  >
                    <FormField
                      name={`variants.${idx}.product_variant_id`}
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Variant</FormLabel>
                          <FormControl>
                            <ProductVariantCombobox
                              variants={variantsList}
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Select a variant..."
                              disabled={field.disabled}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name={`variants.${idx}.quantity`}
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
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
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label={`Remove label row ${idx + 1}`}
                      disabled={fields.length <= 1}
                      onClick={() => remove(idx)}
                      className="text-muted-foreground hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="gap-2 border-t border-white/40 px-5 py-3 dark:border-white/10">
              <Button
                type="button"
                variant="outline"
                className="bg-background"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isBusy}
                variant="secondary"
                onClick={form.handleSubmit((data) =>
                  generateThermalBarcodesMutation(data)
                )}
              >
                {isPendingThermal && (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                )}
                Thermal (50×30)
              </Button>
              <Button type="submit" disabled={isBusy}>
                {isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                )}
                Generate A4 PDF
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
