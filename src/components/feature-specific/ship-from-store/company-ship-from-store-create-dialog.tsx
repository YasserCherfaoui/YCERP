"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductVariantCombobox } from "@/components/feature-specific/company-products/product-variant-combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createShipFromStoreAdmin } from "@/services/ship-from-store-service";
import { getFranchiseInventory } from "@/services/franchise-service";
import { getMyCompanyFranchises } from "@/services/franchise-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { ProductVariant } from "@/models/data/product.model";
import { Franchise } from "@/models/data/franchise.model";

interface CompanyShipFromStoreCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: number;
  /** When set (e.g. from company franchise context), franchise is fixed and selector hidden */
  defaultFranchiseId?: number;
}

export function CompanyShipFromStoreCreateDialog({
  open,
  onOpenChange,
  companyId,
  defaultFranchiseId,
}: CompanyShipFromStoreCreateDialogProps) {
  const [franchiseId, setFranchiseId] = useState<number | undefined>(defaultFranchiseId);
  const [productVariantId, setProductVariantId] = useState<number | undefined>(undefined);
  const [trackingNumber, setTrackingNumber] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setFranchiseId(defaultFranchiseId ?? undefined);
      setProductVariantId(undefined);
      setTrackingNumber("");
    }
  }, [open, defaultFranchiseId]);
  const queryClient = useQueryClient();

  const { data: franchisesData } = useQuery({
    queryKey: ["company-franchises", companyId],
    queryFn: () => getMyCompanyFranchises(companyId),
    enabled: !!companyId && open,
  });
  const franchises: Franchise[] = franchisesData?.data ?? [];

  const { data: inventory } = useQuery({
    queryKey: ["franchise-inventory", franchiseId],
    queryFn: () => getFranchiseInventory(franchiseId!),
    enabled: !!franchiseId && open,
  });

  const variants: ProductVariant[] = (() => {
    if (!inventory?.data) return [];
    const items = inventory.data.items_with_cost ?? inventory.data.items ?? [];
    const seen = new Set<number>();
    const out: ProductVariant[] = [];
    for (const item of items) {
      const v = item.product_variant;
      if (v && !seen.has(v.ID)) {
        seen.add(v.ID);
        out.push(v);
      }
    }
    return out;
  })();

  const mutate = useMutation({
    mutationFn: createShipFromStoreAdmin,
    onSuccess: () => {
      toast({ title: "Ship-from-store recorded", description: "Record created successfully." });
      queryClient.invalidateQueries({ queryKey: ["company-ship-from-store", companyId] });
      queryClient.invalidateQueries({ queryKey: ["company-franchise-fulfillment-shipments"] });
      onOpenChange(false);
      setFranchiseId(defaultFranchiseId ?? undefined);
      setProductVariantId(undefined);
      setTrackingNumber("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create record",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (franchiseId == null || productVariantId == null || !trackingNumber.trim()) {
      toast({
        title: "Validation",
        description: "Please select franchise, variant, and enter tracking number.",
        variant: "destructive",
      });
      return;
    }
    mutate.mutate({
      franchise_id: franchiseId,
      product_variant_id: productVariantId,
      tracking_number: trackingNumber.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ship from store (create)</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {defaultFranchiseId == null && (
            <div className="space-y-2">
              <Label>Franchise</Label>
              <Select
                value={franchiseId?.toString() ?? ""}
                onValueChange={(v) => {
                  setFranchiseId(v ? parseInt(v, 10) : undefined);
                  setProductVariantId(undefined);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select franchise..." />
                </SelectTrigger>
                <SelectContent>
                  {franchises.map((f) => (
                    <SelectItem key={f.ID} value={String(f.ID)}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label>Variant (QR code)</Label>
            <ProductVariantCombobox
              variants={variants}
              value={productVariantId}
              onChange={setProductVariantId}
              placeholder="Select variant..."
              disabled={!franchiseId}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tracking-admin">Tracking number</Label>
            <Input
              id="tracking-admin"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="YAL-XXXXXX or ECH-XXXXXX"
            />
            <p className="text-xs text-muted-foreground">e.g. YAL-XXXXXX or ECH-XXXXXX</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutate.isPending}>
              {mutate.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
