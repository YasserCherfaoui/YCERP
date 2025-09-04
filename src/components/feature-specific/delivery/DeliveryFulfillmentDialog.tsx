import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { WooOrder } from "@/models/data/woo-order.model";
import { DeliveryFulfillmentRequest } from "@/models/requests/delivery-fulfillment-request";
import { submitFulfillment } from "@/services/delivery-fulfillment-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

type Props = {
  order: WooOrder;
  open: boolean;
  setOpen: (val: boolean) => void;
  ordersQueryKey: any[];
  onSubmitted?: () => void;
};

type RowState = {
  confirmedItemId: number;
  qrCode: string;
  confirmedQty: number;
  delivered: boolean;
  deliveredQty: number;
};

export default function DeliveryFulfillmentDialog({ order, open, setOpen, ordersQueryKey, onSubmitted }: Props) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [rows, setRows] = useState<RowState[]>([]);
  const [feesCollected, setFeesCollected] = useState<boolean>(true);
  const [comments, setComments] = useState<string>("");

  useEffect(() => {
    if (open && order) {
      const items = (order.confirmed_order_items || []) as any[];
      const normalizedRows: RowState[] = items
        .map((ci: any) => {
          const id = (ci.id ?? ci.ID) as number | undefined;
          if (id == null) return null;
          return {
            confirmedItemId: id,
            qrCode: ci.product_variant?.qr_code || "-",
            confirmedQty: Number(ci.quantity || 0),
            delivered: true,
            deliveredQty: Number(ci.quantity || 0),
          } as RowState;
        })
        .filter(Boolean) as RowState[];
      setRows(normalizedRows);
      setFeesCollected(true);
      setComments("");
    }
  }, [open, order]);

  const setRow = (index: number, updater: (old: RowState) => RowState) => {
    setRows((prev) => prev.map((r, i) => (i === index ? updater(r) : r)));
  };

  const getConfirmedItem = (row: RowState) => ((order.confirmed_order_items || []) as any[]).find((c: any) => ((c.id ?? c.ID) === row.confirmedItemId));

  // kept for potential future UI previews per line; not used in totals after breakdown

  const totals = useMemo(() => {
    let itemsSubtotal = 0;
    for (const r of rows) {
      if (!r.delivered || r.deliveredQty <= 0) continue;
      const ci = getConfirmedItem(r);
      const unit = Number(ci?.product?.price ?? 0);
      itemsSubtotal += r.deliveredQty * unit;
    }
    const deliveryFees = feesCollected ? Number(order.woo_shipping?.second_delivery_cost || 0) : 0;
    const allDelivered = rows.length === 0 ? false : rows.every((r) => r.delivered);
    const orderDiscountApplied = allDelivered ? Number(order.discount || 0) : 0;
    const total = itemsSubtotal + deliveryFees - orderDiscountApplied;
    return { itemsSubtotal, deliveryFees, orderDiscountApplied, total };
  }, [rows, order, feesCollected]);

  const { mutate: submit, isPending } = useMutation({
    mutationFn: async () => {
      // Client-side validation
      for (const r of rows) {
        const qty = r.delivered ? r.deliveredQty : 0;
        if (!Number.isInteger(qty) || qty < 0 || qty > r.confirmedQty) {
          throw new Error(`Invalid quantity for item ${r.qrCode}`);
        }
      }

      const payload: DeliveryFulfillmentRequest = {
        order_id: order.id,
        delivered_items: rows
          .filter((r) => r.delivered && r.deliveredQty > 0)
          .map((r) => ({ confirmed_item_id: r.confirmedItemId, quantity: r.deliveredQty })),
        fees_collected: feesCollected ? true : false,
        fees_amount: null,
        total_amount_collected: totals.total,
        comments: comments || undefined,
      };
      const updated = await submitFulfillment(payload);
      return updated;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Delivery fulfillment submitted." });
      queryClient.invalidateQueries({ queryKey: ordersQueryKey });
      setOpen(false);
      onSubmitted?.();
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "submit-fulfillment-failed", variant: "destructive" });
    },
  });

  const hasAnyDelivered = useMemo(() => rows.some((r) => r.delivered && r.deliveredQty > 0), [rows]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Delivery Fulfillment (#{order.number})</DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-muted-foreground">Confirm delivered items and fees</div>
        </div>

        <div className="max-h-96 overflow-y-auto border rounded-md">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead>QR Code</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Delivered?</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, idx) => (
                <TableRow key={row.confirmedItemId}>
                  <TableCell className="font-mono">{row.qrCode}</TableCell>
                  <TableCell className="w-40">
                    <Input
                      type="number"
                      min={0}
                      max={row.confirmedQty}
                      step={1}
                      value={row.delivered ? row.deliveredQty : 0}
                      onChange={(e) => {
                        const val = Math.max(0, Math.min(row.confirmedQty, Math.floor(Number(e.target.value) || 0)));
                        setRow(idx, (old) => ({ ...old, delivered: val > 0, deliveredQty: val }));
                      }}
                      disabled={!row.delivered}
                    />
                    <div className="text-xs text-muted-foreground mt-1">Confirmed: {row.confirmedQty}</div>
                  </TableCell>
                  <TableCell className="w-24">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={row.delivered}
                        onCheckedChange={(v) => {
                          const checked = Boolean(v);
                          setRow(idx, (old) => {
                            if (!checked) return { ...old, delivered: false, deliveredQty: 0 };
                            const proposed = old.deliveredQty > 0 ? old.deliveredQty : (old.confirmedQty > 0 ? 1 : 0);
                            const bounded = Math.min(proposed, old.confirmedQty);
                            return { ...old, delivered: true, deliveredQty: bounded };
                          });
                        }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox checked={feesCollected} onCheckedChange={(v) => setFeesCollected(Boolean(v))} />
            <Label>The Client has paid the delivery fees</Label>
          </div>
          <div>
            <Label>Comments (optional)</Label>
            <Textarea value={comments} onChange={(e) => setComments(e.target.value)} rows={3} placeholder="Add comments..." />
          </div>
          <div className="space-y-1 text-right text-sm text-muted-foreground">
            <div>Items: {new Intl.NumberFormat("en-DZ", { style: "currency", currency: "DZD" }).format(totals.itemsSubtotal)}</div>
            <div>Delivery fee: {new Intl.NumberFormat("en-DZ", { style: "currency", currency: "DZD" }).format(totals.deliveryFees)}</div>
            <div>Order discount applied: -{new Intl.NumberFormat("en-DZ", { style: "currency", currency: "DZD" }).format(totals.orderDiscountApplied)}</div>
          </div>
          <div className="text-right font-semibold">
            Total client will pay: {new Intl.NumberFormat("en-DZ", { style: "currency", currency: "DZD" }).format(totals.total)}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>Cancel</Button>
          <Button onClick={() => submit()} disabled={isPending || !hasAnyDelivered}>
            {isPending ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
