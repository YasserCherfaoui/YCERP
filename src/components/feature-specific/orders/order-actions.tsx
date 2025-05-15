import CreateOrderDialog from "@/components/feature-specific/orders/create-order-dialog";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { WooOrder } from "@/models/data/woo-order.model";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import OrderDetailsDialog from "./order-details-dialog";

function OrderActions({ order }: { order: WooOrder }) {
  const [open, setOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  return (
    <>
      <OrderDetailsDialog order={order} open={open} setOpen={setOpen} />
      <CreateOrderDialog wooOrder={order} open={createDialogOpen} setOpen={setCreateDialogOpen} />
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
          {/* Future actions can be added here */}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

export default OrderActions; 