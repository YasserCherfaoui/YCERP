import { Badge } from "@/components/ui/badge";
import { WooOrder } from "@/models/data/woo-order.model";
import { ColumnDef } from "@tanstack/react-table";

function orderStatusVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
  const s = status?.toLowerCase() ?? "";
  if (s.includes("deliver")) return "default";
  if (s.includes("cancel") || s.includes("return")) return "destructive";
  if (s.includes("pack") || s.includes("dispatch") || s.includes("delivir")) return "secondary";
  return "outline";
}

export const franchiseShipFromOrdersColumns: ColumnDef<WooOrder>[] = [
  {
    accessorKey: "number",
    header: "Order",
    cell: ({ row }) => {
      const o = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium">#{o.number || o.id}</span>
          <span className="text-xs text-muted-foreground">
            {new Date(o.date_created).toLocaleDateString()}
          </span>
        </div>
      );
    },
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
];
