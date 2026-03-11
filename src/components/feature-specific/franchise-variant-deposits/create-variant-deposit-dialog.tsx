import { RootState } from "@/app/store";
import { ProductVariantCombobox } from "@/components/feature-specific/company-products/product-variant-combobox";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  CreateVariantDepositSchema,
  createVariantDepositSchema,
} from "@/schemas/variant-deposit";
import { createVariantDeposit } from "@/services/variant-deposits-service";
import { getFranchiseAllProducts } from "@/services/product-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";

interface CreateVariantDepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateVariantDepositDialog({
  open,
  onOpenChange,
}: CreateVariantDepositDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const franchise = useSelector((state: RootState) => state.franchise.franchise);

  const form = useForm<CreateVariantDepositSchema>({
    resolver: zodResolver(createVariantDepositSchema),
    defaultValues: {
      customer_phone: "",
      product_variant_id: 0,
      amount_paid: 0,
      quantity: 1,
      comment: "",
    },
  });

  const { data: productsData } = useQuery({
    queryKey: ["franchise-products", franchise?.company_id],
    queryFn: () => getFranchiseAllProducts(franchise?.company_id ?? 0),
    enabled: !!franchise?.company_id && open,
  });

  const allVariants =
    productsData?.data?.flatMap((p) => p.product_variants || []).filter(Boolean) ?? [];

  const { mutate: createMutation, isPending } = useMutation({
    mutationFn: createVariantDeposit,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Variant deposit recorded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["franchise-variant-deposits"] });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record deposit",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateVariantDepositSchema) => {
    createMutation(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record variant deposit</DialogTitle>
          <DialogDescription>
            Record money received from a customer for a product variant. When the variant is in stock, you can create a sale from this deposit.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customer_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer phone</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. 0550123456"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="product_variant_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product variant</FormLabel>
                  <FormControl>
                    <ProductVariantCombobox
                      variants={allVariants}
                      value={field.value || undefined}
                      onChange={(v) => field.onChange(v ?? 0)}
                      placeholder="Select a product variant"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount_paid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount paid</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value) || 1)}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comment (optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Notes..." {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Record deposit"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
