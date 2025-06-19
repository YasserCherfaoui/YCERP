import CreateOrderDialog from "@/components/feature-specific/orders/create-order-dialog";
import DispatchConfirmDialog from "@/components/feature-specific/orders/dispatch-confirm-dialog";
import ExportConfirmDialog from "@/components/feature-specific/orders/export-confirm-dialog";
import OrderDetailsDialog from "@/components/feature-specific/orders/order-details-dialog";
import OrderHistoryDialog from "@/components/feature-specific/orders/order-history-dialog";
import SetCancelledStatusDialog from "@/components/feature-specific/orders/set-cancelled-status-dialog";
import SetPackingStatusDialog from "@/components/feature-specific/orders/set-packing-status-dialog";
import UpdateOrderDialog from "@/components/feature-specific/orders/update-order-dialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { WooOrder } from "@/models/data/woo-order.model";
import { Download, Eye, History, PackageOpen, PlusCircle, Truck, X } from "lucide-react";
import { useState } from "react";

function DeliveryOrdersActions(props: { order: WooOrder, ordersQueryKey: any[] }) {
  const { order, ordersQueryKey } = props;
  const [open, setOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [dispatchDialogOpen, setDispatchDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [orderHistoryDialogOpen, setOrderHistoryDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [setPackingDialogOpen, setSetPackingDialogOpen] = useState(false);
  const [setCancelledDialogOpen, setSetCancelledDialogOpen] = useState(false);

  return (
    <>
      <OrderDetailsDialog order={order} open={open} setOpen={setOpen} ordersQueryKey={ordersQueryKey} />
      <CreateOrderDialog wooOrder={order} open={createDialogOpen} setOpen={setCreateDialogOpen} ordersQueryKey={ordersQueryKey} />
      <DispatchConfirmDialog order={order} open={dispatchDialogOpen} setOpen={setDispatchDialogOpen} ordersQueryKey={ordersQueryKey} />
      <ExportConfirmDialog order={order} open={exportDialogOpen} setOpen={setExportDialogOpen} ordersQueryKey={ordersQueryKey} />
      <OrderHistoryDialog order={order} open={orderHistoryDialogOpen} setOpen={setOrderHistoryDialogOpen} ordersQueryKey={ordersQueryKey} />
      <UpdateOrderDialog order={order} open={updateDialogOpen} setOpen={setUpdateDialogOpen} ordersQueryKey={ordersQueryKey} />
      <SetPackingStatusDialog order={order} open={setPackingDialogOpen} setOpen={setSetPackingDialogOpen} ordersQueryKey={ordersQueryKey} />
      <SetCancelledStatusDialog order={order} open={setCancelledDialogOpen} setOpen={setSetCancelledDialogOpen} ordersQueryKey={ordersQueryKey} />

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
          {/* Create Order - only if unconfirmed */}
          {order.order_status === "unconfirmed" && (
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
          {/* Set to Packing - show everywhere except when status is packing */}
          {order.order_status !== "packing" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setSetPackingDialogOpen(true)}>
                  <PackageOpen className="h-4 w-4" />
                  <span className="sr-only">Set to Packing</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Set to Packing</TooltipContent>
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
          {/* Cancel Order - show everywhere except when status is cancelled */}
          {order.order_status !== "cancelled" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setSetCancelledDialogOpen(true)}>
                  <X className="h-4 w-4" />
                  <span className="sr-only">Cancel Order</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Cancel Order</TooltipContent>
            </Tooltip>
          )}
          {/* Update Order - only if packing or dispaching */}
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
        </div>
      </TooltipProvider>
    </>
  );
}

export default DeliveryOrdersActions; 