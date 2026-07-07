import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import { BrokenItemListItem } from "@/models/data/broken-item.model";
import { recoverBrokenItem } from "@/services/broken-items-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

interface RecoverBrokenItemDialogProps {
  item: BrokenItemListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RecoverBrokenItemDialog({
  item,
  open,
  onOpenChange,
}: RecoverBrokenItemDialogProps) {
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const recoverableQuantity = item?.recoverable_quantity ?? 0;

  useEffect(() => {
    if (open && item) {
      setQuantity(item.recoverable_quantity);
    }
  }, [open, item]);

  const { mutate: recoverMutation, isPending } = useMutation({
    mutationFn: recoverBrokenItem,
    onSuccess: () => {
      onOpenChange(false);
      toast({
        title: "Item recovered",
        description: "Declared quantity has been restored to sellable inventory.",
      });
      queryClient.invalidateQueries({ queryKey: ["broken-items-declarations"] });
      queryClient.invalidateQueries({ queryKey: ["broken-items"] });
      queryClient.invalidateQueries({ queryKey: ["franchise-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["company-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-total-cost"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Recovery failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const handleRecover = () => {
    if (!item) return;
    if (quantity < 1 || quantity > recoverableQuantity) {
      toast({
        title: "Invalid quantity",
        description: `Enter a value between 1 and ${recoverableQuantity}.`,
        variant: "destructive",
      });
      return;
    }

    recoverMutation({
      inventory_item_id: item.inventory_item_id,
      product_variant_id: item.product_variant_id,
      recovered_quantity: quantity,
    });
  };

  if (!item) return null;

  const variantLabel =
    item.inventory_item?.name ||
    (item.product_variant
      ? `${item.product_variant.color} / ${item.product_variant.size}`
      : `Variant ${item.product_variant_id}`);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Recover declared quantity</DialogTitle>
          <DialogDescription>
            Restore units from broken declarations back to sellable inventory for{" "}
            <span className="font-medium">{variantLabel}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">Declared</Label>
              <p className="font-medium">{item.broken_quantity}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Already recovered</Label>
              <p className="font-medium">{item.recovered_quantity}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Recoverable</Label>
              <p className="font-medium">{recoverableQuantity}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Current sellable qty</Label>
              <p className="font-medium">{item.inventory_item?.quantity ?? "-"}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recover-quantity">Quantity to recover</Label>
            <div className="flex gap-2">
              <Input
                id="recover-quantity"
                type="number"
                min={1}
                max={recoverableQuantity}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setQuantity(recoverableQuantity)}
              >
                Recover all
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleRecover} disabled={isPending || recoverableQuantity < 1}>
            {isPending ? "Recovering..." : "Recover"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
