import CreateOrderDialog from "@/components/feature-specific/orders/create-order-dialog";
import DispatchConfirmDialog from "@/components/feature-specific/orders/dispatch-confirm-dialog";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { WooOrder } from "@/models/data/woo-order.model";
import { MoreHorizontal } from "lucide-react";
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onSelect={() => setOpen(true)}>
            Show Order Details
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setCreateDialogOpen(true)}>
            Create Order
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setDispatchDialogOpen(true)} disabled={order.order_status !== "packing"}>
            Dispatch Order
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setExportDialogOpen(true)} disabled={order.order_status !== "dispaching"}>
            Export Order
          </DropdownMenuItem>
          {/* Future actions can be added here */}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

export default OrderActions; 