import { avatarTone, liquidGlass, orderStatus, tile, tone } from "@/components/feature-specific/crm/crm-theme";
import OrderDetailsDialog from "@/components/feature-specific/orders/order-details-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { getWooCommerceOrder, getWooCommerceOrders } from "@/services/woocommerce-service";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { AlertCircle, ChevronLeft, ChevronRight, Eye, History, Loader2, Package } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";

interface CustomerOrderHistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerPhone: string;
  customerName?: string;
}

function initials(name?: string) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  const letters = `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`;
  return letters ? letters.toUpperCase() : "#";
}

export default function CustomerOrderHistoryDrawer({
  open,
  onOpenChange,
  customerPhone,
  customerName,
}: CustomerOrderHistoryDrawerProps) {
  const { companyID } = useParams<{ companyID: string }>();
  const companyId = companyID ? parseInt(companyID, 10) : undefined;
  const [page, setPage] = useState(1);
  const limit = 20;
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ["customer-orders", customerPhone, companyId, page, limit],
    queryFn: () =>
      getWooCommerceOrders({
        _page: page - 1,
        phone_number: customerPhone,
        company_id: companyId,
      }),
    enabled: open && !!customerPhone && !!companyId,
  });

  const orders = data?.data?.orders || [];
  const pagination = data?.data?.meta;

  const { data: selectedOrderData, isFetching: selectedOrderLoading } = useQuery({
    queryKey: ["woo-order-details", selectedOrderId],
    queryFn: () => selectedOrderId ? getWooCommerceOrder(selectedOrderId) : null,
    enabled: !!selectedOrderId && detailsDialogOpen,
  });

  const selectedOrder = selectedOrderData?.data;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={cn("flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl", liquidGlass, "bg-white/85 dark:bg-slate-950/85")}>
        <SheetHeader className="space-y-3 border-b border-white/40 bg-gradient-to-r from-sky-100/80 via-indigo-50/60 to-violet-100/60 px-5 py-4 pr-12 text-left dark:border-white/10 dark:from-sky-500/15 dark:via-indigo-500/10 dark:to-violet-500/10">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 text-white shadow-md shadow-sky-500/30">
              <History className="size-5" />
            </span>
            <div className="min-w-0 space-y-0.5">
              <SheetTitle>Order history</SheetTitle>
              <SheetDescription>Every order placed with this phone number.</SheetDescription>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 py-1 pl-1 pr-3 text-sm font-medium shadow-sm dark:bg-white/10">
              <span className={cn("flex size-6 items-center justify-center rounded-full text-[10px] font-semibold", avatarTone(customerPhone))}>
                {initials(customerName)}
              </span>
              {customerName || "Unnamed customer"}
              <span className="font-normal tabular-nums text-muted-foreground">· {customerPhone}</span>
            </span>
            {pagination && (
              <Badge variant="outline" className={cn("rounded-full px-2.5 py-1 tabular-nums", tone.indigo)}>
                {pagination.total_items.toLocaleString()} order{pagination.total_items === 1 ? "" : "s"}
              </Badge>
            )}
            {isFetching && !isLoading && <Loader2 className="size-4 animate-spin text-indigo-500" aria-label="Updating" />}
          </div>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="space-y-2" aria-busy="true">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center gap-2 py-14 text-center">
              <span className={cn("flex size-11 items-center justify-center rounded-xl", tile.rose.icon)}>
                <AlertCircle className="size-5" />
              </span>
              <p className="text-sm font-medium">Failed to load order history</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-14 text-center">
              <span className={cn("flex size-11 items-center justify-center rounded-xl", tile.slate.icon)}>
                <Package className="size-5" />
              </span>
              <p className="text-sm font-medium">No orders found for this customer</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/60 bg-white/60 dark:border-white/10 dark:bg-white/[0.03]">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Order</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    const status = orderStatus(order.order_status);
                    const items = order.confirmed_order_items?.length || order.line_items?.length || 0;
                    return (
                      <TableRow key={order.id} className="hover:bg-indigo-50/60 dark:hover:bg-indigo-500/10">
                        <TableCell className="font-semibold tabular-nums">#{order.number || order.id}</TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                          {order.date_created ? format(new Date(order.date_created), "d MMM yyyy, HH:mm") : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={status.chip}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold tabular-nums text-emerald-700 dark:text-emerald-300">
                          {order.final_price || order.total} {order.currency || "DZD"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("tabular-nums", tone.violet)}>
                            {items} item{items === 1 ? "" : "s"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className={cn("h-8", tone.indigo)}
                            disabled={selectedOrderLoading && selectedOrderId === order.id}
                            onClick={() => {
                              setSelectedOrderId(order.id);
                              setDetailsDialogOpen(true);
                            }}
                          >
                            {selectedOrderLoading && selectedOrderId === order.id ? <Loader2 className="animate-spin" /> : <Eye />}
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {pagination && pagination.total_pages > 1 && (
          <div className="flex items-center justify-between gap-2 border-t border-white/40 px-4 py-3 dark:border-white/10">
            <span className="text-xs tabular-nums text-muted-foreground">
              Page {pagination.current_page} of {pagination.total_pages} · {pagination.total_items.toLocaleString()} orders
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={tone.indigo}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.current_page <= 1 || isFetching}
              >
                <ChevronLeft />
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={tone.indigo}
                onClick={() => setPage((p) => p + 1)}
                disabled={pagination.current_page >= pagination.total_pages || isFetching}
              >
                Next
                <ChevronRight />
              </Button>
            </div>
          </div>
        )}

        {selectedOrder && (
          <OrderDetailsDialog
            order={selectedOrder}
            open={detailsDialogOpen}
            setOpen={(open) => {
              setDetailsDialogOpen(open);
              if (!open) {
                setSelectedOrderId(null);
              }
            }}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
