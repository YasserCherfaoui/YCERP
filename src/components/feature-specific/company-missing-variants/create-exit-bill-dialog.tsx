import { RootState } from "@/app/store";
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
import { MissingVariantRequestResponse } from "@/models/data/missing-variant.model";
import { CreateExitBillFromMissingVariantsSchema, createExitBillFromMissingVariantsSchema } from "@/schemas/missing-variant";
import { createExitBillFromMissingVariants } from "@/services/missing-variants-service";
import { getAllProductsWithVariantsByCompany } from "@/services/product-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { ProductVariantCombobox } from "../company-products/product-variant-combobox";

interface CreateExitBillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRequests: MissingVariantRequestResponse[];
  franchiseId: number;
  companyId: number;
}

export default function CreateExitBillDialog({ 
  open, 
  onOpenChange, 
  selectedRequests, 
  franchiseId, 
  companyId 
}: CreateExitBillDialogProps) {
  console.log('Dialog props:', { open, selectedRequests, franchiseId, companyId });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  let company = useSelector((state: RootState) => state.company.company);
  const { pathname } = useLocation();
  if (pathname.includes("moderator")) {
    company = useSelector((state: RootState) => state.user.company);
  }

  // Get all products with variants for the company
  const { data: productsData } = useQuery({
    queryKey: ["products", company?.ID],
    queryFn: () => getAllProductsWithVariantsByCompany(company?.ID ?? 0),
    enabled: !!company,
  });

  // Flatten all variants from all products
  const allVariants = productsData?.data?.flatMap(product => 
    product.product_variants?.map(variant => ({
      ...variant,
      product_name: product.name,
    })) || []
  ) || [];

  const form = useForm<CreateExitBillFromMissingVariantsSchema>({
    resolver: zodResolver(createExitBillFromMissingVariantsSchema),
    defaultValues: {
      franchise_id: franchiseId,
      company_id: companyId,
      request_ids: selectedRequests.length > 0 ? selectedRequests.map(req => req.id) : undefined,
      comment: "",
      quantity_adjustments: selectedRequests.length > 0 ? selectedRequests.map(req => ({
        request_id: req.id,
        quantity: req.requested_quantity,
      })) : undefined,
      additional_items: [],
    },
  });

  // Field array for additional items
  const { fields: additionalItemsFields, append: appendAdditionalItem, remove: removeAdditionalItem } = useFieldArray({
    control: form.control,
    name: "additional_items",
  });

  console.log('Form initialized with:', {
    franchise_id: franchiseId,
    company_id: companyId,
    request_ids: selectedRequests.map(req => req.id),
    quantity_adjustments: selectedRequests.map(req => ({
      request_id: req.id,
      quantity: req.requested_quantity,
    }))
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        franchise_id: franchiseId,
        company_id: companyId,
        request_ids: selectedRequests.length > 0 ? selectedRequests.map(req => req.id) : undefined,
        comment: "",
        quantity_adjustments: selectedRequests.length > 0 ? selectedRequests.map(req => ({
          request_id: req.id,
          quantity: req.requested_quantity,
        })) : undefined,
        additional_items: [],
      });
      console.log('Form reset with values:', {
        franchise_id: franchiseId,
        company_id: companyId,
        request_ids: selectedRequests.length > 0 ? selectedRequests.map(req => req.id) : undefined,
        quantity_adjustments: selectedRequests.length > 0 ? selectedRequests.map(req => ({
          request_id: req.id,
          quantity: req.requested_quantity,
        })) : undefined,
        additional_items: []
      });
    }
  }, [open, franchiseId, companyId, selectedRequests, form]);

  const { mutate: createExitBillMutation, isPending } = useMutation({
    mutationFn: createExitBillFromMissingVariants,
    onSuccess: (data) => {
      console.log('Success:', data);
      const response = data.data;
      let message = `Exit bill created successfully with ${response.total_bill_items} items.`;
      
      if (response.fulfilled_requests > 0) {
        message += ` ${response.fulfilled_requests} requests fully fulfilled.`;
      }
      if (response.partially_fulfilled_requests > 0) {
        message += ` ${response.partially_fulfilled_requests} requests partially fulfilled.`;
      }
      if (response.additional_items_processed > 0) {
        message += ` ${response.additional_items_processed} additional items processed.`;
      }
      
      toast({
        title: "Success",
        description: message,
      });
      queryClient.invalidateQueries({ queryKey: ["company-missing-variants"] });
      queryClient.invalidateQueries({ queryKey: ["exit_bills"] });
      // Don't reset the form - just close the dialog
      onOpenChange(false);
    },
    onError: (error: Error) => {
      console.error('Mutation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create exit bill",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateExitBillFromMissingVariantsSchema) => {
    console.log('Form submitted with data:', data);
    console.log('Selected requests:', selectedRequests);
    createExitBillMutation(data);
  };

  const watchedQuantityAdjustments = form.watch("quantity_adjustments");
  const watchedAdditionalItems = form.watch("additional_items");
  
  const missingVariantsQuantity = watchedQuantityAdjustments 
    ? watchedQuantityAdjustments
        .filter(adj => adj.quantity > 0)
        .reduce((sum, adj) => sum + adj.quantity, 0)
    : selectedRequests.reduce((sum, req) => sum + req.requested_quantity, 0);
  
  const additionalItemsQuantity = watchedAdditionalItems
    ? watchedAdditionalItems.reduce((sum, item) => sum + (item.quantity || 0), 0)
    : 0;
  
  const totalQuantity = missingVariantsQuantity + additionalItemsQuantity;
  
  // Get franchise name from selected requests or find it from products data
  let franchiseName = selectedRequests[0]?.franchise_name || "Unknown";
  if (franchiseName === "Unknown" && franchiseId && productsData?.data) {
    // For additional items only, we might need to get franchise name from API
    // For now, we'll show the franchise ID
    franchiseName = `Franchise ${franchiseId}`;
  }

  // Debug form state
  console.log('Form state:', {
    isValid: form.formState.isValid,
    errors: form.formState.errors,
    values: form.getValues(),
    watchedQuantityAdjustments
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Exit Bill</DialogTitle>
          <DialogDescription>
            {selectedRequests.length > 0 
              ? `Create an exit bill to fulfill missing variant requests for ${franchiseName}.`
              : `Create an exit bill with additional items for ${franchiseName}.`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Exit Bill Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Franchise:</span>
                <Badge variant="outline" className="ml-2">{franchiseName}</Badge>
              </div>
              <div>
                <span className="font-medium">Total Items:</span>
                <span className="ml-2">{totalQuantity}</span>
              </div>
              <div>
                <span className="font-medium">Missing Requests:</span>
                <span className="ml-2">{selectedRequests.length}</span>
              </div>
              <div>
                <span className="font-medium">Additional Items:</span>
                <span className="ml-2">{additionalItemsFields.length}</span>
              </div>
            </div>
            {(missingVariantsQuantity > 0 || additionalItemsQuantity > 0) && (
              <div className="mt-2 pt-2 border-t">
                <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                  <div>Missing Variants: {missingVariantsQuantity} items</div>
                  <div>Additional Items: {additionalItemsQuantity} items</div>
                </div>
              </div>
            )}
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Selected Items with Editable Quantities */}
              {selectedRequests.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Missing Variant Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-60 overflow-y-auto space-y-3">
                      {selectedRequests.map((request, index) => {
                        const currentQuantity = watchedQuantityAdjustments?.[index]?.quantity ?? request.requested_quantity;
                        const isExcluded = currentQuantity === 0;
                        
                        return (
                          <div key={request.id} className={`p-3 border rounded-lg ${isExcluded ? 'opacity-50 bg-muted' : ''}`}>
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <span className="font-medium">{request.product_name}</span>
                                <span className="text-gray-500 ml-2">
                                  {request.product_variant_color} (Size {request.product_variant_size})
                                </span>
                                {isExcluded && (
                                  <Badge variant="secondary" className="ml-2 text-xs">
                                    Excluded
                                  </Badge>
                                )}
                              </div>
                              <Badge variant="outline" className="text-xs">
                                Original: {request.requested_quantity}
                              </Badge>
                            </div>
                            <FormField
                              control={form.control}
                              name={`quantity_adjustments.${index}.quantity`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm">Quantity to fulfill</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="0"
                                      max={request.requested_quantity}
                                      placeholder={`Max: ${request.requested_quantity}`}
                                      {...field}
                                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Additional Items Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    Additional Items
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendAdditionalItem({ product_variant_id: 0, quantity: 1 })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {additionalItemsFields.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No additional items. Click "Add Item" to include items not related to missing variant requests.</p>
                  ) : (
                    <div className="space-y-4">
                      {additionalItemsFields.map((field, index) => {
                        const selectedVariantId = form.watch(`additional_items.${index}.product_variant_id`);
                        const selectedVariant = allVariants.find(v => v.ID === selectedVariantId);
                        
                        return (
                          <div key={field.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium">Item {index + 1}</h4>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeAdditionalItem(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name={`additional_items.${index}.product_variant_id`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Product Variant</FormLabel>
                                    <FormControl>
                                      <ProductVariantCombobox
                                        value={field.value}
                                        onChange={field.onChange}
                                        variants={allVariants}
                                        placeholder="Select product variant..."
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name={`additional_items.${index}.quantity`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Quantity</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min="1"
                                        placeholder="Enter quantity"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            {selectedVariant && (
                              <div className="mt-2 p-2 bg-muted rounded text-sm">
                                <span className="font-medium">{selectedVariant.product_name}</span>
                                <span className="text-muted-foreground ml-2">
                                  {selectedVariant.color} (Size {selectedVariant.size})
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comment (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional notes for this exit bill..."
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
                <Button 
                  type="submit" 
                  disabled={isPending}
                  onClick={() => {
                    console.log('Button clicked');
                    console.log('Form errors:', form.formState.errors);
                    console.log('Form values:', form.getValues());
                  }}
                >
                  {isPending ? "Creating..." : "Create Exit Bill"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
