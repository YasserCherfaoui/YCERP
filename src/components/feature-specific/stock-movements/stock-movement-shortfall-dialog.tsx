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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { InventoryShortfallItem } from "@/models/data/missing-variant.model";
import { alignStockMovementSource } from "@/services/stock-movement-service";
import { useState } from "react";

interface StockMovementShortfallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shortfalls: InventoryShortfallItem[];
  companyId: number;
  inventoryId: number;
  /** Retry the movement. Return remaining shortfalls, or null when the bill is created. */
  onRetry: () => Promise<InventoryShortfallItem[] | null>;
  onResolved: () => void;
}

export default function StockMovementShortfallDialog({
  open,
  onOpenChange,
  shortfalls,
  companyId,
  inventoryId,
  onRetry,
  onResolved,
}: StockMovementShortfallDialogProps) {
  const { toast } = useToast();
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const alignAndRetry = async (rows: InventoryShortfallItem[], key: string) => {
    if (!inventoryId || rows.length === 0) return;
    setPendingKey(key);
    try {
      await alignStockMovementSource({
        company_id: companyId,
        inventory_id: inventoryId,
        items: rows.map((row) => ({
          product_variant_id: row.product_variant_id,
          quantity: row.needed_quantity,
        })),
      });
      const remaining = await onRetry();
      if (!remaining) {
        onOpenChange(false);
        onResolved();
      }
    } catch (error) {
      toast({
        title: "Could not fix stock",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setPendingKey(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Insufficient inventory</DialogTitle>
          <DialogDescription>
            Source stock is lower than the quantity being moved. Fix sets the source
            quantity to the requested amount, then tries the movement again.
          </DialogDescription>
        </DialogHeader>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Variant barcode</TableHead>
              <TableHead className="text-right">Actual qty</TableHead>
              <TableHead className="text-right">Needed qty</TableHead>
              <TableHead className="w-[100px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {shortfalls.map((row) => {
              const key = `${row.product_variant_id}-${row.inventory_item_id}`;
              return (
                <TableRow key={key}>
                  <TableCell className="font-mono text-sm">
                    <div>{row.barcode?.trim() ? row.barcode : "—"}</div>
                    <div className="font-sans text-xs text-muted-foreground">{row.item_name}</div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{row.actual_quantity}</TableCell>
                  <TableCell className="text-right tabular-nums">{row.needed_quantity}</TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={pendingKey !== null}
                      onClick={() => alignAndRetry([row], key)}
                    >
                      {pendingKey === key ? "Fixing…" : "Fix"}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            type="button"
            disabled={pendingKey !== null || shortfalls.length === 0}
            onClick={() => alignAndRetry(shortfalls, "all")}
          >
            {pendingKey === "all" ? "Fixing…" : "Fix all"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
