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
      {(status === "unconfirmed" || status === "relaunched") && (
        <CreateOrderDialog wooOrder={order} open={createOpen} setOpen={setCreateOpen} ordersQueryKey={ordersQueryKey} />
      )}
      {status !== "packing" && (
        <SetPackingStatusDialog order={order} open={packingOpen} setOpen={setPackingOpen} ordersQueryKey={ordersQueryKey} />
      )}
      {status === "packing" && (
        <DispatchConfirmDialog order={order} open={dispatchOpen} setOpen={setDispatchOpen} ordersQueryKey={ordersQueryKey} />
      )}
      {status === "dispaching" && (
        <ExportConfirmDialog order={order} open={exportOpen} setOpen={setExportOpen} ordersQueryKey={ordersQueryKey} />
      )}
      {(status === "packing" || status === "dispaching") && (
        <UpdateOrderDialog order={order} open={updateOpen} setOpen={setUpdateOpen} ordersQueryKey={ordersQueryKey} />
      )}
      {status !== "cancelled" && (
        <SetCancelledStatusDialog order={order} open={cancelOpen} setOpen={setCancelOpen} ordersQueryKey={ordersQueryKey} />
      )}
      {status === "cancelled" && (
        <SetUnconfirmedStatusDialog order={order} open={unconfirmedOpen} setOpen={setUnconfirmedOpen} ordersQueryKey={ordersQueryKey} />
      )}
      {status === "delivered" && (
        <DeclareExchangeDialog open={exchangeOpen} onOpenChange={setExchangeOpen} order={order} />
      )}
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
        <Button type="button" variant="outline" size="sm" className={actionTone.violet} onClick={() => setHistoryOpen(true)}>
          <History className="h-4 w-4" />
          History
        </Button>
        <Button type="button" variant="outline" size="sm" className={actionTone.sky} onClick={() => setClientStatusOpen(true)}>
          <MessageSquare className="h-4 w-4" />
          Client status
        </Button>
        <Button type="button" variant="outline" size="sm" className={actionTone.amber} onClick={() => cloneOrder(order)} disabled={isCloning}>
          <Copy className="h-4 w-4" />
          {isCloning ? "Cloning…" : "Clone"}
        </Button>
        {(status === "unconfirmed" || status === "relaunched") && (
          <Button type="button" size="sm" className={actionTone.emeraldSolid} onClick={() => setCreateOpen(true)}>
            <PlusCircle className="h-4 w-4" />
            Confirm order
          </Button>
        )}
        {status !== "packing" && (
          <Button type="button" variant="outline" size="sm" className={actionTone.blue} onClick={() => setPackingOpen(true)}>
            <PackageOpen className="h-4 w-4" />
            Set to packing
          </Button>
        )}
        {status === "packing" && (
          <Button type="button" size="sm" className={actionTone.blueSolid} onClick={() => setDispatchOpen(true)}>
            <Truck className="h-4 w-4" />
            Dispatch
          </Button>
        )}
        {status === "dispaching" && (
          <Button type="button" size="sm" className={actionTone.indigoSolid} onClick={() => setExportOpen(true)}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        )}
        {(status === "packing" || status === "dispaching") && (
          <Button type="button" variant="outline" size="sm" className={actionTone.orange} onClick={() => setUpdateOpen(true)}>
            <Pencil className="h-4 w-4" />
            Update
          </Button>
        )}
        {status === "cancelled" && (
          <Button type="button" variant="outline" size="sm" className={actionTone.rose} onClick={() => setUnconfirmedOpen(true)}>
            <Undo className="h-4 w-4" />
            Set unconfirmed
          </Button>
        )}
        {status === "delivered" && (
          <Button type="button" size="sm" className={actionTone.amberSolid} onClick={() => setExchangeOpen(true)}>
            <RotateCcw className="h-4 w-4" />
            Declare exchange
          </Button>
        )}
        {isAdminOrModerator && (
          <Button type="button" variant="outline" size="sm" className={actionTone.teal} onClick={() => setFulfillmentOpen(true)}>
            <Pencil className="h-4 w-4" />
            Adjust delivered items
          </Button>
        )}
        {status !== "cancelled" && (
          <Button type="button" variant="outline" size="sm" className={actionTone.danger} onClick={() => setCancelOpen(true)}>
            <X className="h-4 w-4" />
            Cancel
          </Button>
        )}
      </div>
    </>
  );
}

const actionTone = {
  violet: "border-violet-300 bg-violet-50 text-violet-800 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-950/70 dark:text-violet-100",
  sky: "border-sky-300 bg-sky-50 text-sky-800 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/70 dark:text-sky-100",
  amber: "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/70 dark:text-amber-100",
  amberSolid: "border-amber-400 bg-amber-500 text-white hover:bg-amber-600",
  emeraldSolid: "border-emerald-500 bg-emerald-600 text-white hover:bg-emerald-700",
  blue: "border-blue-300 bg-blue-50 text-blue-800 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/70 dark:text-blue-100",
  blueSolid: "border-blue-500 bg-blue-600 text-white hover:bg-blue-700",
  indigoSolid: "border-indigo-500 bg-indigo-600 text-white hover:bg-indigo-700",
  orange: "border-orange-300 bg-orange-50 text-orange-800 hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-950/70 dark:text-orange-100",
  rose: "border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/70 dark:text-rose-100",
  teal: "border-teal-300 bg-teal-50 text-teal-800 hover:bg-teal-100 dark:border-teal-800 dark:bg-teal-950/70 dark:text-teal-100",
  danger: "border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/70 dark:text-rose-100",
};
