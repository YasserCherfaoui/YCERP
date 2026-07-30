import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { BillItem, ExitBill } from "@/models/data/bill.model";
import { prepareExitBill } from "@/services/bill-service";
import { processPrepareBarcode } from "@/utils/process-prepare-barcode";
import {
  validateExtraEntryExitBill,
  validateMissingEntryExitBill,
} from "@/utils/validate-entry-exit-bill";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Barcode, PackageCheck, Printer, Scan } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface Props {
  bill: ExitBill | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function variantLabel(item: {
  product_variant?: {
    qr_code?: string;
    color?: string;
    product?: { name?: string };
  };
}) {
  const pv = item.product_variant;
  if (pv?.product?.name) {
    return `${pv.product.name} — ${pv.color ?? ""}`;
  }
  return pv?.qr_code ?? "Unknown";
}

function printRemainingItems(
  billId: number,
  franchiseName: string | undefined,
  remaining: Array<{
    name: string;
    color: string;
    size: string;
    barcode: string;
    quantity: number;
  }>
) {
  const rows = remaining
    .map(
      (item) => `
      <tr>
        <td>${escapeHtml(item.name)}</td>
        <td>${escapeHtml(item.color)}</td>
        <td style="text-align:center">${escapeHtml(item.size)}</td>
        <td>${escapeHtml(item.barcode)}</td>
        <td style="text-align:right;font-weight:600">${item.quantity}</td>
      </tr>`
    )
    .join("");

  const totalQty = remaining.reduce((sum, item) => sum + item.quantity, 0);
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>EXB-${billId} Remaining Items</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
    h1 { font-size: 18px; margin: 0 0 4px; }
    .meta { font-size: 12px; color: #444; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
    th { background: #f3f3f3; }
    .footer { margin-top: 16px; font-size: 13px; font-weight: 600; }
    @media print {
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <h1>Prepare Exit Bill EXB-${billId} — Remaining Items</h1>
  <div class="meta">
    ${franchiseName ? `Franchise: ${escapeHtml(franchiseName)}<br/>` : ""}
    Printed: ${new Date().toLocaleString()}<br/>
    Lines: ${remaining.length} · Total qty: ${totalQty}
  </div>
  <table>
    <thead>
      <tr>
        <th>Product</th>
        <th>Color</th>
        <th>Size</th>
        <th>Barcode</th>
        <th>Qty</th>
      </tr>
    </thead>
    <tbody>
      ${rows || `<tr><td colspan="5">No remaining items</td></tr>`}
    </tbody>
  </table>
  <div class="footer">Total remaining quantity: ${totalQty}</div>
</body>
</html>`;

  const printWindow = window.open("", "_blank", "width=800,height=600");
  if (!printWindow) {
    throw new Error("Popup blocked. Please allow popups to print.");
  }
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.onload = () => {
    printWindow.print();
    printWindow.onafterprint = () => printWindow.close();
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default function PrepareExitBillDialog({
  bill,
  open,
  onOpenChange,
}: Props) {
  const [input, setInput] = useState("");
  const [checkedItems, setCheckedItems] = useState<BillItem[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!open) {
      setInput("");
      setCheckedItems([]);
    }
  }, [open, bill?.ID]);

  const remainingItems = useMemo(() => {
    if (!bill) return [];
    return bill.bill_items
      .map((exitItem) => {
        const checked =
          checkedItems.find(
            (c) => c.product_variant_id === exitItem.product_variant_id
          )?.quantity ?? 0;
        const remaining = exitItem.quantity - checked;
        return { exitItem, remaining };
      })
      .filter(({ remaining }) => remaining > 0);
  }, [bill, checkedItems]);

  const remainingByVariant = useMemo(() => {
    const map = new Map<number, number>();
    for (const { exitItem, remaining } of remainingItems) {
      map.set(exitItem.product_variant_id, remaining);
    }
    return map;
  }, [remainingItems]);

  const missing = bill
    ? validateMissingEntryExitBill({
        entryItems: checkedItems,
        exitItems: bill.bill_items,
      })
    : [];
  const extras = bill
    ? validateExtraEntryExitBill({
        entryItems: checkedItems,
        exitItems: bill.bill_items,
      })
    : [];
  const canSubmit =
    !!bill && missing.length === 0 && extras.length === 0 && checkedItems.length > 0;

  const { mutate: prepareMutation, isPending } = useMutation({
    mutationFn: () =>
      prepareExitBill(bill!.ID, {
        bill_items: checkedItems.map((item) => ({
          product_variant_id: item.product_variant_id,
          quantity: item.quantity,
        })),
      }),
    onSuccess: () => {
      toast({
        title: "Exit Bill Prepared",
        description: `EXB-${bill!.ID} is ready for the franchise`,
      });
      queryClient.invalidateQueries({ queryKey: ["preparing-exit-bills"] });
      queryClient.invalidateQueries({ queryKey: ["exit_bills"] });
      queryClient.invalidateQueries({ queryKey: ["franchise-exit-bills"] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error preparing exit bill",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePrintRemaining = () => {
    if (!bill) return;
    if (remainingItems.length === 0) {
      toast({
        title: "Nothing to print",
        description: "There are no remaining items",
      });
      return;
    }
    try {
      printRemainingItems(
        bill.ID,
        bill.franchise?.name,
        remainingItems.map(({ exitItem, remaining }) => ({
          name: exitItem.product_variant?.product?.name ?? "Unknown",
          color: exitItem.product_variant?.color ?? "",
          size: String(exitItem.product_variant?.size ?? ""),
          barcode: exitItem.product_variant?.qr_code ?? "",
          quantity: remaining,
        }))
      );
    } catch (error) {
      toast({
        title: "Print failed",
        description: error instanceof Error ? error.message : "Could not print",
        variant: "destructive",
      });
    }
  };

  const runScan = () => {
    if (!bill) return;
    processPrepareBarcode({
      input,
      exitItems: bill.bill_items,
      checkedItems,
      setCheckedItems,
      remainingByVariant,
      toast,
      setInput,
    });
  };

  useEffect(() => {
    if (!open) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        runScan();
      }
    };

    window.addEventListener("keypress", handleKeyPress);
    const timeout = setTimeout(() => {
      if (input.length > 0) {
        runScan();
      }
    }, 1000);

    return () => {
      window.removeEventListener("keypress", handleKeyPress);
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mirror entry-bill scanner pattern
  }, [input, open, bill, checkedItems, remainingByVariant]);

  if (!bill) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackageCheck className="h-5 w-5" />
            Prepare Exit Bill EXB-{bill.ID}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <span className="flex gap-2 items-center text-sm text-muted-foreground">
            <Scan className="h-4 w-4" />
            <Barcode className="h-4 w-4" />
            Scan barcodes to check declared items. Submit only when the lists match exactly.
          </span>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Scan barcode..."
            className="w-full"
            autoFocus
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[320px]">
            <div className="flex flex-col gap-2 border rounded-md p-3">
              <h3 className="font-semibold text-sm">
                Remaining ({remainingItems.length})
              </h3>
              <ScrollArea className="h-[300px]">
                <ul className="flex flex-col gap-2 pr-2">
                  {remainingItems.length === 0 ? (
                    <li className="text-sm text-muted-foreground">
                      All declared items checked
                    </li>
                  ) : (
                    remainingItems.map(({ exitItem, remaining }) => (
                      <li
                        key={exitItem.product_variant_id}
                        className="flex justify-between items-center gap-2 rounded border px-3 py-2 text-sm"
                      >
                        <span className="truncate">
                          {variantLabel(exitItem)}
                        </span>
                        <span className="shrink-0 font-medium">
                          Qty: {remaining}
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              </ScrollArea>
            </div>

            <div className="flex flex-col gap-2 border rounded-md p-3">
              <h3 className="font-semibold text-sm">
                Checking ({checkedItems.length})
              </h3>
              <ScrollArea className="h-[300px]">
                <ul className="flex flex-col gap-2 pr-2">
                  {checkedItems.length === 0 ? (
                    <li className="text-sm text-muted-foreground">
                      Scan items to start checking
                    </li>
                  ) : (
                    checkedItems.map((item) => (
                      <li
                        key={item.product_variant_id}
                        className="flex justify-between items-center gap-2 rounded border px-3 py-2 text-sm"
                      >
                        <span className="truncate">{item.variant_name}</span>
                        <span className="shrink-0 font-medium">
                          Qty: {item.quantity}
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              </ScrollArea>
            </div>
          </div>

          {!canSubmit && checkedItems.length > 0 && (
            <p className="text-sm text-amber-600">
              Submit is disabled until remaining is empty and there are no extra
              items.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handlePrintRemaining}
            disabled={remainingItems.length === 0 || isPending}
          >
            <Printer className="h-4 w-4 sm:mr-2" />
            Print remaining
          </Button>
          <Button
            disabled={!canSubmit || isPending}
            onClick={() => prepareMutation()}
          >
            {isPending ? "Preparing…" : "Mark Prepared"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
