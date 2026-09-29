import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StockMovementBill, StockMovementBillItem } from "@/models/data/stock-movement.model";
import { Printer } from "lucide-react";

function itemTitle(item: StockMovementBillItem): string {
  const variant = item.product_variant;
  const product = variant?.product?.name;
  if (product) {
    return `${product} ${variant?.color ?? ""} ${variant?.size ?? ""}`.trim();
  }
  return variant?.qr_code || `Variant ${item.product_variant_id}`;
}

interface StockMovementBillDialogProps {
  bill: StockMovementBill | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPrint: (billId: number) => void;
  printing: boolean;
}

export default function StockMovementBillDialog({
  bill,
  open,
  onOpenChange,
  onPrint,
  printing,
}: StockMovementBillDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Stock movement {bill ? `SM-${bill.ID}` : ""}</DialogTitle>
          <DialogDescription asChild>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex gap-2">
                <span className="font-medium text-foreground">From</span>
                <span>{bill?.from_inventory?.name || (bill ? `Inventory ${bill.from_inventory_id}` : "")}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium text-foreground">To</span>
                <span>{bill?.to_inventory?.name || (bill ? `Inventory ${bill.to_inventory_id}` : "")}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium text-foreground">Date</span>
                <span>{bill?.CreatedAt ? new Date(bill.CreatedAt).toLocaleString() : "—"}</span>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[360px] pr-3">
          <div className="flex flex-col gap-2">
            {(bill?.items ?? []).map((item) => (
              <div key={item.ID} className="flex items-start justify-between gap-3 text-sm">
                <div>
                  <div>{itemTitle(item)}</div>
                  {item.product_variant?.qr_code ? (
                    <div className="font-mono text-xs text-muted-foreground">{item.product_variant.qr_code}</div>
                  ) : null}
                </div>
                <span className="tabular-nums">Qty {item.quantity}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            type="button"
            disabled={!bill || printing}
            onClick={() => bill && onPrint(bill.ID)}
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
