import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { decrementUnreadCount } from "@/features/alerts/stock-alerts-slice";
import { toast } from "@/hooks/use-toast";
import { StockAlertNotification } from "@/models/data/stock-alert.model";
import { markNotificationAsRead } from "@/services/stock-alerts-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpDown, Mail } from "lucide-react";
import { useDispatch } from "react-redux";

const NotificationActions = ({
  notification,
}: {
  notification: StockAlertNotification;
}) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const markAsReadMutation = useMutation({
    mutationFn: () => markNotificationAsRead(notification.id),
    onSuccess: () => {
      toast({
        title: "Marked as read",
        description: "The notification has been marked as read.",
      });
      dispatch(decrementUnreadCount());
      queryClient.invalidateQueries({ queryKey: ["stock-alert-notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["stock-alerts-unread-count"],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark notification as read",
        variant: "destructive",
      });
    },
  });

  if (notification.read_at) {
    return (
      <Badge variant="secondary" className="gap-1">
        <Mail className="h-3 w-3" />
        Read
      </Badge>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => markAsReadMutation.mutate()}
      disabled={markAsReadMutation.isPending}
    >
      Mark as read
    </Button>
  );
};

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

export const stockAlertNotificationsColumns: ColumnDef<StockAlertNotification>[] =
  [
    {
      accessorKey: "stock_alert.inventory_item.product.name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          >
            Product
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          row.original.stock_alert?.inventory_item?.product?.name || "N/A"
        );
      },
    },
    {
      accessorKey: "stock_alert.inventory_item.product_variant",
      header: "Variant",
      cell: ({ row }) => {
        const variant =
          row.original.stock_alert?.inventory_item?.product_variant;
        if (!variant) return "N/A";
        return `${variant.color || ""} - ${variant.size || ""}`.trim();
      },
    },
    {
      accessorKey: "stock_alert.alert_type",
      header: "Alert Type",
      cell: ({ row }) => {
        if (!row.original.stock_alert) return "N/A";
        return <AlertTypeBadge type={row.original.stock_alert.alert_type} />;
      },
    },
    {
      accessorKey: "stock_alert.current_quantity",
      header: "Qty",
      cell: ({ row }) => {
        return row.original.stock_alert?.current_quantity ?? "N/A";
      },
    },
    {
      accessorKey: "stock_alert.threshold",
      header: "Threshold",
      cell: ({ row }) => {
        return row.original.stock_alert?.threshold ?? "N/A";
      },
    },
    {
      accessorKey: "sent_at",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          >
            Sent
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        if (!row.original.sent_at) return "Pending";
        return formatDistanceToNow(new Date(row.original.sent_at), {
          addSuffix: true,
        });
      },
    },
    {
      id: "actions",
      header: "Status",
      cell: ({ row }) => <NotificationActions notification={row.original} />,
    },
  ];

