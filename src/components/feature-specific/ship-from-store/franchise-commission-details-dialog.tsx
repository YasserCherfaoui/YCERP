import OrderDetailsDialog from "@/components/feature-specific/orders/order-details-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { FranchiseCommission } from "@/models/data/franchise-commission.model";
import { WooOrder } from "@/models/data/woo-order.model";
import { useState } from "react";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-DZ", {
    style: "currency",
    currency: "DZD",
    maximumFractionDigits: 0,
  }).format(amount);

function statusVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "approved":
      return "default";
    case "cancelled":
      return "destructive";
    default:
      return "secondary";
  }
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

interface FranchiseCommissionDetailsDialogProps {
  commission: FranchiseCommission;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FranchiseCommissionDetailsDialog({
  commission,
  open,
  onOpenChange,
}: FranchiseCommissionDetailsDialogProps) {
  const [orderOpen, setOrderOpen] = useState(false);

  const item = commission.confirmed_order_item;
  const product = item?.product;
  const variant = item?.product_variant;
  const order = commission.woo_order;
  const orderNum = order?.number ?? `#${commission.woo_order_id}`;

  const variantMeta = variant
    ? [variant.color, variant.size != null ? String(variant.size) : null]
        .filter((part): part is string => Boolean(part))
        .join(" / ")
    : "";

  const hasOrderForDialog =
    order &&
    (order.confirmed_order_items != null || order.billing_name != null || order.id != null);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex flex-wrap items-center gap-2">
              Commission #{commission.ID}
              <Badge variant={statusVariant(commission.status)}>
                {commission.status}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Order {orderNum}
              {commission.franchise?.name ? ` · ${commission.franchise.name}` : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <section className="space-y-2">
              <h4 className="text-sm font-semibold">Commission</h4>
              <DetailRow
                label="Created"
                value={
                  commission.CreatedAt
                    ? new Date(commission.CreatedAt).toLocaleString()
                    : "—"
                }
              />
              <DetailRow label="Quantity" value={commission.quantity} />
              <DetailRow
                label="Unit amount"
                value={formatCurrency(commission.unit_amount)}
              />
              <DetailRow
                label="Total"
                value={formatCurrency(commission.total_amount)}
              />
              {commission.franchise?.name && (
                <DetailRow label="Franchise" value={commission.franchise.name} />
              )}
            </section>

            <Separator />

            <section className="space-y-2">
              <h4 className="text-sm font-semibold">Line item</h4>
              {product || variant ? (
                <>
                  <DetailRow
                    label="Product"
                    value={product?.name ?? "Unknown product"}
                  />
                  {variant && (
                    <>
                      <DetailRow label="Variant QR" value={variant.qr_code ?? "—"} />
                      {variantMeta && (
                        <DetailRow label="Variant" value={variantMeta} />
                      )}
                    </>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Product details were not loaded for this row. Use the IDs below
                  to trace the line item in the order.
                </p>
              )}
              <DetailRow
                label="Confirmed item ID"
                value={commission.confirmed_order_item_id}
              />
              <DetailRow label="Product ID" value={commission.product_id} />
              <DetailRow label="Variant ID" value={commission.product_variant_id} />
            </section>

            <Separator />

            <section className="space-y-2">
              <h4 className="text-sm font-semibold">Order</h4>
              <DetailRow label="Order" value={orderNum} />
              <DetailRow
                label="Order status"
                value={order?.order_status ?? "—"}
              />
              {order?.franchise_order_status && (
                <DetailRow
                  label="Franchise status"
                  value={order.franchise_order_status}
                />
              )}
              <DetailRow
                label="Customer"
                value={order?.billing_name ?? order?.shipping_name ?? "—"}
              />
              <DetailRow
                label="Phone"
                value={order?.customer_phone ?? "—"}
              />
              <DetailRow
                label="Tracking"
                value={order?.tracking_number ?? "—"}
              />
              {order?.woo_shipping && (
                <>
                  <DetailRow
                    label="From wilaya"
                    value={order.woo_shipping.from_wilaya_name ?? "—"}
                  />
                  <DetailRow
                    label="To wilaya"
                    value={order.woo_shipping.wilaya_name ?? "—"}
                  />
                </>
              )}
              <DetailRow label="Woo order ID" value={commission.woo_order_id} />
            </section>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            {hasOrderForDialog && (
              <Button type="button" onClick={() => setOrderOpen(true)}>
                View full order
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {hasOrderForDialog && order && (
        <OrderDetailsDialog
          order={order as WooOrder}
          open={orderOpen}
          setOpen={setOrderOpen}
        />
      )}
    </>
  );
}
