import { RootState } from "@/app/store";
import { ProductVariantCombobox } from "@/components/feature-specific/company-products/product-variant-combobox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { bulkCreateMissingVariantRequests } from "@/services/missing-variants-service";
import { getFranchiseAllProducts } from "@/services/product-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { z } from "zod";

const bulkCreateMissingVariantSchema = z.object({
  requests: z.array(
    z.object({
      product_variant_id: z.number().min(1, "Product variant is required"),
      requested_quantity: z.number().min(1, "Quantity must be at least 1"),
      comment: z.string().optional(),
    })
  ).min(1, "At least one request is required"),
});

type BulkCreateMissingVariantSchema = z.infer<typeof bulkCreateMissingVariantSchema>;

interface BulkCreateMissingVariantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface BulkCreateResponse {
  created_requests: any[];
  updated_requests: any[];
  summary: {
    total_processed: number;
    created_count: number;
    updated_count: number;
    error_count: number;
  };
  errors?: string[];
}

export default function BulkCreateMissingVariantDialog({ 
  open, 
  onOpenChange 
}: BulkCreateMissingVariantDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const franchise = useSelector((state: RootState) => state.franchise.franchise);
  const [bulkResult, setBulkResult] = useState<BulkCreateResponse | null>(null);

  const form = useForm<BulkCreateMissingVariantSchema>({
    resolver: zodResolver(bulkCreateMissingVariantSchema),
    defaultValues: {
      requests: [
        {
          product_variant_id: 0,
          requested_quantity: 1,
          comment: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "requests",
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

  const { mutate: bulkCreateMutation, isPending } = useMutation({
    mutationFn: bulkCreateMissingVariantRequests,
    onSuccess: (response) => {
      setBulkResult(response.data);
      
      const { summary } = response.data;
      if (summary.error_count === 0) {
        toast({
          title: "Success",
          description: `Successfully created ${summary.created_count} missing variant requests`,
        });
      } else {
        toast({
          title: "Partial Success",
          description: `Created ${summary.created_count}, updated ${summary.updated_count}, ${summary.error_count} errors`,
          variant: "destructive",
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ["franchise-missing-variants"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create bulk missing variant requests",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BulkCreateMissingVariantSchema) => {
    bulkCreateMutation(data);
  };

  const handleClose = () => {
    setBulkResult(null);
    form.reset();
    onOpenChange(false);
  };

  const addNewRequest = () => {
    append({
      product_variant_id: 0,
      requested_quantity: 1,
      comment: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Report Missing Variants</DialogTitle>
          <DialogDescription>
            Create multiple missing variant requests at once. If pending requests already exist for any variants, quantities will be summed and comments merged.
          </DialogDescription>
        </DialogHeader>

        {bulkResult ? (
          <div className="space-y-4">
            {/* Results Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Bulk Request Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{bulkResult.summary.total_processed}</div>
                    <div className="text-sm text-gray-600">Total Processed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{bulkResult.summary.created_count}</div>
                    <div className="text-sm text-gray-600">Created</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{bulkResult.summary.updated_count}</div>
                    <div className="text-sm text-gray-600">Updated</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{bulkResult.summary.error_count}</div>
                    <div className="text-sm text-gray-600">Errors</div>
                  </div>
                </div>

                {bulkResult.errors && bulkResult.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-red-600 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Errors:
                    </h4>
                    {bulkResult.errors.map((error, index) => (
                      <Badge key={index} variant="destructive" className="mr-2">
                        {error}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <DialogFooter>
              <Button onClick={handleClose}>
                Close
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <Card key={field.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Request {index + 1}</CardTitle>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name={`requests.${index}.product_variant_id`}
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

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`requests.${index}.requested_quantity`}
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
                          name={`requests.${index}.comment`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Comment (Optional)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Add any additional notes..."
                                  {...field}
                                  rows={2}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addNewRequest}
                  disabled={isPending}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Request
                </Button>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Creating..." : `Create ${fields.length} Request${fields.length > 1 ? 's' : ''}`}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
