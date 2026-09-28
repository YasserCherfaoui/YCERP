import OrderDetailsContent from "@/components/feature-specific/orders/order-details-content";
import OrderHistoryDialog from "@/components/feature-specific/orders/order-history-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WooOrder } from "@/models/data/woo-order.model";
import { Package } from "lucide-react";
import { useState } from "react";

interface OrderDetailsDialogProps {
  order: WooOrder;
  open: boolean;
  setOpen: (open: boolean) => void;
  ordersQueryKey?: any[];
  /** When true, shows a DELETED badge (soft-deleted reference). */
  isDeleted?: boolean;
}

export default function OrderDetailsDialog({
  order,
  open,
  setOpen,
  isDeleted,
}: OrderDetailsDialogProps) {
  const [orderHistoryOpen, setOrderHistoryOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Details #{order.number || order.id}
            {isDeleted && <Badge variant="destructive">DELETED</Badge>}
          </DialogTitle>
          <DialogDescription>
            Comprehensive information for this WooCommerce order
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto pr-2">
          <OrderDetailsContent order={order} />
        </div>

        <DialogFooter>
          <Button onClick={() => setOrderHistoryOpen(true)}>Order History</Button>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>

        <OrderHistoryDialog order={order} open={orderHistoryOpen} setOpen={setOrderHistoryOpen} />
      </DialogContent>
    </Dialog>
  );
}
