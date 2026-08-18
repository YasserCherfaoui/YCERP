import { ProductVariantCombobox } from "@/components/feature-specific/company-products/product-variant-combobox";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox-standalone";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { DeliveryEmployee } from "@/models/data/delivery.model";
import { Franchise } from "@/models/data/franchise.model";
import { ProductVariant } from "@/models/data/product.model";
import {
  getDeliveryCompanies,
  getDeliveryEmployees,
} from "@/services/delivery-service";
import { getFranchiseInventory, getFranchisesWithStock } from "@/services/franchise-service";
import { createFranchisePickupRequest } from "@/services/franchise-pickup-service";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface LineDraft {
  product_variant_id?: number;
  quantity: number;
}

interface CreatePickupRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: number;
}

export default function CreatePickupRequestDialog({
  open,
  onOpenChange,
  companyId,
}: CreatePickupRequestDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [franchiseId, setFranchiseId] = useState<string>("");
  const [employeeId, setEmployeeId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<LineDraft[]>([{ quantity: 1 }]);

  useEffect(() => {
    if (open) {
      setFranchiseId("");
      setEmployeeId("");
      setNotes("");
      setLines([{ quantity: 1 }]);
    }
  }, [open]);

  const { data: franchisesData } = useQuery({
    queryKey: ["franchises-with-stock", companyId],
    queryFn: () => getFranchisesWithStock(companyId),
    enabled: open && companyId > 0,
  });
  const franchises: Franchise[] = franchisesData?.data ?? [];

  const { data: inventoryData } = useQuery({
    queryKey: ["franchise-inventory", franchiseId],
    queryFn: () => getFranchiseInventory(Number(franchiseId)),
    enabled: open && Boolean(franchiseId),
  });

  const stockByVariant = useMemo(() => {
    const items = inventoryData?.data?.items_with_cost ?? inventoryData?.data?.items ?? [];
    const map = new Map<number, { variant: ProductVariant; quantity: number }>();
    for (const item of items) {
      if (!item.product_variant || item.quantity <= 0) continue;
      map.set(item.product_variant_id, {
        variant: {
          ...item.product_variant,
          product: item.product_variant.product ?? item.product,
        },
        quantity: item.quantity,
      });
    }
    return map;
  }, [inventoryData]);

  const inStockVariants = useMemo(
    () => Array.from(stockByVariant.values()).map((row) => row.variant),
    [stockByVariant]
  );

  const { data: deliveryCompaniesData } = useQuery({
    queryKey: ["delivery-companies"],
    queryFn: getDeliveryCompanies,
    enabled: open,
  });
  const deliveryCompanyIds = useMemo(
    () =>
      (deliveryCompaniesData?.data ?? [])
        .filter((company) => company.company_id === companyId)
        .map((company) => company.ID),
    [deliveryCompaniesData, companyId]
  );

  const employeeQueries = useQueries({
    queries: deliveryCompanyIds.map((id) => ({
      queryKey: ["delivery-employees", id],
      queryFn: () => getDeliveryEmployees(id),
      enabled: open && id > 0,
    })),
  });
  const employees: DeliveryEmployee[] = employeeQueries.flatMap(
    (query) => query.data?.data ?? []
  );

  const selectedVariantIds = new Set(
    lines.map((line) => line.product_variant_id).filter(Boolean) as number[]
  );

  const { mutate, isPending } = useMutation({
    mutationFn: createFranchisePickupRequest,
    onSuccess: () => {
      toast({ title: "Pickup request created" });
      queryClient.invalidateQueries({ queryKey: ["company-pickup-requests"] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Could not create pickup request",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const canSubmit =
    Boolean(franchiseId) &&
    Boolean(employeeId) &&
    lines.length > 0 &&
    lines.every(
      (line) =>
        line.product_variant_id &&
        line.quantity > 0 &&
        line.quantity <= (stockByVariant.get(line.product_variant_id)?.quantity ?? 0)
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-2xl">
        <DialogHeader className="pr-8 text-left">
          <DialogTitle>Create pickup request</DialogTitle>
          <DialogDescription>
            Choose a franchise with stock, the courier, and the variants to collect.
            Inventory is deducted only after the franchise confirms pickup.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="min-w-0">
            <Combobox
              label="Franchise"
              placeholder="Select a franchise with stock"
              searchPlaceholder="Search franchise..."
              emptyMessage="No franchise with stock found."
              items={franchises.map((franchise) => ({
                value: String(franchise.ID),
                label: franchise.name,
              }))}
              value={franchiseId}
              onChange={(value) => {
                setFranchiseId(value);
                setLines([{ quantity: 1 }]);
              }}
            />
          </div>
          <div className="min-w-0">
            <Combobox
              label="Delivery employee"
              placeholder="Select a courier"
              searchPlaceholder="Search employee..."
              emptyMessage="No delivery employees found."
              items={employees.map((employee) => ({
                value: String(employee.ID),
                label: employee.name,
              }))}
              value={employeeId}
              onChange={setEmployeeId}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Variants</Label>
            {lines.map((line, index) => {
              const available = line.product_variant_id
                ? stockByVariant.get(line.product_variant_id)?.quantity ?? 0
                : 0;
              const variantsForLine = inStockVariants.filter(
                (variant) =>
                  variant.ID === line.product_variant_id ||
                  !selectedVariantIds.has(variant.ID)
              );
              return (
                <div
                  key={index}
                  className="space-y-2 rounded-lg border bg-muted/30 p-3"
                >
                  <ProductVariantCombobox
                    variants={variantsForLine}
                    value={line.product_variant_id}
                    disabled={!franchiseId}
                    placeholder={
                      franchiseId
                        ? "Select in-stock variant..."
                        : "Select a franchise first"
                    }
                    variantSuffix={(variantId) =>
                      `qty ${stockByVariant.get(variantId)?.quantity ?? 0}`
                    }
                    onChange={(variantId) => {
                      const next = [...lines];
                      next[index] = {
                        ...next[index],
                        product_variant_id: variantId,
                        quantity: 1,
                      };
                      setLines(next);
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <Label htmlFor={`pickup-qty-${index}`} className="sr-only">
                        Quantity
                      </Label>
                      <Input
                        id={`pickup-qty-${index}`}
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={available || undefined}
                        value={line.quantity}
                        disabled={!line.product_variant_id}
                        onChange={(event) => {
                          const next = [...lines];
                          next[index] = {
                            ...next[index],
                            quantity: Number(event.target.value),
                          };
                          setLines(next);
                        }}
                      />
                    </div>
                    {available > 0 ? (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        of {available}
                      </span>
                    ) : null}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Remove variant"
                      disabled={lines.length === 1}
                      onClick={() => setLines(lines.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              disabled={!franchiseId || inStockVariants.length <= lines.length}
              onClick={() => setLines([...lines, { quantity: 1 }])}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add variant
            </Button>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="pickup-notes">Notes</Label>
            <Textarea
              id="pickup-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional notes for the franchise"
              className="min-h-20"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="w-full sm:w-auto"
            disabled={!canSubmit || isPending}
            onClick={() =>
              mutate({
                company_id: companyId,
                franchise_id: Number(franchiseId),
                delivery_employee_id: Number(employeeId),
                notes,
                items: lines
                  .filter((line) => line.product_variant_id)
                  .map((line) => ({
                    product_variant_id: line.product_variant_id as number,
                    quantity: line.quantity,
                  })),
              })
            }
          >
            Create request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
