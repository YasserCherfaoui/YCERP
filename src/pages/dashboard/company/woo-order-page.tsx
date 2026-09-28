import AppBarBackButton from "@/components/common/app-bar-back-button";
import OrderDetailsContent from "@/components/feature-specific/orders/order-details-content";
import OrderPageActions from "@/components/feature-specific/orders/order-page-actions";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getWooCommerceOrder } from "@/services/woocommerce-service";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

export default function WooOrderPage() {
  const { orderID } = useParams();
  const id = Number(orderID);
  const valid = Number.isFinite(id) && id > 0;

  const { data, isLoading, error } = useQuery({
    queryKey: ["orders", id],
    queryFn: () => getWooCommerceOrder(id),
    enabled: valid,
  });

  const order = data?.data;

  return (
    <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-4 px-3 py-3 md:px-5">
      <div className="flex flex-wrap items-center gap-3">
        <AppBarBackButton destination="Orders" />
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight">
            Order {order ? `#${order.number || order.id}` : valid ? `#${id}` : ""}
          </h1>
          {order && (
            <p className="text-xs text-muted-foreground">
              WooCommerce order {order.woo_id || order.id}
            </p>
          )}
        </div>
        {order?.order_status && <Badge variant="secondary">{order.order_status}</Badge>}
      </div>

      {!valid && <p className="text-sm text-destructive">This order id is not valid.</p>}

      {valid && isLoading && (
        <div className="space-y-3" aria-label="Loading order">
          <Skeleton className="h-10 w-full max-w-xl" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {valid && error && (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load this order."}
        </p>
      )}

      {order && (
        <>
          <OrderPageActions order={order} />
          <OrderDetailsContent order={order} />
        </>
      )}
    </div>
  );
}
