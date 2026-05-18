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
import { FranchiseWooRefund } from "@/models/data/franchise-woo-refund.model";
import { useEffect, useMemo, useState } from "react";

const formatDZD = (n: number) =>
  new Intl.NumberFormat("en-DZ", {
    style: "currency",
    currency: "DZD",
    maximumFractionDigits: 0,
  }).format(n);

type Props = {
  refunds: FranchiseWooRefund[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (paymentReference: string) => void;
  isPending?: boolean;
};

export function MarkWooRefundReimbursedDialog({
  refunds,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: Props) {
  const [reference, setReference] = useState("");

  useEffect(() => {
    if (!open) setReference("");
  }, [open]);

  const total = useMemo(
    () =>
      refunds.reduce((sum, r) => sum + (r.cash_paid_to_customer ?? 0), 0),
    [refunds]
  );

  const handleOpenChange = (next: boolean) => {
    if (!next) setReference("");
    onOpenChange(next);
  };

  if (refunds.length === 0) return null;

  const isBulk = refunds.length > 1;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isBulk
              ? `Settle ${refunds.length} reimbursements`
              : "Record franchise reimbursement"}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {isBulk ? (
            <>
              Confirm the company paid{" "}
              <strong>{formatDZD(total)}</strong> total back to franchise stores
              for <strong>{refunds.length}</strong> cash refunds.
            </>
          ) : (
            <>
              Confirm the company paid{" "}
              <strong>{formatDZD(refunds[0].cash_paid_to_customer ?? 0)}</strong>{" "}
              back to{" "}
              <strong>{refunds[0].franchise?.name ?? "the franchise"}</strong> for
              order{" "}
              <strong>
                {refunds[0].woo_order?.number ?? refunds[0].woo_order_id}
              </strong>
              .
            </>
          )}
        </p>
        {isBulk && (
          <ul className="max-h-32 overflow-y-auto rounded-md border text-xs divide-y">
            {refunds.map((r) => (
              <li
                key={r.ID}
                className="flex justify-between gap-2 px-2 py-1.5"
              >
                <span className="truncate">
                  {r.woo_order?.number ?? `#${r.woo_order_id}`} ·{" "}
                  {r.franchise?.name ?? "Franchise"}
                </span>
                <span className="shrink-0 font-medium">
                  {formatDZD(r.cash_paid_to_customer ?? 0)}
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="space-y-1">
          <Label htmlFor="payment-ref">Payment reference (optional)</Label>
          <Input
            id="payment-ref"
            placeholder="Transfer ID, cheque #, …"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
          {isBulk && (
            <p className="text-xs text-muted-foreground">
              Same reference will be saved on every selected refund.
            </p>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={isPending}
            onClick={() => onConfirm(reference.trim())}
          >
            {isPending
              ? "Saving…"
              : isBulk
                ? `Settle ${refunds.length} refunds`
                : "Mark as paid"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
