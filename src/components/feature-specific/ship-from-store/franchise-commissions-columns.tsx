import { FranchiseCommissionDetailsDialog } from "@/components/feature-specific/ship-from-store/franchise-commission-details-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FranchiseCommission } from "@/models/data/franchise-commission.model";
import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
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
    case "paid":
      return "outline";
    case "cancelled":
      return "destructive";
    case "pending":
    default:
      return "secondary";
  }
}

function statusLabel(status: string) {
  if (status === "paid") return "Paid";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function CommissionDetailsCell({ commission }: { commission: FranchiseCommission }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Eye className="mr-1 h-4 w-4" />
        Details
      </Button>
      <FranchiseCommissionDetailsDialog
        commission={commission}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}

export const franchiseCommissionsColumns: ColumnDef<FranchiseCommission>[] = [
  {
    accessorKey: "ID",
    header: "ID",
    cell: ({ row }) => (
      <span className="font-mono text-sm tabular-nums">{row.original.ID}</span>
    ),
  },
  {
    accessorKey: "CreatedAt",
    header: "Date",
    cell: ({ row }) => {
      const v = row.original.CreatedAt;
      return v ? new Date(v).toLocaleString() : "—";
    },
  },
  {
    id: "order",
    header: "Order",
    cell: ({ row }) => {
      const order = row.original.woo_order;
      const orderNum = order?.number ?? `#${row.original.woo_order_id}`;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{orderNum}</span>
          {order?.order_status && (
            <span className="text-xs text-muted-foreground capitalize">
              {order.order_status}
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: "product",
    header: "Product",
    cell: ({ row }) => {
      const item = row.original.confirmed_order_item;
      const product = item?.product;
      const variant = item?.product_variant;
      if (!product && !variant) {
        return <span className="text-muted-foreground">—</span>;
      }
      const variantMeta = variant
        ? [variant.color, variant.size != null ? String(variant.size) : null]
            .filter((part): part is string => Boolean(part))
            .join(" / ")
        : "";
      return (
        <div className="flex flex-col">
          <span className="font-medium">{product?.name ?? "Unknown product"}</span>
          {variant && (
            <span className="text-xs text-muted-foreground">
              {variant.qr_code}
              {variantMeta ? ` · ${variantMeta}` : ""}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "quantity",
    header: () => <div className="text-right">Qty</div>,
    cell: ({ row }) => (
      <div className="text-right tabular-nums">{row.original.quantity}</div>
    ),
  },
  {
    accessorKey: "unit_amount",
    header: () => <div className="text-right">Unit</div>,
    cell: ({ row }) => (
      <div className="text-right tabular-nums">
        {formatCurrency(row.original.unit_amount)}
      </div>
    ),
  },
  {
    accessorKey: "total_amount",
    header: () => <div className="text-right">Total</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium tabular-nums">
        {formatCurrency(row.original.total_amount)}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={statusVariant(row.original.status)}>
        {statusLabel(row.original.status)}
      </Badge>
    ),
  },
  {
    id: "details",
    header: () => <div className="text-right">Details</div>,
    cell: ({ row }) => (
      <div className="text-right">
        <CommissionDetailsCell commission={row.original} />
      </div>
    ),
  },
];
