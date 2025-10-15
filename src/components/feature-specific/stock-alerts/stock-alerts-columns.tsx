import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { StockAlert } from "@/models/data/stock-alert.model";
import { acknowledgeAlert, resolveAlert } from "@/services/stock-alerts-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpDown, Check, X } from "lucide-react";

const AlertTypeBadge = ({ type }: { type: string }) => {
  const variants: Record<string, { variant: any; label: string }> = {
    out_of_stock: { variant: "destructive", label: "Out of Stock" },
    low_stock: { variant: "default", label: "Low Stock" },
    reorder_point: { variant: "secondary", label: "Reorder Point" },
    overstock: { variant: "outline", label: "Overstock" },
  };

  const config = variants[type] || { variant: "outline", label: type };

  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const AlertStatusBadge = ({ status }: { status: string }) => {
  const variants: Record<string, { variant: any; label: string }> = {
    active: { variant: "destructive", label: "Active" },
    acknowledged: { variant: "default", label: "Acknowledged" },
    resolved: { variant: "secondary", label: "Resolved" },
  };

  const config = variants[status] || { variant: "outline", label: status };

  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const AlertActions = ({ alert }: { alert: StockAlert }) => {
  const queryClient = useQueryClient();

  const acknowledgeMutation = useMutation({
    mutationFn: () => acknowledgeAlert(alert.id),
    onSuccess: () => {
      toast({
        title: "Alert acknowledged",
        description: "The alert has been marked as acknowledged.",
      });
      queryClient.invalidateQueries({ queryKey: ["stock-alerts-active"] });
      queryClient.invalidateQueries({ queryKey: ["stock-alerts-history"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to acknowledge alert",
        variant: "destructive",
      });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: () => resolveAlert(alert.id),
    onSuccess: () => {
      toast({
        title: "Alert resolved",
        description: "The alert has been marked as resolved.",
      });
      queryClient.invalidateQueries({ queryKey: ["stock-alerts-active"] });
      queryClient.invalidateQueries({ queryKey: ["stock-alerts-history"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to resolve alert",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="flex gap-2">
      {alert.status === "active" && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => acknowledgeMutation.mutate()}
          disabled={acknowledgeMutation.isPending}
        >
          <Check className="h-4 w-4 mr-1" />
          Acknowledge
        </Button>
      )}
      {alert.status !== "resolved" && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => resolveMutation.mutate()}
          disabled={resolveMutation.isPending}
        >
          <X className="h-4 w-4 mr-1" />
          Resolve
        </Button>
      )}
    </div>
  );
};

export const stockAlertsColumns: ColumnDef<StockAlert>[] = [
  {
    accessorKey: "inventory_item.product.name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Product
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return row.original.inventory_item?.product?.name || "N/A";
    },
  },
  {
    accessorKey: "inventory_item.product_variant",
    header: "Variant",
    cell: ({ row }) => {
      const variant = row.original.inventory_item?.product_variant;
      if (!variant) return "N/A";
      return `${variant.color || ""} - ${variant.size || ""}`.trim();
    },
  },
  {
    accessorKey: "alert_type",
    header: "Alert Type",
    cell: ({ row }) => <AlertTypeBadge type={row.original.alert_type} />,
  },
  {
    accessorKey: "current_quantity",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Current Qty
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "threshold",
    header: "Threshold",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <AlertStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "notified_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Notified
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return formatDistanceToNow(new Date(row.original.notified_at), {
        addSuffix: true,
      });
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <AlertActions alert={row.original} />,
  },
];

export const stockAlertsHistoryColumns: ColumnDef<StockAlert>[] = [
  {
    accessorKey: "inventory_item.product.name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Product
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return row.original.inventory_item?.product?.name || "N/A";
    },
  },
  {
    accessorKey: "inventory_item.product_variant",
    header: "Variant",
    cell: ({ row }) => {
      const variant = row.original.inventory_item?.product_variant;
      if (!variant) return "N/A";
      return `${variant.color || ""} - ${variant.size || ""}`.trim();
    },
  },
  {
    accessorKey: "alert_type",
    header: "Alert Type",
    cell: ({ row }) => <AlertTypeBadge type={row.original.alert_type} />,
  },
  {
    accessorKey: "current_quantity",
    header: "Quantity",
  },
  {
    accessorKey: "threshold",
    header: "Threshold",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <AlertStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "notified_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Notified
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return formatDistanceToNow(new Date(row.original.notified_at), {
        addSuffix: true,
      });
    },
  },
  {
    accessorKey: "resolved_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Resolved
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      if (!row.original.resolved_at) return "N/A";
      return formatDistanceToNow(new Date(row.original.resolved_at), {
        addSuffix: true,
      });
    },
  },
];

