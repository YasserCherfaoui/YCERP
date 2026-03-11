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
import { useToast } from "@/hooks/use-toast";
import { createShipFromStoreFranchise } from "@/services/ship-from-store-service";
import { getFranchiseInventory } from "@/services/franchise-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { ProductVariant } from "@/models/data/product.model";

interface ShipFromStoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShipFromStoreDialog({ open, onOpenChange }: ShipFromStoreDialogProps) {
  const franchise = useSelector((state: RootState) => state.franchise.franchise);
  const [productVariantId, setProductVariantId] = useState<number | undefined>(undefined);
  const [trackingNumber, setTrackingNumber] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: inventory } = useQuery({
    queryKey: ["franchise-inventory", franchise?.ID],
    queryFn: () => getFranchiseInventory(franchise!.ID),
    enabled: !!franchise && open,
  });

  const variants: ProductVariant[] = (() => {
    const items = inventory?.data?.items_with_cost ?? inventory?.data?.items ?? [];
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
    mutationFn: createShipFromStoreFranchise,
    onSuccess: () => {
      toast({
        title: "Ship-from-store recorded",
        description: "Record created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["franchise-ship-from-store"] });
      queryClient.invalidateQueries({ queryKey: ["franchise-inventory", franchise?.ID] });
      onOpenChange(false);
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
    if (productVariantId == null || !trackingNumber.trim()) {
      toast({
        title: "Validation",
        description: "Please select a variant and enter a tracking number.",
        variant: "destructive",
      });
      return;
    }
    mutate.mutate({
      product_variant_id: productVariantId,
      tracking_number: trackingNumber.trim(),
    });
  };

  if (!franchise) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ship from store</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Variant (QR code)</Label>
            <ProductVariantCombobox
              variants={variants}
              value={productVariantId}
              onChange={setProductVariantId}
              placeholder="Select variant..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tracking">Tracking number</Label>
            <Input
              id="tracking"
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
