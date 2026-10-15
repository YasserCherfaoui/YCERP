import OrderDetailsContent from "@/components/feature-specific/orders/order-details-content";
import OrderPageActions from "@/components/feature-specific/orders/order-page-actions";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { WooOrder } from "@/models/data/woo-order.model";

const liquidGlass =
  "border border-white/40 bg-white/55 shadow-[0_12px_40px_-18px_rgba(15,23,42,0.45),inset_0_1px_0_0_rgba(255,255,255,0.7)] backdrop-blur-xl dark:border-white/15 dark:bg-white/[0.08] dark:shadow-[0_16px_40px_-20px_rgba(0,0,0,0.75),inset_0_1px_0_0_rgba(255,255,255,0.16)]";

const statusTone: Record<string, string> = {
  unconfirmed: "border-indigo-200/80 bg-indigo-100 text-indigo-950 dark:border-indigo-400/30 dark:bg-indigo-500/20 dark:text-indigo-50",
  packing: "border-blue-200/80 bg-blue-100 text-blue-950 dark:border-blue-400/30 dark:bg-blue-500/20 dark:text-blue-50",
  dispaching: "border-violet-200/80 bg-violet-100 text-violet-950 dark:border-violet-400/30 dark:bg-violet-500/20 dark:text-violet-50",
  deliviring: "border-amber-200/80 bg-amber-100 text-amber-950 dark:border-amber-400/30 dark:bg-amber-500/20 dark:text-amber-50",
  orphaned: "border-yellow-200/80 bg-yellow-100 text-yellow-950 dark:border-yellow-400/30 dark:bg-yellow-500/20 dark:text-yellow-50",
  delivered: "border-emerald-200/80 bg-emerald-100 text-emerald-950 dark:border-emerald-400/30 dark:bg-emerald-500/20 dark:text-emerald-50",
  returning: "border-orange-200/80 bg-orange-100 text-orange-950 dark:border-orange-400/30 dark:bg-orange-500/20 dark:text-orange-50",
  returned: "border-rose-200/80 bg-rose-100 text-rose-950 dark:border-rose-400/30 dark:bg-rose-500/20 dark:text-rose-50",
  cancelled: "border-fuchsia-200/80 bg-fuchsia-100 text-fuchsia-950 dark:border-fuchsia-400/30 dark:bg-fuchsia-500/20 dark:text-fuchsia-50",
  relaunched: "border-sky-200/80 bg-sky-100 text-sky-950 dark:border-sky-400/30 dark:bg-sky-500/20 dark:text-sky-50",
};

const statusLabel: Record<string, string> = {
  unconfirmed: "Unconfirmed",
  packing: "Packing",
  dispaching: "Dispatching",
  deliviring: "Delivering",
  orphaned: "Orphaned",
  delivered: "Delivered",
  returning: "Returning",
  returned: "Returned",
  cancelled: "Cancelled",
  relaunched: "Relaunched",
};

const money = new Intl.NumberFormat("en-DZ", { style: "currency", currency: "DZD", maximumFractionDigits: 0 });

interface OrderDetailsDialogProps {
  order: WooOrder;
  open: boolean;
  setOpen: (open: boolean) => void;
  ordersQueryKey?: unknown[];
  isDeleted?: boolean;
}

export default function OrderDetailsDialog({ order, open, setOpen, isDeleted }: OrderDetailsDialogProps) {
  const customer = order.shipping_name || order.billing_name || "No name";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className={cn("flex max-h-[90vh] max-w-5xl flex-col gap-0 overflow-hidden p-0 sm:p-0", liquidGlass)}>
        <DialogHeader className="space-y-4 border-b border-white/40 px-5 py-5 pr-12 text-left dark:border-white/10">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <DialogTitle className="text-xl">
                Order #{order.number || order.id}
              </DialogTitle>
              <DialogDescription className="text-sm text-foreground/80">
                {customer}
                {order.customer_phone ? ` · ${order.customer_phone}` : ""}
              </DialogDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={cn("capitalize", statusTone[order.order_status])}>
                {statusLabel[order.order_status] || order.order_status}
              </Badge>
              {isDeleted && <Badge variant="destructive">Deleted</Badge>}
              <span className="text-lg font-semibold tabular-nums">{money.format(Number(order.final_price || order.total || 0))}</span>
            </div>
          </div>
          <OrderPageActions order={order} />
        </DialogHeader>
        <div className="overflow-y-auto px-5 py-5">
          <OrderDetailsContent order={order} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
