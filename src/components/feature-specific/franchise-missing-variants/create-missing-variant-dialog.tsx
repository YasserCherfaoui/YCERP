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
import { CreateMissingVariantRequestSchema, createMissingVariantRequestSchema } from "@/schemas/missing-variant";
import { createMissingVariantRequest } from "@/services/missing-variants-service";
import { getFranchiseAllProducts } from "@/services/product-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";

interface CreateMissingVariantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateMissingVariantDialog({ open, onOpenChange }: CreateMissingVariantDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const franchise = useSelector((state: RootState) => state.franchise.franchise);

  const form = useForm<CreateMissingVariantRequestSchema>({
    resolver: zodResolver(createMissingVariantRequestSchema),
    defaultValues: {
      product_variant_id: 0,
      requested_quantity: 1,
      comment: "",
    },
  });

  const { data: productsData } = useQuery({
    queryKey: ["franchise-products", franchise?.company_id],
    queryFn: () => getFranchiseAllProducts(franchise?.company_id ?? 0),
    enabled: !!franchise?.company_id,
  });

  // Extract all product variants from products
  const allVariants = productsData?.data
    ?.flatMap(product => product.product_variants || [])
    .filter(variant => variant) || [];

  const { mutate: createRequestMutation, isPending } = useMutation({
    mutationFn: createMissingVariantRequest,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Missing variant request created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["franchise-missing-variants"] });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create missing variant request",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateMissingVariantRequestSchema) => {
    createRequestMutation(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Report Missing Variant</DialogTitle>
          <DialogDescription>
            Report a product variant that you need from the company warehouse.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="product_variant_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Variant</FormLabel>
                  <FormControl>
                    <ProductVariantCombobox
                      variants={allVariants}
                      value={field.value || undefined}
                      onChange={(value) => field.onChange(value || 0)}
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
              name="requested_quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requested Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
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
                  <FormLabel>Comment (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes..."
                      {...field}
                    />
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
                {isPending ? "Creating..." : "Create Request"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
