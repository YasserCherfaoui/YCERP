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
import { Barcode, PackageCheck, Scan } from "lucide-react";
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
