import OrderDetailsDialog from "@/components/feature-specific/orders/order-details-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  FRANCHISE_ORDER_STATUSES,
  FranchiseOrderStatus,
  WooOrder,
  isFranchiseOrderStatus,
} from "@/models/data/woo-order.model";
import {
  getFranchiseWooOrderShippingLabelUrl,
  updateFranchiseOrderStatus,
} from "@/services/franchise-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Loader2, Printer } from "lucide-react";
import { useState } from "react";

function orderStatusVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
  const s = status?.toLowerCase() ?? "";
  if (s.includes("deliver")) return "default";
  if (s.includes("cancel") || s.includes("return")) return "destructive";
  if (s.includes("pack") || s.includes("dispatch") || s.includes("delivir")) return "secondary";
  return "outline";
}

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

const FRANCHISE_ORDER_STATUS_LABELS: Record<FranchiseOrderStatus, string> = {
  pending: "Pending",
  packed: "Packed",
  dispatched: "Dispatched",
  not_available: "Not Available",
};

const STATUS_RANK: Record<FranchiseOrderStatus, number> = {
  pending: 1,
  packed: 2,
  dispatched: 3,
  not_available: 0,
};

function isFranchiseStatusOptionDisabled(
  option: FranchiseOrderStatus,
  current: FranchiseOrderStatus
): boolean {
  if (current === "not_available") return option !== "not_available";
  if (option === "not_available") return current === "dispatched";
  return STATUS_RANK[option] < STATUS_RANK[current];
}

function FranchiseStatusCell({ order }: { order: WooOrder }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const current = isFranchiseOrderStatus(order.franchise_order_status)
    ? order.franchise_order_status
    : "pending";

  const mutation = useMutation({
    mutationFn: (status: FranchiseOrderStatus) =>
      updateFranchiseOrderStatus(order.id, status),
    onSuccess: (_data, status) => {
      toast({
        title: "Status updated",
        description: `Order #${order.number || order.id} marked as ${FRANCHISE_ORDER_STATUS_LABELS[status]}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["franchise-woo-orders"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Could not update status.",
        variant: "destructive",
      });
    },
  });

  return (
    <Select
      value={current}
      onValueChange={(value) => {
        if (!isFranchiseOrderStatus(value) || value === current) return;
        mutation.mutate(value);
      }}
      disabled={mutation.isPending}
    >
      <SelectTrigger className="h-8 w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {FRANCHISE_ORDER_STATUSES.map((status) => (
          <SelectItem
            key={status}
            value={status}
            disabled={isFranchiseStatusOptionDisabled(status, current)}
          >
            {FRANCHISE_ORDER_STATUS_LABELS[status]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ViewDetailsCell({ order }: { order: WooOrder }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <Eye className="mr-1 h-4 w-4" />
        View
      </Button>
      <OrderDetailsDialog order={order} open={open} setOpen={setOpen} />
    </>
  );
}

function PrintLabelCell({ order }: { order: WooOrder }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handlePrint = async () => {
    setLoading(true);
    try {
      const response = await getFranchiseWooOrderShippingLabelUrl(order.id);
      const url = response.data?.signed_url;
      if (!url) {
        throw new Error("No download URL returned.");
      }
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast({
        title: "Could not open label",
        description:
          error instanceof Error ? error.message : "Failed to fetch shipping label.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={!order.has_shipping_label || loading}
      onClick={handlePrint}
    >
      {loading ? (
        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
      ) : (
        <Printer className="mr-1 h-4 w-4" />
      )}
      Print label
    </Button>
  );
}

export const franchiseShipFromOrdersColumns: ColumnDef<WooOrder>[] = [
  {
    accessorKey: "number",
    header: "Order",
    cell: ({ row }) => <OrderNumberCell order={row.original} />,
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
    cell: ({ row }) => <FranchiseStatusCell order={row.original} />,
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
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => (
      <div className="flex justify-end gap-1">
        <PrintLabelCell order={row.original} />
        <ViewDetailsCell order={row.original} />
      </div>
    ),
  },
];
