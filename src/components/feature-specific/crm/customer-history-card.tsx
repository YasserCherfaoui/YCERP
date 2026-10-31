import { liquidGlass, orderStatus, tile, tone } from "@/components/feature-specific/crm/crm-theme";
import OrderDetailsDialog from "@/components/feature-specific/orders/order-details-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { WooOrder } from "@/models/data/woo-order.model";
import { getCustomerOrders, getCustomerSales } from "@/services/customer-service";
import { getWooCommerceOrder } from "@/services/woocommerce-service";
import { carrierChipClass, carrierLabel } from "@/utils/shipping-provider";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  MapPin,
  Package,
  ShoppingBag,
  Star,
  Store,
  Undo2,
  Warehouse,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const PAGE_SIZE = 10;
const money = new Intl.NumberFormat("en-DZ", { style: "currency", currency: "DZD", maximumFractionDigits: 0 });

function formatDateTime(value?: string | Date | null) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime()) || date.getFullYear() < 2000) return "—";
  return format(date, "d MMM yyyy, HH:mm");
}

type Tab = "orders" | "sales";

interface CustomerHistoryCardProps {
  phone: string;
  companyId?: number;
  franchiseId?: number;
  defaultTab?: Tab;
  orderPath?: (orderId: number) => string | undefined;
  allowOrderDetails?: boolean;
}

function Pager({
  page,
  totalPages,
  total,
  noun,
  fetching,
  onChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  noun: string;
  fetching: boolean;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <>
      <Separator />
      <div className="flex items-center justify-between gap-2 px-3 py-2.5 sm:px-4">
        <span className="text-xs tabular-nums text-muted-foreground">
          Page {page} of {totalPages} · {total.toLocaleString()} {noun}
        </span>
        <div className="flex items-center gap-2">
          <Button type="button" size="sm" variant="outline" className={tone.indigo} disabled={page <= 1 || fetching} onClick={() => onChange(page - 1)}>
            <ChevronLeft />
            Previous
          </Button>
          <Button type="button" size="sm" variant="outline" className={tone.indigo} disabled={page >= totalPages || fetching} onClick={() => onChange(page + 1)}>
            Next
            <ChevronRight />
          </Button>
        </div>
      </div>
    </>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-2 p-1" aria-busy="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-xl" />
      ))}
    </div>
  );
}

