import CreateOrderDialog from "@/components/feature-specific/orders/create-order-dialog";
import DispatchConfirmDialog from "@/components/feature-specific/orders/dispatch-confirm-dialog";
import SetUnconfirmedStatusDialog from "@/components/feature-specific/orders/set-unconfirmed-status-dialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { WooOrder } from "@/models/data/woo-order.model";
import { cloneWooCommerceOrder } from "@/services/woocommerce-service";
import { Download, Eye, History, PlusCircle, Truck, Undo, Copy } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ExportConfirmDialog from "./export-confirm-dialog";
import OrderDetailsDialog from "./order-details-dialog";
import OrderHistoryDialog from "./order-history-dialog";
import UpdateOrderDialog from "./update-order-dialog";

function OrderActions({ order, ordersQueryKey }: { order: WooOrder, ordersQueryKey?: any[] }) {
  const [open, setOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [dispatchDialogOpen, setDispatchDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [orderHistoryDialogOpen, setOrderHistoryDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [setUnconfirmedDialogOpen, setSetUnconfirmedDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate: cloneOrder, isPending: isCloning } = useMutation({
    mutationFn: cloneWooCommerceOrder,
    onSuccess: () => {
      toast({
        title: "Order cloned",
        description: "Order has been cloned successfully",
      });
      if (ordersQueryKey) {
        queryClient.invalidateQueries({ queryKey: ordersQueryKey });
      } else {
        queryClient.invalidateQueries({ queryKey: ["orders"] });
      }
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to clone order",
        variant: "destructive",
      });
    },
  });

  return (
    <>
      <OrderDetailsDialog order={order} open={open} setOpen={setOpen} ordersQueryKey={ordersQueryKey} />
      <CreateOrderDialog wooOrder={order} open={createDialogOpen} setOpen={setCreateDialogOpen} ordersQueryKey={ordersQueryKey} />
      <DispatchConfirmDialog order={order} open={dispatchDialogOpen} setOpen={setDispatchDialogOpen} ordersQueryKey={ordersQueryKey} />
      <ExportConfirmDialog order={order} open={exportDialogOpen} setOpen={setExportDialogOpen} ordersQueryKey={ordersQueryKey} />
      <OrderHistoryDialog order={order} open={orderHistoryDialogOpen} setOpen={setOrderHistoryDialogOpen} ordersQueryKey={ordersQueryKey} />
      <UpdateOrderDialog order={order} open={updateDialogOpen} setOpen={setUpdateDialogOpen} ordersQueryKey={ordersQueryKey} />
      <SetUnconfirmedStatusDialog order={order} open={setUnconfirmedDialogOpen} setOpen={setSetUnconfirmedDialogOpen} ordersQueryKey={ordersQueryKey} />
      <TooltipProvider>
        <div className="flex gap-2">
          {/* Show Order Details - always available */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
                <Eye className="h-4 w-4" />
                <span className="sr-only">Show Order Details</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Show Order Details</TooltipContent>
          </Tooltip>
          {/* Order History - always available */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => setOrderHistoryDialogOpen(true)}>
                <History className="h-4 w-4" />
                <span className="sr-only">Order History</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Order History</TooltipContent>
          </Tooltip>
          {/* Clone Order - always available */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => cloneOrder(order)}
                disabled={isCloning}
              >
                <Copy className="h-4 w-4" />
                <span className="sr-only">Clone Order</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clone Order</TooltipContent>
          </Tooltip>
          {/* Create Order - only if unconfirmed or relaunched */}
          {(order.order_status === "unconfirmed" || order.order_status === "relaunched") && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setCreateDialogOpen(true)}>
                  <PlusCircle className="h-4 w-4" />
                  <span className="sr-only">Create Order</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Create Order</TooltipContent>
            </Tooltip>
          )}
          {/* Dispatch Order - only if packing */}
          {order.order_status === "packing" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setDispatchDialogOpen(true)}>
                  <Truck className="h-4 w-4" />
                  <span className="sr-only">Dispatch Order</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Dispatch Order</TooltipContent>
            </Tooltip>
          )}
          {/* Export Order - only if dispaching */}
          {order.order_status === "dispaching" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setExportDialogOpen(true)}>
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Export Order</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export Order</TooltipContent>
            </Tooltip>
          )}
          {/* Update Order - always available */}
          {(order.order_status === "packing" || order.order_status === "dispaching") && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setUpdateDialogOpen(true)}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z"/></svg>
                  <span className="sr-only">Update Order</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Update Order</TooltipContent>
            </Tooltip>
          )}
          {order.order_status == "cancelled" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setSetUnconfirmedDialogOpen(true)}>
                  <Undo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>
    </>
  );
}

export default OrderActions; 