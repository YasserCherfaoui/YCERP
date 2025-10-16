import OrderDetailsDialog from "@/components/feature-specific/orders/order-details-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Commission } from "@/models/data/affiliate/commission.model";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-DZ", {
    style: "currency",
    currency: "DZD",
  }).format(amount);
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "paid":
      return "default";
    case "approved":
      return "secondary";
    case "partially_paid":
      return "outline";
    case "pending":
      return "outline";
    case "cancelled":
      return "destructive";
    default:
      return "outline";
  }
};

const formatStatus = (status: string) => {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Order cell component with dialog
function OrderCell({ commission }: { commission: Commission }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const order = commission.woo_order;

  if (!order || !order.id) {
    return (
      <div className="flex flex-col">
        <span className="font-mono text-sm text-muted-foreground">
          #{commission.woo_order_id}
        </span>
        <span className="text-xs text-muted-foreground">No details</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col">
        <Button
          variant="link"
          className="font-mono text-sm p-0 h-auto justify-start"
          onClick={() => setDialogOpen(true)}
        >
          {order.number || `#${commission.woo_order_id}`}
        </Button>
        {order.order_status && (
          <span className="text-xs text-muted-foreground capitalize">
            {order.order_status}
          </span>
        )}
      </div>
      <OrderDetailsDialog
        order={order}
        open={dialogOpen}
        setOpen={setDialogOpen}
      />
    </>
  );
}

export const commissionsTableColumns: ColumnDef<Commission>[] = [
  {
    id: "id",
    header: () => <div>ID</div>,
    cell: ({ row }) => {
      return <div className="font-mono text-sm">#{row.original.ID}</div>;
    },
  },
  {
    accessorKey: "affiliate.full_name",
    id: "affiliate_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Affiliate
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const affiliate = row.original.affiliate;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{affiliate?.full_name || "N/A"}</span>
          <span className="text-xs text-muted-foreground">
            {affiliate?.email || ""}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "woo_order.number",
    id: "order_number",
    header: () => <div>Order</div>,
    cell: ({ row }) => {
      return <OrderCell commission={row.original} />;
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-full justify-end"
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const amount = row.original.amount;
      return (
        <div className="text-right font-medium">{formatCurrency(amount)}</div>
      );
    },
  },
  {
    accessorKey: "paid_amount",
    header: () => <div className="text-right">Paid Amount</div>,
    cell: ({ row }) => {
      const paidAmount = row.original.paid_amount;
      const totalAmount = row.original.amount;
      const percentage = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;
      
      return (
        <div className="text-right">
          <div className="font-medium">{formatCurrency(paidAmount)}</div>
          {paidAmount > 0 && paidAmount < totalAmount && (
            <div className="text-xs text-muted-foreground">
              {percentage.toFixed(0)}%
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge variant={getStatusBadgeVariant(status)}>
          {formatStatus(status)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "CreatedAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.original.CreatedAt);
      return (
        <div className="flex flex-col">
          <span className="text-sm">{date.toLocaleDateString()}</span>
          <span className="text-xs text-muted-foreground">
            {date.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const commission = row.original;
      const companyId = commission.affiliate?.company?.ID;
      const affiliateId = commission.affiliate_id;

      if (!companyId || !affiliateId) return null;

      return (
        <Button
          variant="ghost"
          size="sm"
          asChild
        >
          <Link to={`/company/${companyId}/affiliates/${affiliateId}`}>
            <ExternalLink className="h-4 w-4 mr-1" />
            View
          </Link>
        </Button>
      );
    },
  },
];