function EmptyState({ icon: Icon, text }: { icon: typeof Package; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <span className={cn("flex size-11 items-center justify-center rounded-xl", tile.slate.icon)}>
        <Icon className="size-5" />
      </span>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

export default function CustomerHistoryCard({
  phone,
  companyId,
  franchiseId,
  defaultTab = "orders",
  orderPath,
  allowOrderDetails = true,
}: CustomerHistoryCardProps) {
  const [tab, setTab] = useState<Tab>(defaultTab);
  const [ordersPage, setOrdersPage] = useState(1);
  const [salesPage, setSalesPage] = useState(1);
  const [openOrderId, setOpenOrderId] = useState<number | null>(null);

  const ordersQuery = useQuery({
    queryKey: ["customer-history-orders", phone, companyId, franchiseId, ordersPage],
    queryFn: () => getCustomerOrders(phone, { companyId, franchiseId, page: ordersPage, limit: PAGE_SIZE }),
    enabled: !!phone && !!companyId,
    placeholderData: (previous) => previous,
  });

  const salesQuery = useQuery({
    queryKey: ["customer-history-sales", phone, companyId, franchiseId, salesPage],
    queryFn: () => getCustomerSales(phone, { companyId, franchiseId, page: salesPage, limit: PAGE_SIZE }),
    enabled: !!phone && !!companyId,
    placeholderData: (previous) => previous,
  });

  const { data: openOrderData, isFetching: openOrderLoading } = useQuery({
    queryKey: ["woo-order-details", openOrderId],
    queryFn: () => getWooCommerceOrder(openOrderId!),
    enabled: !!openOrderId,
  });

  const orders = ordersQuery.data?.data?.orders ?? [];
  const ordersMeta = ordersQuery.data?.data?.pagination;
  const ordersSummary = ordersQuery.data?.data?.summary;
  const sales = salesQuery.data?.data?.sales ?? [];
  const salesMeta = salesQuery.data?.data?.pagination;
  const salesSummary = salesQuery.data?.data?.summary;

  const tabs = [
    {
      value: "orders" as const,
      label: "Online orders",
      icon: Package,
      count: ordersSummary?.total_orders,
      selected: "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-sm",
      idle: "text-indigo-700 hover:bg-indigo-100/70 dark:text-indigo-200 dark:hover:bg-indigo-500/20",
    },
    {
      value: "sales" as const,
      label: "Store sales",
      icon: ShoppingBag,
      count: salesSummary?.total_sales,
      selected: "bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-sm",
      idle: "text-sky-700 hover:bg-sky-100/70 dark:text-sky-200 dark:hover:bg-sky-500/20",
    },
  ];

  const activeQuery = tab === "orders" ? ordersQuery : salesQuery;
  const description =
    tab === "orders"
      ? ordersSummary
        ? `${ordersSummary.delivered_orders.toLocaleString()} delivered · ${money.format(ordersSummary.delivered_amount)} delivered value`
        : "Loading…"
      : salesSummary
        ? `${money.format(salesSummary.total_amount)} spent in ${salesSummary.stores} store${salesSummary.stores === 1 ? "" : "s"}`
        : "Loading…";

  return (
    <Card className={cn("overflow-hidden", liquidGlass)}>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 pb-3">
        <div role="tablist" aria-label="Customer history" className="inline-flex gap-0.5 rounded-xl bg-white/60 p-1 ring-1 ring-black/5 dark:bg-white/5 dark:ring-white/10">
          {tabs.map((item) => {
            const Icon = item.icon;
            const selected = tab === item.value;
            return (
              <button
                key={item.value}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setTab(item.value)}
                className={cn(
                  "inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm font-medium motion-safe:transition-colors",
                  selected ? item.selected : item.idle
                )}
              >
                <Icon className="size-4" />
                {item.label}
                {item.count != null && (
                  <span
                    className={cn(
                      "rounded-md px-1.5 text-xs tabular-nums",
                      selected ? "bg-white/25 text-white" : "bg-black/5 dark:bg-white/10"
                    )}
                  >
                    {item.count.toLocaleString()}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {description}
          {activeQuery.isFetching && !activeQuery.isLoading && <Loader2 className="size-3.5 animate-spin text-indigo-500" aria-label="Updating" />}
        </span>
      </CardHeader>
      <Separator />

      {tab === "orders" ? (
        <>
          <CardContent className={cn("p-2 sm:p-3 motion-safe:transition-opacity", ordersQuery.isFetching && !ordersQuery.isLoading && "opacity-60")}>
            {ordersQuery.isLoading ? (
              <ListSkeleton />
            ) : ordersQuery.isError ? (
              <EmptyState icon={Package} text="Failed to load orders." />
            ) : orders.length === 0 ? (
              <EmptyState icon={Package} text="No online orders for this phone." />
            ) : (
              <ul className="divide-y divide-black/5 dark:divide-white/10">
                {orders.map((order: WooOrder) => {
                  const status = orderStatus(order.order_status);
                  const provider = order.woo_shipping?.shipping_provider;
                  const items = order.confirmed_order_items?.length || order.line_items?.length || 0;
                  const path = orderPath?.(order.id);
                  const loading = openOrderLoading && openOrderId === order.id;
                  return (
                    <li key={order.id} className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-white/60 dark:hover:bg-white/5">
                      <button
                        type="button"
                        disabled={!allowOrderDetails}
                        onClick={() => setOpenOrderId(order.id)}
                        className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left disabled:cursor-default"
                      >
                        <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", tile.indigo.icon)}>
                          {loading ? <Loader2 className="size-4 animate-spin" /> : <Package className="size-4" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-1.5">
                            <span className="font-semibold tabular-nums">#{order.number || order.id}</span>
                            {order.is_exchange && (
                              <Badge variant="outline" className={cn("h-5 px-1.5 text-[10px]", tone.amber)}>
                                Exchange
                              </Badge>
                            )}
                            {provider && (
                              <Badge variant="outline" className={cn("h-5 px-1.5 text-[10px]", carrierChipClass(provider))}>
                                {carrierLabel(provider)}
                              </Badge>
                            )}
                          </span>
                          <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                            <span>{formatDateTime(order.date_created || order.created_at)}</span>
                            <span>
                              {items} item{items === 1 ? "" : "s"}
                            </span>
                            {(order.woo_shipping?.wilaya_name || order.shipping_city) && (
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="size-3 text-rose-400" />
                                {order.woo_shipping?.wilaya_name || order.shipping_city}
                              </span>
                            )}
                          </span>
                        </span>
                        {order.tracking_number && (
                          <span className="hidden rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] tracking-wide text-foreground/80 md:inline">
                            {order.tracking_number.toUpperCase()}
                          </span>
                        )}
                        <Badge variant="outline" className={cn("shrink-0", status.chip)}>
                          {status.label}
                        </Badge>
                        <span className="w-24 shrink-0 text-right text-sm font-semibold tabular-nums">
                          {money.format(order.final_price || order.amount || 0)}
                        </span>
                      </button>
                      {path && (
                        <Button asChild size="icon" variant="ghost" className="size-8 shrink-0 text-indigo-600 hover:bg-indigo-100 dark:text-indigo-300 dark:hover:bg-indigo-500/20">
                          <Link to={path} aria-label={`Open order ${order.number || order.id}`} title="Open order page">
                            <ExternalLink className="size-4" />
                          </Link>
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
          {ordersMeta && (
            <Pager
              page={ordersMeta.page}
              totalPages={ordersMeta.total_pages}
              total={ordersMeta.total}
              noun="orders"
              fetching={ordersQuery.isFetching}
              onChange={setOrdersPage}
            />
          )}
        </>
      ) : (
        <>
          <CardContent className={cn("space-y-2 p-2 sm:p-3 motion-safe:transition-opacity", salesQuery.isFetching && !salesQuery.isLoading && "opacity-60")}>
            {salesQuery.isLoading ? (
              <ListSkeleton />
            ) : salesQuery.isError ? (
              <EmptyState icon={ShoppingBag} text="Failed to load store sales." />
            ) : sales.length === 0 ? (
              <EmptyState icon={ShoppingBag} text="No store sales for this phone." />
            ) : (
              sales.map((sale) => {
                const isFranchise = !!sale.franchise_id;
                const storeName =
                  sale.franchise?.name ||
                  (sale.sale_type === "algiers" ? "Algiers store" : sale.sale_type === "warehouse" ? "Warehouse" : sale.location_type || "Company store");
                const StoreIcon = isFranchise ? Store : Warehouse;
                return (
                  <div key={sale.ID} className="rounded-xl border border-sky-200/70 bg-sky-50/60 p-3 dark:border-sky-400/20 dark:bg-sky-500/10">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", isFranchise ? tile.sky.icon : tile.violet.icon)}>
                          <StoreIcon className="size-4" />
                        </span>
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-sm font-semibold">{storeName}</span>
                            <span className="text-xs text-muted-foreground">· Sale #{sale.ID}</span>
                            {sale.return && (
                              <Badge variant="outline" className={cn("h-5 gap-1 px-1.5 text-[10px]", tone.rose)}>
                                <Undo2 className="size-3" />
                                Returned
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            {formatDateTime(sale.CreatedAt)}
                            {!!sale.rating && (
                              <span className="inline-flex items-center gap-0.5" aria-label={`${sale.rating} out of 5`}>
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={cn("size-3", i < sale.rating! ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600")} />
                                ))}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold tabular-nums">{money.format(sale.total || 0)}</div>
                        {sale.discount > 0 && (
                          <div className="text-xs tabular-nums text-emerald-700 dark:text-emerald-300">−{money.format(sale.discount)} discount</div>
                        )}
                      </div>
                    </div>
                    {sale.sale_items?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5 border-t border-sky-200/70 pt-2 dark:border-sky-400/20">
                        {sale.sale_items.map((item) => {
                          const variant = [item.product_variant?.color, item.product_variant?.size].filter(Boolean).join(" / ");
                          return (
                            <span
                              key={item.ID}
                              className="inline-flex items-center gap-1 rounded-md bg-white/80 px-1.5 py-0.5 text-[11px] dark:bg-white/10"
                              title={item.product_variant?.qr_code}
                            >
                              <span className="font-medium">{item.product?.name || item.product_variant?.qr_code || `Variant ${item.product_variant_id}`}</span>
                              {variant && <span className="text-muted-foreground">{variant}</span>}
                              <span className="font-semibold text-sky-700 dark:text-sky-300">×{item.quantity}</span>
                              <span className="tabular-nums text-muted-foreground">{money.format(item.price)}</span>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
          {salesMeta && (
            <Pager
              page={salesMeta.page}
              totalPages={salesMeta.total_pages}
              total={salesMeta.total}
              noun="sales"
              fetching={salesQuery.isFetching}
              onChange={setSalesPage}
            />
          )}
        </>
      )}

      {openOrderData?.data && (
        <OrderDetailsDialog
          order={openOrderData.data}
          open={!!openOrderId}
          setOpen={(open) => {
            if (!open) setOpenOrderId(null);
          }}
        />
      )}
    </Card>
  );
}
