import { RootState } from "@/app/store";
import { ClientStatusDialog } from "@/components/feature-specific/orders/client-status-dialog";
import CreateOrderDialog from "@/components/feature-specific/orders/create-order-dialog";
import DeclareExchangeDialog from "@/components/feature-specific/orders/declare-exchange-dialog";
import DispatchConfirmDialog from "@/components/feature-specific/orders/dispatch-confirm-dialog";
import ExportConfirmDialog from "@/components/feature-specific/orders/export-confirm-dialog";
import OrderHistoryDialog from "@/components/feature-specific/orders/order-history-dialog";
import SetCancelledStatusDialog from "@/components/feature-specific/orders/set-cancelled-status-dialog";
import SetPackingStatusDialog from "@/components/feature-specific/orders/set-packing-status-dialog";
import SetUnconfirmedStatusDialog from "@/components/feature-specific/orders/set-unconfirmed-status-dialog";
import UpdateOrderDialog from "@/components/feature-specific/orders/update-order-dialog";
import DeliveryFulfillmentDialog from "@/components/feature-specific/delivery/DeliveryFulfillmentDialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { WooOrder } from "@/models/data/woo-order.model";
import { cloneWooCommerceOrder } from "@/services/woocommerce-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Copy,
  Download,
  History,
  MessageSquare,
  PackageOpen,
  Pencil,
  PlusCircle,
  RotateCcw,
  Truck,
  Undo,
  X,
} from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";

export default function OrderPageActions({ order }: { order: WooOrder }) {
  const ordersQueryKey = ["orders", order.id];
  const [historyOpen, setHistoryOpen] = useState(false);
  const [clientStatusOpen, setClientStatusOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [packingOpen, setPackingOpen] = useState(false);
  const [dispatchOpen, setDispatchOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [unconfirmedOpen, setUnconfirmedOpen] = useState(false);
  const [exchangeOpen, setExchangeOpen] = useState(false);
  const [fulfillmentOpen, setFulfillmentOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const regularUser = useSelector((state: RootState) => state.user.user);
  const isAdminOrModerator = !!authUser || !!regularUser;
  const status = order.order_status;

  const { mutate: cloneOrder, isPending: isCloning } = useMutation({
    mutationFn: cloneWooCommerceOrder,
    onSuccess: () => {
      toast({ title: "Order cloned", description: "Order has been cloned successfully" });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err: Error) => {
      toast({
        title: "Error",
        description: err.message || "Failed to clone order",
        variant: "destructive",
      });
    },
  });

  return (
    <>
      <OrderHistoryDialog order={order} open={historyOpen} setOpen={setHistoryOpen} ordersQueryKey={ordersQueryKey} />
      <ClientStatusDialog open={clientStatusOpen} setOpen={setClientStatusOpen} wooOrderID={order.id} />
      <CreateOrderDialog wooOrder={order} open={createOpen} setOpen={setCreateOpen} ordersQueryKey={ordersQueryKey} />
      <SetPackingStatusDialog order={order} open={packingOpen} setOpen={setPackingOpen} ordersQueryKey={ordersQueryKey} />
      <DispatchConfirmDialog order={order} open={dispatchOpen} setOpen={setDispatchOpen} ordersQueryKey={ordersQueryKey} />
      <ExportConfirmDialog order={order} open={exportOpen} setOpen={setExportOpen} ordersQueryKey={ordersQueryKey} />
      <UpdateOrderDialog order={order} open={updateOpen} setOpen={setUpdateOpen} ordersQueryKey={ordersQueryKey} />
      <SetCancelledStatusDialog order={order} open={cancelOpen} setOpen={setCancelOpen} ordersQueryKey={ordersQueryKey} />
      <SetUnconfirmedStatusDialog order={order} open={unconfirmedOpen} setOpen={setUnconfirmedOpen} ordersQueryKey={ordersQueryKey} />
      <DeclareExchangeDialog open={exchangeOpen} onOpenChange={setExchangeOpen} order={order} />
      {isAdminOrModerator && (
        <DeliveryFulfillmentDialog
          order={order}
          open={fulfillmentOpen}
          setOpen={setFulfillmentOpen}
          ordersQueryKey={ordersQueryKey}
          isAdminOrModerator
        />
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setHistoryOpen(true)}>
          <History className="h-4 w-4" />
          History
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => setClientStatusOpen(true)}>
          <MessageSquare className="h-4 w-4" />
          Client status
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => cloneOrder(order)} disabled={isCloning}>
          <Copy className="h-4 w-4" />
          {isCloning ? "Cloning…" : "Clone"}
        </Button>
        {(status === "unconfirmed" || status === "relaunched") && (
          <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
            <PlusCircle className="h-4 w-4" />
            Confirm order
          </Button>
        )}
        {status !== "packing" && (
          <Button type="button" variant="outline" size="sm" onClick={() => setPackingOpen(true)}>
            <PackageOpen className="h-4 w-4" />
            Set to packing
          </Button>
        )}
        {status === "packing" && (
          <Button type="button" size="sm" onClick={() => setDispatchOpen(true)}>
            <Truck className="h-4 w-4" />
            Dispatch
          </Button>
        )}
        {status === "dispaching" && (
          <Button type="button" size="sm" onClick={() => setExportOpen(true)}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        )}
        {(status === "packing" || status === "dispaching") && (
          <Button type="button" variant="outline" size="sm" onClick={() => setUpdateOpen(true)}>
            <Pencil className="h-4 w-4" />
            Update
          </Button>
        )}
        {status === "cancelled" && (
          <Button type="button" variant="outline" size="sm" onClick={() => setUnconfirmedOpen(true)}>
            <Undo className="h-4 w-4" />
            Set unconfirmed
          </Button>
        )}
        {status === "delivered" && (
          <Button type="button" size="sm" onClick={() => setExchangeOpen(true)}>
            <RotateCcw className="h-4 w-4" />
            Declare exchange
          </Button>
        )}
        {isAdminOrModerator && (
          <Button type="button" variant="outline" size="sm" onClick={() => setFulfillmentOpen(true)}>
            <Pencil className="h-4 w-4" />
            Adjust delivered items
          </Button>
        )}
        {status !== "cancelled" && (
          <Button type="button" variant="destructive" size="sm" onClick={() => setCancelOpen(true)}>
            <X className="h-4 w-4" />
            Cancel
          </Button>
        )}
      </div>
    </>
  );
}
