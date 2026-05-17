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
import { useToast } from "@/hooks/use-toast";
import { updateShipFromStoreAdmin } from "@/services/ship-from-store-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { ShipFromStore } from "@/models/data/ship-from-store.model";

interface CompanyShipFromStoreEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: ShipFromStore | null;
  companyId: number;
}

export function CompanyShipFromStoreEditDialog({
  open,
  onOpenChange,
  record,
  companyId,
}: CompanyShipFromStoreEditDialogProps) {
  const [trackingNumber, setTrackingNumber] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (record) setTrackingNumber(record.tracking_number ?? "");
  }, [record]);

  const mutate = useMutation({
    mutationFn: ({ id, tracking_number }: { id: number; tracking_number: string }) =>
      updateShipFromStoreAdmin(id, { tracking_number }),
    onSuccess: () => {
      toast({ title: "Updated", description: "Tracking number updated." });
      queryClient.invalidateQueries({ queryKey: ["company-ship-from-store", companyId] });
      queryClient.invalidateQueries({ queryKey: ["company-franchise-fulfillment-shipments"] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!record) return;
    mutate.mutate({ id: record.ID, tracking_number: trackingNumber.trim() });
  };

  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit ship-from-store</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-tracking">Tracking number</Label>
            <Input
              id="edit-tracking"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="YAL-XXXXXX or ECH-XXXXXX"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutate.isPending}>
              {mutate.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
