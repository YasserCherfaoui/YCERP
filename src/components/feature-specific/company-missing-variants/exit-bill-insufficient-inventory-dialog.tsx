import UpdateInventoryItemDialog from "@/components/feature-specific/company-warehouse/update-inventory-item-dialog";
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
import { InventoryItem } from "@/models/data/inventory.model";
import { InventoryShortfallItem } from "@/models/data/missing-variant.model";
import { useState } from "react";

function shortfallToInventoryItem(row: InventoryShortfallItem): InventoryItem {
  return {
    ID: row.inventory_item_id,
    name: row.item_name,
    quantity: row.actual_quantity,
    inventory_id: 0,
    product_id: 0,
    product_variant_id: row.product_variant_id,
    broken_count: 0,
    created_at: "",
    updated_at: "",
  };
}

interface ExitBillInsufficientInventoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shortfalls: InventoryShortfallItem[];
}

export default function ExitBillInsufficientInventoryDialog({
  open,
  onOpenChange,
  shortfalls,
}: ExitBillInsufficientInventoryDialogProps) {
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [adjustOpen, setAdjustOpen] = useState(false);

  const handleQuickFix = (row: InventoryShortfallItem) => {
    if (!row.inventory_item_id) return;
    setAdjustItem(shortfallToInventoryItem(row));
    setAdjustOpen(true);
  };

  const handleAdjustOpenChange = (next: boolean) => {
    setAdjustOpen(next);
    if (!next) setAdjustItem(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Insufficient inventory</DialogTitle>
            <DialogDescription>
              Company stock is too low for one or more variants. Adjust quantities
              in the warehouse, then try creating the exit bill again.
            </DialogDescription>
          </DialogHeader>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Variant barcode</TableHead>
                <TableHead className="text-right">Actual qty</TableHead>
                <TableHead className="text-right">Needed qty</TableHead>
                <TableHead className="w-[120px]"> </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shortfalls.map((row) => (
                <TableRow key={`${row.product_variant_id}-${row.inventory_item_id}`}>
                  <TableCell className="font-mono text-sm">
                    {row.barcode?.trim() ? row.barcode : "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.actual_quantity}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.needed_quantity}
                  </TableCell>
                  <TableCell>
                    {row.inventory_item_id ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickFix(row)}
                      >
                        Quick fix
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Not in warehouse
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {adjustItem ? (
        <UpdateInventoryItemDialog
          inventoryItem={adjustItem}
          open={adjustOpen}
          onOpenChange={handleAdjustOpenChange}
        />
      ) : null}
    </>
  );
}
