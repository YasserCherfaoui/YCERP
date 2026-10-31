import { liquidGlass, tile } from "@/components/feature-specific/crm/crm-theme";
import CarrierTimeline from "@/components/feature-specific/orders/carrier-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { WooOrder } from "@/models/data/woo-order.model";
import { carrierChipClass, carrierLabel } from "@/utils/shipping-provider";
import { format } from "date-fns";
import { Clock, History, Plus, Truck } from "lucide-react";
import { useState } from "react";
import AddOrderHistoryDialog from "./add-order-history-dialog";

function formatDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : format(date, "d MMM yyyy, HH:mm");
}

export default function OrderHistoryDialog({ order, open, setOpen }: { order: WooOrder; open: boolean; setOpen: (open: boolean) => void; ordersQueryKey?: unknown[] }) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const provider = order.woo_shipping?.shipping_provider;
  const carrierHistories = order.yalidine_order_histories || [];
  const orderHistories = (order.order_histories || [])
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className={cn("flex max-h-[90vh] max-w-4xl flex-col gap-0 overflow-hidden p-0 sm:p-0", liquidGlass, "bg-white/85 dark:bg-slate-950/85")}>
        <DialogHeader className="space-y-3 border-b border-white/40 bg-gradient-to-r from-rose-100/80 via-violet-50/60 to-sky-100/60 px-5 py-4 pr-12 text-left dark:border-white/10 dark:from-rose-500/15 dark:via-violet-500/10 dark:to-sky-500/10">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-violet-500 text-white shadow-md shadow-rose-500/30">
              <History className="size-5" />
            </span>
            <div className="min-w-0 space-y-0.5">
              <DialogTitle>Order #{order.number || order.id} history</DialogTitle>
              <DialogDescription>Carrier tracking and internal status changes for this order.</DialogDescription>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={cn("rounded-full px-2.5 py-1", carrierChipClass(provider))}>
              <Truck className="mr-1 size-3.5" />
              {carrierLabel(provider)}
            </Badge>
            {order.tracking_number && (
              <span className="rounded-full bg-white/80 px-2.5 py-1 font-mono text-xs shadow-sm dark:bg-white/10">{order.tracking_number}</span>
            )}
          </div>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto p-5 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <section className="min-w-0 space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <span className={cn("flex size-7 items-center justify-center rounded-lg", tile.rose.icon)}>
                <Truck className="size-4" />
              </span>
              {carrierLabel(provider)} updates
              <span className="text-xs font-normal text-muted-foreground">({carrierHistories.length})</span>
            </h3>
            <CarrierTimeline histories={carrierHistories} provider={provider} />
          </section>

          <section className="min-w-0 space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <span className={cn("flex size-7 items-center justify-center rounded-lg", tile.violet.icon)}>
                <Clock className="size-4" />
              </span>
              Order history
              <span className="text-xs font-normal text-muted-foreground">({orderHistories.length})</span>
            </h3>
            {orderHistories.length === 0 ? (
              <p className="text-sm text-muted-foreground">No order history yet.</p>
            ) : (
              <ul className="space-y-2">
                {orderHistories.map((history) => (
                  <li key={history.ID} className="space-y-1 rounded-xl bg-white/50 px-3 py-2 dark:bg-white/[0.04]">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline" className="capitalize">{history.status || "No status"}</Badge>
                      {history.qualification?.name && (
                        <Badge style={{ backgroundColor: history.qualification.color || "#6b7280" }} className="border-transparent text-white">
                          {history.qualification.name}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs tabular-nums text-muted-foreground">{formatDate(history.date)}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <DialogFooter className="gap-2 border-t border-white/40 px-5 py-3 dark:border-white/10 sm:space-x-0">
          <DialogClose asChild>
            <Button type="button" variant="ghost">Close</Button>
          </DialogClose>
          <Button
            type="button"
            className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/25 hover:from-violet-500 hover:to-indigo-500"
            onClick={() => setAddDialogOpen(true)}
          >
            <Plus />
            Add order history
          </Button>
        </DialogFooter>
        <AddOrderHistoryDialog open={addDialogOpen} setOpen={setAddDialogOpen} orderId={order.id} />
      </DialogContent>
    </Dialog>
  );
}
