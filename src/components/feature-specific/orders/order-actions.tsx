import CreateOrderDialog from "@/components/feature-specific/orders/create-order-dialog";
import DispatchConfirmDialog from "@/components/feature-specific/orders/dispatch-confirm-dialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { WooOrder } from "@/models/data/woo-order.model";
import { Download, Eye, PlusCircle, Truck } from "lucide-react";
import { useState } from "react";
import ExportConfirmDialog from "./export-confirm-dialog";
import OrderDetailsDialog from "./order-details-dialog";

function OrderActions({ order }: { order: WooOrder }) {
  const [open, setOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [dispatchDialogOpen, setDispatchDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  return (
    <>
      <OrderDetailsDialog order={order} open={open} setOpen={setOpen} />
      <CreateOrderDialog wooOrder={order} open={createDialogOpen} setOpen={setCreateDialogOpen} />
      <DispatchConfirmDialog order={order} open={dispatchDialogOpen} setOpen={setDispatchDialogOpen} />
      <ExportConfirmDialog order={order} open={exportDialogOpen} setOpen={setExportDialogOpen} />
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
        </div>
      </TooltipProvider>
    </>
  );
}

export default OrderActions; 