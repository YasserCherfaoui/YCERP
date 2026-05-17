import OrderDetailsDialog from "@/components/feature-specific/orders/order-details-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FranchiseOrderStatus,
  WooOrder,
  isFranchiseOrderStatus,
} from "@/models/data/woo-order.model";
import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { useState } from "react";

function orderStatusVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
  const s = status?.toLowerCase() ?? "";
  if (s.includes("deliver")) return "default";
  if (s.includes("cancel") || s.includes("return")) return "destructive";
  if (s.includes("pack") || s.includes("dispatch") || s.includes("delivir")) return "secondary";
  return "outline";
}

const FRANCHISE_ORDER_STATUS_LABELS: Record<FranchiseOrderStatus, string> = {
  pending: "Pending",
  packed: "Packed",
  dispatched: "Dispatched",
};

function OrderNumberCell({ order }: { order: WooOrder }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant="link"
        className="h-auto justify-start p-0 font-medium"
        onClick={() => setOpen(true)}
      >
        #{order.number || order.id}
      </Button>
      <div className="text-xs text-muted-foreground">
        {new Date(order.date_created).toLocaleDateString()}
      </div>
      <OrderDetailsDialog order={order} open={open} setOpen={setOpen} />
    </>
  );
}

function ViewDetailsCell({ order }: { order: WooOrder }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Eye className="mr-1 h-4 w-4" />
        View
      </Button>
      <OrderDetailsDialog order={order} open={open} setOpen={setOpen} />
    </>
  );
}

export const companyFranchiseFulfillmentOrdersColumns: ColumnDef<WooOrder>[] = [
  {
    accessorKey: "number",
    header: "Order",
    cell: ({ row }) => <OrderNumberCell order={row.original} />,
  },
  {
    id: "franchise",
    header: "Franchise",
    cell: ({ row }) => row.original.franchise?.name ?? "—",
  },
  {
    accessorKey: "order_status",
    header: "Status",
    cell: ({ row }) => {
      const s = row.original.order_status;
      return <Badge variant={orderStatusVariant(s)}>{s || "-"}</Badge>;
    },
  },
  {
    id: "customer",
    header: "Customer",
    cell: ({ row }) => {
      const o = row.original;
      return (
        <div className="flex flex-col">
          <span>{o.billing_name || "-"}</span>
          <span className="text-xs text-muted-foreground">
            {o.customer_phone || ""}
          </span>
        </div>
      );
    },
  },
  {
    id: "from_wilaya",
    header: "From wilaya",
    cell: ({ row }) => row.original.woo_shipping?.from_wilaya_name ?? "-",
  },
  {
    id: "to_wilaya",
    header: "To wilaya",
    cell: ({ row }) => row.original.woo_shipping?.wilaya_name ?? "-",
  },
  {
    accessorKey: "tracking_number",
    header: "Tracking",
    cell: ({ row }) =>
      row.original.tracking_number ? (
        <span className="font-mono text-sm">{row.original.tracking_number}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    id: "franchise_order_status",
    header: "Franchise status",
    cell: ({ row }) => {
      const raw = row.original.franchise_order_status;
      const status = isFranchiseOrderStatus(raw) ? raw : "pending";
      return (
        <Badge variant="outline">
          {FRANCHISE_ORDER_STATUS_LABELS[status] ??
            (raw ? String(raw) : "Pending")}
        </Badge>
      );
    },
  },
  {
    id: "items",
    header: "Items",
    cell: ({ row }) => {
      const items = row.original.confirmed_order_items ?? [];
      const total = items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
      return (
        <span className="tabular-nums">
          {total} unit{total === 1 ? "" : "s"}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Details</div>,
    cell: ({ row }) => (
      <div className="text-right">
        <ViewDetailsCell order={row.original} />
      </div>
    ),
  },
];
