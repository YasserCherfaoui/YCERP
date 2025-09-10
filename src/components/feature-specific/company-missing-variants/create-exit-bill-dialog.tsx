import { RootState } from "@/app/store";
import { Badge } from "@/components/ui/badge";
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
import { MissingVariantRequestResponse } from "@/models/data/missing-variant.model";
import { CreateExitBillFromMissingVariantsSchema, createExitBillFromMissingVariantsSchema } from "@/schemas/missing-variant";
import { createExitBillFromMissingVariants } from "@/services/missing-variants-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

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

  const form = useForm<CreateExitBillFromMissingVariantsSchema>({
    resolver: zodResolver(createExitBillFromMissingVariantsSchema),
    defaultValues: {
      franchise_id: franchiseId,
      company_id: companyId,
      request_ids: selectedRequests.map(req => req.id),
      comment: "",
      quantity_adjustments: selectedRequests.map(req => ({
        request_id: req.id,
        quantity: req.requested_quantity,
      })),
    },
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
        request_ids: selectedRequests.map(req => req.id),
        comment: "",
        quantity_adjustments: selectedRequests.map(req => ({
          request_id: req.id,
          quantity: req.requested_quantity,
        })),
      });
      console.log('Form reset with values:', {
        franchise_id: franchiseId,
        company_id: companyId,
        request_ids: selectedRequests.map(req => req.id),
        quantity_adjustments: selectedRequests.map(req => ({
          request_id: req.id,
          quantity: req.requested_quantity,
        }))
      });
    }
  }, [open, franchiseId, companyId, selectedRequests, form]);

  const { mutate: createExitBillMutation, isPending } = useMutation({
    mutationFn: createExitBillFromMissingVariants,
    onSuccess: (data) => {
      console.log('Success:', data);
      toast({
        title: "Success",
        description: `Exit bill created successfully. ${data.data.fulfilled_requests} requests fulfilled.`,
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
  const totalQuantity = watchedQuantityAdjustments 
    ? watchedQuantityAdjustments
        .filter(adj => adj.quantity > 0)
        .reduce((sum, adj) => sum + adj.quantity, 0)
    : selectedRequests.reduce((sum, req) => sum + req.requested_quantity, 0);
  const franchiseName = selectedRequests[0]?.franchise_name || "Unknown";

  // Debug form state
  console.log('Form state:', {
    isValid: form.formState.isValid,
    errors: form.formState.errors,
    values: form.getValues(),
    watchedQuantityAdjustments
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Exit Bill</DialogTitle>
          <DialogDescription>
            Create an exit bill to fulfill missing variant requests for {franchiseName}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Request Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Franchise:</span>
                <Badge variant="outline" className="ml-2">{franchiseName}</Badge>
              </div>
              <div>
                <span className="font-medium">Total Items:</span>
                <span className="ml-2">{totalQuantity}</span>
              </div>
              <div>
                <span className="font-medium">Selected Requests:</span>
                <span className="ml-2">{selectedRequests.length}</span>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Selected Items with Editable Quantities */}
              <div className="max-h-60 overflow-y-auto">
                <h3 className="font-semibold mb-2">Selected Items</h3>
                <div className="space-y-3">
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
              </div>

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
