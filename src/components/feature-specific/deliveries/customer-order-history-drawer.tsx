import OrderDetailsDialog from "@/components/feature-specific/orders/order-details-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getWooCommerceOrder, getWooCommerceOrders } from "@/services/woocommerce-service";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Eye, History, Loader2 } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";

interface CustomerOrderHistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerPhone: string;
  customerName?: string;
}

export default function CustomerOrderHistoryDrawer({
  open,
  onOpenChange,
  customerPhone,
  customerName,
}: CustomerOrderHistoryDrawerProps) {
  const { companyID } = useParams<{ companyID: string }>();
  const companyId = companyID ? parseInt(companyID, 10) : undefined;
  const [page, setPage] = useState(1);
  const limit = 20;
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["customer-orders", customerPhone, companyId, page, limit],
    queryFn: () =>
      getWooCommerceOrders({
        _page: page - 1,
        phone_number: customerPhone,
        company_id: companyId,
      }),
    enabled: open && !!customerPhone && !!companyId,
  });

  const orders = data?.data?.orders || [];
  const pagination = data?.data?.meta;

  // Fetch full order details when selected
  const { data: selectedOrderData } = useQuery({
    queryKey: ["woo-order-details", selectedOrderId],
    queryFn: () => selectedOrderId ? getWooCommerceOrder(selectedOrderId) : null,
    enabled: !!selectedOrderId && detailsDialogOpen,
  });

  const selectedOrder = selectedOrderData?.data;

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("delivered") || statusLower.includes("livre"))
      return "bg-green-100 text-green-800";
    if (statusLower.includes("shipped") || statusLower.includes("expedie"))
      return "bg-blue-100 text-blue-800";
    if (statusLower.includes("pending") || statusLower.includes("en attente"))
      return "bg-yellow-100 text-yellow-800";
    if (statusLower.includes("failed") || statusLower.includes("echouee"))
      return "bg-red-100 text-red-800";
    if (
      statusLower.includes("processing") ||
      statusLower.includes("preparation")
    )
      return "bg-purple-100 text-purple-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Order History
          </SheetTitle>
          <SheetDescription>
            {customerName || customerPhone}
            {customerName && ` (${customerPhone})`}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading orders...</span>
            </div>
          ) : isError ? (
            <div className="text-center py-8 text-destructive">
              Failed to load order history
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No orders found for this customer
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        #{order.number || order.id}
                      </TableCell>
                      <TableCell>
                        {order.date_created
                          ? format(
                              new Date(order.date_created),
                              "PPp"
                            )
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getStatusColor(order.order_status)}
                          variant="secondary"
                        >
                          {order.order_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {order.final_price || order.total} {order.currency || "DZD"}
                      </TableCell>
                      <TableCell>
                        {order.confirmed_order_items?.length || order.line_items?.length || 0} item(s)
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedOrderId(order.id);
                            setDetailsDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {pagination && pagination.total_pages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {pagination.current_page} of {pagination.total_pages} (
                    {pagination.total_items} total orders)
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={pagination.current_page <= 1 || isLoading}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={pagination.current_page >= pagination.total_pages || isLoading}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Order Details Dialog */}
        {selectedOrder && (
          <OrderDetailsDialog
            order={selectedOrder}
            open={detailsDialogOpen}
            setOpen={(open) => {
              setDetailsDialogOpen(open);
              if (!open) {
                setSelectedOrderId(null);
              }
            }}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
